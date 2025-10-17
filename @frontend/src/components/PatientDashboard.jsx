import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import "./StaffDashboard.css";
import api from "../services/api.js";

// Import icons
import dashboardIcon from "../assets/icons/dashboard.png";
import appointmentsIcon from "../assets/icons/Appoinments.png";
import patientsIcon from "../assets/icons/patient.png";
import doctorRosterIcon from "../assets/icons/doctor roster.png";
import reportsIcon from "../assets/icons/reports.png";
import creditCardIcon from "../assets/icons/credit-card (1) 1.png";
import newspaperIcon from "../assets/icons/newspaper 1.png";
import inventoryIcon from "../assets/icons/inventory.png";

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [message, setMessage] = useState({ type: "", text: "" });

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [error, setError] = useState(null);

  // Booking states
  const [bookingStep, setBookingStep] = useState("doctor"); // Initialize to first step
  const [selectedSpecialization, setSelectedSpecialization] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [doctorSearchQuery, setDoctorSearchQuery] = useState("");
  // Initialize form data with empty values
  const [formData, setFormData] = useState(() => ({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    reason: ""
  }));

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // User profile data
  const [userProfile, setUserProfile] = useState(null);

  // Data states
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const handleLogout = () => {
    logout();
  };

  // Fetch initial data when component mounts
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch appointments when appointments tab is active
  useEffect(() => {
    if (activeTab === "appointments") {
      fetchAppointments();
    }
  }, [activeTab]);

  // Fetch available dates and times when booking step changes to datetime
  useEffect(() => {
    if (bookingStep === "datetime" && selectedDoctor) {
      fetchAvailableSlots();
    }
  }, [bookingStep, selectedDoctor]);


  const fetchAvailableSlots = async () => {
    if (!selectedDoctor) return;

    try {
      setLoadingSlots(true);

      // Generate next 7 days as potential available dates
      const dates = [];
      const today = new Date();

      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        if (i === 0) {
          dates.push({
            id: i + 1,
            date: "Today",
            day: "Today",
            status: "Available",
            actualDate: date.toISOString().split("T")[0],
          });
        } else if (i === 1) {
          dates.push({
            id: i + 1,
            date: "Tomorrow",
            day: "Tomorrow",
            status: "Available",
            actualDate: date.toISOString().split("T")[0],
          });
        } else {
          const dayName = date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          });
          dates.push({
            id: i + 1,
            date: dayName,
            day: dayName,
            status: "Available",
            actualDate: date.toISOString().split("T")[0],
          });
        }
      }

      setAvailableDates(dates);

      // For demo purposes, set some default available times
      // In a real app, you'd fetch this from the backend based on the selected date
      setAvailableTimes([
        { id: 1, time: "09:00", available: true },
        { id: 2, time: "09:30", available: false },
        { id: 3, time: "10:00", available: true },
        { id: 4, time: "10:30", available: true },
        { id: 5, time: "11:00", available: true },
        { id: 6, time: "11:30", available: true },
        { id: 7, time: "14:00", available: true },
        { id: 8, time: "14:30", available: true },
        { id: 9, time: "15:00", available: true },
        { id: 10, time: "15:30", available: false },
        { id: 11, time: "16:00", available: true },
        { id: 12, time: "16:30", available: true },
      ]);
    } catch (error) {
      console.error("Error fetching available slots:", error);
      setError("Failed to load available slots");
    } finally {
      setLoadingSlots(false);
    }
  };

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching initial data...");
      console.log("User authenticated:", !!user?.patientId);

      // Fetch doctors and hospitals for appointment booking
      const [doctorsResponse, hospitalsResponse] = await Promise.all([
        api.getDoctors().catch((err) => {
          console.error("Doctors API failed:", err);
          return { success: false, data: [] };
        }),
        api.getHospitals().catch((err) => {
          console.error("Hospitals API failed:", err);
          return { success: false, data: [] };
        }),
      ]);

      console.log("Doctors response:", doctorsResponse);
      console.log("Hospitals response:", hospitalsResponse);

      if (doctorsResponse.success && doctorsResponse.data) {
        console.log("Raw doctors data:", doctorsResponse.data);

        // Transform backend data to match frontend expectations
        const transformedDoctors = doctorsResponse.data.map((doctor) => ({
          id: doctor._id,
          name: doctor.name,
          specialization: doctor.specialization,
          position: `${doctor.specialization} Specialist`,
          experience: "5+ years",
          rating: 4.5,
          location: doctor.hospital?.name || "Hospital",
          availability: "Available Today",
          availabilityColor: "#10b981",
          image: "👩‍⚕️",
        }));

        console.log("Transformed doctors:", transformedDoctors);
        setDoctors(transformedDoctors);
      } else {
        console.warn("Failed to fetch doctors, using empty array");
        setDoctors([]);
      }

      if (hospitalsResponse.success && hospitalsResponse.data) {
        console.log("Raw hospitals data:", hospitalsResponse.data);

        const transformedHospitals = hospitalsResponse.data.map((hospital) => ({
          id: hospital._id,
          name: hospital.name,
          location:
            hospital.location || hospital.address || "Hospital Location",
        }));

        console.log("Transformed hospitals:", transformedHospitals);
        setHospitals(transformedHospitals);
      } else {
        console.warn("Failed to fetch hospitals, using empty array");
        setHospitals([]);
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
      setError("Failed to load data. Please try again.");
      // Set empty arrays as fallback
      setDoctors([]);
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    if (!user?.patientId) return;

    try {
      // Use a different loading state for appointments to avoid conflicts
      setLoadingAppointments(true);
      const response = await api.getPatientAppointments(user.patientId);

      if (response.success) {
        setAppointments(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setError("Failed to load appointments. Please try again.");
    } finally {
      setLoadingAppointments(false);
    }
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
              <strong>Date of Birth:</strong>{" "}
              {user?.dob ? new Date(user.dob).toLocaleDateString() : "N/A"}
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
              <button
                className="action-btn"
                onClick={() => setActiveTab("appointments")}
              >
                View Appointments
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const specializations = [
    {
      id: 1,
      icon: "❤️",
      title: "Cardiology",
      description: "Heart and cardiovascular system",
    },
    {
      id: 2,
      icon: "🧠",
      title: "Neurology",
      description: "Brain and nervous system",
    },
    {
      id: 3,
      icon: "👁️",
      title: "Ophthalmology",
      description: "Eye and vision care",
    },
    {
      id: 4,
      icon: "🩺",
      title: "General Medicine",
      description: "Primary healthcare and wellness",
    },
    {
      id: 5,
      icon: "👶",
      title: "Pediatrics",
      description: "Children's health and development",
    },
    {
      id: 6,
      icon: "🦴",
      title: "Orthopedics",
      description: "Bones, joints, and muscles",
    },
    {
      id: 7,
      icon: "✂️",
      title: "Surgery",
      description: "Surgical procedures and operations",
    },
    {
      id: 8,
      icon: "⚡",
      title: "Emergency Medicine",
      description: "Urgent and emergency care",
    },
  ];

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Get selected doctor and hospital
      const selectedDoc = doctors.find((d) => d.id === selectedDoctor);
      const selectedHospital =
        hospitals.find((h) => h.id === selectedHospital) || hospitals[0];

      if (!selectedDoc || !selectedHospital) {
        setError("Please select a doctor and hospital");
        return;
      }

      // Create appointment data - format for backend
      const appointmentData = {
        patientId: user.patientId,
        doctorId: selectedDoctor,
        hospitalId: selectedHospital.id,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        reasonForVisit: formData.reason,
        priority: "medium",
        appointmentType: "consultation",
      };

      const response = await api.createAppointment(appointmentData);

      if (response.success) {
        setMessage({
          type: "success",
          text: "Appointment confirmed successfully!",
        });
        setBookingStep(null);
        setActiveTab("dashboard");
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setError(response.message || "Failed to create appointment");
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      setError("Failed to create appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderAppointments = () => {
    if (bookingStep === "specialization") {
      const filteredSpecializations = specializations.filter(
        (spec) =>
          spec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          spec.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

      return (
        <div className="dashboard-content" style={{ padding: "24px 32px" }}>
          <div
            style={{
              marginBottom: "32px",
              padding: "16px 0",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <button
              onClick={() => setBookingStep(null)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                background: "white",
                cursor: "pointer",
                fontSize: "15px",
                color: "#4b5563",
                transition: "all 0.2s",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "#f9fafb";
                e.currentTarget.style.borderColor = "#9ca3af";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "white";
                e.currentTarget.style.borderColor = "#d1d5db";
              }}
            >
              <span>←</span>
              <span>Back to Appointments</span>
            </button>
          </div>

          <div
            style={{
              textAlign: "center",
              marginBottom: "40px",
              padding: "0 20px",
            }}
          >
            <h2
              style={{
                fontSize: "28px",
                fontWeight: "700",
                marginBottom: "12px",
                color: "#111827",
              }}
            >
              Book Your Appointment
            </h2>
            <p
              style={{
                color: "#6b7280",
                fontSize: "15px",
                maxWidth: "600px",
                margin: "0 auto",
                lineHeight: "1.5",
              }}
            >
              Step 2 of 4: Choose the medical specialization that best matches
              your needs
            </p>
          </div>

          <div
            style={{
              maxWidth: "800px",
              margin: "0 auto 40px",
              padding: "0 20px",
            }}
          >
            <div
              style={{
                marginBottom: "24px",
                maxWidth: "600px",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  placeholder="Search specializations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "14px 16px 14px 48px",
                    border: "1px solid #d1d5db",
                    borderRadius: "10px",
                    fontSize: "15px",
                    outline: "none",
                    transition: "all 0.2s",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    left: "16px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#9ca3af",
                    fontSize: "18px",
                  }}
                >
                  🔍
                </span>
              </div>
            </div>

            <h3
              style={{
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "20px",
                color: "#111827",
                textAlign: "center",
              }}
            >
              Available Specializations
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "24px",
                marginBottom: "40px",
              }}
            >
              {filteredSpecializations.map((spec) => (
                <button
                  key={spec.id}
                  onClick={() => setSelectedSpecialization(spec.id)}
                  style={{
                    padding: "28px 24px",
                    background: "white",
                    borderRadius: "12px",
                    border:
                      selectedSpecialization === spec.id
                        ? "2px solid #2563eb"
                        : "2px solid #e5e7eb",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 0.2s ease-in-out",
                    boxShadow:
                      selectedSpecialization === spec.id
                        ? "0 4px 12px rgba(37, 99, 235, 0.12)"
                        : "0 2px 6px rgba(0, 0, 0, 0.04)",
                    ":hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                    },
                  }}
                >
                  <div
                    style={{
                      fontSize: "48px",
                      marginBottom: "16px",
                      transition: "transform 0.2s ease-in-out",
                    }}
                  >
                    {spec.icon}
                  </div>
                  <h4
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      marginBottom: "8px",
                      color: "#111827",
                    }}
                  >
                    {spec.title}
                  </h4>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#6b7280",
                      lineHeight: "1.5",
                      margin: "0 auto",
                      maxWidth: "240px",
                    }}
                  >
                    {spec.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "24px 0",
              borderTop: "1px solid #e5e7eb",
              position: "sticky",
              bottom: 0,
              background: "white",
              boxShadow: "0 -2px 10px rgba(0,0,0,0.03)",
            }}
          >
            <button
              onClick={() => selectedSpecialization && setBookingStep("doctor")}
              disabled={!selectedSpecialization}
              style={{
                padding: "14px 40px",
                borderRadius: "10px",
                border: "none",
                fontWeight: "600",
                cursor: selectedSpecialization ? "pointer" : "not-allowed",
                background: selectedSpecialization ? "#2563eb" : "#e5e7eb",
                color: selectedSpecialization ? "white" : "#9ca3af",
                fontSize: "15px",
                transition: "all 0.2s",
                boxShadow: selectedSpecialization
                  ? "0 4px 6px rgba(37, 99, 235, 0.2)"
                  : "none",
                ":hover": {
                  transform: selectedSpecialization
                    ? "translateY(-1px)"
                    : "none",
                  boxShadow: selectedSpecialization
                    ? "0 6px 8px rgba(37, 99, 235, 0.25)"
                    : "none",
                },
              }}
            >
              Continue to Select Doctor
            </button>
          </div>
        </div>
      );
    }

    if (bookingStep === "doctor") {
      const selectedSpec = specializations.find(
        (s) => s.id === selectedSpecialization
      );

      // Debug logging
      console.log("Selected specialization:", selectedSpec);
      console.log("Total doctors:", doctors.length);
      console.log(
        "Doctor specializations:",
        doctors.map((d) => d.specialization)
      );

      // Show loading state if data is still being fetched
      if (loading) {
        return (
          <div className="dashboard-content">
            <div style={{ textAlign: "center", padding: "40px" }}>
              <p>Loading doctors...</p>
            </div>
          </div>
        );
      }

      const filteredDoctors = doctors.filter((doc) => {
        const matchesSpecialization = selectedSpec
          ? doc.specialization.toLowerCase() ===
            selectedSpec.title.toLowerCase()
          : true;

        const matchesSearch =
          !doctorSearchQuery ||
          doc.name.toLowerCase().includes(doctorSearchQuery.toLowerCase()) ||
          doc.specialization
            .toLowerCase()
            .includes(doctorSearchQuery.toLowerCase()) ||
          doc.location
            .toLowerCase()
            .includes(doctorSearchQuery.toLowerCase()) ||
          doc.position.toLowerCase().includes(doctorSearchQuery.toLowerCase());

        return matchesSpecialization && matchesSearch;
      });

      console.log("Filtered doctors count:", filteredDoctors.length);
      console.log("Filtered doctors:", filteredDoctors);

      // If no doctors match the specialization filter, show all doctors
      const doctorsToShow =
        filteredDoctors.length > 0 ? filteredDoctors : doctors;

      return (
        <div className="dashboard-content">
          <div style={{ marginBottom: "20px" }}>
            <button
              onClick={() => setBookingStep("specialization")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                background: "white",
                cursor: "pointer",
                fontSize: "14px",
                color: "#6b7280",
              }}
            >
              <span>←</span>
              <span>Back</span>
            </button>
          </div>

          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <h2
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                marginBottom: "8px",
              }}
            >
              Book Your Appointment
            </h2>
            <p style={{ color: "#6b7280", fontSize: "14px" }}>
              Step 3 of 4: Choose Doctor
            </p>
          </div>

          <h3
            style={{
              fontSize: "22px",
              fontWeight: "bold",
              marginBottom: "8px",
            }}
          >
            Choose Your Doctor
          </h3>
          <p style={{ color: "#6b7280", marginBottom: "20px" }}>
            {selectedSpec
              ? `Available ${selectedSpec.title.toLowerCase()} specialists`
              : "Available specialists (select a specialization to filter)"}
          </p>

          <div style={{ marginBottom: "30px", maxWidth: "600px" }}>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search doctors by name, specialization, or location..."
                value={doctorSearchQuery}
                onChange={(e) => setDoctorSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 12px 12px 40px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  left: "15px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af",
                }}
              >
                🔍
              </span>
            </div>
          </div>

          <div style={{ marginBottom: "32px" }}>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "600",
                color: "#2d3748",
                marginBottom: "16px",
                paddingBottom: "12px",
                borderBottom: "1px solid #edf2f7",
              }}
            >
              Available {selectedSpec?.title || "All"} Specialists
              <span
                style={{
                  marginLeft: "12px",
                  background: "#ebf8ff",
                  color: "#2b6cb0",
                  fontSize: "14px",
                  padding: "2px 10px",
                  borderRadius: "12px",
                  fontWeight: "500",
                }}
              >
                {doctorsToShow.length} doctors found
              </span>
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(500px, 1fr))",
                gap: "24px",
                marginTop: "16px",
              }}
            >
              {doctorsToShow.map((doctor) => (
                <div
                  key={doctor.id}
                  onClick={() => {
                    setSelectedDoctor(doctor.id);
                    // Automatically select the doctor's hospital
                    const doctorHospital = hospitals.find(
                      (h) => h.name === doctor.location
                    );
                    if (doctorHospital) {
                      setSelectedHospital(doctorHospital.id);
                    }
                  }}
                  style={{
                    background:
                      selectedDoctor === doctor.id ? "#f0f9ff" : "white",
                    border:
                      selectedDoctor === doctor.id
                        ? "2px solid #0ea5e9"
                        : "1px solid #e2e8f0",
                    borderRadius: "12px",
                    padding: "24px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    boxShadow:
                      selectedDoctor === doctor.id
                        ? "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                        : "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
                    ":hover": {
                      transform: "translateY(-2px)",
                      boxShadow:
                        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                    },
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "20px",
                      alignItems: "flex-start",
                    }}
                  >
                    {/* Doctor Avatar */}
                    <div
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "12px",
                        background: "#ebf8ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "40px",
                        flexShrink: 0,
                        color: "#0c4a6e",
                      }}
                    >
                      {doctor.image}
                    </div>

                    {/* Doctor Info */}
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "8px",
                        }}
                      >
                        <div>
                          <h3
                            style={{
                              fontSize: "18px",
                              fontWeight: "600",
                              color: "#1a202c",
                              margin: "0 0 4px 0",
                            }}
                          >
                            {doctor.name}
                          </h3>
                          <p
                            style={{
                              color: "#4a5568",
                              fontSize: "14px",
                              margin: "0 0 4px 0",
                            }}
                          >
                            {doctor.specialization}
                            <span
                              style={{
                                display: "inline-block",
                                width: "4px",
                                height: "4px",
                                borderRadius: "50%",
                                background: "#a0aec0",
                                margin: "0 8px",
                                verticalAlign: "middle",
                              }}
                            ></span>
                            {doctor.position}
                          </p>
                        </div>

                        {/* Rating Badge */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            background: "#f0fdf4",
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#166534",
                          }}
                        >
                          ⭐ {doctor.rating}
                        </div>
                      </div>

                      {/* Experience and Location */}
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "12px",
                          marginTop: "12px",
                          marginBottom: "16px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "13px",
                            color: "#4a5568",
                            background: "#f8fafc",
                            padding: "4px 10px",
                            borderRadius: "6px",
                          }}
                        >
                          <span>👨‍⚕️</span>
                          <span>{doctor.experience} experience</span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "13px",
                            color: "#4a5568",
                            background: "#f8fafc",
                            padding: "4px 10px",
                            borderRadius: "6px",
                          }}
                        >
                          <span>🏥</span>
                          <span>{doctor.location}</span>
                        </div>
                      </div>

                      {/* Availability */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          paddingTop: "12px",
                          borderTop: "1px solid #edf2f7",
                          marginTop: "auto",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "14px",
                            color: doctor.availabilityColor,
                            fontWeight: "500",
                          }}
                        >
                          <div
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              background: doctor.availabilityColor,
                            }}
                          ></div>
                          {doctor.availability}
                        </div>

                        <button
                          style={{
                            background:
                              selectedDoctor === doctor.id
                                ? "#0ea5e9"
                                : "#f8fafc",
                            color:
                              selectedDoctor === doctor.id
                                ? "white"
                                : "#4a5568",
                            border: "none",
                            padding: "6px 16px",
                            borderRadius: "6px",
                            fontSize: "14px",
                            fontWeight: "500",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            ":hover": {
                              background:
                                selectedDoctor === doctor.id
                                  ? "#0284c7"
                                  : "#edf2f7",
                            },
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDoctor(doctor.id);
                            // Automatically select the doctor's hospital
                            const doctorHospital = hospitals.find(
                              (h) => h.name === doctor.location
                            );
                            if (doctorHospital) {
                              setSelectedHospital(doctorHospital.id);
                            }
                          }}
                        >
                          {selectedDoctor === doctor.id ? "Selected" : "Select"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={() => selectedDoctor && setBookingStep("datetime")}
              disabled={!selectedDoctor}
              style={{
                padding: "12px 32px",
                borderRadius: "8px",
                border: "none",
                fontWeight: "600",
                cursor: selectedDoctor ? "pointer" : "not-allowed",
                background: selectedDoctor ? "#2563eb" : "#d1d5db",
                color: "white",
                fontSize: "14px",
              }}
            >
              Continue
            </button>
          </div>
        </div>
      );
    }

    if (bookingStep === "datetime") {
      const selectedDoc = doctors.find((d) => d.id === selectedDoctor);

      return (
        <div className="dashboard-content">
          <div style={{ marginBottom: "20px" }}>
            <button
              onClick={() => setBookingStep("doctor")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                background: "white",
                cursor: "pointer",
                fontSize: "14px",
                color: "#6b7280",
              }}
            >
              <span>←</span>
              <span>Back</span>
            </button>
          </div>

          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <h2
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                marginBottom: "8px",
              }}
            >
              Book Your Appointment
            </h2>
            <p style={{ color: "#6b7280", fontSize: "14px" }}>
              Step 3 of 4: Select Time
            </p>
          </div>

          <div
            className="dashboard-card"
            style={{ maxWidth: "900px", margin: "0 auto", padding: "30px" }}
          >
            <div style={{ marginBottom: "30px" }}>
              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  marginBottom: "4px",
                }}
              >
                Select Date & Time
              </h3>
              <p style={{ color: "#6b7280", fontSize: "14px" }}>
                {selectedDoc?.name} - {selectedDoc?.specialization}
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "40px",
              }}
            >
              {/* Available Dates */}
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "16px",
                  }}
                >
                  <span style={{ fontSize: "18px" }}>📅</span>
                  <h4
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#111827",
                    }}
                  >
                    Available Dates
                  </h4>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  {availableDates.map((dateItem) => (
                    <button
                      key={dateItem.id}
                      onClick={() => setSelectedDate(dateItem.id)}
                      style={{
                        padding: "16px",
                        borderRadius: "8px",
                        border:
                          selectedDate === dateItem.id
                            ? "2px solid #2563eb"
                            : "2px solid #e5e7eb",
                        background:
                          selectedDate === dateItem.id ? "#2563eb" : "white",
                        color:
                          selectedDate === dateItem.id ? "white" : "#111827",
                        cursor: "pointer",
                        textAlign: "center",
                        transition: "all 0.2s",
                        fontWeight: "600",
                      }}
                    >
                      <div style={{ fontSize: "14px", marginBottom: "4px" }}>
                        {dateItem.day}
                      </div>
                      <div style={{ fontSize: "12px", opacity: 0.8 }}>
                        {dateItem.status}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Available Times */}
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "16px",
                  }}
                >
                  <span style={{ fontSize: "18px" }}>🕐</span>
                  <h4
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#111827",
                    }}
                  >
                    Available Times
                  </h4>
                </div>

                {loadingSlots ? (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <p>Loading available times...</p>
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: "16px" }}>
                      <h5
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#374151",
                          marginBottom: "12px",
                        }}
                      >
                        Morning
                      </h5>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(3, 1fr)",
                          gap: "10px",
                        }}
                      >
                        {availableTimes.slice(0, 4).map((timeSlot) => (
                          <button
                            key={timeSlot.id}
                            onClick={() =>
                              timeSlot.available && setSelectedTime(timeSlot.id)
                            }
                            disabled={!timeSlot.available}
                            style={{
                              padding: "12px",
                              borderRadius: "8px",
                              border:
                                selectedTime === timeSlot.id
                                  ? "2px solid #2563eb"
                                  : "2px solid #e5e7eb",
                              background: timeSlot.available
                                ? "white"
                                : "#f9fafb",
                              color: timeSlot.available ? "#111827" : "#d1d5db",
                              cursor: timeSlot.available
                                ? "pointer"
                                : "not-allowed",
                              textAlign: "center",
                              fontSize: "14px",
                              fontWeight: "600",
                              transition: "all 0.2s",
                            }}
                          >
                            {timeSlot.time}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                      <h5
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#374151",
                          marginBottom: "12px",
                        }}
                      >
                        Afternoon
                      </h5>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(3, 1fr)",
                          gap: "10px",
                        }}
                      >
                        {availableTimes.slice(4).map((timeSlot) => (
                          <button
                            key={timeSlot.id}
                            onClick={() =>
                              timeSlot.available && setSelectedTime(timeSlot.id)
                            }
                            disabled={!timeSlot.available}
                            style={{
                              padding: "12px",
                              borderRadius: "8px",
                              border:
                                selectedTime === timeSlot.id
                                  ? "2px solid #2563eb"
                                  : "2px solid #e5e7eb",
                              background: timeSlot.available
                                ? "white"
                                : "#f9fafb",
                              color: timeSlot.available ? "#111827" : "#d1d5db",
                              cursor: timeSlot.available
                                ? "pointer"
                                : "not-allowed",
                              textAlign: "center",
                              fontSize: "14px",
                              fontWeight: "600",
                              transition: "all 0.2s",
                            }}
                          >
                            {timeSlot.time}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "30px",
              }}
            >
              <button
                onClick={() =>
                  selectedDate && selectedTime && setBookingStep("details")
                }
                disabled={!selectedDate || !selectedTime}
                style={{
                  padding: "12px 32px",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: "600",
                  cursor:
                    selectedDate && selectedTime ? "pointer" : "not-allowed",
                  background:
                    selectedDate && selectedTime ? "#2563eb" : "#d1d5db",
                  color: "white",
                  fontSize: "14px",
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (bookingStep === "details") {
      return (
        <div className="dashboard-content">
          <div style={{ marginBottom: "20px" }}>
            <button
              onClick={() => setBookingStep("datetime")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                background: "white",
                cursor: "pointer",
                fontSize: "14px",
                color: "#6b7280",
              }}
            >
              <span>←</span>
              <span>Back</span>
            </button>
          </div>

          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <h2
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                marginBottom: "8px",
              }}
            >
              Book Your Appointment
            </h2>
            <p style={{ color: "#6b7280", fontSize: "14px" }}>
              Step 4 of 4: Patient Information
            </p>
          </div>

          <div
            className="dashboard-card"
            style={{ maxWidth: "800px", margin: "0 auto" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
                marginBottom: "30px",
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: "22px",
                    fontWeight: "bold",
                    marginBottom: "4px",
                  }}
                >
                  Patient Information
                </h3>
                <p style={{ color: "#6b7280", fontSize: "14px" }}>
                  Complete your booking details
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#111827",
                  }}
                >
                  {(selectedDoctor &&
                    doctors.find((d) => d.id === selectedDoctor)?.name) ||
                    "Dr. Viduni Shakya"}
                </p>
                <p style={{ fontSize: "12px", color: "#6b7280" }}>
                  {selectedDate && selectedTime
                    ? `${
                        availableDates.find((d) => d.id === selectedDate)
                          ?.day || "Today"
                      }, ${new Date().toLocaleDateString()} - ${
                        availableTimes.find((t) => t.id === selectedTime)
                          ?.time || "11:00"
                      }`
                    : "Monday, September 8, 2025 - 11.00"}
                </p>
              </div>
            </div>

            <form onSubmit={handleFormSubmit}>
              {userProfile ? (
                <>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "20px",
                      marginBottom: "20px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "13px",
                          fontWeight: "500",
                          color: "#374151",
                          marginBottom: "6px",
                        }}
                      >
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleFormChange}
                        required
                        placeholder="Enter first name"
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          border: "1px solid #d1d5db",
                          borderRadius: "6px",
                          fontSize: "14px",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "13px",
                          fontWeight: "500",
                          color: "#374151",
                          marginBottom: "6px",
                        }}
                      >
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleFormChange}
                        required
                        placeholder="Enter last name"
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          border: "1px solid #d1d5db",
                          borderRadius: "6px",
                          fontSize: "14px",
                        }}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "20px",
                      marginBottom: "20px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "13px",
                          fontWeight: "500",
                          color: "#374151",
                          marginBottom: "6px",
                        }}
                      >
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleFormChange}
                        required
                        placeholder="Enter email address"
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          border: "1px solid #d1d5db",
                          borderRadius: "6px",
                          fontSize: "14px",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "13px",
                          fontWeight: "500",
                          color: "#374151",
                          marginBottom: "6px",
                        }}
                      >
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleFormChange}
                        required
                        placeholder="Enter phone number"
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          border: "1px solid #d1d5db",
                          borderRadius: "6px",
                          fontSize: "14px",
                        }}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "20px",
                      marginBottom: "20px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "13px",
                          fontWeight: "500",
                          color: "#374151",
                          marginBottom: "6px",
                        }}
                      >
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleFormChange}
                        required
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          border: "1px solid #d1d5db",
                          borderRadius: "6px",
                          fontSize: "14px",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "13px",
                          fontWeight: "500",
                          color: "#374151",
                          marginBottom: "6px",
                        }}
                      >
                        Gender
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleFormChange}
                        required
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          border: "1px solid #d1d5db",
                          borderRadius: "6px",
                          fontSize: "14px",
                        }}
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: "500",
                        color: "#374151",
                        marginBottom: "6px",
                      }}
                    >
                      Reason for Visit
                    </label>
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleFormChange}
                      required
                      rows={4}
                      placeholder="Describe your symptoms or reason for visit"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        background: "#f9fafb",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        fontSize: "14px",
                        resize: "none",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      paddingTop: "10px",
                    }}
                  >
                    <button
                      type="submit"
                      style={{
                        padding: "12px 32px",
                        background: "#2563eb",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: "600",
                        fontSize: "14px",
                        cursor: "pointer",
                      }}
                    >
                      Confirm Appointment
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <p>Loading patient information...</p>
                </div>
              )}
            </form>
          </div>
        </div>
      );
    }

    return (
      <div className="dashboard-content">
        <h2>Your Appointments</h2>
        <div className="dashboard-card">
          <p>No appointments scheduled yet.</p>
          <button
            className="primary-btn"
            onClick={() => {
              setActiveTab("book");
              setBookingStep("doctor");
              setSelectedDoctor(null);
              setSelectedDate(null);
              setSelectedTime(null);
            }}
          >
            Book Appointment
          </button>
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
    return (
      <div className="dashboard-content">
        <h2>Payment Information</h2>
        <div className="dashboard-card">
          <p>Payment information and history will be displayed here.</p>
          <button className="primary-btn">Make Payment</button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "appointments":
        return renderAppointments();
      case "medical-records":
        return renderMedicalRecords();
      case "payments":
        return renderPayments();
      default:
        return renderDashboard();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#f9fafb",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: "260px",
          background: "white",
          borderRight: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "28px 24px",
            borderBottom: "1px solid #e5e7eb",
            background: "linear-gradient(135deg, #f0f7ff 0%, #e6f0ff 100%)",
          }}
        >
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "800",
              color: "#1e40af",
              margin: 0,
              letterSpacing: "-0.5px",
            }}
          >
            HealthFirst
          </h1>
          <p
            style={{
              fontSize: "13px",
              color: "#4b5563",
              margin: "4px 0 0",
              opacity: 0.9,
            }}
          >
            Patient Portal
          </p>
        </div>

        {/* Navigation */}
        <nav
          style={{
            flex: 1,
            padding: "20px 12px",
            overflowY: "auto",
            scrollbarWidth: "thin",
          }}
        >
          <div style={{ marginBottom: "24px" }}>
            <p
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#6b7280",
                padding: "0 12px 8px",
                margin: "0 0 8px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Main Menu
            </p>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              {[
                { id: "dashboard", label: "Dashboard", icon: dashboardIcon },
                {
                  id: "appointments",
                  label: "Appointments",
                  icon: appointmentsIcon,
                },
                {
                  id: "medical-records",
                  label: "Medical Records",
                  icon: reportsIcon,
                },
                { id: "payments", label: "Payments", icon: creditCardIcon },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    border: "none",
                    borderRadius: "8px",
                    background:
                      activeTab === item.id ? "#eff6ff" : "transparent",
                    color: activeTab === item.id ? "#1e40af" : "#4b5563",
                    fontSize: "15px",
                    fontWeight: activeTab === item.id ? "600" : "500",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s ease",
                    ":hover": {
                      background: activeTab === item.id ? "#e0f2fe" : "#f9fafb",
                    },
                  }}
                >
                  <img
                    src={item.icon}
                    alt={item.label}
                    style={{
                      width: "20px",
                      height: "20px",
                      filter:
                        activeTab === item.id
                          ? "invert(30%) sepia(99%) saturate(2454%) hue-rotate(212deg) brightness(104%) contrast(96%)"
                          : "invert(63%) sepia(8%) saturate(372%) hue-rotate(182deg) brightness(93%) contrast(87%)",
                      transition: "all 0.2s ease",
                    }}
                  />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#6b7280",
                padding: "0 12px 8px",
                margin: "24px 0 8px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Account
            </p>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              {[
                {
                  id: "health-card",
                  label: "Health Card",
                  icon: newspaperIcon,
                },
                { id: "profile", label: "Profile", icon: inventoryIcon },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    border: "none",
                    borderRadius: "8px",
                    background:
                      activeTab === item.id ? "#eff6ff" : "transparent",
                    color: activeTab === item.id ? "#1e40af" : "#4b5563",
                    fontSize: "15px",
                    fontWeight: activeTab === item.id ? "600" : "500",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s ease",
                    ":hover": {
                      background: activeTab === item.id ? "#e0f2fe" : "#f9fafb",
                    },
                  }}
                >
                  <img
                    src={item.icon}
                    alt={item.label}
                    style={{
                      width: "20px",
                      height: "20px",
                      filter:
                        activeTab === item.id
                          ? "invert(30%) sepia(99%) saturate(2454%) hue-rotate(212deg) brightness(104%) contrast(96%)"
                          : "invert(63%) sepia(8%) saturate(372%) hue-rotate(182deg) brightness(93%) contrast(87%)",
                      transition: "all 0.2s ease",
                    }}
                  />
                  <span>{item.label}</span>
                </button>
              ))}
              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  marginTop: "24px",
                  border: "1px solid #fee2e2",
                  borderRadius: "8px",
                  background: "#fef2f2",
                  color: "#b91c1c",
                  fontSize: "15px",
                  fontWeight: "500",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s ease",
                  ":hover": {
                    background: "#fee2e2",
                    borderColor: "#fecaca",
                  },
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9M16 17L21 12M21 12L16 7M21 12H9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Header */}
        <header
          style={{
            background: "white",
            borderBottom: "1px solid #e5e7eb",
            padding: "0 32px",
            height: "72px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "600",
                color: "#111827",
                margin: 0,
              }}
            >
              {activeTab === "dashboard" && "Dashboard"}
              {activeTab === "appointments" && "Appointments"}
              {activeTab === "medical-records" && "Medical Records"}
              {activeTab === "payments" && "Payments"}
              {activeTab === "health-card" && "Health Card"}
              {activeTab === "profile" && "My Profile"}
            </h2>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                background: "#f9fafb",
                borderRadius: "20px",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "#10b981",
                  boxShadow: "0 0 0 2px rgba(16, 185, 129, 0.2)",
                }}
              ></div>
              <span
                style={{
                  fontSize: "14px",
                  color: "#374151",
                  fontWeight: "500",
                }}
              >
                Active
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "8px 12px 8px 16px",
                borderRadius: "8px",
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                transition: "all 0.2s ease",
                cursor: "pointer",
                ":hover": {
                  background: "#f3f4f6",
                },
              }}
            >
              <div style={{ textAlign: "right" }}>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#111827",
                    margin: 0,
                    lineHeight: 1.3,
                  }}
                >
                  {user?.name || "Hasaranga Weerasiri"}
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#6b7280",
                    margin: 0,
                    lineHeight: 1.3,
                  }}
                >
                  Patient ID: {user?.patientId || "P-001234"}
                </p>
              </div>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "600",
                  fontSize: "16px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                HW
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main
          style={{
            flex: 1,
            overflow: "auto",
            background: "#f9fafb",
            padding: "24px 32px",
            position: "relative",
          }}
        >
          {message.text && (
            <div
              style={{
                padding: "16px 24px",
                marginBottom: "24px",
                borderRadius: "8px",
                background: message.type === "success" ? "#d1fae5" : "#fee2e2",
                color: message.type === "success" ? "#065f46" : "#991b1b",
                fontSize: "14px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                border:
                  message.type === "success"
                    ? "1px solid #a7f3d0"
                    : "1px solid #fecaca",
              }}
            >
              {message.type === "success" ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 9V12M12 15H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              <span>{message.text}</span>
            </div>
          )}
          <div
            style={{
              maxWidth: "1400px",
              margin: "0 auto",
              width: "100%",
            }}
          >
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientDashboard;
