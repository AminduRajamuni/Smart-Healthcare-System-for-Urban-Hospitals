// routes/medicalReportRoutes.js
import express from 'express';
import MedicalReportController from '../controllers/MedicalReportController.js';

const router = express.Router();

// Public routes for demo/testing
router.get('/', MedicalReportController.getAllReports);
router.post('/:patientId', MedicalReportController.createReport);
router.get('/:patientId', MedicalReportController.getReports);
router.delete('/:id', MedicalReportController.deleteReport);

export default router;


