import express from 'express';
import ReportController from '../controllers/ReportController.js';

const router = express.Router();

// Public for now; can be protected later with authenticateToken
router.get('/summary', ReportController.getSummary);

export default router;


