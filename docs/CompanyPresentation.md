# Geo Intelligence Platform - Company Presentation Document

## 1. Executive Summary

Geo Intelligence Platform is a full-stack MERN application that converts Google Maps business listings into clean, structured, deduplicated, and scored business leads.

The platform allows a user to enter a business keyword and a target location, such as `Hospitals in Nashik` or `Manufacturing companies in Pune`. The backend then collects place data from Google Places API, enriches each result with detailed business information, validates the data, removes duplicates, calculates lead quality, stores the clean records in MongoDB, and presents the final output through a professional dashboard with export and AI summary features.

In simple terms, the system turns manual Google Maps research into an automated location intelligence workflow.

```text
Search Query -> Google Places API -> Details Fetch -> Validation -> Deduplication -> Lead Scoring -> MongoDB -> Dashboard -> Export / AI Summary
```

---

## 2. Problem We Solved

Companies often need accurate local business data for sales prospecting, market research, outreach campaigns, competitor analysis, or regional expansion planning. Manually collecting this data from Google Maps is slow and inconsistent.

Common problems in manual lead collection:

- Business data must be copied one record at a time.
- Phone numbers, websites, ratings, and addresses are not always collected consistently.
- Duplicate businesses appear across multiple searches.
- Raw search results are not ranked by lead quality.
- Teams do not know which records are new, repeated, or already stored.
- Data must be cleaned before it can be used in Excel, CRM tools, or outreach systems.

This project solves those problems by building an automated data pipeline that collects, cleans, deduplicates, scores, stores, and exports local business leads.

---

## 3. Business Value

The platform is useful for:

- Sales lead generation
- Local business discovery
- Market research
- Territory planning
- Business intelligence
- Outreach list creation
- Competitor and category analysis

Example use case:

A sales team wants to target clinics, hospitals, gyms, restaurants, schools, or manufacturers in a specific city. Instead of manually searching Google Maps and creating spreadsheets, they can search once in the dashboard and receive a ready-to-use list containing business name, category, address, phone, website, rating, review count, lead score, lead tier, and AI-generated summary.

---

## 4. Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 19 | Component-based frontend application |
| Vite | Fast development and production build tooling |
| Tailwind CSS 4 | Responsive, professional UI styling |
| React Router | Client-side routing |
| Axios | API communication with the backend |
| Lucide React | Professional icons across the dashboard |
| Framer Motion | Motion-ready UI dependency |
| React Globe / Three.js | Visual geo-intelligence capability for richer UI experiences |

### Backend

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express 5 | REST API server |
| MongoDB | NoSQL database for users, places, search history, and relationships |
| Mongoose | Schema modeling and database indexes |
| Axios | Server-side calls to Google Places API and Gemini API |
| JWT | Token-based authentication |
| bcryptjs | Secure password hashing |
| express-rate-limit | API abuse protection |
| Morgan | Request logging |
| json2csv | CSV export generation |
| xlsx | Excel export generation |

### External APIs

| API | Purpose |
|---|---|
| Google Places Text Search API | Finds places based on keyword and location |
| Google Place Details API | Fetches rich business fields for each Google place ID |
| Gemini 2.5 Flash API | Generates professional AI lead summaries |

---

## 5. Core Features

- Secure user registration and login using JWT authentication.
- Keyword and location-based business search.
- Google Places API integration using Text Search and Place Details.
- Configurable radius and maximum result limits.
- Data validation and normalization before storage.
- Deduplication using Google place ID and fuzzy matching.
- Rule-based lead scoring and lead tier classification.
- Search history tracking with status, result count, duplicate count, and API call count.
- Formal `SearchResult` relationship between searches and places.
- Responsive dashboard with analytics cards and mobile-friendly result cards.
- AI summary generation for each saved business lead.
- CSV and Excel exports for sales or CRM workflows.
- API rate limiting and centralized error handling.

---

## 6. System Architecture

The application follows a clean client-server architecture.

```text
React Frontend
  |  Axios HTTP requests with JWT token
  v
Express REST API
  |  Auth middleware, validation, controller logic
  v
Google Places API / Gemini API
  |  Raw external data
  v
Validation + Deduplication + Lead Scoring Services
  |  Clean business records
  v
MongoDB Collections
  |  User, Place, SearchHistory, SearchResult
  v
Dashboard, History, Export, AI Summary
```

