// services/api.js
const API_BASE_URL = 'http://localhost:3000/api';

// SOLID Principle: Single Responsibility Principle (SRP)
// This service is responsible only for API communication
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // SOLID Principle: Open/Closed Principle (OCP)
  // This method can be extended for different HTTP methods without modification
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json'
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  // Doctor methods
  async createDoctor(doctorData) {
    return this.request('/doctors', {
      method: 'POST',
      body: JSON.stringify(doctorData)
    });
  }

  async getDoctors() {
    return this.request('/doctors');
  }

  async getDoctorById(id) {
    return this.request(`/doctors/${id}`);
  }

  async updateDoctor(id, doctorData) {
    return this.request(`/doctors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(doctorData)
    });
  }

  async deleteDoctor(id) {
    return this.request(`/doctors/${id}`, {
      method: 'DELETE'
    });
  }

  // Hospital methods
  async getHospitals() {
    return this.request('/hospitals');
  }

  async getHospitalById(id) {
    return this.request(`/hospitals/${id}`);
  }

  // SOLID Principle: Interface Segregation Principle (ISP)
  // This method provides only the necessary functionality for health checks
  async healthCheck() {
    return this.request('/health');
  }
}

// SOLID Principle: Dependency Inversion Principle (DIP)
// Export a singleton instance to be used throughout the application
export default new ApiService();
