function calculateLeadScore(place) {
  let score = 0;

  if (place.website) score += 30;
  if (place.phone) score += 20;
  if (place.address) score += 15;
  if (place.lat !== null && place.lng !== null) score += 10;
  if (typeof place.rating === 'number' && place.rating >= 4) score += 15;
  if (typeof place.reviewCount === 'number' && place.reviewCount >= 25) score += 10;

  return Math.min(score, 100);
}

function getLeadTier(score) {
  if (score >= 80) return 'hot';
  if (score >= 60) return 'warm';
  return 'cold';
}

module.exports = {
  calculateLeadScore,
  getLeadTier,
};