### Main frontend areas

- `Dashboard.jsx`: Main command center for searching and reviewing leads.
- `SearchForm.jsx`: Captures keyword, city/location, radius, and max results.
- `ResultsTable.jsx`: Displays desktop table and responsive mobile cards.
- `AnalyticsCards.jsx`: Shows total places, rating, new records, duplicates, and API calls.
- `ExportButton.jsx`: Downloads current data as CSV or Excel.
- `SearchHistory.jsx` and `HistoryResults.jsx`: Let users revisit previous searches.

### Main backend areas

- `placeController.js`: Main search, list, delete, status, and AI summary logic.
- `googlePlaces.js`: Google Text Search and Place Details integration.
- `validation.js`: Cleans and validates incoming place data.
- `deduplication.js`: Detects duplicate businesses.
- `leadScoring.js`: Calculates lead quality.
- `gemini.js`: Generates AI summaries.
- `exportController.js`: Generates CSV and Excel files.
- `authController.js`: Handles registration, login, and current user.

---

## 7. Google Places API Usage and Implementation

The system uses two Google Places endpoints because a single search call does not provide all useful business data.

### 7.1 Text Search API

Endpoint:

```text
https://maps.googleapis.com/maps/api/place/textsearch/json
```

Purpose:

The Text Search API finds businesses matching a user query. The backend builds a query like:

```text
{keyword} in {location}
```

Example:

```text
Hospitals in Nashik
```

This returns initial business records containing data such as:

- `place_id`
- name
- address
- rating
- geometry coordinates
- business types
- pagination token

### 7.2 Place Details API

Endpoint:

```text
https://maps.googleapis.com/maps/api/place/details/json
```

Purpose:

Text Search does not reliably include phone number, website, full opening hours, and complete review information. For every `place_id`, the backend calls Place Details API and requests only the fields needed by the platform.

Requested fields:

```text
place_id,
name,
types,
formatted_address,
geometry,
formatted_phone_number,
international_phone_number,
website,
rating,
user_ratings_total,
opening_hours
```

This selective field usage keeps the response focused and avoids storing unnecessary raw data.

### 7.3 Pagination and API Call Tracking

Google Text Search returns limited results per page. The backend supports pagination through `next_page_token` and waits before requesting the next page because Google page tokens need time to become active.

The system also tracks the number of Google API calls per search and stores that value in `SearchHistory.apiCalls`. This is important for cost awareness and operational transparency.

---

## 8. Complete Data Flow

When a user submits a search from the dashboard, this is the backend flow:

1. The frontend sends `POST /api/places/search` with keyword, location, radius, and max results.
2. Auth middleware verifies the JWT token and attaches the user to the request.
3. The backend validates that keyword and location are present.
4. A `SearchHistory` record is created with status `processing`.
5. The backend calls Google Places Text Search API.
6. If more pages exist, the backend uses `next_page_token` with retry handling for subsequent pages.
7. For each result, the backend calls Google Place Details API using the Google `place_id`.
8. Raw Google data is sent through validation and cleaning.
9. Existing records are checked using the user-specific Google place ID.
10. Fuzzy duplicate detection checks similar names within close geographic distance.
11. New places are scored and stored in the `Place` collection.
12. Every search-place relationship is recorded in `SearchResult`.
13. `SearchHistory` is updated with final status, result count, new count, duplicate count, and API calls.
14. The API returns sorted lead data to the frontend.
15. The dashboard displays analytics, results, export options, and AI summary actions.

---

## 9. How Data Is Received From Google and Stored

### Raw Google response

Google returns data using its own structure, for example:

```json
{
  "place_id": "ChIJ...",
  "name": "ABC Hospital",
  "formatted_address": "Nashik, Maharashtra",
  "geometry": {
    "location": {
      "lat": 19.9975,
      "lng": 73.7898
    }
  },
  "formatted_phone_number": "+91 98765 43210",
  "website": "https://example.com",
  "rating": 4.5,
  "user_ratings_total": 420,
  "types": ["hospital", "health", "point_of_interest"]
}
```

### Clean internal shape

