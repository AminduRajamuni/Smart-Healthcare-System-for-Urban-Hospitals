import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './StaffDashboard.css';

// Import icons
import dashboardIcon from '../assets/icons/dashboard.png';
import appointmentsIcon from '../assets/icons/Appoinments.png';
import reportsIcon from '../assets/icons/reports.png';

// SOLID: This component serves as a presentation/controller for Manager features.
// - SRP: Manages UI state and rendering for manager dashboards and reports.
// - OCP: New tabs/sections can be added with additional cases without altering existing ones.
// - DIP: Relies on fetch API and context hooks rather than concrete service implementations.
// Code Smell: File size is growing (>500 lines). Consider extracting subcomponents:
//   ReportFilters, ChartsView, PatientTable, SummaryStats to reduce cognitive load.
const ManagerDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState('');
  const [reportData, setReportData] = useState(null);
  const [reportFilters, setReportFilters] = useState({ hospitalId: '', doctorId: '', from: '', to: '' });
  const [reportViewTab, setReportViewTab] = useState('charts');

  const buildLineChartPath = (values) => {
    // SRP: Pure helper to generate an SVG polyline path for a simple line chart
    if (!values || values.length === 0) return '';
    const maxVal = Math.max(...values, 1);
    const width = 600;
    const height = 180;
    const stepX = width / Math.max(values.length - 1, 1);
    const points = values.map((v, i) => {
      const x = i * stepX;
      const y = height - (v / maxVal) * height;
      return `${x},${y}`;
    });
    return `M ${points[0]} L ${points.slice(1).join(' ')}`;
  };

  const getChartData = () => {
    // OCP: Allows switching between mock and backend data without changing consumers
    // Code Smell: Mock data lives next to prod code; move to fixtures for cleaner prod builds
    const mockLine = [12, 28, 22, 35, 18, 42, 30];
    const mockGender = { male: 48, female: 52 };
    const mockSpecs = {
      Cardiology: 6,
      Dermatology: 3,
      Neurology: 5,
      Orthopedics: 4,
      Pediatrics: 2,
    };
    const line = (reportData?.patientsByDay || []).map(d => d.count);
    const gender = reportData?.patientsByGender && Object.keys(reportData.patientsByGender).length
      ? reportData.patientsByGender
      : mockGender;
    const specs = reportData?.doctorsBySpecialization && Object.keys(reportData.doctorsBySpecialization).length
      ? reportData.doctorsBySpecialization
      : mockSpecs;
    return { line: line.length ? line : mockLine, gender, specs };
  };

  useEffect(() => {
    // SRP: Effect dedicated to loading reference data for the dashboard
    // Code Smell: Inline fetch calls; consider an api client module to centralize base URL and errors
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const [hospitalsRes, doctorsRes, patientsRes] = await Promise.all([
          fetch('http://localhost:3000/api/hospitals'),
          fetch('http://localhost:3000/api/doctors'),
          fetch('http://localhost:3000/api/patients/all')
        ]);

        const [hospitalsData, doctorsData, patientsData] = await Promise.all([
          hospitalsRes.json(),
          doctorsRes.json(),
          patientsRes.json()
        ]);

        if (!hospitalsRes.ok) throw new Error(hospitalsData.message || 'Failed to load hospitals');
        if (!doctorsRes.ok) throw new Error(doctorsData.message || 'Failed to load doctors');
        if (!patientsRes.ok) throw new Error(patientsData.message || 'Failed to load patients');

        // Expecting shape { success, data }
        setHospitals(hospitalsData.data || []);
        setDoctors(doctorsData.data || []);
        setPatients(patientsData.data || []);
      } catch (e) {
        setError(e.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: dashboardIcon },
    { id: 'appointments', label: 'Appointments', icon: appointmentsIcon },
    { id: 'reports', label: 'Reports', icon: reportsIcon }
  ];

  const renderContent = () => {
    // SRP: Renders the main content for the selected tab
    // Code Smell: Large switch; consider extracting tab-specific components when growing further
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="content-section">
            <h1>Dashboard</h1>
            {error && (
              <div className="dashboard-card" style={{ background: '#ffe6e6', color: '#a00' }}>
                <h3>Error</h3>
                <p>{error}</p>
              </div>
            )}
            {loading && (
              <div className="dashboard-card">
                <h3>Loading data...</h3>
                <p className="stat-number">Please wait</p>
              </div>
            )}
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h3>Total Patients</h3>
                <p className="stat-number">{patients.length}</p>
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
                  <select value={reportFilters.doctorId} onChange={(e) => setReportFilters(prev => ({ ...prev, doctorId: e.target.value }))}>
                    <option value="">All Doctors</option>
                    {doctors.map((d) => (
                      <option key={d._id || d.id} value={d._id || d.id}>
                        {d.name || `${d.firstName || ''} ${d.lastName || ''}`.trim()}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="filter-group">
                  <label>Date Range</label>
                  
                  <input type="date" placeholder="mm/dd/yyyy" value={reportFilters.to} onChange={(e) => setReportFilters(prev => ({ ...prev, to: e.target.value }))} style={{ marginLeft: 8 }} />
                </div>
                <div className="filter-group">
                  <label>Select Hospitals</label>
                  <select value={reportFilters.hospitalId} onChange={(e) => setReportFilters(prev => ({ ...prev, hospitalId: e.target.value }))}>
                    <option value="">All Hospitals</option>
                    {hospitals.map((h) => (
                      <option key={h._id || h.id} value={h._id || h.id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="filter-buttons">
                  {/* SRP: User intent actions (reset, generate, download) */}
                  <button className="reset-btn" onClick={() => { setReportFilters({ hospitalId: '', doctorId: '', from: '', to: '' }); setReportData(null); setReportError(''); }}>Reset Filters</button>
                  <button className="generate-btn" onClick={async () => {
                    // Code Smell: Inline async handler; could be extracted for testability/reuse
                    try {
                      setReportLoading(true);
                      setReportError('');
                      setReportData(null);
                      const params = new URLSearchParams();
                      if (reportFilters.hospitalId) params.append('hospitalId', reportFilters.hospitalId);
                      if (reportFilters.doctorId) params.append('doctorId', reportFilters.doctorId);
                      if (reportFilters.from) params.append('from', reportFilters.from);
                      if (reportFilters.to) params.append('to', reportFilters.to);
                      const url = `http://localhost:3000/api/reports/summary?${params.toString()}`;
                      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });

                      const contentType = res.headers.get('content-type') || '';
                      let payload;
                      if (contentType.includes('application/json')) {
                        payload = await res.json();
                      } else {
                        const text = await res.text();
                        throw new Error(`Unexpected response (${res.status} ${res.statusText}). Content-Type: ${contentType}. Body: ${text.slice(0, 120)}...`);
                      }

                      if (!res.ok || !payload?.success) {
                        throw new Error(payload?.message || `Failed to generate report (${res.status})`);
                      }
                      setReportData(payload.data);
                    } catch (err) {
                      setReportError(err.message || 'Failed to generate report');
                    } finally {
                      setReportLoading(false);
                    }
                  }}>Generate Report</button>
                  {reportData && (
                    <button className="generate-btn" onClick={() => {
                      // OCP: PDF export added without changing generation logic
                      // Code Smell: Long template string; extract to a helper for readability
                      // Simple print-to-PDF approach
                      const w = window.open('', '_blank');
                      if (!w) return;
                      const style = `
                        <style>
                          body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
                          h1 { font-size: 22px; margin: 0 0 16px 0; }
                          h2 { font-size: 16px; margin: 24px 0 8px 0; }
                          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
                          th, td { text-align: left; padding: 8px; border: 1px solid #e5e7eb; font-size: 12px; }
                          th { background: #f9fafb; }
                          .totals { display: flex; gap: 16px; margin: 12px 0; }
                          .total-card { border: 1px solid #e5e7eb; padding: 10px 14px; border-radius: 6px; }
                        </style>
                      `;
                      const totals = reportData.totals || {};
                      const gender = reportData.patientsByGender || {};
                      const specs = reportData.doctorsBySpecialization || {};
                      const days = reportData.patientsByDay || [];
                      const filters = reportFilters;
                      const html = `
                        <!DOCTYPE html>
                        <html>
                          <head>
                            <meta charset="utf-8" />
                            <title>Report</title>
                            ${style}
                          </head>
                          <body>
                            <h1>Smart Healthcare System - Report</h1>
                            <div>Generated: ${new Date().toLocaleString()}</div>
                            <div>Filters: ${[
                              filters.hospitalId ? `Hospital=${filters.hospitalId}` : null,
                              filters.doctorId ? `Doctor=${filters.doctorId}` : null,
                              filters.from ? `From=${filters.from}` : null,
                              filters.to ? `To=${filters.to}` : null,
                            ].filter(Boolean).join(', ') || 'None'}</div>
                            <div class="totals">
                              <div class="total-card"><strong>Patients:</strong> ${totals.patients ?? '-'}</div>
                              <div class="total-card"><strong>Doctors:</strong> ${totals.doctors ?? '-'}</div>
                              <div class="total-card"><strong>Hospitals:</strong> ${totals.hospitals ?? '-'}</div>
                            </div>
                            <h2>Patients by Gender</h2>
                            <table>
                              <thead><tr><th>Gender</th><th>Count</th></tr></thead>
                              <tbody>
                                ${Object.entries(gender).map(([g,c]) => `<tr><td>${g}</td><td>${c}</td></tr>`).join('')}
                              </tbody>
                            </table>
                            <h2>Doctors by Specialization</h2>
                            <table>
                              <thead><tr><th>Specialization</th><th>Count</th></tr></thead>
                              <tbody>
                                ${Object.entries(specs).map(([s,c]) => `<tr><td>${s}</td><td>${c}</td></tr>`).join('')}
                              </tbody>
                            </table>
                            <h2>Patient Registrations Over Time</h2>
                            <table>
                              <thead><tr><th>Date</th><th>Count</th></tr></thead>
                              <tbody>
                                ${days.map(d => `<tr><td>${d.date}</td><td>${d.count}</td></tr>`).join('')}
                              </tbody>
                            </table>
                            <script>window.onload = () => { window.print(); }</script>
                          </body>
                        </html>
                      `;
                      w.document.write(html);
                      w.document.close();
                    }}>Download PDF</button>
                  )}
                </div>
              </div>
              
              <div className="report-tabs">
                <button className={`report-tab ${reportViewTab === 'charts' ? 'active' : ''}`} onClick={() => setReportViewTab('charts')}>Charts</button>
                <button className={`report-tab ${reportViewTab === 'tables' ? 'active' : ''}`} onClick={() => setReportViewTab('tables')}>Tables</button>
                <button className={`report-tab ${reportViewTab === 'summary' ? 'active' : ''}`} onClick={() => setReportViewTab('summary')}>Summary</button>
              </div>

              {reportViewTab === 'charts' && (
              <div className="charts-section">
                {reportError && (
                  <div className="dashboard-card" style={{ background: '#ffe6e6', color: '#a00' }}>
                    <h3>Report Error</h3>
                    <p>{reportError}</p>
                      </div>
                )}
                {reportLoading && (
                  <div className="dashboard-card">
                    <h3>Generating report...</h3>
                    <p className="stat-number">Please wait</p>
                  </div>
                )}
                {(() => {
                  // SRP: Transform data for chart rendering only
                  const { line, gender, specs } = getChartData();
                  const path = buildLineChartPath(line);
                  const total = Object.values(gender).reduce((a, b) => a + b, 0) || 1;
                  return (
                    <>
                      <div className="chart-container full-width">
                        <h3>Patient Visits Over Time</h3>
                        <svg width="100%" viewBox="0 0 600 200" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.4" />
                              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <path d={path} fill="none" stroke="#2563eb" strokeWidth="2" />
                        </svg>
                </div>

                <div className="chart-container">
                        <h3>Patients by Gender</h3>
                        <div className="donut-legend">
                          {Object.entries(gender).map(([g, c], idx) => (
                            <div className="legend-item" key={g}>
                              <span className="legend-color" style={{ background: idx % 2 === 0 ? '#2563eb' : '#60a5fa' }}></span>
                              <span style={{ marginRight: 8, textTransform: 'capitalize' }}>{g}</span>
                              <strong>{c}</strong>
                            </div>
                          ))}
                    </div>
                      </div>

                      <div className="chart-container">
                        <h3>Doctors by Specialization</h3>
                        <div className="donut-legend">
                          {Object.entries(specs).map(([s, c], idx) => (
                            <div className="legend-item" key={s}>
                              <span className="legend-color" style={{ background: idx % 3 === 0 ? '#2563eb' : idx % 3 === 1 ? '#60a5fa' : '#9ca3af' }}></span>
                              <span style={{ marginRight: 8 }}>{s}</span>
                              <strong>{c}</strong>
                      </div>
                          ))}
                      </div>
                      </div>
                    </>
                  );
                })()}
              </div>
              )}

              <div className="patient-data-table">
                <h3>Patient Data</h3>
                <table>
                  <thead>
                    <tr>
                      <th>PATIENT NAME</th>
                      <th>VISIT DATE</th>
                      <th>ADDRESS</th>
                      <th>CONTACT NUMBER</th>
                      <th>GENDER</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '12px' }}>No patients found</td>
                    </tr>
                    ) : (
                      patients.map((p) => (
                        <tr key={p._id || p.patientId}>
                          <td>{p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim()}</td>
                          <td>{p.dob ? new Date(p.dob).toISOString().slice(0,10) : '-'}</td>
                          <td>{p.address || '-'}</td>
                          <td>{p.contactNumber || '-'}</td>
                          <td>{p.gender || '-'}</td>
                    </tr>
                      ))
                    )}
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
