// controllers/AuthController.js
import UserService from '../services/UserService.js';

// SOLID Principle: Single Responsibility Principle (SRP)
// This controller is responsible only for handling authentication-related HTTP requests
class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      // SOLID Principle: Dependency Inversion Principle (DIP)
      // We depend on abstraction (UserService) not concrete implementation
      const user = await UserService.authenticateUser(email, password);
      const token = await UserService.generateToken(user);
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            hospital: user.hospital
          },
          token
        }
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  async register(req, res) {
    try {
      const user = await UserService.createUser(req.body);
      const token = await UserService.generateToken(user);
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            hospital: user.hospital
          },
          token
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getProfile(req, res) {
    try {
      // SOLID Principle: Interface Segregation Principle (ISP)
      // This method provides only the necessary user profile information
      const user = await UserService.getUserById(req.user.id);
      res.status(200).json({
        success: true,
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          hospital: user.hospital
        }
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateProfile(req, res) {
    try {
      const { id } = req.user;
      const user = await UserService.updateUser(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          hospital: user.hospital
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new AuthController();