Before saving, the system transforms the raw response into the platform's internal `Place` format:

```json
{
  "placeId": "ChIJ...",
  "name": "ABC Hospital",
  "category": "hospital",
  "address": "Nashik, Maharashtra",
  "lat": 19.9975,
  "lng": 73.7898,
  "phone": "+91 98765 43210",
  "website": "https://example.com/",
  "rating": 4.5,
  "reviewCount": 420,
  "openingHours": [],
  "searchKeyword": "Hospitals",
  "searchLocation": "Nashik",
  "leadScore": 100,
  "leadTier": "high",
  "source": "google_places"
}
```

The project does not blindly store the entire Google response. It stores a clean, application-specific model that is easier to query, export, and display.

---

## 10. Validation and Cleaning

Validation is handled in `server/src/controllers/services/validation.js`.

The purpose is to prevent broken or inconsistent records from entering MongoDB.

### Validation rules

| Field | Validation / Cleaning |
|---|---|
| place ID | Required. If missing, the record is skipped. |
| name | Required and trimmed. If missing, the record is skipped. |
| category | Derived from the first Google type and converted from underscores to readable text. |
| address | Trimmed and stored as `null` if unavailable. |
| latitude | Must be a number between -90 and 90. |
| longitude | Must be a number between -180 and 180. |
| phone | Trimmed and whitespace-normalized. |
| website | Parsed with JavaScript `URL`; invalid URLs become `null`. |
| rating | Stored only if it is numeric. |
| review count | Defaults to `0` if unavailable. |
| opening hours | Stored as an array, defaults to `[]`. |

This makes the database safer for analytics, filtering, export, and future map visualization.

---

## 11. Deduplication Strategy

Deduplication is one of the strongest parts of the system because it prevents repeated business records across multiple searches.

Deduplication happens in two layers.

### 11.1 Primary deduplication: Google Place ID

Every Google place has a `place_id`. The backend stores this value as `Place.placeId`.

The project enforces a user-specific unique index:

```text
{ user: 1, placeId: 1 } unique
```

This means the same user cannot store the same Google business twice.

Before saving new results, the backend runs a query like:

```text
Find all existing places for this user where placeId is in the incoming Google place IDs.
```

If a match exists, the result is marked as a duplicate with reason `placeId` and is not inserted again.

### 11.2 Secondary deduplication: fuzzy name and distance

Some duplicate-like businesses may have slightly different names. For example:

```text
ABC Industries
ABC Industries Pvt Ltd
```

The system handles this with fuzzy matching:

- Business names are normalized to lowercase alphanumeric text.
- The system calculates string similarity using bigram comparison.
- It calculates physical distance using the Haversine formula.
- A record is considered a duplicate when:

```text
name similarity >= 0.86
AND distance <= 0.1 km
```

That means two records with very similar names within 100 meters are treated as duplicates.

### 11.3 Duplicate tracking

Duplicates are not silently ignored. They are counted and recorded in two places:

- `SearchHistory.duplicateCount`
- `SearchResult.duplicate` and `SearchResult.duplicateReason`

This gives the dashboard and history page useful data quality metrics.

---

## 12. Lead Scoring and Lead Tiering

Lead scoring is handled in `server/src/controllers/services/leadScoring.js`.

The current implementation uses clear, explainable business rules rather than black-box AI. This is useful in a company setting because the score can be explained to sales and operations teams.

### Score formula

| Signal | Points | Reason |
|---|---:|---|
| Website exists | 30 | Business has online presence and can be researched further. |
| Phone exists | 20 | Business is directly contactable. |
| Address exists | 15 | Lead has a clear physical location. |
| Coordinates exist | 10 | Lead can be used in geospatial workflows. |
| Rating >= 4 | 15 | Indicates positive public reputation. |
| Review count >= 25 | 10 | Indicates the profile has meaningful activity. |

Maximum score: `100`.

### Lead tiers

| Score Range | Tier |
|---|---|
| 80 - 100 | high |
| 60 - 79 | medium |
| 0 - 59 | low |

Example:

A business with website, phone, address, coordinates, 4.5 rating, and 100 reviews receives a score of 100 and is classified as a high-priority lead.

This helps users quickly decide which records should be contacted first.

