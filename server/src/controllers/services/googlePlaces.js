import axios from 'axios';

const TEXT_SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText';
const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.websiteUri',
  'places.rating',
  'places.userRatingCount',
  'places.businessStatus',
  'places.primaryType',
  'places.types',
  'places.internationalPhoneNumber',
  'places.nationalPhoneNumber',
  'places.regularOpeningHours',
  'nextPageToken',
].join(',');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getApiKey() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    const error = new Error('GOOGLE_PLACES_API_KEY is required');
    error.statusCode = 500;
    throw error;
  }

  return apiKey;
}

async function searchTextPage({ keyword, location, radius, pageToken }) {
  const data = {
    textQuery: `${keyword} in ${location}`
  };

  if (pageToken) {
    data.pageToken = pageToken;
  }

  const headers = {
    'X-Goog-Api-Key': getApiKey(),
    'X-Goog-FieldMask': FIELD_MASK,
    'Content-Type': 'application/json',
  };

  try {
    const response = await axios.post(TEXT_SEARCH_URL, data, { headers, timeout: 15000 });
    return response.data;
  } catch (error) {
    const err = new Error(`Google Places Text Search failed: ${error.message}`);
    err.statusCode = error.response?.status || 502;
    err.details = error.response?.data || error.message;
    throw err;
  }
}

export async function searchGooglePlaces({ keyword, location, radius, maxResults }) {
  const maxPages = Number(process.env.GOOGLE_TEXT_SEARCH_MAX_PAGES || 3);
  const resultLimit = Math.min(Number(maxResults || process.env.GOOGLE_MAX_RESULTS || 40), 60);
  const textResults = [];
  let nextPageToken = null;
  let apiCalls = 0;

  for (let page = 0; page < maxPages && textResults.length < resultLimit; page += 1) {
    let pageData = null;

    if (page === 0) {
      // First page is required, if it fails, throw
      pageData = await searchTextPage({
        keyword,
        location,
        radius,
        pageToken: nextPageToken,
      });
      apiCalls += 1;
    } else {
      // Subsequent pages: try with retry logic and graceful fallback
      if (nextPageToken) {
        await sleep(6000); // Sleep to allow next page to become valid (legacy API behavior, can keep it or reduce it. Keeping it as requested to "Preserve business logic")
      }

      let attempts = 3;
      let success = false;

      while (attempts > 0 && !success) {
        try {
          pageData = await searchTextPage({
            keyword,
            location,
            radius,
            pageToken: nextPageToken,
          });
          apiCalls += 1;
          success = true;
        } catch (error) {
          attempts -= 1;
          console.warn(`Google Places subsequent page fetch failed (attempts remaining: ${attempts}). Error: ${error.message}`);

          if (error.statusCode === 401 || error.statusCode === 403) {
            attempts = 0; // Don't retry if it is an authorization issue
          } else if (attempts > 0) {
            console.log('Waiting 5000ms before retrying...');
            await sleep(5000);
          }
        }
      }

      if (!success || !pageData) {
        console.warn('Could not retrieve subsequent page results. Returning accumulated results.');
        break;
      }
    }

    if (pageData.places) {
      textResults.push(...pageData.places);
    }
    
    nextPageToken = pageData.nextPageToken;

    if (!nextPageToken) {
      break;
    }
  }

  const limitedResults = textResults.slice(0, resultLimit);

  return {
    places: limitedResults,
    apiCalls,
  };
}
