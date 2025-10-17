// routes/appointmentRoutes.js
import express from 'express';
import AppointmentController from '../controllers/AppointmentController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All appointment routes require authentication
router.use(authenticateToken);

// Create a new appointment
router.post('/', AppointmentController.createAppointment);

// Get all appointments for a patient
router.get('/patient/:patientId', AppointmentController.getPatientAppointments);

// Get all appointments for a doctor
router.get('/doctor/:doctorId', AppointmentController.getDoctorAppointments);

// Get appointment by ID
router.get('/:appointmentId', AppointmentController.getAppointment);

// Update appointment status (doctor/hospital only)
router.put('/:appointmentId/status', requireRole(['doctor', 'hospital']), AppointmentController.updateAppointmentStatus);

// Cancel appointment (patient/doctor/hospital)
router.put('/:appointmentId/cancel', AppointmentController.cancelAppointment);

// Get available time slots for a doctor on a specific date
router.get('/:doctorId/slots/:date', AppointmentController.getAvailableSlots);

// Get appointments by date range (with optional filters)
router.get('/date-range/search', AppointmentController.getAppointmentsByDateRange);

export default router;
