/**
 * Frontend Implementation Guide
 * File: client/FRONTEND_IMPLEMENTATION.md
 * 
 * This document provides templates and guidelines for implementing
 * frontend components for the new authentication and profile system
 */

# Frontend Implementation Guide

## Overview
This guide provides ready-to-use component templates for implementing the new authentication flow and profile management system.

---

## 1. UPDATE Login.jsx (Redirect to /home)

### Changes Required

```javascript
// OLD: Redirects directly to dashboards
if (res.role === "student") {
  navigate("/student", { replace: true });
}

// NEW: Redirect to authenticated home page
navigate("/home", { replace: true });
```

### Updated handleSubmit function:

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!backendAvailable) {
    setError("Backend unavailable. Start the server and try again.");
    return;
  }

  setLoading(true);
  setError("");

  try {
    if (!form.email || !form.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    const res = await loginUser(form);
    console.log("LOGIN RESPONSE:", res);

    if (res.token) {
      // Store all user data
      localStorage.setItem("token", res.token);
      localStorage.setItem("role", res.role);
      localStorage.setItem("name", res.name || "User");
      localStorage.setItem("email", res.email);
      localStorage.setItem("userId", res.userId);
      localStorage.setItem("profileCompletion", res.profileCompletion?.percentage || 0);

      // UPDATED: Always redirect to /home after login
      navigate("/home", { replace: true });
    } else {
      setError(res.message || "Invalid email or password");
    }
  } catch (err) {
    console.error("Login Error:", err);
    setError("Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};
```

---

## 2. CREATE AuthenticatedHome.jsx

### File Structure
```
client/src/pages/
├── AuthenticatedHome.jsx
├── AuthenticatedHomeStyles.css
```

### Component Code

```javascript
// client/src/pages/AuthenticatedHome.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile } from "../services/api";
import ProfileProgressBar from "../components/ProfileProgressBar";
import DashboardButton from "../components/DashboardButton";
import ContactManagement from "../components/profile/ContactManagement";
import BasicInformationForm from "../components/profile/BasicInformationForm";
import AcademicInformationForm from "../components/profile/AcademicInformationForm";
import "./AuthenticatedHomeStyles.css";

function AuthenticatedHome() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [error, setError] = useState("");

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || !role) {
      navigate("/login", { replace: true });
      return;
    }

    // Fetch user profile
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await getUserProfile();
      
      if (response.user) {
        setUser(response.user);
        setProfileCompletion(response.profileCompletion.percentage);
        localStorage.setItem("profileCompletion", response.profileCompletion.percentage);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="authenticated-home">
        <div className="loading-spinner">Loading profile...</div>
      </div>
    );
  }

  const userName = localStorage.getItem("name");
  const userRole = localStorage.getItem("role");

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
            <span className="user-role">{userRole.charAt(0).toUpperCase() + userRole.slice(1)}</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="auth-home-container">
        <div className="sidebar">
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
              📞 Contact Information
            </button>
            <button
              className={`nav-item ${activeTab === "basic" ? "active" : ""}`}
              onClick={() => setActiveTab("basic")}
            >
              👤 Basic Information
            </button>
            <button
              className={`nav-item ${activeTab === "academic" ? "active" : ""}`}
              onClick={() => setActiveTab("academic")}
            >
              🎓 Academic Information
            </button>
          </nav>
        </div>

        <div className="main-content">
          {error && <div className="error-banner">{error}</div>}

          {/* Profile Overview Tab */}
          {activeTab === "profile" && (
            <div className="tab-content profile-overview">
              <h2>Profile Overview</h2>
              
              <ProfileProgressBar completionPercentage={profileCompletion} />

              <div className="dashboard-section">
                <h3>Dashboard Access</h3>
                <p>Go to your role-specific dashboard to manage your placements:</p>
                <DashboardButton />
              </div>

              <div className="profile-summary">
                <h3>Quick Profile Summary</h3>
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
                </div>
              </div>
            </div>
          )}

          {/* Contact Information Tab */}
          {activeTab === "contact" && (
            <div className="tab-content">
              <h2>Contact Information</h2>
              <ContactManagement 
                initialData={user?.profile}
                onSave={fetchUserProfile}
              />
            </div>
          )}

          {/* Basic Information Tab */}
          {activeTab === "basic" && (
            <div className="tab-content">
              <h2>Basic Information</h2>
              <BasicInformationForm 
                initialData={user?.profile?.basicInfo}
                onSave={fetchUserProfile}
              />
            </div>
          )}

          {/* Academic Information Tab */}
          {activeTab === "academic" && (
            <div className="tab-content">
              <h2>Academic Information</h2>
              <AcademicInformationForm 
                initialData={user?.profile?.academicInfo}
                onSave={fetchUserProfile}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthenticatedHome;
```

---

## 3. CREATE DashboardButton.jsx

### File Structure
```
client/src/components/
├── DashboardButton.jsx
├── DashboardButton.css
```

### Component Code

```javascript
// client/src/components/DashboardButton.jsx

import { useNavigate } from "react-router-dom";
import "./DashboardButton.css";

function DashboardButton() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const getDashboardConfig = (userRole) => {
    const config = {
      student: {
        path: "/student-dashboard",
        label: "Student Dashboard",
        icon: "🎓",
        color: "#3498db"
      },
      admin: {
        path: "/admin-dashboard",
        label: "Admin Dashboard",
        icon: "👨‍💼",
        color: "#e74c3c"
      },
      company: {
        path: "/company-dashboard",
        label: "Company Dashboard",
        icon: "🏢",
        color: "#27ae60"
      }
    };

    return config[userRole] || config.student;
  };

  const config = getDashboardConfig(role);

  const handleClick = () => {
    navigate(config.path, { replace: false });
  };

  return (
    <button
      className={`dashboard-button dashboard-button-${role}`}
      onClick={handleClick}
      style={{ "--button-color": config.color }}
    >
      <span className="button-icon">{config.icon}</span>
      <span className="button-text">{config.label}</span>
      <span className="button-arrow">→</span>
    </button>
  );
}

export default DashboardButton;
```

### Styles

```css
/* client/src/components/DashboardButton.css */

.dashboard-button {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 24px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--button-color) 0%, 
              color-mix(in srgb, var(--button-color) 85%, white) 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 100%;
  justify-content: center;
}

.dashboard-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.dashboard-button:active {
  transform: translateY(0);
}

.button-icon {
  font-size: 20px;
}

.button-arrow {
  margin-left: 8px;
  font-size: 18px;
  animation: slideArrow 0.5s ease infinite;
}

@keyframes slideArrow {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(4px); }
}

