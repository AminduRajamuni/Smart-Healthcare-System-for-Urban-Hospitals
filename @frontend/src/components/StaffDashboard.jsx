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
  const [activeTab, setActiveTab] = useState('patients');
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [patientResults, setPatientResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [reportData, setReportData] = useState({ title: '', diagnosis: '', notes: '', prescribedMedications: '' });
  const [reports, setReports] = useState([]);
  const [reportDetail, setReportDetail] = useState(null);
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

  /**
   * Return auth token from localStorage in browser environments.
   */
  const getAuthToken = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

  /**
   * Refresh the global reports list for Billings/Reports tab
   */
  const handleRefreshReports = async () => {
    try {
      setLoading(true);
      const res = await apiService.getAllMedicalReports(getAuthToken());
      if (res.success) setReports(res.data);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to load reports' });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Open the selected report in the detail modal
   */
  const handleViewReport = (report) => setReportDetail(report);

  /**
   * Delete a report by id after user confirmation
   */
  const handleDeleteReport = async (report) => {
    if (!confirm('Delete this report?')) return;
    try {
      setLoading(true);
      const res = await apiService.deleteMedicalReport(report._id, getAuthToken());
      if (res.success) setReports(prev => prev.filter(x => x._id !== report._id));
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete report' });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generate a sectioned report PDF for the given report
   * NOTE: Uses jspdf + autotable when available; falls back gracefully.
   */
  const handleGeneratePdf = async (r) => {
    try {
      const { default: jsPDF } = await import('jspdf');
      try { await import('jspdf-autotable'); } catch {}
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const margin = 48;
      const pageWidth = doc.internal.pageSize.getWidth();
      const brand = [37, 99, 235];

      // Header
      doc.setFillColor(...brand);
      doc.rect(0, 0, pageWidth, 60, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text('HealthFirst', margin, 34);
      doc.setFontSize(12);
      doc.text('Medical Report', margin, 50);

      // Helpers
      const sectionTitle = (text, y) => {
        doc.setTextColor(17, 24, 39);
        doc.setFontSize(13);
        doc.setFont(undefined, 'bold');
        doc.text(text, margin, y);
        doc.setFont(undefined, 'normal');
      };

      const drawTable = (startY, bodyRows) => {
        if (doc.autoTable) {
          doc.autoTable({
            startY,
            head: [['Field', 'Value']],
            body: bodyRows,
            margin: { left: margin, right: margin },
            styles: { fontSize: 11, cellPadding: 6 },
            headStyles: { fillColor: [229,231,235], textColor: 17 },
            columnStyles: { 0: { cellWidth: 140, fontStyle: 'bold' }, 1: { cellWidth: pageWidth - margin * 2 - 140 } },
            theme: 'grid'
          });
          return doc.lastAutoTable.finalY + 18;
        }
        // Fallback without autotable
        let y = startY + 6;
        doc.setTextColor(17, 24, 39);
        doc.setFontSize(12);
        bodyRows.forEach(([k, v]) => {
          doc.setFont(undefined, 'bold');
          doc.text(`${k}:`, margin, y);
          doc.setFont(undefined, 'normal');
          const lines = doc.splitTextToSize(String(v || '-'), pageWidth - margin * 2 - 80);
          doc.text(lines, margin + 80, y);
          y += 16 + Math.max(0, lines.length - 1) * 14;
        });
        return y + 12;
      };

      // Section 1: Title & Report ID
      let yPos = 96;
      sectionTitle('Report Summary', yPos);
      yPos = drawTable(yPos + 8, [
        ['Title', r.title || 'Medical Report'],
        ['Report ID', r.reportId || '-']
      ]);

      // Section 2: Patient
      sectionTitle('Patient Information', yPos);
      yPos = drawTable(yPos + 8, [
        ['Patient Name', r.patient?.name || '-'],
        ['Patient ID', r.patient?.patientId || '-']
      ]);

      // Section 3: Clinical Details
      const medsText = Array.isArray(r.prescribedMedications) && r.prescribedMedications.length
        ? r.prescribedMedications.join(', ')
        : '-';
      sectionTitle('Clinical Details', yPos);
      yPos = drawTable(yPos + 8, [
        ['Diagnosis', r.diagnosis || '-'],
        ['Notes', r.notes || '-'],
        ['Medications', medsText]
      ]);

      // Section 4: Audit
      sectionTitle('Created Details', yPos);
      yPos = drawTable(yPos + 8, [
        ['Created By', r.createdBy || 'N/A'],
        ['Created At', new Date(r.createdAt).toLocaleString()]
      ]);

      // Footer page number
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const footerY = doc.internal.pageSize.getHeight() - 24;
        doc.setFontSize(9);
        doc.setTextColor(107,114,128);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, footerY, { align: 'right' });
      }

      doc.save(`${r.reportId || 'report'}.pdf`);
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to generate PDF' });
    }
  };

  useEffect(() => {
    if (activeTab === 'doctor-roster') {
      fetchDoctors();
    }
    if (activeTab === 'patients') {
      // load all patients initially
      (async () => {
        try {
          setLoading(true);
          const res = await apiService.getAllPatients();
          if (res.success) setPatientResults(res.data);
        } catch (err) {
          // ignore initial load error visual noise
        } finally {
          setLoading(false);
        }
      })();
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
              {message.text && (
                <div className={`message ${message.type}`} style={{ marginBottom: '12px' }}>
                  {message.text}
                </div>
              )}
              <div className="search-bar">
                <input type="text" placeholder="Search by ID or name" value={patientSearchTerm} onChange={(e) => setPatientSearchTerm(e.target.value)} />
                <button className="search-btn" onClick={async () => {
                  try {
                    const res = patientSearchTerm
                      ? await apiService.searchPatients(patientSearchTerm)
                      : await apiService.getAllPatients();
                    if (res.success) setPatientResults(res.data);
                  } catch (err) {
                    setMessage({ type: 'error', text: err.message || 'Search failed' });
                  }
                }}>Search</button>
              </div>
              {patientResults.length > 0 && (
                <div className="patients-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Patient ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Contact</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patientResults.map((p) => (
                        <tr key={p.patientId}>
                          <td>{p.patientId}</td>
                          <td>{p.name}</td>
                          <td>{p.email}</td>
                          <td>{p.contactNumber}</td>
                          <td>
                            <button className="action-btn view" onClick={async () => {
                              setSelectedPatient(p);
                              try {
                                const res = await apiService.getMedicalReports(p.patientId);
                                if (res.success) setReports(res.data);
                              } catch {}
                            }}>Add Medical Report</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {selectedPatient && (
                <div className="report-form" style={{ marginTop: '20px' }}>
                  <h2>Add Medical Report for {selectedPatient.name} ({selectedPatient.patientId})</h2>
                  <div className="form-group">
                    <label>Title</label>
                    <input type="text" value={reportData.title} onChange={(e) => setReportData({ ...reportData, title: e.target.value })} placeholder="e.g., Follow-up Consultation" />
                  </div>
                  <div className="form-group">
                    <label>Diagnosis *</label>
                    <textarea value={reportData.diagnosis} onChange={(e) => setReportData({ ...reportData, diagnosis: e.target.value })} placeholder="Enter diagnosis" required />
                  </div>
                  <div className="form-group">
                    <label>Notes</label>
                    <textarea value={reportData.notes} onChange={(e) => setReportData({ ...reportData, notes: e.target.value })} placeholder="Additional notes" />
                  </div>
                  <div className="form-group">
                    <label>Medications (comma separated)</label>
                    <input type="text" value={reportData.prescribedMedications} onChange={(e) => setReportData({ ...reportData, prescribedMedications: e.target.value })} placeholder="Paracetamol 500mg, Amoxicillin" />
                  </div>
                  <button className="save-btn" onClick={async () => {
                    if (!reportData.diagnosis) {
                      setMessage({ type: 'error', text: "Diagnosis is required" });
                      return;
                    }
                    try {
                      setLoading(true);
                      setMessage({ type: '', text: '' });
                      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                      const payload = {
                        title: reportData.title,
                        diagnosis: reportData.diagnosis,
                        notes: reportData.notes,
                        prescribedMedications: (reportData.prescribedMedications || '')
                          .split(',')
                          .map(s => s.trim())
                          .filter(Boolean),
                        createdBy: user?.email
                      };
                      const res = await apiService.createMedicalReport(selectedPatient.patientId, payload, token);
                      if (res.success) {
                        setMessage({ type: 'success', text: 'Medical report saved successfully' });
                        setReportData({ title: '', diagnosis: '', notes: '', prescribedMedications: '' });
                        try {
                          const list = await apiService.getMedicalReports(selectedPatient.patientId);
                          if (list.success) setReports(list.data);
                        } catch {}
                      } else {
                        setMessage({ type: 'error', text: res.message || 'Failed to save report' });
                      }
                    } catch (err) {
                      setMessage({ type: 'error', text: err.message || 'Failed to save report' });
                    } finally {
                      setLoading(false);
                    }
                  }} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Report'}
                  </button>
                </div>
              )}

              {selectedPatient && reports.length > 0 && (
                <div style={{ marginTop: '24px' }}>
                  <h3>Existing Reports</h3>
                  <div className="doctors-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Report ID</th>
                          <th>Title</th>
                          <th>Diagnosis</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reports.map(r => (
                          <tr key={r._id}>
                            <td>{r.reportId}</td>
                            <td>{r.title}</td>
                            <td>{r.diagnosis}</td>
                            <td>{new Date(r.createdAt).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
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
                <button className="generate-btn" onClick={handleRefreshReports}>Refresh</button>
              </div>

              {reports?.length === 0 && (
                <p style={{ marginTop: '12px' }}>No reports yet. Add a medical report from the Patients tab.</p>
              )}

              {reports?.length > 0 && (
                <div className="reports-cards">
                  {reports.map(r => (
                    <div className="report-card" key={r._id}>
                      <div className="report-card-header">
                        <h4>{r.title || 'Medical Report'}</h4>
                        <span className="report-id">{r.reportId}</span>
                      </div>
                      <div className="report-card-body">
                        <p><strong>Title:</strong> {r.title || 'Medical Report'}</p>
                        <p><strong>Report ID:</strong> {r.reportId}</p>
                      </div>
                      <div className="report-card-actions">
                        <button className="action-btn view" onClick={() => handleViewReport(r)}>View</button>
                        <button className="action-btn delete" onClick={() => handleDeleteReport(r)}>Delete</button>
                        <button className="action-btn generate" onClick={() => handleGeneratePdf(r)}>Generate PDF</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {reportDetail && (
                <div className="report-detail-modal" role="dialog" aria-modal="true">
                  <div className="report-detail-content">
                    <div className="report-detail-header">
                      <h3>{reportDetail.title || 'Medical Report'}</h3>
                      <button className="close-btn" onClick={() => setReportDetail(null)}>✕</button>
                    </div>
                    <div className="report-detail-section">
                      {reportDetail.patient && (
                        <div style={{ marginBottom: '12px' }}>
                          <h4 style={{ margin: '0 0 8px 0' }}>Patient Information</h4>
                          <p><strong>Name:</strong> {reportDetail.patient.name || '-'} ({reportDetail.patient.patientId || '-'})</p>
                          <p><strong>Email:</strong> {reportDetail.patient.email || '-'}</p>
                          <p><strong>Gender:</strong> {reportDetail.patient.gender || '-'}</p>
                          <p><strong>DOB:</strong> {reportDetail.patient.dob ? new Date(reportDetail.patient.dob).toLocaleDateString() : '-'}</p>
                          <p><strong>Contact:</strong> {reportDetail.patient.contactNumber || '-'}</p>
                        </div>
                      )}
                      <p><strong>Report ID:</strong> {reportDetail.reportId}</p>
                      <p><strong>Diagnosis:</strong> {reportDetail.diagnosis}</p>
                      {reportDetail.notes && <p><strong>Notes:</strong> {reportDetail.notes}</p>}
                      {Array.isArray(reportDetail.prescribedMedications) && reportDetail.prescribedMedications.length > 0 && (
                        <div>
                          <strong>Medications:</strong>
                          <ul>
                            {reportDetail.prescribedMedications.map((m, idx) => <li key={idx}>{m}</li>)}
                          </ul>
                        </div>
                      )}
                      <p><strong>Created By:</strong> {reportDetail.createdBy || 'N/A'}</p>
                      <p><strong>Created At:</strong> {new Date(reportDetail.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}
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
