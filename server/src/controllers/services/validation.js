import { calculateLeadScore, getLeadTier } from './leadScoring.js';

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
  if (rawPlace.primaryType) {
    return rawPlace.primaryType.replace(/_/g, ' ');
  }

  if (Array.isArray(rawPlace.types) && rawPlace.types.length > 0) {
    return rawPlace.types[0].replace(/_/g, ' ');
  }

  return null;
}

export function validateAndCleanPlace(rawPlace, context = {}) {
  const lat = rawPlace.location?.latitude;
  const lng = rawPlace.location?.longitude;
  const name = cleanString(rawPlace.displayName?.text);

  if (!rawPlace.id || !name) {
    return null;
  }

  const cleaned = {
    placeId: rawPlace.id,
    name,
    category: getCategory(rawPlace),
    address: cleanString(rawPlace.formattedAddress),
    lat: isValidLat(lat) ? lat : null,
    lng: isValidLng(lng) ? lng : null,
    phone: normalizePhone(rawPlace.nationalPhoneNumber || rawPlace.internationalPhoneNumber),
    website: normalizeWebsite(rawPlace.websiteUri),
    rating: typeof rawPlace.rating === 'number' ? rawPlace.rating : null,
    reviewCount: typeof rawPlace.userRatingCount === 'number' ? rawPlace.userRatingCount : 0,
    openingHours: rawPlace.regularOpeningHours?.weekdayDescriptions || [],
    searchKeyword: context.keyword || null,
    searchLocation: context.location || null,
    rawTypes: Array.isArray(rawPlace.types) ? rawPlace.types : [],
  };

  cleaned.leadScore = calculateLeadScore(cleaned);
  cleaned.leadTier = getLeadTier(cleaned.leadScore);

  return cleaned;
}
