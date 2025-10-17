// services/DoctorService.js
import Doctor from '../models/Doctor.js';
import HospitalService from './HospitalService.js';

// SOLID Principle: Single Responsibility Principle (SRP)
// This service is responsible only for doctor-related business logic
class DoctorService {
  async createDoctor(doctorData, hospitalId) {
    try {
      // SOLID Principle: Dependency Inversion Principle (DIP)
      // We depend on abstraction (HospitalService) not concrete implementation
      const hospital = await HospitalService.getHospitalById(hospitalId);
      
      const doctor = new Doctor({
        ...doctorData,
        hospital: hospitalId
      });
      
      return await doctor.save();
    } catch (error) {
      throw new Error(`Failed to create doctor: ${error.message}`);
    }
  }

  async getDoctorById(id) {
    try {
      const doctor = await Doctor.findById(id).populate('hospital', 'name');
      if (!doctor) {
        throw new Error('Doctor not found');
      }
      return doctor;
    } catch (error) {
      throw new Error(`Failed to get doctor: ${error.message}`);
    }
  }

  async getAllDoctors() {
    try {
      return await Doctor.find({ isActive: true })
        .populate('hospital', 'name')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw new Error(`Failed to get doctors: ${error.message}`);
    }
  }

  async getDoctorsByHospital(hospitalId) {
    try {
      return await Doctor.find({ 
        hospital: hospitalId, 
        isActive: true 
      }).populate('hospital', 'name');
    } catch (error) {
      throw new Error(`Failed to get doctors by hospital: ${error.message}`);
    }
  }

  async updateDoctor(id, updateData) {
    try {
      const doctor = await Doctor.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true, runValidators: true }
      ).populate('hospital', 'name');
      
      if (!doctor) {
        throw new Error('Doctor not found');
      }
      return doctor;
    } catch (error) {
      throw new Error(`Failed to update doctor: ${error.message}`);
    }
  }

  async deleteDoctor(id) {
    try {
      const doctor = await Doctor.findByIdAndUpdate(
        id, 
        { isActive: false }, 
        { new: true }
      );
      
      if (!doctor) {
        throw new Error('Doctor not found');
      }
      return doctor;
    } catch (error) {
      throw new Error(`Failed to delete doctor: ${error.message}`);
    }
  }

  // SOLID Principle: Open/Closed Principle (OCP)
  // This method can be extended without modifying existing code
  async getDoctorsBySpecialization(specialization) {
    try {
      return await Doctor.find({ 
        specialization, 
        isActive: true 
      }).populate('hospital', 'name');
    } catch (error) {
      throw new Error(`Failed to get doctors by specialization: ${error.message}`);
    }
  }
}

export default new DoctorService();
