import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { getUserProfile } from "../services/api";
import ProfileProgressBar from "../components/ProfileProgressBar";
import ContactManagement from "../components/profile/ContactManagement";
import BasicInformationForm from "../components/profile/BasicInformationForm";
import AcademicInformationForm from "../components/profile/AcademicInformationForm";
import "./AuthenticatedHomeStyles.css";

function AuthenticatedHome() {
  const navigate = useNavigate();
  const { user: authUser, role, logout, isAuthenticated, getDashboardPath } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [error, setError] = useState("");

  const displayRole = role || authUser?.role || "student";
  const handleEditProfileTab = (tab) => setActiveTab(tab);

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

  const handleBackToOverview = () => {
    setActiveTab("profile");
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
            <button
              className="dashboard-link"
              onClick={() => navigate(getDashboardPath(role || userRole))}
            >
              Dashboard
            </button>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className={`auth-home-container ${activeTab === "profile" ? "profile-view" : ""}`}>
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
            {displayRole === "student" && (
              <button
                className={`nav-item ${activeTab === "academic" ? "active" : ""}`}
                onClick={() => setActiveTab("academic")}
              >
                🎓 Academic Info
              </button>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {error && <div className="error-banner">{error}</div>}

          {/* Profile Overview Tab */}
          {activeTab === "profile" && (
            <div className="tab-content profile-overview">
              <h2>Profile Overview</h2>

              <ProfileProgressBar completionPercentage={profileCompletion} role={displayRole} />

              <div className="profile-summary">
                <h3>📋 Quick Profile Summary</h3>
                <div className="summary-grid">
                  <div className="summary-card">
                    <label>Full Name</label>
                    <p>{user?.profile?.basicInfo?.fullName || authUser?.name || "Not provided"}</p>
                  </div>
                  <div className="summary-card">
                    <label>Email</label>
                    <p>{user?.email || authUser?.email || "Not provided"}</p>
                  </div>
                  <div className="summary-card">
                    <label>Role</label>
                    <p>{displayRole.charAt(0).toUpperCase() + displayRole.slice(1)}</p>
                  </div>
                  <div className="summary-card">
                    <label>Enrollment Number</label>
                    <p>{user?.enrollmentNumber || "Not provided"}</p>
                  </div>
                  <div className="summary-card">
                    <label>Institution</label>
                    <p>{user?.profile?.academicInfo?.institution || "Not provided"}</p>
                  </div>
                  <div className="summary-card">
                    <label>CGPA</label>
                    <p>{user?.profile?.academicInfo?.cgpa || "Not provided"}</p>
                  </div>
                </div>

                <div className="profile-actions">
                  <button className="edit-button" onClick={() => handleEditProfileTab("basic")}>✏️ Edit Basic Info</button>
                  <button className="edit-button" onClick={() => handleEditProfileTab("contact")}>✏️ Edit Contact Info</button>
                  {displayRole === "student" && (
                    <button className="edit-button" onClick={() => handleEditProfileTab("academic")}>✏️ Edit Academic Info</button>
                  )}
                </div>
                <div className="back-action">
                  <button className="back-button" onClick={() => navigate(-1)}>
                    ← Back
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* Contact Information Tab */}
          {activeTab === "contact" && (
            <div className="tab-content">
              <h2>📞 Contact Information</h2>
              <div className="centered-tab-content">
                <ContactManagement 
                  initialData={user?.profile}
                  onSave={fetchUserProfile}
                  onBack={handleBackToOverview}
                />
              </div>
            </div>
          )}

          {/* Basic Information Tab */}
          {activeTab === "basic" && (
            <div className="tab-content">
              <h2>👤 Basic Information</h2>
              <BasicInformationForm 
                initialData={user?.profile?.basicInfo}
                onSave={fetchUserProfile}
                onBack={handleBackToOverview}
              />
            </div>
          )}

          {/* Academic Information Tab */}
          {activeTab === "academic" && displayRole === "student" && (
            <div className="tab-content">
              <h2>🎓 Academic Information</h2>
              <AcademicInformationForm 
                initialData={user?.profile?.academicInfo}
                onSave={fetchUserProfile}
                onBack={handleBackToOverview}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default AuthenticatedHome;
