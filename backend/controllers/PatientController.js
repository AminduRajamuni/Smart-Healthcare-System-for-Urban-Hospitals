// controllers/PatientController.js
import PatientService from '../services/PatientService.js';

// SOLID Principle: Single Responsibility Principle (SRP)
// This controller is responsible only for handling patient-related HTTP requests
class PatientController {
  async createPatient(req, res) {
    try {
      const { name, email, dob, gender, address, contactNumber } = req.body;
      
      // Validate required fields
      if (!name || !email || !dob || !gender || !address || !contactNumber) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }

      // SOLID Principle: Dependency Inversion Principle (DIP)
      // We depend on abstraction (PatientService) not concrete implementation
      const patient = await PatientService.createPatient({
        name,
        email,
        dob,
        gender,
        address,
        contactNumber
      });
      
      res.status(201).json({
        success: true,
        message: 'Patient created successfully',
        data: {
          patientId: patient.patientId,
          name: patient.name,
          email: patient.email,
          dob: patient.dob,
          gender: patient.gender,
          address: patient.address,
          contactNumber: patient.contactNumber
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async loginPatient(req, res) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      const patient = await PatientService.getPatientByEmail(email);
      
      res.status(200).json({
        success: true,
        message: 'Patient login successful',
        data: {
          patientId: patient.patientId,
          name: patient.name,
          email: patient.email,
          dob: patient.dob,
          gender: patient.gender,
          address: patient.address,
          contactNumber: patient.contactNumber
        }
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async getPatientProfile(req, res) {
    try {
      const { patientId } = req.params;
      const patient = await PatientService.getPatientById(patientId);
      
      res.status(200).json({
        success: true,
        data: {
          patientId: patient.patientId,
          name: patient.name,
          email: patient.email,
          dob: patient.dob,
          gender: patient.gender,
          address: patient.address,
          contactNumber: patient.contactNumber
        }
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAllPatients(req, res) {
    try {
      const patients = await PatientService.getAllPatients();
      
      res.status(200).json({
        success: true,
        data: patients.map(patient => ({
          patientId: patient.patientId,
          name: patient.name,
          email: patient.email,
          dob: patient.dob,
          gender: patient.gender,
          address: patient.address,
          contactNumber: patient.contactNumber
        }))
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async updatePatient(req, res) {
    try {
      const { patientId } = req.params;
      const patient = await PatientService.updatePatient(patientId, req.body);
      
      res.status(200).json({
        success: true,
        message: 'Patient updated successfully',
        data: {
          patientId: patient.patientId,
          name: patient.name,
          email: patient.email,
          dob: patient.dob,
          gender: patient.gender,
          address: patient.address,
          contactNumber: patient.contactNumber
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async searchPatients(req, res) {
    try {
      const { term } = req.query;
      const patients = await PatientService.searchPatients({ term });
      return res.status(200).json({
        success: true,
        data: patients.map(patient => ({
          patientId: patient.patientId,
          name: patient.name,
          email: patient.email,
          dob: patient.dob,
          gender: patient.gender,
          address: patient.address,
          contactNumber: patient.contactNumber
        }))
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

export default new PatientController();
