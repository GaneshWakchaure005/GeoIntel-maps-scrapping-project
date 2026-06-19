# Place Data Extraction & Location Intelligence System
## Architecture & Developer Guide

---

## 1. What This Project Actually Is

At its core, this is a **Google Places API wrapper with a dashboard**, with one LLM enrichment stage bolted onto the pipeline.

You give it a keyword + city → it hits Google Places API → validates/dedupes → an LLM call enriches each record (summary, lead score) → stores results in MongoDB → shows them on a React dashboard with filters, map view, and CSV export.

That's the project. The pieces that make it nontrivial:
- Deduplication logic (fuzzy matching)
- Job queue for large batch searches (BullMQ)
- Rate limit handling (so you don't blow your Google API quota — now you have TWO quotas to watch, Google's and Anthropic's)
- AI enrichment layer (summary, lead score)

Be precise about what this is and isn't: this is an AI-**powered** pipeline (an LLM call is a function in your data flow), not an AI **agent** (nothing here makes autonomous decisions or changes its own next action based on context). Don't blur that line in your docs or pitch — it's the first thing a technical evaluator will probe.

---

## 2. Folder Structure

```
location-intelligence/
│
├── client/                        # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── SearchForm.jsx
│   │   │   ├── ResultsTable.jsx
│   │   │   ├── MapView.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── ExportButton.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Results.jsx
│   │   │   └── History.jsx
│   │   ├── hooks/
│   │   │   └── usePlaces.js
│   │   ├── services/
│   │   │   └── api.js             # Axios calls to backend
│   │   └── App.jsx
│   └── package.json
│
├── server/                        # Node.js + Express backend
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── placeController.js     # Search, fetch, save logic
│   │   └── exportController.js    # CSV/Excel generation
│   ├── models/
│   │   ├── Place.js               # MongoDB schema for a business
│   │   └── SearchHistory.js       # Store past searches
│   ├── routes/
│   │   ├── placeRoutes.js
│   │   └── exportRoutes.js
│   ├── services/
│   │   ├── googlePlaces.js        # Google Places API calls
│   │   ├── deduplication.js       # Fuzzy match logic
│   │   ├── validation.js          # Data cleaning
│   │   └── aiEnrichment.js        # LLM calls: summary, lead score
│   ├── jobs/
│   │   ├── searchWorker.js        # BullMQ worker — Google fetch + dedup
│   │   ├── searchQueue.js         # BullMQ queue definition
│   │   ├── enrichmentWorker.js    # BullMQ worker — AI enrichment (separate queue)
│   │   └── enrichmentQueue.js     # BullMQ queue definition
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── utils/
│   │   └── logger.js              # Winston logger
│   └── index.js                   # Entry point
│
├── .env
├── docker-compose.yml             # Optional
└── README.md
```

---

## 3. Data Flow (Step-by-Step)

```
User fills search form (keyword + city + radius)
        |
        v
React sends POST /api/places/search
        |
        v
Express controller receives request
        |
        v
Job pushed to BullMQ "place-search" queue (Redis)
        |
        v
Worker picks up job
        |
        v
Worker calls Google Places API
   [Text Search → Place Details for each result]
        |
        v
Raw data → Validation & Cleaning
        |
        v
Deduplication check against MongoDB
        |
        v
Clean, unique records saved to MongoDB (unenriched)
        |
        v
Each new record pushed to BullMQ "ai-enrichment" queue
        |
        v
Enrichment worker batches records → calls LLM
   [summary + lead score, per place]
        |
        v
Records updated in MongoDB with AI fields
        |
        v
Frontend polls job status → shows results as they complete
        |
        v
React renders table + map markers (enrichment fields populate slightly after raw data — show a subtle "enriching..." badge per row until aiSummary exists)
```

Note the split: search results appear in the UI as soon as raw data is saved — don't make the user wait for enrichment to see anything. Enrichment fields backfill onto rows already on screen. This matters for perceived speed; without it, your "fast" Google fetch gets bottlenecked by a slow LLM step the user didn't need to wait on.

---

## 4. Google Places API — The Tricky Part

This is where most teams get confused. There are **two APIs** you'll chain together:

### Step 1: Text Search API
Finds a list of places for a keyword in a city.

```
GET https://maps.googleapis.com/maps/api/place/textsearch/json
  ?query=hospitals in Nashik
  &radius=10000
  &key=YOUR_API_KEY
```

Returns: a list of places, each with `place_id`, name, address, rating, lat/lng.

**Problem:** It does NOT return phone number or website. For that you need Step 2.

### Step 2: Place Details API
For each `place_id`, fetch full details.

```
GET https://maps.googleapis.com/maps/api/place/details/json
  ?place_id=ChIJ...
  &fields=name,formatted_address,formatted_phone_number,website,opening_hours,rating,user_ratings_total
  &key=YOUR_API_KEY
```

### Important: Pagination
Text Search returns max 20 results per call. For more, use `next_page_token`:

```javascript
// First call returns up to 20 results + next_page_token
// Wait 2 seconds (Google requirement), then call again with pagetoken param
// Max 3 pages = 60 results per search
```

### API Costs (Know This Before You Build)
- Text Search: $32 per 1000 calls
- Place Details: $17 per 1000 calls
- Each search = 1 Text Search + N Place Details calls (N = number of results)
- A search returning 20 hospitals = 1 + 20 = 21 API calls

**Build a usage cap in your system. Do not skip this.**

### LLM Enrichment Costs — Your Second Quota to Watch

Every place now costs you a Claude API call on top of the two Google calls. At Sonnet pricing this is small per-call, but it's not zero, and it's a cost axis your original spec never accounted for.

**Cut the call count, don't cut the feature:**
- **Batch, don't loop.** Sending one API call per place (20 places = 20 LLM calls) is the naive approach and the slow one. Send 10 places in a single prompt, ask the model to return a JSON array of 10 enrichment objects. Same cost in tokens, far fewer round trips — round trips are what add latency to your job, not raw token count.
- **Cap enrichment per search**, same as you cap Google calls. If a search returns 60 results, you don't need to AI-enrich all 60 immediately — enrich the first page, lazy-enrich the rest on demand or in a lower-priority queue.
- **Cache by `placeId`.** If a business already has `aiSummary` from a previous search, don't re-enrich it. This is the same dedup principle you're already using for Google data — apply it here too.

---

## 5. MongoDB Schemas

### Place Schema (`models/Place.js`)

```javascript
const placeSchema = new mongoose.Schema({
  placeId: { type: String, unique: true, required: true }, // Google's ID
  name: { type: String, required: true },
  category: String,
  address: String,
  lat: Number,
  lng: Number,
  phone: String,
  website: String,
  rating: Number,
  reviewCount: Number,
  openingHours: [String],
  searchKeyword: String,       // What search found this
  searchLocation: String,      // Which city
  createdAt: { type: Date, default: Date.now },

  // AI enrichment fields — populated by a separate worker, may be null until enrichment completes
  aiSummary: { type: String, default: null },
  aiLeadScore: { type: Number, min: 0, max: 100, default: null },
  aiLeadScoreReason: { type: String, default: null }, // forces the LLM to justify the number
  enrichedAt: { type: Date, default: null },
});

// Geospatial index for map queries
placeSchema.index({ lat: 1, lng: 1 });
```

**Why `aiLeadScoreReason` is not optional:** a bare number with no justification is an LLM's unverifiable opinion. Storing the reasoning string forces the model to ground the score in actual fields (rating, review count, has-website, has-phone) and gives you something to show an evaluator who asks "scored against what?" It also lets you sanity-check outputs in QA — if the reason text doesn't logically support the number, you know the prompt needs work.

**Lead score honesty check:** you have no historical conversion data, so this cannot be a predictive model — it's a heuristic the LLM applies based on signals you give it (website presence, review volume, rating, completeness of contact info). State this plainly in your documentation rather than implying it's been validated against real outcomes. A transparent heuristic score is a legitimate feature; an unvalidated score presented as predictive is the part that falls apart under questioning.

### SearchHistory Schema (`models/SearchHistory.js`)

**Reminder:** `placeId` (Google's ID) is your primary dedup key — if it already exists in MongoDB, skip the record. This alone handles most of your deduplication before fuzzy matching even runs (see Section 8).


```javascript
const searchHistorySchema = new mongoose.Schema({
  keyword: String,
  location: String,
  radius: Number,
  resultsCount: Number,
  status: { type: String, enum: ['pending', 'processing', 'done', 'failed'] },
  jobId: String,  // BullMQ job ID
  createdAt: { type: Date, default: Date.now }
});
```

---

## 6. Backend API Endpoints

| Method | Endpoint | What It Does |
|--------|----------|-------------|
| POST | `/api/places/search` | Trigger a new search, returns jobId |
| GET | `/api/places/status/:jobId` | Poll job progress |
| GET | `/api/places` | Get all saved places (paginated) |
| GET | `/api/places?keyword=X&city=Y` | Filter saved places |
| DELETE | `/api/places/:id` | Delete a record |
| GET | `/api/export/csv` | Download CSV |
| GET | `/api/export/excel` | Download Excel |
| GET | `/api/history` | Past search history |
| POST | `/api/places/:id/enrich` | Manually trigger/re-trigger AI enrichment for one place |
| GET | `/api/places/enrichment-status/:jobId` | Poll AI enrichment job progress |

---

## 7. BullMQ Job Queue — Why You Need It

Without a queue: User triggers search → backend makes 20+ API calls synchronously → request times out → user sees error.

With a queue: User triggers search → job added to queue → worker processes in background → frontend polls for status.

### Setup

```javascript
// server/jobs/searchQueue.js
import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis.js';

export const searchQueue = new Queue('place-search', {
  connection: redisConnection
});
```

```javascript
// server/jobs/searchWorker.js
import { Worker } from 'bullmq';

const worker = new Worker('place-search', async (job) => {
  const { keyword, location, radius } = job.data;
  
  // 1. Call Google Text Search
  // 2. For each result, call Place Details
  // 3. Validate + clean
  // 4. Dedup check
  // 5. Save to MongoDB
  // 6. Update job progress
  
  await job.updateProgress(50); // midway
  
}, { connection: redisConnection });
```

Frontend polls `GET /api/places/status/:jobId` every 2 seconds until status = `done`.

---

## 8. Deduplication Logic

**Layer 1 (Always do this):** Check if `placeId` already exists in MongoDB. If yes, skip. This is O(1) with an index.

**Layer 2 (Fuzzy match for edge cases):** Sometimes the same business appears with slightly different names across searches. Use string similarity:

```javascript
// npm install string-similarity
import stringSimilarity from 'string-similarity';

function isDuplicate(newPlace, existingPlaces) {
  for (const existing of existingPlaces) {
    const nameSim = stringSimilarity.compareTwoStrings(
      newPlace.name.toLowerCase(),
      existing.name.toLowerCase()
    );
    const distanceKm = haversineDistance(newPlace.lat, newPlace.lng, existing.lat, existing.lng);
    
    // Same-ish name AND within 100 meters = duplicate
    if (nameSim > 0.85 && distanceKm < 0.1) return true;
  }
  return false;
}
```

Don't over-engineer this. Layer 1 (placeId) handles almost everything. Layer 2 is a fallback.

---

## 8.5 AI Enrichment Layer

This is the new stage. It runs *after* dedup (no point paying for an LLM call on a record you're about to discard) and *before* the place is considered "complete" in the UI.

### Service

```javascript
// server/services/aiEnrichment.js
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

// Batched — sends N places in one call, gets N results back.
// This is the difference between 1 API call and 10 for a 10-place batch.
export async function enrichPlacesBatch(places) {
  const prompt = `For each business below, return a JSON array (same order) where each object is:
{
  "summary": "1-2 sentence plain-language description",
  "leadScore": <number 0-100>,
  "leadScoreReason": "one sentence justifying the score using only the data given"
}

Businesses:
${places.map((p, i) => `
${i + 1}. Name: ${p.name}
   Category (Google): ${p.category}
   Rating: ${p.rating ?? 'unknown'}
   Review Count: ${p.reviewCount ?? 0}
   Has Website: ${!!p.website}
   Has Phone: ${!!p.phone}
   Address: ${p.address}`).join('\n')}

Respond with ONLY the JSON array, no other text.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 250 * places.length,
    messages: [{ role: 'user', content: prompt }],
  });

  return JSON.parse(response.content[0].text);
}
```

### Worker — separate queue from the search job

```javascript
// server/jobs/enrichmentWorker.js
import { Worker } from 'bullmq';
import { enrichPlacesBatch } from '../services/aiEnrichment.js';
import Place from '../models/Place.js';

