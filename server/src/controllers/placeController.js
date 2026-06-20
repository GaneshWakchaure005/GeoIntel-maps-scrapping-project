const mongoose = require('mongoose');

const Place = require('../models/Place');
const SearchHistory = require('../models/SearchHistory');
const asyncHandler = require('../utils/asyncHandler');
const { isFuzzyDuplicate } = require('./services/deduplication');
const { searchGooglePlaces } = require('./services/googlePlaces');
const { validateAndCleanPlace } = require('./services/validation');

function parsePositiveNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function buildPlaceQuery(query) {
  const filters = {};

  if (query.keyword) {
    filters.searchKeyword = new RegExp(String(query.keyword), 'i');
  }

  if (query.location || query.city) {
    filters.searchLocation = new RegExp(String(query.location || query.city), 'i');
  }

  if (query.tier) {
    filters.leadTier = query.tier;
  }

  if (query.hasWebsite === 'true') {
    filters.website = { $ne: null };
  }

  if (query.hasPhone === 'true') {
    filters.phone = { $ne: null };
  }

  if (query.minRating) {
    filters.rating = { $gte: Number(query.minRating) };
  }

  return filters;
}

const searchPlaces = asyncHandler(async (req, res) => {
  const keyword = String(req.body.keyword || '').trim();
  const location = String(req.body.location || req.body.city || '').trim();
  const radius = parsePositiveNumber(req.body.radius, 10000);
  const maxResults = parsePositiveNumber(req.body.maxResults, Number(process.env.GOOGLE_MAX_RESULTS || 40));

  if (!keyword || !location) {
    const error = new Error('keyword and location are required');
    error.statusCode = 400;
    throw error;
  }

  const history = await SearchHistory.create({
    keyword,
    location,
    radius,
    status: 'processing',
  });
  history.jobId = history._id.toString();
  await history.save();

  try {
    const googleResult = await searchGooglePlaces({ keyword, location, radius, maxResults });
    const cleanedPlaces = googleResult.places
      .map((place) => validateAndCleanPlace(place, { keyword, location }))
      .filter(Boolean);

    const existingByPlaceId = await Place.find({
      placeId: { $in: cleanedPlaces.map((place) => place.placeId) },
    });
    const existingPlaceIds = new Set(existingByPlaceId.map((place) => place.placeId));
    const fuzzyComparisonPlaces = await Place.find({
      searchLocation: new RegExp(location, 'i'),
    }).limit(500);

    const placesToInsert = [];
    let duplicateCount = 0;

    for (const place of cleanedPlaces) {
      if (existingPlaceIds.has(place.placeId)) {
        duplicateCount += 1;
        continue;
      }

      if (isFuzzyDuplicate(place, [...fuzzyComparisonPlaces, ...placesToInsert])) {
        duplicateCount += 1;
        continue;
      }

      placesToInsert.push(place);
    }

    const insertedPlaces = placesToInsert.length > 0
      ? await Place.insertMany(placesToInsert, { ordered: false })
      : [];

    history.status = 'done';
    history.resultsCount = cleanedPlaces.length;
    history.newCount = insertedPlaces.length;
    history.duplicateCount = duplicateCount;
    history.apiCalls = googleResult.apiCalls;
    await history.save();

    const data = await Place.find({
      placeId: { $in: cleanedPlaces.map((place) => place.placeId) },
    }).sort({ leadScore: -1, rating: -1 });

    res.status(201).json({
      success: true,
      jobId: history.jobId,
      count: data.length,
      newCount: insertedPlaces.length,
      duplicateCount,
      apiCalls: googleResult.apiCalls,
      data,
    });
  } catch (error) {
    history.status = 'failed';
    history.errorMessage = error.message;
    await history.save();
    throw error;
  }
});

const getPlaces = asyncHandler(async (req, res) => {
  const page = parsePositiveNumber(req.query.page, 1);
  const limit = Math.min(parsePositiveNumber(req.query.limit, 20), 100);
  const skip = (page - 1) * limit;
  const filters = buildPlaceQuery(req.query);

  const [data, total] = await Promise.all([
    Place.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Place.countDocuments(filters),
  ]);

  res.json({
    success: true,
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
    count: data.length,
    data,
  });
});

const getPlaceById = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    const error = new Error('Invalid place id');
    error.statusCode = 400;
    throw error;
  }

  const place = await Place.findById(req.params.id);

  if (!place) {
    const error = new Error('Place not found');
    error.statusCode = 404;
    throw error;
  }

  res.json({ success: true, data: place });
});

const deletePlace = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    const error = new Error('Invalid place id');
    error.statusCode = 400;
    throw error;
  }

  const deleted = await Place.findByIdAndDelete(req.params.id);

  if (!deleted) {
    const error = new Error('Place not found');
    error.statusCode = 404;
    throw error;
  }

  res.json({ success: true, message: 'Place deleted' });
});

const getSearchStatus = asyncHandler(async (req, res) => {
  const history = await SearchHistory.findOne({ jobId: req.params.jobId });

  if (!history) {
    const error = new Error('Search job not found');
    error.statusCode = 404;
    throw error;
  }

  res.json({ success: true, data: history });
});

export {
  deletePlace,
  getPlaceById,
  getPlaces,
  getSearchStatus,
  searchPlaces,
};
