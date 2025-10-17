import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import './StaffDashboard.css';

// Import icons
import dashboardIcon from '../assets/icons/dashboard.png';
import appointmentsIcon from '../assets/icons/Appoinments.png';
import patientsIcon from '../assets/icons/patient.png';
import doctorRosterIcon from '../assets/icons/doctor roster.png';
import reportsIcon from '../assets/icons/reports.png';
import inventoryIcon from '../assets/icons/inventory.png';

const StaffDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('doctor-roster');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialization: '',
    time: '',
    pricePerSchedule: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  useEffect(() => {
    if (activeTab === 'doctor-roster') {
      fetchDoctors();
    }
  }, [activeTab]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDoctors();
      if (response.success) {
        setDoctors(response.data);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setMessage({ type: 'error', text: 'Failed to fetch doctors' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.specialization || !formData.time || !formData.pricePerSchedule) {
      setMessage({ type: 'error', text: 'All fields are required' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      const response = await apiService.createDoctor(formData);
      
      if (response.success) {
        setShowSuccessPopup(true);
        setFormData({
          name: '',
          email: '',
          specialization: '',
          time: '',
          pricePerSchedule: ''
        });
        fetchDoctors(); // Refresh the doctors list
        
        // Auto-hide success popup after 3 seconds
        setTimeout(() => {
          setShowSuccessPopup(false);
        }, 3000);
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to create doctor' });
      }
    } catch (error) {
      console.error('Error creating doctor:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to create doctor' });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: dashboardIcon },
    { id: 'appointments', label: 'Appointments', icon: appointmentsIcon },
    { id: 'patients', label: 'Patients', icon: patientsIcon },
    { id: 'doctor-roster', label: 'Doctor Roster', icon: doctorRosterIcon },
    { id: 'billings-reports', label: 'Billings/Reports', icon: reportsIcon },
    { id: 'inventory', label: 'Inventory', icon: inventoryIcon }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="content-section">
            <h1>Dashboard</h1>
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h3>Total Patients</h3>
                <p className="stat-number">1,234</p>
              </div>
              <div className="dashboard-card">
                <h3>Today's Appointments</h3>
                <p className="stat-number">45</p>
              </div>
              <div className="dashboard-card">
                <h3>Active Doctors</h3>
                <p className="stat-number">{doctors.length}</p>
              </div>
              <div className="dashboard-card">
                <h3>Revenue Today</h3>
                <p className="stat-number">$12,450</p>
              </div>
            </div>
          </div>
        );
      
      case 'appointments':
        return (
          <div className="content-section">
            <h1>Appointments</h1>
            <div className="appointments-content">
              <div className="appointment-filters">
                <button className="filter-btn active">Today</button>
                <button className="filter-btn">This Week</button>
                <button className="filter-btn">This Month</button>
              </div>
              <div className="appointments-list">
                <div className="appointment-item">
                  <div className="appointment-time">09:00 AM</div>
                  <div className="appointment-details">
                    <h4>John Smith</h4>
                    <p>Dr. Sarah Johnson - Cardiology</p>
                  </div>
                  <div className="appointment-status confirmed">Confirmed</div>
                </div>
                <div className="appointment-item">
                  <div className="appointment-time">10:30 AM</div>
                  <div className="appointment-details">
                    <h4>Emily Davis</h4>
                    <p>Dr. Michael Brown - Dermatology</p>
                  </div>
                  <div className="appointment-status pending">Pending</div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'patients':
        return (
          <div className="content-section">
            <h1>Patients</h1>
            <div className="patients-content">
              <div className="search-bar">
                <input type="text" placeholder="Search patients..." />
                <button className="search-btn">Search</button>
              </div>
              <div className="patients-table">
                <table>
                  <thead>
                    <tr>
                      <th>Patient ID</th>
                      <th>Name</th>
                      <th>Age</th>
                      <th>Contact</th>
                      <th>Last Visit</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>P001</td>
                      <td>John Smith</td>
                      <td>45</td>
                      <td>+1 234-567-8900</td>
                      <td>2024-01-15</td>
                      <td>
                        <button className="action-btn view">View</button>
                        <button className="action-btn edit">Edit</button>
                      </td>
                    </tr>
                    <tr>
                      <td>P002</td>
                      <td>Emily Davis</td>
                      <td>32</td>
                      <td>+1 234-567-8901</td>
                      <td>2024-01-14</td>
                      <td>
                        <button className="action-btn view">View</button>
                        <button className="action-btn edit">Edit</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      
      case 'doctor-roster':
        return (
          <div className="content-section">
            <h1>Add new Doctor</h1>
            
            {message.text && (
              <div className={`message ${message.type}`}>
                {message.text}
              </div>
            )}

            {/* Success Popup */}
            {showSuccessPopup && (
              <div className="success-popup">
                <div className="success-content">
                  <div className="success-icon">✅</div>
                  <h3>Doctor Created Successfully!</h3>
                  <p>Dr. {formData.name || 'New Doctor'} has been added to Asiri Hospitals</p>
                  <button 
                    className="close-popup-btn"
                    onClick={() => setShowSuccessPopup(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            <div className="doctor-form">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Doctor Name</label>
                  <input 
                    type="text" 
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter doctor's name"
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
                    placeholder="Enter doctor's email"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="specialization">Specialization</label>
                  <select 
                    id="specialization"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Specialization</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Emergency Medicine">Emergency Medicine</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="time">Time</label>
                  <input 
                    type="time" 
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="pricePerSchedule">Price Per Schedule</label>
                  <input 
                    type="number" 
                    id="pricePerSchedule"
                    name="pricePerSchedule"
                    value={formData.pricePerSchedule}
                    onChange={handleInputChange}
                    placeholder="Enter price per schedule"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </form>
            </div>

            {/* Doctors List */}
            {doctors.length > 0 && (
              <div className="doctors-list">
                <h2>Current Doctors</h2>
                <div className="doctors-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Specialization</th>
                        <th>Time</th>
                        <th>Price</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctors.map((doctor) => (
                        <tr key={doctor._id}>
                          <td>{doctor.name}</td>
                          <td>{doctor.email}</td>
                          <td>{doctor.specialization}</td>
                          <td>{doctor.time}</td>
                          <td>${doctor.pricePerSchedule}</td>
                          <td>{new Date(doctor.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      
      case 'billings-reports':
        return (
          <div className="content-section">
            <h1>Billings/Reports</h1>
            <div className="reports-content">
              <div className="report-filters">
                <select>
                  <option>All Reports</option>
                  <option>Financial Reports</option>
                  <option>Patient Reports</option>
                  <option>Doctor Reports</option>
                </select>
                <input type="date" />
                <input type="date" />
                <button className="generate-btn">Generate Report</button>
              </div>
              <div className="reports-list">
                <div className="report-item">
                  <h4>Monthly Revenue Report</h4>
                  <p>January 2024</p>
                  <button className="download-btn">Download</button>
                </div>
                <div className="report-item">
                  <h4>Patient Statistics</h4>
                  <p>Q4 2023</p>
                  <button className="download-btn">Download</button>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'inventory':
        return (
          <div className="content-section">
            <h1>Inventory</h1>
            <div className="inventory-content">
              <div className="inventory-controls">
                <button className="add-item-btn">Add New Item</button>
                <input type="text" placeholder="Search inventory..." />
              </div>
              <div className="inventory-table">
                <table>
                  <thead>
                    <tr>
                      <th>Item ID</th>
                      <th>Item Name</th>
                      <th>Category</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>I001</td>
                      <td>Bandages</td>
                      <td>Medical Supplies</td>
                      <td>150</td>
                      <td>$2.50</td>
                      <td>
                        <button className="action-btn edit">Edit</button>
                        <button className="action-btn delete">Delete</button>
                      </td>
                    </tr>
                    <tr>
                      <td>I002</td>
                      <td>Syringes</td>
                      <td>Medical Equipment</td>
                      <td>75</td>
                      <td>$1.20</td>
                      <td>
                        <button className="action-btn edit">Edit</button>
                        <button className="action-btn delete">Delete</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      
      default:
        return <div className="content-section"><h1>Dashboard</h1></div>;
    }
  };

  return (
    <div className="staff-dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>HealthFirst</h2>
        </div>
        <nav className="sidebar-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <img src={tab.icon} alt={tab.label} className="nav-icon" />
              <span className="nav-label">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="content-header">
          <div className="user-profile">
            <div className="user-info">
              <h3>{user?.name || 'Dr. User'}</h3>
              <p>{user?.email || 'user@hospital.com'}</p>
            </div>
            <div className="user-avatar">
              <div className="avatar-placeholder"></div>
            </div>
            <button className="logout-btn" onClick={logout} title="Logout">
              <span>Logout</span>
            </button>
          </div>
        </div>
        
        <div className="content-body">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