---

## 13. Database Schema Relationships

The backend uses four main MongoDB collections.

### 13.1 User

Stores registered users.

Important fields:

```text
name
email
password
```

Passwords are hashed with bcrypt before storage. API access is protected using JWT.

### 13.2 Place

Stores unique business records for each user.

Important fields:

```text
user
placeId
name
category
address
lat
lng
phone
website
rating
reviewCount
openingHours
searchKeyword
searchLocation
leadScore
leadTier
rawTypes
source
aiSummary
```

Important indexes:

```text
{ user: 1, placeId: 1 } unique
{ user: 1, lat: 1, lng: 1 }
{ user: 1, searchKeyword: 1, searchLocation: 1 }
{ user: 1, leadTier: 1 }
```

### 13.3 SearchHistory

Stores metadata for every search.

Important fields:

```text
user
keyword
location
radius
status
jobId
resultsCount
newCount
duplicateCount
apiCalls
errorMessage
```

This collection answers questions like:

- What did the user search?
- How many results came back?
- How many were new?
- How many were duplicates?
- How many Google API calls were used?
- Did the search succeed or fail?

### 13.4 SearchResult

This collection links a search to the places discovered by that search.

Important fields:

```text
user
searchHistory
place
googlePlaceId
isNewlyAdded
duplicate
duplicateReason
```

This creates a formal relationship:

```text
User -> SearchHistory -> SearchResult -> Place
```

Conceptually:

```text
One user can perform many searches.
One search can return many search results.
One place can appear in many searches.
SearchResult connects searches and places cleanly.
```

This is better than only storing keyword and location on each place because it supports a real many-to-many relationship between searches and business records.

---

## 14. AI Summary Integration

The project includes AI-powered lead summaries using Gemini.

Endpoint:

```http
POST /api/places/:id/summary
```

Flow:

1. The frontend user clicks the AI summary action for a place.
2. The backend validates the place ID and confirms the place belongs to the authenticated user.
3. If the place already has `aiSummary`, the cached summary is returned immediately.
4. If not, the backend calls Gemini 2.5 Flash.
5. The prompt asks Gemini to act as a lead intelligence analyst.
6. Gemini returns a concise 3-4 sentence business summary.
7. The summary is saved back to the `Place.aiSummary` field.
8. The frontend displays the summary in the result table or mobile card.

### Prompt intent

The prompt includes:

- Business name
- Category
- Address
- Phone
- Website
- Context about whether a website exists

If a website is available, the summary focuses on business offerings, target audience, and possible selling points. If there is no website, the prompt asks for a likely service summary and outreach suggestion based on name and category.

### Fallback behavior

If Gemini fails or the API key is unavailable, the backend generates a contextual fallback summary using the available place data. This prevents the feature from breaking the user experience.

---

## 15. Authentication and User-Specific Data

The platform supports user accounts.

### Registration

Endpoint:

```http
POST /api/auth/register
```

The backend validates name, email, and password. Passwords are hashed with bcrypt before storage.

### Login

Endpoint:

```http
POST /api/auth/login
```

On successful login, the backend returns a JWT token.

### Protected routes

Routes such as place search, history, export, and AI summary use authentication middleware. The middleware verifies the JWT token and loads the user from MongoDB.

This is important because all important collections are user-scoped:

```text
Place.user
SearchHistory.user
SearchResult.user
```

So one user's data does not mix with another user's data.

---

## 16. Dashboard and Frontend Experience

The dashboard is designed as a business intelligence workspace rather than a basic table.

Key dashboard features:

- Search form for keyword, city/location, radius, and max results.
- Live loading state while Google data is being fetched and processed.
- Analytics cards for places found, average rating, new records, duplicates removed, and API calls.
- Responsive result display: desktop table for large screens and card layout for mobile screens.
- Lead tier badges and lead score display.
- Phone and website actions.
- Opening hours expansion.
- AI summary action per record.
- CSV and Excel export actions.
- Search history pages for reviewing previous searches.

This gives the project a polished product feel suitable for demos and HR/company presentations.

---

## 17. Export System

The platform supports exporting lead data for real business use.

### CSV export

Endpoint:

```http
GET /api/export/csv
```

### Excel export

Endpoint:

