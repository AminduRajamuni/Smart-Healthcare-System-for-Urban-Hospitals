// services/PatientService.js
import Patient from '../models/Patient.js';

// SOLID Principle: Single Responsibility Principle (SRP)
// This service is responsible only for patient-related business logic
class PatientService {
  async createPatient(patientData) {
    try {
      // Check if patient with email already exists
      const existingPatient = await Patient.findOne({ email: patientData.email });
      if (existingPatient) {
        throw new Error('Patient with this email already exists');
      }

      const patient = new Patient(patientData);
      await patient.save();
      return patient;
    } catch (error) {
      throw error;
    }
  }

  async getPatientByEmail(email) {
    try {
      const patient = await Patient.findOne({ email: email.toLowerCase() });
      if (!patient) {
        throw new Error('Patient not found');
      }
      return patient;
    } catch (error) {
      throw error;
    }
  }

  async getPatientById(patientId) {
    try {
      const patient = await Patient.findOne({ patientId });
      if (!patient) {
        throw new Error('Patient not found');
      }
      return patient;
    } catch (error) {
      throw error;
    }
  }

  async getAllPatients() {
    try {
      const patients = await Patient.find({ isActive: true }).sort({ createdAt: -1 });
      return patients;
    } catch (error) {
      throw error;
    }
  }

  async searchPatients(query) {
    try {
      const { term } = query;
      if (!term) return [];

      // search by patientId exact or name partial (case-insensitive)
      return await Patient.find({
        isActive: true,
        $or: [
          { patientId: term },
          { name: { $regex: term, $options: 'i' } }
        ]
      }).sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  async updatePatient(patientId, updateData) {
    try {
      const patient = await Patient.findOneAndUpdate(
        { patientId },
        updateData,
        { new: true, runValidators: true }
      );
      if (!patient) {
        throw new Error('Patient not found');
      }
      return patient;
    } catch (error) {
      throw error;
    }
  }

  async deletePatient(patientId) {
    try {
      const patient = await Patient.findOneAndUpdate(
        { patientId },
        { isActive: false },
        { new: true }
      );
      if (!patient) {
        throw new Error('Patient not found');
      }
      return patient;
    } catch (error) {
      throw error;
    }
  }
}

export default new PatientService();