const BATCH_SIZE = 10;

const worker = new Worker('ai-enrichment', async (job) => {
  const { placeIds } = job.data;
  const places = await Place.find({ _id: { $in: placeIds }, aiSummary: null });

  for (let i = 0; i < places.length; i += BATCH_SIZE) {
    const batch = places.slice(i, i + BATCH_SIZE);
    const results = await enrichPlacesBatch(batch);

    await Promise.all(batch.map((place, idx) =>
      Place.findByIdAndUpdate(place._id, {
        aiSummary: results[idx].summary,
        aiLeadScore: results[idx].leadScore,
        aiLeadScoreReason: results[idx].leadScoreReason,
        enrichedAt: new Date(),
      })
    ));

    await job.updateProgress(Math.round(((i + BATCH_SIZE) / places.length) * 100));
  }
}, { connection: redisConnection, concurrency: 2 }); // low concurrency — respect Anthropic rate limits
```

### Why this is its own queue, not a step inside `searchWorker.js`

- **Different failure mode.** If the LLM call fails (rate limit, malformed JSON, timeout), that should not fail or retry your entire Google Places fetch. The raw data is already safely in MongoDB; only enrichment needs to retry.
- **Different rate limits.** Google and Anthropic throttle independently. Coupling them means a slow LLM response stalls your search job for no reason — the user is staring at a progress bar for data that's already fetched.
- **Lets the frontend show partial results.** Raw place data appears in the table immediately; AI fields backfill into the same rows a few seconds later. Without separating the queues, the user waits for the slowest step (LLM) before seeing anything at all.

---

## 9. Data Validation & Cleaning

```javascript
// server/services/validation.js

