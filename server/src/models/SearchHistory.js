const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema({
  keyword: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  radius: { type: Number, default: 10000 },
  status: {
    type: String,
    enum: ['pending', 'processing', 'done', 'failed'],
    default: 'pending',
  },
  jobId: { type: String, index: true },
  resultsCount: { type: Number, default: 0 },
  newCount: { type: Number, default: 0 },
  duplicateCount: { type: Number, default: 0 },
  apiCalls: { type: Number, default: 0 },
  errorMessage: { type: String, default: null },
}, {
  timestamps: true,
});

const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);

export default SearchHistory;