.dashboard-button:hover .button-arrow {
  animation: slideArrow 0.3s ease infinite;
}
```

---

## 4. CREATE ProfileProgressBar.jsx

### File Structure
```
client/src/components/
├── ProfileProgressBar.jsx
├── ProfileProgressBar.css
```

### Component Code

```javascript
// client/src/components/ProfileProgressBar.jsx

import "./ProfileProgressBar.css";

function ProfileProgressBar({ completionPercentage = 0 }) {
  const getProgressColor = (percentage) => {
    if (percentage <= 33) return "#e74c3c"; // Red
    if (percentage <= 66) return "#f39c12"; // Orange
    if (percentage < 100) return "#f1c40f"; // Yellow
    return "#27ae60"; // Green
  };

  const getProgressLabel = (percentage) => {
    if (percentage === 0) return "Not Started";
    if (percentage <= 33) return "Incomplete";
    if (percentage <= 66) return "Partial";
    if (percentage < 100) return "Almost Complete";
    return "Complete";
  };

  const sections = [
    { name: "Contact Info", completed: completionPercentage >= 10 },
    { name: "Basic Details", completed: completionPercentage >= 30 },
    { name: "Academic Info", completed: completionPercentage >= 60 },
    { name: "Skills", completed: completionPercentage >= 80 },
    { name: "Documents", completed: completionPercentage >= 100 }
  ];

  return (
    <div className="progress-container">
      <div className="progress-header">
        <h3>Profile Completion</h3>
        <div className="progress-stats">
          <span className="percentage">{completionPercentage}%</span>
          <span className="label">{getProgressLabel(completionPercentage)}</span>
        </div>
      </div>

      <div className="progress-bar-wrapper">
        <div
          className="progress-bar-fill"
          style={{
            width: `${completionPercentage}%`,
            backgroundColor: getProgressColor(completionPercentage)
          }}
        />
      </div>

      <div className="sections-grid">
        {sections.map((section) => (
          <div key={section.name} className="section-item">
            <div className={`status-icon ${section.completed ? "completed" : "pending"}`}>
              {section.completed ? "✓" : "○"}
            </div>
            <span className="section-name">{section.name}</span>
          </div>
        ))}
      </div>

      {completionPercentage < 100 && (
        <div className="recommendation-box">
          <p>
            📌 Complete your profile to unlock better job matches and increase your visibility to employers!
          </p>
        </div>
      )}

      {completionPercentage === 100 && (
        <div className="success-box">
          <p>
            ✨ Congratulations! Your profile is complete. You're ready to apply for jobs!
          </p>
        </div>
      )}
    </div>
  );
}

