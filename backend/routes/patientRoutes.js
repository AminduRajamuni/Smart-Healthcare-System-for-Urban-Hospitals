// routes/patientRoutes.js
import express from 'express';

// SOLID Principle: Single Responsibility Principle (SRP)
// This router defines only patient-related HTTP endpoints
import PatientController from '../controllers/PatientController.js';

const router = express.Router();

// Patient routes - no authentication required for creation and login
router.post('/create', PatientController.createPatient);
router.post('/login', PatientController.loginPatient);
router.get('/profile/:patientId', PatientController.getPatientProfile);
router.get('/all', PatientController.getAllPatients);
router.put('/update/:patientId', PatientController.updatePatient);

export default router;