```http
GET /api/export/excel
```

Exports can be filtered by:

- history ID
- selected place IDs
- keyword
- location/city
- lead tier

Exported fields include:

```text
name
category
address
latitude
longitude
phone
website
rating
reviewCount
leadScore
leadTier
searchKeyword
searchLocation
googlePlaceId
```

This makes the output useful for sales teams, CRM imports, reporting, and offline analysis.

---

## 18. API Endpoints

### Auth

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Places

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/places/search` | Search Google Places and store clean results |
| GET | `/api/places/status/:jobId` | Get search status |
| GET | `/api/places` | Get saved places with filters and pagination |
| GET | `/api/places/:id` | Get one place |
| DELETE | `/api/places/:id` | Delete one place |
| POST | `/api/places/:id/summary` | Generate or return AI summary |

### History

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/history` | Get recent search history |
| GET | `/api/history/:id/results` | Get places linked to a search |
| DELETE | `/api/history` | Clear search history relationships |

### Export

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/export/csv` | Export places as CSV |
| GET | `/api/export/excel` | Export places as Excel |

### Health

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Backend health check |

---

## 19. Error Handling and Reliability

The backend includes centralized error handling and useful safeguards.

Reliability features:

- Required environment variable checks for Google Places API and Gemini API.
- Google API status validation for `OK` and `ZERO_RESULTS`.
- Graceful fallback when details fetch fails for an individual place.
- Retry handling for subsequent Google Text Search pages.
- Rate limiting on `/api` routes.
- Structured error responses through centralized middleware.
- User-specific authorization checks before reading or modifying data.

Example error response:

```json
{
  "success": false,
  "message": "Google Places Text Search failed with status REQUEST_DENIED"
}
```

---

## 20. Why This Project Is Impressive

This project is more than a CRUD application. It demonstrates several real-world engineering skills:

- Integration with paid third-party APIs.
- Transformation of raw external API data into a clean domain model.
- Data quality handling through validation and deduplication.
- Explainable lead scoring logic for business prioritization.
- User-specific data isolation with authentication.
- Many-to-many relationship modeling using `SearchResult`.
- AI integration with caching and fallback behavior.
- Export-ready output for real sales workflows.
- Responsive professional dashboard design.
- Backend API design with pagination, filters, history, and status tracking.

For an HR or company demo, the key message is:

> This platform automates the complete lead intelligence pipeline: discovering businesses, enriching their details, cleaning the data, removing duplicates, scoring lead quality, storing searchable history, generating AI summaries, and exporting the final dataset for business use.

---

## 21. Demo Script for Presentation

A good 3-5 minute demo flow:

1. Login to the application.
2. Open the dashboard and explain that it is a location intelligence workspace.
3. Search for a category and city, for example `Hospitals` in `Nashik`.
4. Explain that the backend calls Google Text Search first, then Place Details for each result.
5. Show the analytics cards: total places, average rating, new records, duplicates, and API calls.
6. Open a result and show phone, website, rating, lead tier, and score.
7. Click AI summary and explain Gemini integration and summary caching.
8. Show search history and explain that each search is tracked.
9. Export results to CSV or Excel and explain CRM/sales use.
10. Close by explaining deduplication, validation, and lead scoring as the data quality layer.

---

## 22. Future Improvements

The current project is already functional, but it can be extended further.

Possible improvements:

- Add background job processing with Redis/BullMQ for very large searches.
- Add map visualization using saved latitude and longitude.
- Add advanced filters for lead score, review count, website availability, and phone availability.
- Add charts for category distribution and lead tier distribution.
- Add per-user API quota dashboards.
- Add scheduled searches for recurring lead refresh.
- Add CRM integrations such as HubSpot, Zoho, or Salesforce.
- Add admin dashboard for monitoring users and API usage.
- Add automated tests for services and controllers.

---

## 23. Final Project Positioning

Geo Intelligence Platform is a practical business intelligence and lead generation system. It shows the ability to build a modern full-stack application, integrate external APIs, design meaningful database relationships, process and clean real-world data, apply business scoring logic, and present the final result through a polished dashboard.

It is suitable to present as a company-level project because it solves a recognizable business problem and demonstrates both technical depth and product thinking.