export default ProfileProgressBar;
```

### Styles

```css
/* client/src/components/ProfileProgressBar.css */

.progress-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.progress-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #2c3e50;
}

.progress-stats {
  display: flex;
  align-items: center;
  gap: 12px;
}

.percentage {
  font-size: 24px;
  font-weight: 700;
  color: #3498db;
}

.label {
  font-size: 12px;
  background: #ecf0f1;
  padding: 4px 8px;
  border-radius: 4px;
  color: #34495e;
  font-weight: 500;
}

.progress-bar-wrapper {
  width: 100%;
  height: 12px;
  background: #ecf0f1;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}

.progress-bar-fill {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
  border-radius: 8px;
}

.sections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.section-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
}

.status-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.status-icon.completed {
  background: #27ae60;
  color: white;
}

.status-icon.pending {
  background: #bdc3c7;
  color: white;
}

.section-name {
  font-size: 13px;
  color: #2c3e50;
  font-weight: 500;
}

.recommendation-box {
  background: #fff3cd;
  border-left: 4px solid #ffc107;
  padding: 12px 16px;
  border-radius: 4px;
  margin-top: 16px;
}

.recommendation-box p {
  margin: 0;
  font-size: 14px;
  color: #856404;
  line-height: 1.4;
}

.success-box {
  background: #d4edda;
  border-left: 4px solid #28a745;
  padding: 12px 16px;
  border-radius: 4px;
  margin-top: 16px;
}

.success-box p {
  margin: 0;
  font-size: 14px;
  color: #155724;
  line-height: 1.4;
}
```

---

## 5. CREATE ContactManagement.jsx

### File Structure
```
client/src/components/profile/
├── ContactManagement.jsx
├── ContactManagement.css
```

### Component Code

```javascript
// client/src/components/profile/ContactManagement.jsx

import { useState } from "react";
import { updateContactInfo } from "../../services/api";
import "./ContactManagement.css";

