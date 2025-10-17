// controllers/HospitalController.js
import HospitalService from '../services/HospitalService.js';

// SOLID Principle: Single Responsibility Principle (SRP)
// This controller is responsible only for handling HTTP requests related to hospitals
class HospitalController {
  async createHospital(req, res) {
    try {
      const hospital = await HospitalService.createHospital(req.body);
      res.status(201).json({
        success: true,
        message: 'Hospital created successfully',
        data: hospital
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getHospital(req, res) {
    try {
      const { id } = req.params;
      const hospital = await HospitalService.getHospitalById(id);
      res.status(200).json({
        success: true,
        data: hospital
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAllHospitals(req, res) {
    try {
      const hospitals = await HospitalService.getAllHospitals();
      res.status(200).json({
        success: true,
        data: hospitals
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateHospital(req, res) {
    try {
      const { id } = req.params;
      const hospital = await HospitalService.updateHospital(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Hospital updated successfully',
        data: hospital
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteHospital(req, res) {
    try {
      const { id } = req.params;
      await HospitalService.deleteHospital(id);
      res.status(200).json({
        success: true,
        message: 'Hospital deleted successfully'
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
  async getHospitalByName(req, res) {
    try {
      const { name } = req.params;
      const hospital = await HospitalService.getHospitalByName(name);
      res.status(200).json({
        success: true,
        data: hospital
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new HospitalController();
