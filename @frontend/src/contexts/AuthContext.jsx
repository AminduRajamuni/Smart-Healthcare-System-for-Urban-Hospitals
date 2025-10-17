// contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

// SOLID Principle: Single Responsibility Principle (SRP)
// This context is responsible only for authentication state management
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// SOLID Principle: Open/Closed Principle (OCP)
// This provider can be extended without modifying existing code
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      
      
      if (token && userData) {
        // Check if it's a mock token (starts with 'mock-token-') or patient token (starts with 'patient-token-')
        if (token.startsWith('mock-token-') || token.startsWith('patient-token-')) {
          
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
        } else {
          // Try backend authentication
          const response = await apiService.getProfile();
          if (response.success) {
            setUser(response.data);
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await apiService.login(credentials);
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        setIsAuthenticated(true);
        return { success: true };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  // SOLID Principle: Interface Segregation Principle (ISP)
  // This context provides only the necessary authentication functionality
  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
