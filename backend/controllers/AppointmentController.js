// controllers/AppointmentController.js
import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Hospital from '../models/Hospital.js';

class AppointmentController {
  // Create a new appointment
  static async createAppointment(req, res) {
    try {
      const {
        patientId,
        doctorId,
        hospitalId,
        appointmentDate,
        appointmentTime,
        reasonForVisit,
        symptoms,
        priority = 'medium',
        appointmentType = 'consultation'
      } = req.body;

      // Validate required fields
      if (!patientId || !doctorId || !hospitalId || !appointmentDate || !appointmentTime || !reasonForVisit) {
        return res.status(400).json({
          success: false,
          message: 'All required fields must be provided'
        });
      }

      // Check if patient exists
      const patient = await Patient.findById(patientId);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      // Check if doctor exists
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor not found'
        });
      }

      // Check if hospital exists
      const hospital = await Hospital.findById(hospitalId);
      if (!hospital) {
        return res.status(404).json({
          success: false,
          message: 'Hospital not found'
        });
      }

      // Check if the appointment slot is available
      const existingAppointment = await Appointment.findOne({
        doctorId,
        appointmentDate: {
          $gte: new Date(appointmentDate).setHours(0, 0, 0, 0),
          $lt: new Date(appointmentDate).setHours(23, 59, 59, 999)
        },
        appointmentTime,
        status: { $ne: 'cancelled' }
      });

      if (existingAppointment) {
        return res.status(409).json({
          success: false,
          message: 'This time slot is already booked'
        });
      }

      // Create new appointment
      const appointment = new Appointment({
        patientId,
        doctorId,
        hospitalId,
        appointmentDate,
        appointmentTime,
        reasonForVisit,
        symptoms,
        priority,
        appointmentType
      });

      await appointment.save();

      // Populate the appointment with related data
      await appointment.populate([
        { path: 'patientId', select: 'name email contactNumber' },
        { path: 'doctorId', select: 'name specialization experience rating' },
        { path: 'hospitalId', select: 'name location' }
      ]);

      res.status(201).json({
        success: true,
        message: 'Appointment created successfully',
        data: appointment
      });

    } catch (error) {
      console.error('Error creating appointment:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get all appointments for a patient
  static async getPatientAppointments(req, res) {
    try {
      const { patientId } = req.params;

      const appointments = await Appointment.find({ patientId })
        .populate('doctorId', 'name specialization experience rating location')
        .populate('hospitalId', 'name location')
        .sort({ appointmentDate: -1 });

      res.status(200).json({
        success: true,
        data: appointments
      });

    } catch (error) {
      console.error('Error fetching patient appointments:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get all appointments for a doctor
  static async getDoctorAppointments(req, res) {
    try {
      const { doctorId } = req.params;

      const appointments = await Appointment.find({ doctorId })
        .populate('patientId', 'name email contactNumber')
        .populate('hospitalId', 'name location')
        .sort({ appointmentDate: -1 });

      res.status(200).json({
        success: true,
        data: appointments
      });

    } catch (error) {
      console.error('Error fetching doctor appointments:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get appointment by ID
  static async getAppointment(req, res) {
    try {
      const { appointmentId } = req.params;

      const appointment = await Appointment.findById(appointmentId)
        .populate('patientId', 'name email contactNumber')
        .populate('doctorId', 'name specialization experience rating location')
        .populate('hospitalId', 'name location');

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }

      res.status(200).json({
        success: true,
        data: appointment
      });

    } catch (error) {
      console.error('Error fetching appointment:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Update appointment status
  static async updateAppointmentStatus(req, res) {
    try {
      const { appointmentId } = req.params;
      const { status, notes } = req.body;

      const appointment = await Appointment.findByIdAndUpdate(
        appointmentId,
        {
          status,
          notes,
          updatedAt: new Date()
        },
        { new: true }
      ).populate([
        { path: 'patientId', select: 'name email contactNumber' },
        { path: 'doctorId', select: 'name specialization' },
        { path: 'hospitalId', select: 'name location' }
      ]);

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Appointment status updated successfully',
        data: appointment
      });

    } catch (error) {
      console.error('Error updating appointment status:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Cancel appointment
  static async cancelAppointment(req, res) {
    try {
      const { appointmentId } = req.params;

      const appointment = await Appointment.findByIdAndUpdate(
        appointmentId,
        {
          status: 'cancelled',
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Appointment cancelled successfully',
        data: appointment
      });

    } catch (error) {
      console.error('Error cancelling appointment:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get available time slots for a doctor on a specific date
  static async getAvailableSlots(req, res) {
    try {
      const { doctorId, date } = req.params;

      // Get all appointments for the doctor on the given date
      const appointments = await Appointment.find({
        doctorId,
        appointmentDate: {
          $gte: new Date(date).setHours(0, 0, 0, 0),
          $lt: new Date(date).setHours(23, 59, 59, 999)
        },
        status: { $ne: 'cancelled' }
      });

      // Define all possible time slots (9 AM to 5 PM, 30-minute intervals)
      const allSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
        '15:00', '15:30', '16:00', '16:30', '17:00'
      ];

      // Filter out booked slots
      const bookedSlots = appointments.map(apt => apt.appointmentTime);
      const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

      res.status(200).json({
        success: true,
        data: {
          availableSlots,
          bookedSlots,
          totalSlots: allSlots.length,
          availableCount: availableSlots.length
        }
      });

    } catch (error) {
      console.error('Error fetching available slots:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get appointments by date range
  static async getAppointmentsByDateRange(req, res) {
    try {
      const { startDate, endDate, doctorId, patientId } = req.query;

      let filter = {};

      if (startDate && endDate) {
        filter.appointmentDate = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      if (doctorId) {
        filter.doctorId = doctorId;
      }

      if (patientId) {
        filter.patientId = patientId;
      }

      const appointments = await Appointment.find(filter)
        .populate('patientId', 'name email contactNumber')
        .populate('doctorId', 'name specialization')
        .populate('hospitalId', 'name location')
        .sort({ appointmentDate: 1 });

      res.status(200).json({
        success: true,
        data: appointments
      });

    } catch (error) {
      console.error('Error fetching appointments by date range:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
}

export default AppointmentController;
