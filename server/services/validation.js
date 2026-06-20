const { calculateLeadScore, getLeadTier } = require('./leadScoring');

function isValidLat(lat) {
  return typeof lat === 'number' && lat >= -90 && lat <= 90;
}

function isValidLng(lng) {
  return typeof lng === 'number' && lng >= -180 && lng <= 180;
}

function cleanString(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function normalizePhone(phone) {
  const cleaned = cleanString(phone);
  return cleaned ? cleaned.replace(/\s+/g, ' ') : null;
}

function normalizeWebsite(website) {
  const cleaned = cleanString(website);
  if (!cleaned) return null;

  try {
    const url = new URL(cleaned.startsWith('http') ? cleaned : `https://${cleaned}`);
    return url.toString();
  } catch (error) {
    return null;
  }
}

function getCategory(rawPlace) {
  if (Array.isArray(rawPlace.types) && rawPlace.types.length > 0) {
    return rawPlace.types[0].replace(/_/g, ' ');
  }

  return null;
}

function validateAndCleanPlace(rawPlace, context = {}) {
  const lat = rawPlace.geometry?.location?.lat;
  const lng = rawPlace.geometry?.location?.lng;
  const name = cleanString(rawPlace.name);

  if (!rawPlace.place_id || !name) {
    return null;
  }

  const cleaned = {
    placeId: rawPlace.place_id,
    name,
    category: getCategory(rawPlace),
    address: cleanString(rawPlace.formatted_address || rawPlace.vicinity),
    lat: isValidLat(lat) ? lat : null,
    lng: isValidLng(lng) ? lng : null,
    phone: normalizePhone(rawPlace.formatted_phone_number || rawPlace.international_phone_number),
    website: normalizeWebsite(rawPlace.website),
    rating: typeof rawPlace.rating === 'number' ? rawPlace.rating : null,
    reviewCount: typeof rawPlace.user_ratings_total === 'number' ? rawPlace.user_ratings_total : 0,
    openingHours: rawPlace.opening_hours?.weekday_text || [],
    searchKeyword: context.keyword || null,
    searchLocation: context.location || null,
    rawTypes: Array.isArray(rawPlace.types) ? rawPlace.types : [],
  };

  cleaned.leadScore = calculateLeadScore(cleaned);
  cleaned.leadTier = getLeadTier(cleaned.leadScore);

  return cleaned;
}

module.exports = {
  validateAndCleanPlace,
};