function validateAndClean(rawPlace) {
  return {
    placeId: rawPlace.place_id,
    name: rawPlace.name?.trim() || null,
    address: rawPlace.formatted_address?.trim() || null,
    lat: isValidLat(rawPlace.geometry?.location?.lat) 
         ? rawPlace.geometry.location.lat : null,
    lng: isValidLng(rawPlace.geometry?.location?.lng) 
         ? rawPlace.geometry.location.lng : null,
    phone: formatPhone(rawPlace.formatted_phone_number) || null,
    website: validateUrl(rawPlace.website) || null,
    rating: rawPlace.rating || null,
    reviewCount: rawPlace.user_ratings_total || 0,
  };
}

const isValidLat = (lat) => typeof lat === 'number' && lat >= -90 && lat <= 90;
const isValidLng = (lng) => typeof lng === 'number' && lng >= -180 && lng <= 180;
```

---

## 10. Frontend Key Components

### SearchForm
- Inputs: keyword (text), city (text), radius (slider: 1–50 km)
- On submit: POST to `/api/places/search`, get `jobId`
- Start polling `/api/places/status/:jobId`
- Show progress bar while polling

### ResultsTable
- Paginated table (20 per page)
- Columns: Name, Category, Address, Phone, Website, Rating, Reviews
- Sortable columns
- Row selection for bulk export

### MapView
- Use `react-leaflet` (free, no key needed) or Google Maps React
- Drop markers for each result
- Cluster nearby markers (use `react-leaflet-cluster`)
- Click marker → show business info popup

### ExportButton
- "Export CSV" → GET `/api/export/csv?ids=...` → download file
- Use `file-saver` npm package on frontend

---

## 11. Environment Variables

```env
# .env (server)
PORT=5000
MONGO_URI=mongodb+srv://...
GOOGLE_PLACES_API_KEY=AIza...
ANTHROPIC_API_KEY=sk-ant-...
REDIS_URL=redis://localhost:6379
NODE_ENV=development
```

---

## 12. Tech Stack — Final Decisions

| Layer | Tech | Why |
|-------|------|-----|
| Frontend | React + Vite + Tailwind | You know it |
| HTTP client | Axios | You know it |
| Charts | Chart.js or Recharts | Simple bar/pie charts |
| Map | react-leaflet | Free, no API key |
| Backend | Node.js + Express | You know it |
| Database | MongoDB Atlas | You know it |
| Job Queue | BullMQ + Redis | Industry standard |
| Logger | Winston | Clean logs |
| Export | exceljs / json2csv | CSV + Excel |
| Dedup | string-similarity | Fuzzy name match |
| AI Enrichment | @anthropic-ai/sdk | Summary + lead score — batched calls |
| Deploy | Render / Railway | Free tier works |

---

## 13. What to Build First (Suggested Order)

### Phase 1 — Core Pipeline (Week 1)
1. Backend: Google Places API service (Text Search + Place Details)
2. Backend: MongoDB Place model + save logic
3. Backend: Single POST `/api/places/search` endpoint (no queue yet, just sync)
4. Test with Postman — make sure data flows correctly

### Phase 2 — Frontend Basic (Week 1-2)
5. React SearchForm → call backend → display raw JSON
6. ResultsTable component
7. Basic pagination

### Phase 3 — Make It Production-Ready (Week 2)
8. Add BullMQ "place-search" queue + Redis
9. Add polling on frontend
10. Deduplication logic
11. Data validation/cleaning

### Phase 4 — AI Enrichment (Week 2-3)
12. Backend: `aiEnrichment.js` service — start with single-place calls, get it correct
13. Switch to batched calls (10 places/prompt) once correctness is confirmed
14. Add separate `ai-enrichment` BullMQ queue + worker
15. Frontend: show "enriching..." badge on rows until `aiSummary` populates
16. Cap enrichment per search + cache by `placeId` (don't re-enrich known places)

### Phase 5 — Polish (Week 3)
17. MapView with react-leaflet
18. CSV/Excel export (include AI fields as columns)
19. Dashboard analytics (charts)
20. Search history page

---

## 14. Common Mistakes to Avoid

**1. Calling Place Details API for all fields in one go without checking what you actually need**
Only request the fields you'll display. Each extra field category costs more money.

**2. Not handling Google's `next_page_token` delay**
You must wait ~2 seconds before using the token. Add `await sleep(2000)` explicitly.

**3. Storing raw Google API response in MongoDB**
Clean and transform first. Your schema should not mirror Google's response shape.

**4. No API usage tracking**
You will blow your free quota and get charged. Track how many API calls you make per search and cap it.

**5. Treating BullMQ as optional and adding it later**
Add it in Phase 1. Retrofitting async job handling into a sync architecture is painful.

**6. Using Google Maps JS for the map on frontend**
react-leaflet is free and just as good for this use case. Save the quota.

**7. Calling the LLM once per place instead of batching**
20 places = 20 round trips if you loop naively, vs. 2 round trips if you batch 10 per call. Batching is what keeps your enrichment stage from doubling job runtime.

**8. Re-enriching places you've already enriched**
If `aiSummary` already exists for a `placeId` from a previous search, skip it. Treat AI enrichment cost the same way you treat Google API cost — cache aggressively.

**9. Presenting `aiLeadScore` as a predictive/validated metric**
You have no historical conversion data to train or validate against. It's a transparent heuristic score (driven by rating, reviews, contact completeness), not a prediction. Say that explicitly in your README — don't let a demo imply otherwise.

**10. Letting one slow LLM call block the whole UI**
Raw place data should render the moment it's saved. AI fields should backfill onto existing rows. If your frontend waits for enrichment before showing anything, you've coupled two stages that don't need to be coupled.

---

## 15. Evaluation Criteria — How to Actually Score Well

| Criteria | What Evaluators Actually Look At |
|----------|----------------------------------|
| Code Quality (25%) | Clean folder structure, no logic in routes, proper error handling |
| System Design (20%) | Job queue present, modular services, not everything in index.js |
| Data Accuracy (25%) | Dedup works, validation removes bad coords, no null crashes |
| Error Handling (15%) | API failures caught, user sees meaningful errors, not 500 crashes |
| Documentation (10%) | README with setup steps, .env.example file present |
| Innovation (5%) | AI enrichment (summary + lead score) is your real innovation point now — fuzzy dedup and clustering are secondary |

The easiest 10 points: write a clean README and include an `.env.example`. Most teams forget this.
