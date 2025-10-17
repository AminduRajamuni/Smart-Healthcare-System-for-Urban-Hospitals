// routes/doctorRoutes.js
import express from 'express';
import DoctorController from '../controllers/DoctorController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// SOLID Principle: Single Responsibility Principle (SRP)
// This router is responsible only for doctor-related routes

// Public routes - no authentication required for doctor creation
router.post('/', DoctorController.createDoctor);
router.get('/', DoctorController.getAllDoctors);
router.get('/:id', DoctorController.getDoctor);
router.put('/:id', DoctorController.updateDoctor);
router.delete('/:id', DoctorController.deleteDoctor);
router.get('/specialization/:specialization', DoctorController.getDoctorsBySpecialization);

export default router;
