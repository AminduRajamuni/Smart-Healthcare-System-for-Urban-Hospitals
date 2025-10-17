// middleware/auth.js
import jwt from 'jsonwebtoken';
import UserService from '../services/UserService.js';

// SOLID Principle: Single Responsibility Principle (SRP)
// This middleware is responsible only for authentication and authorization
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // SOLID Principle: Dependency Inversion Principle (DIP)
    // We depend on abstraction (jwt.verify) not concrete implementation
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // SOLID Principle: Interface Segregation Principle (ISP)
    // We only validate what's necessary for authentication
    const user = await UserService.validateUser(decoded.id);
    
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      hospital: user.hospital._id
    };
    
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// SOLID Principle: Open/Closed Principle (OCP)
// This middleware can be extended for role-based access without modifying existing code
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
    next();
  };
};

// SOLID Principle: Single Responsibility Principle (SRP)
// This middleware is responsible only for error handling
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
};
