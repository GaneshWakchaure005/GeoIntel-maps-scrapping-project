import express from 'express';
import { exportCsv, exportExcel } from '../controllers/exportController.js';

const router = express.Router();

router.get('/csv', exportCsv);
router.get('/excel', exportExcel);

export default router;
