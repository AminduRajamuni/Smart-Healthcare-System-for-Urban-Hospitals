// components/Login.jsx
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import CreatePatient from './CreatePatient';
import './Login.css';

// SOLID Principle: Single Responsibility Principle (SRP)
// This component is responsible only for user authentication
const Login = () => {
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showCreatePatient, setShowCreatePatient] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credentials.email) {
      setMessage({ type: 'error', text: 'Email is required' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      // First try to login as patient
      try {
        const patientResult = await apiService.loginPatient(credentials.email);
        if (patientResult.success) {
          const patientUser = { ...patientResult.data, role: 'patient' };
          localStorage.setItem('user', JSON.stringify(patientUser));
          localStorage.setItem('token', 'patient-token-' + Date.now());
          setMessage({ type: 'success', text: 'Patient login successful!' });
          setLoading(false);
          window.location.reload();
          return;
        }
      } catch (patientError) {
        // Continue to staff login fallback
      }
      
      // If patient login fails, try staff login (existing logic)
      const emailPrefix = credentials.email.split('@')[0];
      const mockUser = {
        email: credentials.email,
        name: emailPrefix === 'manager' ? 'Healthcare Manager' : emailPrefix,
        role: emailPrefix === 'manager' ? 'manager' : 'admin'
      };
      
      // Simulate successful staff login
      setTimeout(() => {
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('token', 'mock-token-' + Date.now());
        
        setMessage({ type: 'success', text: 'Staff login successful!' });
        setLoading(false);
        
        window.location.reload();
      }, 500);
      
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Login failed' });
      setLoading(false);
    }
  };

  if (showCreatePatient) {
    return <CreatePatient onBack={() => setShowCreatePatient(false)} />;
  }

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="form-header">
          <h2>HealthFirst Login</h2>
          <p>Please sign in to access the dashboard</p>
          <div className="create-patient-link">
            <button 
              type="button" 
              className="create-patient-btn"
              onClick={() => setShowCreatePatient(true)}
            >
              Create a Patient
            </button>
          </div>
        </div>
        
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password (Optional)</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleInputChange}
              placeholder="Enter your password (optional)"
            />
          </div>
          
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
