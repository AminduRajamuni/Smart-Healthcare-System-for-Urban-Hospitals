// controllers/DoctorController.js
import DoctorService from '../services/DoctorService.js';

// SOLID Principle: Single Responsibility Principle (SRP)
// This controller is responsible only for handling HTTP requests related to doctors
class DoctorController {
  async createDoctor(req, res) {
    try {
      // Use the default hospital ID from global variable (set during server startup)
      const defaultHospitalId = global.defaultHospitalId;
      
      if (!defaultHospitalId) {
        return res.status(500).json({
          success: false,
          message: 'Default hospital not initialized. Please restart the server.'
        });
      }
      
      const doctor = await DoctorService.createDoctor(req.body, defaultHospitalId);
      
      res.status(201).json({
        success: true,
        message: 'Doctor created successfully',
        data: doctor
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getDoctor(req, res) {
    try {
      const { id } = req.params;
      const doctor = await DoctorService.getDoctorById(id);
      res.status(200).json({
        success: true,
        data: doctor
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAllDoctors(req, res) {
    try {
      const doctors = await DoctorService.getAllDoctors();
      res.status(200).json({
        success: true,
        data: doctors
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getDoctorsByHospital(req, res) {
    try {
      const hospitalId = req.user.hospital;
      const doctors = await DoctorService.getDoctorsByHospital(hospitalId);
      res.status(200).json({
        success: true,
        data: doctors
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateDoctor(req, res) {
    try {
      const { id } = req.params;
      const doctor = await DoctorService.updateDoctor(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Doctor updated successfully',
        data: doctor
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteDoctor(req, res) {
    try {
      const { id } = req.params;
      await DoctorService.deleteDoctor(id);
      res.status(200).json({
        success: true,
        message: 'Doctor deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // SOLID Principle: Open/Closed Principle (OCP)
  // This method can be extended without modifying existing code
  async getDoctorsBySpecialization(req, res) {
    try {
      const { specialization } = req.params;
      const doctors = await DoctorService.getDoctorsBySpecialization(specialization);
      res.status(200).json({
        success: true,
        data: doctors
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new DoctorController();
