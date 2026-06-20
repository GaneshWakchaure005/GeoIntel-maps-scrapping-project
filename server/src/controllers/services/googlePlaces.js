const axios = require('axios');

const TEXT_SEARCH_URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
const DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json';
const DETAILS_FIELDS = [
  'place_id',
  'name',
  'types',
  'formatted_address',
  'geometry',
  'formatted_phone_number',
  'international_phone_number',
  'website',
  'rating',
  'user_ratings_total',
  'opening_hours',
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

function assertGoogleStatus(data, operation) {
  const okStatuses = ['OK', 'ZERO_RESULTS'];

  if (!okStatuses.includes(data.status)) {
    const error = new Error(`Google Places ${operation} failed with status ${data.status}`);
    error.statusCode = data.status === 'REQUEST_DENIED' ? 401 : 502;
    error.details = data.error_message;
    throw error;
  }
}

async function textSearchPage({ keyword, location, radius, pageToken }) {
  const params = {
    key: getApiKey(),
  };

  if (pageToken) {
    params.pagetoken = pageToken;
  } else {
    params.query = `${keyword} in ${location}`;
    params.radius = radius;
  }

  const response = await axios.get(TEXT_SEARCH_URL, { params, timeout: 15000 });
  assertGoogleStatus(response.data, 'Text Search');

  return response.data;
}

async function getPlaceDetails(placeId) {
  const response = await axios.get(DETAILS_URL, {
    params: {
      key: getApiKey(),
      place_id: placeId,
      fields: DETAILS_FIELDS,
    },
    timeout: 15000,
  });

  assertGoogleStatus(response.data, 'Details');
  return response.data.result || null;
}

async function searchGooglePlaces({ keyword, location, radius = 10000, maxResults }) {
  const maxPages = Number(process.env.GOOGLE_TEXT_SEARCH_MAX_PAGES || 3);
  const resultLimit = Math.min(Number(maxResults || process.env.GOOGLE_MAX_RESULTS || 40), 60);
  const textResults = [];
  let nextPageToken = null;
  let apiCalls = 0;

  for (let page = 0; page < maxPages && textResults.length < resultLimit; page += 1) {
    if (nextPageToken) {
      await sleep(2100);
    }

    const pageData = await textSearchPage({
      keyword,
      location,
      radius,
      pageToken: nextPageToken,
    });
    apiCalls += 1;

    textResults.push(...(pageData.results || []));
    nextPageToken = pageData.next_page_token;

    if (!nextPageToken || pageData.status === 'ZERO_RESULTS') {
      break;
    }
  }

  const limitedResults = textResults.slice(0, resultLimit);
  const detailedResults = [];

  for (const result of limitedResults) {
    if (!result.place_id) continue;

    try {
      const details = await getPlaceDetails(result.place_id);
      apiCalls += 1;
      detailedResults.push({ ...result, ...details });
    } catch (error) {
      detailedResults.push(result);
    }
  }

  return {
    places: detailedResults,
    apiCalls,
  };
}

module.exports = {
  searchGooglePlaces,
};