function ContactManagement({ initialData, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    mobileNumber: initialData?.mobileNumber || "",
    alternateEmail: initialData?.alternateEmail || ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setError("");
      setSuccess("");
      setLoading(true);

      // Validation
      if (formData.mobileNumber && !/^[0-9]{10}$/.test(formData.mobileNumber)) {
        setError("Mobile number must be 10 digits");
        return;
      }

      if (formData.alternateEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.alternateEmail)) {
        setError("Invalid email format");
        return;
      }

      const response = await updateContactInfo(formData);
      setSuccess("Contact information updated successfully!");
      setIsEditing(false);

      if (onSave) {
        onSave();
      }
    } catch (err) {
      setError("Failed to update contact information");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      mobileNumber: initialData?.mobileNumber || "",
      alternateEmail: initialData?.alternateEmail || ""
    });
    setIsEditing(false);
    setError("");
  };

  if (!isEditing) {
    return (
      <div className="contact-info-display">
        <div className="info-card">
          <h4>📞 Mobile Number</h4>
          <p>{formData.mobileNumber || "Not provided"}</p>
        </div>
        <div className="info-card">
          <h4>📧 Alternate Email</h4>
          <p>{formData.alternateEmail || "Not provided"}</p>
        </div>
        <button
          className="edit-button"
          onClick={() => setIsEditing(true)}
        >
          Edit Contact Information
        </button>
      </div>
    );
  }

  return (
    <div className="contact-info-form">
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="form-group">
        <label htmlFor="mobileNumber">Mobile Number (10 digits)</label>
        <input
          type="tel"
          id="mobileNumber"
          name="mobileNumber"
          placeholder="9876543210"
          value={formData.mobileNumber}
          onChange={handleChange}
          maxLength="10"
        />
      </div>

      <div className="form-group">
        <label htmlFor="alternateEmail">Alternate Email</label>
        <input
          type="email"
          id="alternateEmail"
          name="alternateEmail"
          placeholder="your.email@example.com"
          value={formData.alternateEmail}
          onChange={handleChange}
        />
      </div>

      <div className="form-actions">
        <button
          className="save-button"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
        <button
          className="cancel-button"
          onClick={handleCancel}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default ContactManagement;
```

### Styles

```css
/* client/src/components/profile/ContactManagement.css */

.contact-info-display {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.info-card {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.info-card h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

.info-card p {
  margin: 0;
  font-size: 16px;
  color: #34495e;
}

.edit-button {
  padding: 10px 20px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s;
}

.edit-button:hover {
  background: #2980b9;
}

.contact-info-form {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #ecf0f1;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #bdc3c7;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.save-button,
.cancel-button {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.save-button {
  background: #27ae60;
  color: white;
}

.save-button:hover {
  background: #229954;
}

.cancel-button {
  background: #95a5a6;
  color: white;
}

.cancel-button:hover {
  background: #7f8c8d;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  border-left: 4px solid #f5c6cb;
}

.success-message {
  background: #d4edda;
  color: #155724;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  border-left: 4px solid #c3e6cb;
}
```

---

## 6. UPDATE App.jsx Routes

### Key Changes

```javascript
// OLD ROUTES - Don't redirect directly to dashboards
<Route path="/student" element={...} />
<Route path="/admin" element={...} />
<Route path="/company" element={...} />

// NEW ROUTES - Add authenticated home
<Route path="/home" element={
  token ? <AuthenticatedHome/> : <Navigate to="/login"/>
}/>

// RENAME DASHBOARDS
<Route path="/student-dashboard" element={...} />
<Route path="/admin-dashboard" element={...} />
<Route path="/company-dashboard" element={...} />
```

---

## 7. UPDATE api.js - Add Profile Methods

```javascript
// Add to client/src/services/api.js

export const getUserProfile = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${apiUrl}/profile/me`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  return await response.json();
};

export const updateContactInfo = async (data) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${apiUrl}/profile/contact`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  return await response.json();
};

export const updateBasicInfo = async (data) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${apiUrl}/profile/basic-info`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  return await response.json();
};

export const updateAcademicInfo = async (data) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${apiUrl}/profile/academic-info`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  return await response.json();
};

export const getProfileCompletion = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${apiUrl}/profile/completion`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  return await response.json();
};
```

---

## Implementation Checklist

- [ ] Update Login.jsx to redirect to /home
- [ ] Create AuthenticatedHome.jsx
- [ ] Create DashboardButton.jsx
- [ ] Create ProfileProgressBar.jsx
- [ ] Create ContactManagement.jsx (and other profile components)
- [ ] Update App.jsx routes
- [ ] Update api.js with profile endpoints
- [ ] Update server User model
- [ ] Create profileController.js
- [ ] Create profileRoutes.js
- [ ] Update authController to include profile completion
- [ ] Test complete flow: Login → Home → Profile → Dashboard

---

## Testing Flow

1. **Register**: Create account with any role
2. **Login**: Login with credentials → Should redirect to `/home`
3. **Profile Overview**: See completion percentage and all status
4. **Update Contact**: Edit mobile and email
5. **Update Basic Info**: Add personal details
6. **Update Academic Info**: Add education details
7. **Dashboard Button**: Click button → Should redirect based on role
8. **Logout**: Click logout → Should clear data and go to login

---

## Common Issues & Fixes

### Issue: Component not rendering after login
**Solution**: Check token is stored in localStorage
```javascript
console.log(localStorage.getItem("token"));
```

### Issue: Profile data not loading
**Solution**: Ensure API endpoint returns data in expected format
```javascript
console.log(response); // Check response structure
```

### Issue: Dashboard button not redirecting
**Solution**: Verify role is stored correctly and matches route names
```javascript
console.log(localStorage.getItem("role"));
```
