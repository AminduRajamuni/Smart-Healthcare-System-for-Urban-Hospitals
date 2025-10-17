// utils/seedData.js
import HospitalService from '../services/HospitalService.js';
import UserService from '../services/UserService.js';

// SOLID Principle: Single Responsibility Principle (SRP)
// This utility is responsible only for seeding initial data
class SeedData {
  async initializeDefaultData() {
    try {
      // Check if Asiri Hospitals already exists
      let hospital = await HospitalService.getHospitalByName('Asiri Hospitals');
      
      if (!hospital) {
        // Create default hospital
        hospital = await HospitalService.createHospital({
          name: 'Asiri Hospitals',
          address: '123 Hospital Street, Colombo, Sri Lanka',
          phone: '+94 11 234 5678',
          email: 'info@asirihospitals.com'
        });
        
        console.log('✅ Default hospital created:', hospital.name);
      } else {
        console.log('✅ Default hospital already exists:', hospital.name);
      }

      // Store the hospital ID globally for API testing
      global.defaultHospitalId = hospital._id.toString();
      console.log('🏥 Default Hospital ID for API testing:', global.defaultHospitalId);

      // Check if default user exists
      try {
        await UserService.authenticateUser('admin@asirihospitals.com', 'admin123');
        console.log('✅ Default user already exists');
      } catch (error) {
        // Create default user
        const defaultUser = await UserService.createUser({
          name: 'Dr. Ashanya Premadasa',
          email: 'admin@asirihospitals.com',
          password: 'admin123',
          role: 'admin',
          hospital: hospital._id
        });
        
        console.log('✅ Default user created:', defaultUser.name);
      }

      return {
        hospital: hospital._id,
        message: 'Default data initialized successfully'
      };
    } catch (error) {
      console.error('❌ Error initializing default data:', error.message);
      throw error;
    }
  }
}

export default new SeedData();
