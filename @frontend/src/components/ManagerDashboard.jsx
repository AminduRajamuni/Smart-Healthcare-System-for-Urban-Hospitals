import { useState } from 'react';
// SOLID Principle: Single Responsibility Principle (SRP)
// This component renders manager dashboard UI and delegates data concerns elsewhere
import { useAuth } from '../contexts/AuthContext';
import './StaffDashboard.css';

// Import icons
import dashboardIcon from '../assets/icons/dashboard.png';
import appointmentsIcon from '../assets/icons/Appoinments.png';
import reportsIcon from '../assets/icons/reports.png';

const ManagerDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: dashboardIcon },
    { id: 'appointments', label: 'Appointments', icon: appointmentsIcon },
    { id: 'reports', label: 'Reports', icon: reportsIcon }
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
                <p className="stat-number">28</p>
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
                <div className="appointment-item">
                  <div className="appointment-time">11:15 AM</div>
                  <div className="appointment-details">
                    <h4>Robert Wilson</h4>
                    <p>Dr. Lisa Chen - Neurology</p>
                  </div>
                  <div className="appointment-status confirmed">Confirmed</div>
                </div>
                <div className="appointment-item">
                  <div className="appointment-time">02:00 PM</div>
                  <div className="appointment-details">
                    <h4>Maria Garcia</h4>
                    <p>Dr. David Lee - Orthopedics</p>
                  </div>
                  <div className="appointment-status pending">Pending</div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'reports':
        return (
          <div className="content-section">
            <h1>Generate Reports</h1>
            <div className="reports-content">
              <div className="report-filters">
                <div className="filter-group">
                  <label>Report Type</label>
                  <select>
                    <option>Patient Analytics</option>
                    <option>Financial Reports</option>
                    <option>Doctor Performance</option>
                    <option>Department Statistics</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Department</label>
                  <select>
                    <option>All Departments</option>
                    <option>Cardiology</option>
                    <option>Dermatology</option>
                    <option>Neurology</option>
                    <option>Orthopedics</option>
                    <option>Pediatrics</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Doctor</label>
                  <select>
                    <option>All Doctors</option>
                    <option>Dr. Sarah Johnson</option>
                    <option>Dr. Michael Brown</option>
                    <option>Dr. Lisa Chen</option>
                    <option>Dr. David Lee</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Date Range</label>
                  <input type="date" placeholder="mm/dd/yyyy" />
                </div>
                <div className="filter-group">
                  <label>Select Hospitals</label>
                  <select>
                    <option>All Hospitals</option>
                    <option>Asiri Hospital</option>
                    <option>Nawaloka Hospital</option>
                    <option>Lanka Hospitals</option>
                  </select>
                </div>
                <div className="filter-buttons">
                  <button className="reset-btn">Reset Filters</button>
                  <button className="generate-btn">Generate Report</button>
                </div>
              </div>
              
              <div className="report-tabs">
                <button className={`report-tab ${activeTab === 'reports' ? 'active' : ''}`}>Charts</button>
                <button className="report-tab">Tables</button>
                <button className="report-tab">Summary</button>
              </div>

              <div className="charts-section">
                <div className="chart-container">
                  <h3>Patient Visits Over Time</h3>
                  <div className="chart-placeholder">
                    <div className="chart-mock">
                      <div className="chart-bars">
                        <div className="bar" style={{height: '60%'}}></div>
                        <div className="bar" style={{height: '80%'}}></div>
                        <div className="bar" style={{height: '45%'}}></div>
                        <div className="bar" style={{height: '90%'}}></div>
                        <div className="bar" style={{height: '70%'}}></div>
                        <div className="bar" style={{height: '85%'}}></div>
                        <div className="bar" style={{height: '55%'}}></div>
                      </div>
                      <div className="chart-labels">
                        <span>Mon</span>
                        <span>Tue</span>
                        <span>Wed</span>
                        <span>Thu</span>
                        <span>Fri</span>
                        <span>Sat</span>
                        <span>Sun</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="chart-container">
                  <h3>Service Utilization</h3>
                  <div className="donut-chart">
                    <div className="donut-center">
                      <span className="utilization-percentage">80%</span>
                      <span className="utilization-label">Utilization</span>
                    </div>
                    <div className="donut-legend">
                      <div className="legend-item">
                        <div className="legend-color consultation"></div>
                        <span>Consultation</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-color therapy"></div>
                        <span>Therapy</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-color surgery"></div>
                        <span>Surgery</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-color other"></div>
                        <span>Other</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="patient-data-table">
                <h3>Patient Data</h3>
                <table>
                  <thead>
                    <tr>
                      <th>PATIENT NAME</th>
                      <th>VISIT DATE</th>
                      <th>DOCTOR</th>
                      <th>DEPARTMENT</th>
                      <th>SERVICE TYPE</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Nimal Perera</td>
                      <td>2025-08-16</td>
                      <td>Dr. Ruwan Senanayake</td>
                      <td>Cardiology</td>
                      <td>Consultation</td>
                    </tr>
                    <tr>
                      <td>Kamani Silva</td>
                      <td>2025-08-15</td>
                      <td>Dr. Priya Fernando</td>
                      <td>Dermatology</td>
                      <td>Therapy</td>
                    </tr>
                    <tr>
                      <td>Ravi Jayawardena</td>
                      <td>2025-08-14</td>
                      <td>Dr. Nimal Rajapaksa</td>
                      <td>Neurology</td>
                      <td>Surgery</td>
                    </tr>
                    <tr>
                      <td>Samantha Wickramasinghe</td>
                      <td>2025-08-13</td>
                      <td>Dr. Anura Bandara</td>
                      <td>Orthopedics</td>
                      <td>Consultation</td>
                    </tr>
                    <tr>
                      <td>Dilshan Perera</td>
                      <td>2025-08-12</td>
                      <td>Dr. Chamari Gunasekara</td>
                      <td>Pediatrics</td>
                      <td>Therapy</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="summary-stats">
                <div className="stat-item">
                  <h4>Average Daily Visits</h4>
                  <p className="stat-value">1170</p>
                </div>
                <div className="stat-item">
                  <h4>Peak Hours</h4>
                  <p className="stat-value">7 AM - 10 AM</p>
                </div>
                <div className="stat-item">
                  <h4>Utilization Rate</h4>
                  <p className="stat-value">80%</p>
                </div>
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
              <h3>{user?.name || 'Healthcare Manager'}</h3>
              <p>{user?.email || 'manager@hospital.com'}</p>
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

export default ManagerDashboard;
