// services/HospitalService.js
import Hospital from '../models/Hospital.js';

// SOLID Principle: Single Responsibility Principle (SRP)
// This service is responsible only for hospital-related business logic
class HospitalService {
  async createHospital(hospitalData) {
    try {
      const hospital = new Hospital(hospitalData);
      return await hospital.save();
    } catch (error) {
      throw new Error(`Failed to create hospital: ${error.message}`);
    }
  }

  async getHospitalById(id) {
    try {
      const hospital = await Hospital.findById(id);
      if (!hospital) {
        throw new Error('Hospital not found');
      }
      return hospital;
    } catch (error) {
      throw new Error(`Failed to get hospital: ${error.message}`);
    }
  }

  async getAllHospitals() {
    try {
      return await Hospital.find({ isActive: true });
    } catch (error) {
      throw new Error(`Failed to get hospitals: ${error.message}`);
    }
  }

  async updateHospital(id, updateData) {
    try {
      const hospital = await Hospital.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true, runValidators: true }
      );
      if (!hospital) {
        throw new Error('Hospital not found');
      }
      return hospital;
    } catch (error) {
      throw new Error(`Failed to update hospital: ${error.message}`);
    }
  }

  async deleteHospital(id) {
    try {
      const hospital = await Hospital.findByIdAndUpdate(
        id, 
        { isActive: false }, 
        { new: true }
      );
      if (!hospital) {
        throw new Error('Hospital not found');
      }
      return hospital;
    } catch (error) {
      throw new Error(`Failed to delete hospital: ${error.message}`);
    }
  }

  // SOLID Principle: Open/Closed Principle (OCP)
  // This method can be extended without modifying existing code
  async getHospitalByName(name) {
    try {
      return await Hospital.findOne({ name: name, isActive: true });
    } catch (error) {
      throw new Error(`Failed to get hospital by name: ${error.message}`);
    }
  }
}

export default new HospitalService();
