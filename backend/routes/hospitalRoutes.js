// routes/hospitalRoutes.js
import express from 'express';
import HospitalController from '../controllers/HospitalController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// SOLID Principle: Single Responsibility Principle (SRP)
// This router is responsible only for hospital-related routes

// Public routes
router.get('/', HospitalController.getAllHospitals);
router.get('/:id', HospitalController.getHospital);
router.get('/name/:name', HospitalController.getHospitalByName);

// Protected routes - require authentication
router.use(authenticateToken);

// Admin only routes
router.post('/', requireRole(['admin']), HospitalController.createHospital);
router.put('/:id', requireRole(['admin']), HospitalController.updateHospital);
router.delete('/:id', requireRole(['admin']), HospitalController.deleteHospital);

export default router;
