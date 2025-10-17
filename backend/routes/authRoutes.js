// routes/authRoutes.js
import express from 'express';
import AuthController from '../controllers/AuthController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// SOLID Principle: Single Responsibility Principle (SRP)
// This router is responsible only for authentication-related routes

// Public routes
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);

// Protected routes
router.use(authenticateToken);
router.get('/profile', AuthController.getProfile);
router.put('/profile', AuthController.updateProfile);

export default router;
