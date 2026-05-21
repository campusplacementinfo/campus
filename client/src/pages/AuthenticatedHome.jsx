import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { getUserProfile } from "../services/api";
import ProfileProgressBar from "../components/ProfileProgressBar";
import DashboardButton from "../components/DashboardButton";
import ContactManagement from "../components/profile/ContactManagement";
import BasicInformationForm from "../components/profile/BasicInformationForm";
import AcademicInformationForm from "../components/profile/AcademicInformationForm";
import "./AuthenticatedHomeStyles.css";

function AuthenticatedHome() {
  const navigate = useNavigate();
  const { user: authUser, logout, isAuthenticated } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [error, setError] = useState("");

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login", { replace: true });
      return;
    }

    fetchUserProfile();
  }, [isAuthenticated, navigate]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getUserProfile();

      if (response.user) {
        setUser(response.user);
        const percentage = response.profileCompletion?.percentage || 0;
        setProfileCompletion(percentage);
      } else if (response.error) {
        setError("Failed to load profile: " + response.error);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="authenticated-home">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  const userName = authUser?.name || "User";
  const userRole = authUser?.role || "student";

  return (
    <div className="authenticated-home">
      {/* Header */}
      <header className="auth-home-header">
        <div className="header-content">
          <div className="header-left">
            <h1>🎓 Campus Placement Portal</h1>
            <p>Welcome back, {userName}!</p>
          </div>
          <div className="header-right">
            <span className="user-role">
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="auth-home-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <nav className="nav-menu">
            <button
              className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              📋 Profile Overview
            </button>
            <button
              className={`nav-item ${activeTab === "contact" ? "active" : ""}`}
              onClick={() => setActiveTab("contact")}
            >
              📞 Contact Info
            </button>
            <button
              className={`nav-item ${activeTab === "basic" ? "active" : ""}`}
              onClick={() => setActiveTab("basic")}
            >
              👤 Basic Info
            </button>
            <button
              className={`nav-item ${activeTab === "academic" ? "active" : ""}`}
              onClick={() => setActiveTab("academic")}
            >
              🎓 Academic Info
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {error && <div className="error-banner">{error}</div>}

          {/* Profile Overview Tab */}
          {activeTab === "profile" && (
            <div className="tab-content profile-overview">
              <h2>Profile Overview</h2>

              <ProfileProgressBar completionPercentage={profileCompletion} />

              <div className="dashboard-section">
                <h3>📊 Dashboard Access</h3>
                <p>Go to your role-specific dashboard to manage placements:</p>
                <DashboardButton />
              </div>

              <div className="profile-summary">
                <h3>📋 Quick Profile Summary</h3>
                <div className="summary-grid">
                  <div className="summary-card">
                    <label>Full Name</label>
                    <p>{user?.profile?.basicInfo?.fullName || "Not provided"}</p>
                  </div>
                  <div className="summary-card">
                    <label>Email</label>
                    <p>{user?.email}</p>
                  </div>
                  <div className="summary-card">
                    <label>Mobile Number</label>
                    <p>{user?.profile?.mobileNumber || "Not provided"}</p>
                  </div>
                  <div className="summary-card">
                    <label>Institution</label>
                    <p>{user?.profile?.academicInfo?.institution || "Not provided"}</p>
                  </div>
                  <div className="summary-card">
                    <label>Degree</label>
                    <p>{user?.profile?.academicInfo?.currentDegree || "Not provided"}</p>
                  </div>
                  <div className="summary-card">
                    <label>CGPA</label>
                    <p>{user?.profile?.academicInfo?.cgpa || "Not provided"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contact Information Tab */}
          {activeTab === "contact" && (
            <div className="tab-content">
              <h2>📞 Contact Information</h2>
              <ContactManagement 
                initialData={user?.profile}
                onSave={fetchUserProfile}
              />
            </div>
          )}

          {/* Basic Information Tab */}
          {activeTab === "basic" && (
            <div className="tab-content">
              <h2>👤 Basic Information</h2>
              <BasicInformationForm 
                initialData={user?.profile?.basicInfo}
                onSave={fetchUserProfile}
              />
            </div>
          )}

          {/* Academic Information Tab */}
          {activeTab === "academic" && (
            <div className="tab-content">
              <h2>🎓 Academic Information</h2>
              <AcademicInformationForm 
                initialData={user?.profile?.academicInfo}
                onSave={fetchUserProfile}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default AuthenticatedHome;
