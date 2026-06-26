import SearchHistory from "../models/SearchHistory.js";
import SearchResult from "../models/SearchResult.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getHistory = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 25), 100);
  const data = await SearchHistory.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(limit);

  res.json({
    success: true,
    count: data.length,
    data,
  });
});

export const getHistoryResults = asyncHandler(async (req, res) => {
  const history = await SearchHistory.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!history) {
    const error = new Error("Search history not found");
    error.statusCode = 404;
    throw error;
  }

  const results = await SearchResult.find({
    user: req.user._id,
    searchHistory: history._id,
  })
    .populate("place")
    .sort({ createdAt: -1 });

  const tierOrder = { high: 1, medium: 2, low: 3 };
  results.sort((a, b) => {
    const tierA = a.place?.leadTier || "low";
    const tierB = b.place?.leadTier || "low";
    
    if (tierOrder[tierA] !== tierOrder[tierB]) {
      return tierOrder[tierA] - tierOrder[tierB];
    }
    
    const scoreA = a.place?.leadScore || 0;
    const scoreB = b.place?.leadScore || 0;
    return scoreB - scoreA;
  });

  res.json({
    success: true,
    data: {
      history,
      results,
    },
  });
});

export const clearHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  await Promise.all([
    SearchHistory.deleteMany({ user: userId }),
    SearchResult.deleteMany({ user: userId }),
  ]);

  res.json({
    success: true,
    message: "Search history cleared successfully.",
  });
});
