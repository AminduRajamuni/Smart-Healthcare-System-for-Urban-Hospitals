import { useAuth } from "./contexts/AuthContext";
import Login from "./components/Login";
import StaffDashboard from "./components/StaffDashboard";
import ManagerDashboard from "./components/ManagerDashboard";
import PatientDashboard from "./components/PatientDashboard";
import "./App.css";

function App() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="App">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            fontSize: "18px",
          }}
        >
          Loading...
        </div>
      </div>
    );
  }

  const renderDashboard = () => {
    if (user?.role === "patient") {
      return <PatientDashboard />;
    }
    if (user?.role === "manager") {
      return <ManagerDashboard />;
    }
    return <StaffDashboard />;
  };

  return (
    <div className="App">{isAuthenticated ? renderDashboard() : <Login />}</div>
  );
}

export default App;
