// routes/paymentRoutes.js
import express from 'express';
import PaymentController from '../controllers/PaymentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all payments for a specific patient
router.get('/patient/:patientId', PaymentController.getPaymentsByPatientId);

// Get unpaid payments for a patient
router.get('/patient/:patientId/unpaid', PaymentController.getUnpaidPayments);

// Get payment summary for dashboard
router.get('/patient/:patientId/summary', PaymentController.getPaymentSummary);

// Get a specific payment by appointment ID
router.get('/appointment/:appointmentId', PaymentController.getPaymentByAppointmentId);

// Process cash payment
router.post('/appointment/:appointmentId/cash', PaymentController.processCashPayment);

// Process card payment
router.post('/appointment/:appointmentId/card', PaymentController.processCardPayment);

// Process insurance claim
router.post('/appointment/:appointmentId/insurance', PaymentController.processInsuranceClaim);

export default router;
