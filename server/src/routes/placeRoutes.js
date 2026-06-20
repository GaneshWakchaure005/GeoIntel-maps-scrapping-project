const express = require('express');
const {
  deletePlace,
  getPlaceById,
  getPlaces,
  getSearchStatus,
  searchPlaces,
} = require('../controllers/placeController');

const router = express.Router();

router.post('/search', searchPlaces);
router.get('/status/:jobId', getSearchStatus);
router.get('/', getPlaces);
router.get('/:id', getPlaceById);
router.delete('/:id', deletePlace);

module.exports = router;
