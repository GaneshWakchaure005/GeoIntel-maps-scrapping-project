const SearchHistory = require('../models/SearchHistory');
const asyncHandler = require('../utils/asyncHandler');

const getHistory = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 25), 100);
  const data = await SearchHistory.find().sort({ createdAt: -1 }).limit(limit);

  res.json({
    success: true,
    count: data.length,
    data,
  });
});

module.exports = {
  getHistory,
};
