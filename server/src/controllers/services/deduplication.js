function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function bigrams(value) {
  const normalized = normalize(value);
  const pairs = [];

  for (let i = 0; i < normalized.length - 1; i += 1) {
    pairs.push(normalized.slice(i, i + 2));
  }

  return pairs;
}

function stringSimilarity(first, second) {
  const firstPairs = bigrams(first);
  const secondPairs = bigrams(second);

  if (firstPairs.length === 0 || secondPairs.length === 0) {
    return first === second ? 1 : 0;
  }

  const secondCounts = new Map();
  secondPairs.forEach((pair) => {
    secondCounts.set(pair, (secondCounts.get(pair) || 0) + 1);
  });

  let intersection = 0;
  firstPairs.forEach((pair) => {
    const count = secondCounts.get(pair) || 0;
    if (count > 0) {
      intersection += 1;
      secondCounts.set(pair, count - 1);
    }
  });

  return (2 * intersection) / (firstPairs.length + secondPairs.length);
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function haversineKm(firstLat, firstLng, secondLat, secondLng) {
  if ([firstLat, firstLng, secondLat, secondLng].some((value) => typeof value !== 'number')) {
    return Number.POSITIVE_INFINITY;
  }

  const earthRadiusKm = 6371;
  const dLat = toRadians(secondLat - firstLat);
  const dLng = toRadians(secondLng - firstLng);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRadians(firstLat)) * Math.cos(toRadians(secondLat))
    * Math.sin(dLng / 2) ** 2;

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(a));
}

export function isFuzzyDuplicate(newPlace, existingPlaces) {
  return existingPlaces.some((existingPlace) => {
    const nameSimilarity = stringSimilarity(newPlace.name, existingPlace.name);
    const distance = haversineKm(newPlace.lat, newPlace.lng, existingPlace.lat, existingPlace.lng);
    return nameSimilarity >= 0.86 && distance <= 0.1;
  });
}
