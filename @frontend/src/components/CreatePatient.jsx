import { useState } from 'react';
import apiService from '../services/api';
import './Login.css';

const CreatePatient = ({ onBack, onPatientCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dob: '',
    gender: '',
    address: '',
    contactNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.dob || !formData.gender || !formData.address || !formData.contactNumber) {
      setMessage({ type: 'error', text: 'All fields are required' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      const result = await apiService.createPatient(formData);

      if (result.success) {
        setMessage({ type: 'success', text: 'Patient created successfully! You can now login with your email.' });
        // Reset form
        setFormData({
          name: '',
          email: '',
          dob: '',
          gender: '',
          address: '',
          contactNumber: ''
        });
        // Show success message for 3 seconds then go back
        setTimeout(() => {
          onBack();
        }, 3000);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to create patient' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="form-header">
          <button className="back-btn" onClick={onBack}>
            ← Back
          </button>
          <h2>Create Patient Account</h2>
          <p>Fill in your details to create a patient account</p>
        </div>
        
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Patient Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="dob">Date of Birth</label>
            <input
              type="date"
              id="dob"
              name="dob"
              value={formData.dob}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter your address"
              rows="3"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="contactNumber">Contact Number</label>
            <input
              type="tel"
              id="contactNumber"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleInputChange}
              placeholder="Enter contact number"
              required
            />
          </div>
          
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Patient Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePatient;
