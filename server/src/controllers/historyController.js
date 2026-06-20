import SearchHistory from '../models/SearchHistory.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getHistory = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 25), 100);
  const data = await SearchHistory.find().sort({ createdAt: -1 }).limit(limit);

  res.json({
    success: true,
    count: data.length,
    data,
  });
});
