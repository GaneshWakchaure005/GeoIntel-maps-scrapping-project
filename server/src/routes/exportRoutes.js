const express = require('express');
const { exportCsv, exportExcel } = require('../controllers/exportController');

const router = express.Router();

router.get('/csv', exportCsv);
router.get('/excel', exportExcel);

module.exports = router;
