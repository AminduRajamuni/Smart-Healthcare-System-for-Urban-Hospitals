import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PaymentDashboard from './PaymentDashboard';
import './StaffDashboard.css';

// Import icons
import dashboardIcon from '../assets/icons/dashboard.png';
import appointmentsIcon from '../assets/icons/Appoinments.png';
import patientsIcon from '../assets/icons/patient.png';
import doctorRosterIcon from '../assets/icons/doctor roster.png';
import reportsIcon from '../assets/icons/reports.png';
import inventoryIcon from '../assets/icons/inventory.png';

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleLogout = () => {
    logout();
  };

  const renderDashboard = () => {
    return (
      <div className="dashboard-content">
        <h2>Welcome to Your Patient Dashboard</h2>
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Your Information</h3>
            <div className="info-item">
              <strong>Patient ID:</strong> {user?.patientId}
            </div>
            <div className="info-item">
              <strong>Name:</strong> {user?.name}
            </div>
            <div className="info-item">
              <strong>Email:</strong> {user?.email}
            </div>
            <div className="info-item">
              <strong>Date of Birth:</strong> {user?.dob ? new Date(user.dob).toLocaleDateString() : 'N/A'}
            </div>
            <div className="info-item">
              <strong>Gender:</strong> {user?.gender}
            </div>
            <div className="info-item">
              <strong>Contact:</strong> {user?.contactNumber}
            </div>
            <div className="info-item">
              <strong>Address:</strong> {user?.address}
            </div>
          </div>
          
          <div className="dashboard-card">
            <h3>Quick Actions</h3>
            <div className="quick-actions">
              <button className="action-btn" onClick={() => setActiveTab('appointments')}>
                View Appointments
              </button>
              <button className="action-btn" onClick={() => setActiveTab('medical-records')}>
                Medical Records
              </button>
              <button className="action-btn" onClick={() => setActiveTab('payments')}>
                Make Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAppointments = () => {
    return (
      <div className="dashboard-content">
        <h2>Your Appointments</h2>
        <div className="dashboard-card">
          <p>No appointments scheduled yet.</p>
          <button className="primary-btn">Book Appointment</button>
        </div>
      </div>
    );
  };

  const renderMedicalRecords = () => {
    return (
      <div className="dashboard-content">
        <h2>Medical Records</h2>
        <div className="dashboard-card">
          <p>Your medical records will appear here.</p>
          <button className="primary-btn">Request Records</button>
        </div>
      </div>
    );
  };

  const renderPayments = () => {
    return <PaymentDashboard />;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'appointments':
        return renderAppointments();
      case 'medical-records':
        return renderMedicalRecords();
      case 'payments':
        return renderPayments();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>HealthFirst</h1>
        </div>
        <div className="header-center">
          <h2>Patient Portal</h2>
        </div>
        <div className="header-right">
          <span className="user-name">{user?.name}</span>
          <div className="user-avatar">
            <span>{user?.name?.charAt(0)?.toUpperCase()}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <img src={dashboardIcon} alt="Dashboard" />
              <span>Dashboard</span>
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'appointments' ? 'active' : ''}`}
              onClick={() => setActiveTab('appointments')}
            >
              <img src={appointmentsIcon} alt="Appointments" />
              <span>Appointments</span>
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'medical-records' ? 'active' : ''}`}
              onClick={() => setActiveTab('medical-records')}
            >
              <img src={patientsIcon} alt="Medical Records" />
              <span>Medical Records</span>
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'payments' ? 'active' : ''}`}
              onClick={() => setActiveTab('payments')}
            >
              <img src={inventoryIcon} alt="Payments" />
              <span>Payments</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">
          {message.text && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default PatientDashboard;
