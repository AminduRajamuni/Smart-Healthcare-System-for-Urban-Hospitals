// services/UserService.js
import User from '../models/User.js';
import HospitalService from './HospitalService.js';
import jwt from 'jsonwebtoken';

// SOLID Principle: Single Responsibility Principle (SRP)
// This service is responsible only for user-related business logic
class UserService {
  async createUser(userData) {
    try {
      // SOLID Principle: Dependency Inversion Principle (DIP)
      // We depend on abstraction (HospitalService) not concrete implementation
      const hospital = await HospitalService.getHospitalById(userData.hospital);
      
      const user = new User(userData);
      return await user.save();
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async authenticateUser(email, password) {
    try {
      const user = await User.findOne({ email }).populate('hospital', 'name');
      if (!user) {
        throw new Error('Invalid credentials');
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      return user;
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  async generateToken(user) {
    try {
      // SOLID Principle: Open/Closed Principle (OCP)
      // Token generation can be extended without modifying existing code
      const payload = {
        id: user._id,
        email: user.email,
        role: user.role,
        hospital: user.hospital._id
      };

      return jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '24h'
      });
    } catch (error) {
      throw new Error(`Token generation failed: ${error.message}`);
    }
  }

  async getUserById(id) {
    try {
      const user = await User.findById(id).populate('hospital', 'name');
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }

  async updateUser(id, updateData) {
    try {
      const user = await User.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true, runValidators: true }
      ).populate('hospital', 'name');
      
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  // SOLID Principle: Interface Segregation Principle (ISP)
  // This method provides only the necessary functionality for user validation
  async validateUser(userId) {
    try {
      const user = await User.findById(userId).populate('hospital', 'name');
      if (!user || !user.isActive) {
        throw new Error('Invalid user');
      }
      return user;
    } catch (error) {
      throw new Error(`User validation failed: ${error.message}`);
    }
  }
}

export default new UserService();
