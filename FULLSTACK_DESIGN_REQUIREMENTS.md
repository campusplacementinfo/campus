# Full-Stack Design: Campus Placement Portal Enhancement

## Overview
This document outlines the complete architecture and implementation strategy for enhancing the Campus Placement Portal with improved authentication flow, role-based redirection, and comprehensive profile management features.

---

## 1. AUTHENTICATION & REDIRECTION LOGIC

### Current Flow (Needs Update)
```
Login → Role-Based Dashboard (Student/Admin/Company)
```

### Required Flow
```
Login → Home Page (Authenticated) → Dashboard Button (Role-Based)
```

### 1.1 Redirection Logic - Pseudocode

#### Login Controller (Backend)
```pseudocode
function login(email, password):
    1. Validate email and password format
    2. Find user by email in database
    3. If user not found:
        return error 401
    4. Compare password with hashed password using bcrypt
    5. If password mismatch:
        return error 401
    6. Generate JWT token with payload:
        - userId (user._id)
        - role (user.role)
        - email (user.email)
        - expirationTime: 24 hours
    7. Return token, role, and user name
    8. Frontend stores token in localStorage

RESPONSE FORMAT:
{
    success: true,
    token: "jwt_token_here",
    role: "student|admin|company",
    name: "User Name",
    email: "user@example.com"
}
```

#### Authentication Middleware (Backend)
```pseudocode
function verifyToken(request):
    1. Extract token from Authorization header
    2. If no token found:
        return error 401 (Unauthorized)
    3. Verify token signature using JWT_SECRET
    4. If token invalid or expired:
        return error 401 (Token expired)
    5. Decode token to get userId, role
    6. Attach user data to request object
    7. Continue to next middleware/route handler

IMPLEMENTATION:
- Add middleware to all protected routes
- Routes requiring auth: /api/profile/*, /api/dashboard/*, etc.
```

#### Frontend Navigation Guard
```pseudocode
// App.jsx - Main routing logic
function App():
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")
    
    return (
        <Routes>
            // Public routes
            <Route path="/login" element=<Login/>/>
            <Route path="/register" element=<Register/>/>
            <Route path="/" element=<PublicHome/>/>  // No auth required
            
            // Protected routes - Post-Login
            <Route path="/home" element={
                token ? <AuthenticatedHome/> : <Navigate to="/login"/>
            }/>
            
            // Dashboard routes (Private)
            <Route path="/student-dashboard" element={
                token && role === "student" ? <StudentDashboard/> : <Navigate to="/login"/>
            }/>
            <Route path="/admin-dashboard" element={
                token && role === "admin" ? <AdminDashboard/> : <Navigate to="/login"/>
            }/>
            <Route path="/company-dashboard" element={
                token && role === "company" ? <CompanyDashboard/> : <Navigate to="/login"/>
            }/>
        </Routes>
    )

// On login success
function handleLoginSuccess(loginResponse):
    1. Store token in localStorage: "token"
    2. Store role in localStorage: "role"
    3. Store email in localStorage: "email"
    4. Store name in localStorage: "name"
    5. Navigate to "/home" (Authenticated Home Page)
    6. Redirect to public Home if no token on app load
```

#### Dynamic Dashboard Button Logic
```pseudocode
// HomePageAuthenticatedSection.jsx
function DashboardButton():
    const role = localStorage.getItem("role")
    
    function getDashboardPath(userRole):
        switch(userRole):
            case "student":
                return "/student-dashboard"
            case "admin":
                return "/admin-dashboard"
            case "company":
                return "/company-dashboard"
            default:
                return "/home"
    
    function handleDashboardClick():
        const path = getDashboardPath(role)
        navigate(path)
    
    return (
        <button onClick={handleDashboardClick}>
            Go to Dashboard
        </button>
    )
```

#### Logout Logic
```pseudocode
function logout():
    1. Clear localStorage:
        - Remove "token"
        - Remove "role"
        - Remove "email"
        - Remove "name"
    2. Clear any API tokens/headers
    3. Navigate to "/" (Public Home)
    4. Show success message "Logged out successfully"
```

---

## 2. DATABASE SCHEMA - USER PROFILE

### 2.1 Extended User Model

#### Database Schema (MongoDB)
```javascript
// models/User.js - UPDATED SCHEMA

const userSchema = new mongoose.Schema(
  {
    // ===== AUTHENTICATION FIELDS =====
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["student", "admin", "company"],
      default: "student"
    },
    
    // ===== PROFILE STATUS FIELDS =====
    verified: {
      type: Boolean,
      default: false
    },
    approved: {
      type: Boolean,
      default: false
    },
    placed: {
      type: Boolean,
      default: false
    },
    profileComplete: {
      type: Boolean,
      default: false
    },

    // ===== CONTACT INFORMATION =====
    profile: {
      mobileNumber: {
        type: String,
        default: null,
        match: /^[0-9]{10}$/, // India phone format
        sparse: true
      },
      alternateEmail: {
        type: String,
        default: null,
        lowercase: true,
        sparse: true
      },
      phoneVerified: {
        type: Boolean,
        default: false
      },
      
      // ===== BASIC INFORMATION =====
      basicInfo: {
        fullName: {
          type: String,
          default: null
        },
        dateOfBirth: {
          type: Date,
          default: null
        },
        gender: {
          type: String,
          enum: ["Male", "Female", "Other"],
          default: null
        },
        profilePicture: {
          type: String, // URL to image
          default: null
        },
        bio: {
          type: String,
          default: null,
          maxlength: 500
        },
        currentCity: {
          type: String,
          default: null
        },
        permanentCity: {
          type: String,
          default: null
        }
      },

      // ===== ACADEMIC INFORMATION =====
      academicInfo: {
        // Current Degree
        currentDegree: {
          type: String,
          enum: ["B.Tech", "M.Tech", "BCA", "MCA", "B.Sc", "M.Sc", null],
          default: null
        },
        specialization: {
          type: String,
          default: null
        },
        institution: {
          type: String,
          default: null
        },
        enrollmentYear: {
          type: Number,
          default: null
        },
        expectedGraduationYear: {
          type: Number,
          default: null
        },
        cgpa: {
          type: Number,
          default: null,
          min: 0,
          max: 10
        },
        
        // 10th Standard
        board10: {
          type: String,
          default: null
        },
        percentage10: {
          type: Number,
          default: null,
          min: 0,
          max: 100
        },
        yearPassed10: {
          type: Number,
          default: null
        },
        
        // 12th Standard
        board12: {
          type: String,
          default: null
        },
        percentage12: {
          type: Number,
          default: null,
          min: 0,
          max: 100
        },
        yearPassed12: {
          type: Number,
          default: null
        },
        
        // Diploma (if applicable)
        diplomaDegree: {
          type: String,
          default: null
        },
        diplomaBranch: {
          type: String,
          default: null
        },
        diplomaCGPA: {
          type: Number,
          default: null,
          min: 0,
          max: 10
        },
        diplomaPassed: {
          type: Number,
          default: null
        },
        
        // Backlogs
        activeBacklogs: {
          type: Number,
          default: 0
        },
        totalBacklogs: {
          type: Number,
          default: 0
        }
      },

      // ===== SKILLS & EXPERIENCE =====
      skills: {
        technical: [
          {
            name: String,
            proficiency: {
              type: String,
              enum: ["Beginner", "Intermediate", "Advanced", "Expert"]
            }
          }
        ],
        languages: [
          {
            language: String,
            proficiency: {
              type: String,
              enum: ["Beginner", "Intermediate", "Advanced", "Native"]
            }
          }
        ]
      },

      experience: {
        internships: [
          {
            company: String,
            position: String,
            duration: String,
            description: String,
            startDate: Date,
            endDate: Date
          }
        ],
        workExperience: [
          {
            company: String,
            position: String,
            duration: String,
            description: String,
            startDate: Date,
            endDate: Date,
            currentlyWorking: Boolean
          }
        ]
      },

      // ===== DOCUMENTS =====
      documents: {
        resumeUrl: {
          type: String,
          default: null
        },
        coverletter: {
          type: String,
          default: null
        },
        certificates: [
          {
            name: String,
            url: String,
            issuer: String,
            issueDate: Date
          }
        ]
      }
    },

    // ===== TIMESTAMPS =====
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    lastProfileUpdate: {
      type: Date,
      default: null
    },
    lastLogin: {
      type: Date,
      default: null
    }
  },
  { 
    timestamps: false, // We'll manage timestamps manually
    collection: "users"
  }
);

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ "profile.basicInfo.institution": 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model("User", userSchema);
```

### 2.2 Profile Completion Status Tracking
```javascript
// Calculate profile completion percentage
const calculateProfileCompletion = (user) => {
  let completed = 0;
  let total = 10; // Total sections
  
  if (user.profile.basicInfo?.fullName) completed++;
  if (user.profile.basicInfo?.dateOfBirth) completed++;
  if (user.profile.academicInfo?.institution) completed++;
  if (user.profile.academicInfo?.cgpa) completed++;
  if (user.profile.skills?.technical?.length > 0) completed++;
  if (user.profile.mobileNumber) completed++;
  if (user.profile.documents?.resumeUrl) completed++;
  if (user.profile.academicInfo?.currentDegree) completed++;
  if (user.profile.experience?.internships?.length > 0) completed++;
  if (user.profile.basicInfo?.bio) completed++;
  
  return Math.round((completed / total) * 100);
};
```

---

## 3. FRONTEND COMPONENTS ARCHITECTURE

### 3.1 Component Tree Structure

```
App.jsx
├── Public Routes
│   ├── Home.jsx (PublicHome - No Auth Required)
│   ├── Login.jsx
│   └── Register.jsx
└── Protected Routes (Auth Required)
    ├── AuthenticatedHome.jsx
    │   ├── DashboardButton.jsx (Role-Based Navigation)
    │   ├── ProfileSection.jsx
    │   │   ├── ContactManagement.jsx
    │   │   │   ├── MobileNumberForm.jsx
    │   │   │   └── EmailForm.jsx
    │   │   ├── BasicInformationForm.jsx
    │   │   │   ├── PersonalDetails.jsx
    │   │   │   ├── ProfilePictureUpload.jsx
    │   │   │   └── BioEditor.jsx
    │   │   └── AcademicInformationForm.jsx
    │   │       ├── CurrentEducation.jsx
    │   │       ├── PreviousEducation.jsx
    │   │       └── BacklogTracker.jsx
    │   ├── ProfileProgressBar.jsx
    │   ├── Sidebar.jsx
    │   └── LogoutButton.jsx
    ├── StudentDashboard.jsx
    ├── AdminDashboard.jsx
    └── CompanyDashboard.jsx
```

### 3.2 Component Specifications

#### A. AuthenticatedHome.jsx (Main Page After Login)
```javascript
/*
PURPOSE: Main landing page for authenticated users
PROPS: None
STATE: 
  - userRole: string (student/admin/company)
  - profileCompletion: number (0-100)
  - profileData: object
  - activeTab: string (contact|basic|academic)

KEY FEATURES:
  1. Role-based dashboard button
  2. Profile completion progress indicator
  3. Tab-based profile editing interface
  4. Quick stats display
  5. Logout functionality

STRUCTURE:
- Header (Logo, User Name, Logout)
- Main Content Area:
  - Profile Completion Progress Bar
  - Dashboard Button (Dynamic based on role)
  - Tabbed Interface:
    * Contact Information Tab
    * Basic Information Tab
    * Academic Information Tab
- Footer
*/
```

#### B. DashboardButton.jsx (Role-Based Navigation)
```javascript
/*
PURPOSE: Dynamic button that redirects to role-specific dashboard
PROPS:
  - userRole: "student" | "admin" | "company"

LOGIC:
  const dashboardRoutes = {
    student: "/student-dashboard",
    admin: "/admin-dashboard",
    company: "/company-dashboard"
  }
  
  onClick: navigate(dashboardRoutes[userRole])

STYLING:
  - Role-specific colors
  - Icon corresponding to role
  - Hover effects and animations
*/
```

#### C. ProfileProgressBar.jsx (Completion Tracker)
```javascript
/*
PURPOSE: Display profile completion percentage and sections status
PROPS:
  - completionPercentage: number (0-100)
  - sections: array of {name, completed: boolean}

FEATURES:
  - Visual progress bar (0-100%)
  - Color changes based on completion
    * 0-33%: Red (Incomplete)
    * 34-66%: Yellow (Partial)
    * 67-99%: Light Green (Almost Complete)
    * 100%: Green (Complete)
  - Section checklist with status icons
  - Recommended action message
*/
```

#### D. ContactManagement.jsx (Phone & Email)
```javascript
/*
PURPOSE: Manage contact information (Mobile & Email)
PROPS:
  - initialData: {mobileNumber, alternateEmail}
  - onSave: function

FIELDS:
  1. Mobile Number
     - Type: Phone input
     - Validation: 10 digits (India format)
     - Verify button with OTP (optional)
     - Save/Edit toggle
  
  2. Alternate Email
     - Type: Email input
     - Validation: Valid email format
     - Email verification link (optional)
     - Current email (read-only)
     - Save/Edit toggle

ACTIONS:
  - Edit mode toggle
  - Save to database
  - Verify phone (OTP)
  - Verify email (Link)
  - Cancel changes

API CALLS:
  - PATCH /api/profile/contact
  - POST /api/profile/verify-phone (OTP)
  - POST /api/profile/verify-email (Link)
*/
```

#### E. BasicInformationForm.jsx (Personal Details)
```javascript
/*
PURPOSE: Edit and manage basic profile information
PROPS:
  - initialData: {fullName, dateOfBirth, gender, bio, currentCity, ...}
  - onSave: function

FORM FIELDS:
  1. Full Name (Text) - Required
  2. Date of Birth (Date Picker)
  3. Gender (Dropdown) - Male/Female/Other
  4. Profile Picture (Image Upload)
  5. Bio/About (Textarea) - Max 500 chars
  6. Current City (Text) - Autocomplete
  7. Permanent City (Text) - Autocomplete

FEATURES:
  - Character counter for bio
  - Image preview for profile picture
  - Edit/Save toggle
  - Form validation
  - Unsaved changes warning

API CALLS:
  - PATCH /api/profile/basic-info
  - POST /api/profile/upload-picture (Image)
*/
```

#### F. AcademicInformationForm.jsx (Education Details)
```javascript
/*
PURPOSE: Manage all academic information
PROPS:
  - initialData: complete academic data
  - onSave: function

SECTIONS:
  1. CURRENT EDUCATION
     - Degree (Dropdown): B.Tech/M.Tech/BCA/MCA
     - Specialization (Text)
     - Institution (Autocomplete)
     - Enrollment Year (Year picker)
     - Expected Graduation (Year picker)
     - CGPA (Number, 0-10)
  
  2. 10TH STANDARD
     - Board (Text)
     - Percentage (Number, 0-100)
     - Year Passed (Year picker)
  
  3. 12TH STANDARD
     - Board (Text)
     - Percentage (Number, 0-100)
     - Year Passed (Year picker)
  
  4. DIPLOMA (Optional)
     - Degree (Text)
     - Branch (Text)
     - CGPA (Number, 0-10)
     - Passed Year (Year picker)
  
  5. BACKLOGS TRACKER
     - Active Backlogs (Number) - Current
     - Total Backlogs (Number) - Historical

VALIDATIONS:
  - CGPA: 0-10 range
  - Percentage: 0-100 range
  - Year: Current year or past
  - Required fields: Current education, CGPA

API CALLS:
  - PATCH /api/profile/academic-info
  - GET /api/institutions (Autocomplete)
*/
```

### 3.3 API Endpoints Required

```javascript
// Backend Routes to implement in profileRoutes.js

// ===== GET ENDPOINTS =====
GET /api/profile/me
  - Get complete user profile
  - Returns: user object with all profile fields

GET /api/profile/completion
  - Get profile completion percentage
  - Returns: {completionPercentage, missingFields}

GET /api/institutions
  - Get list of institutions (for autocomplete)
  - Query params: ?search=keyword
  - Returns: [{name, city, state}]

// ===== UPDATE ENDPOINTS =====
PATCH /api/profile/contact
  - Update mobile number and alternate email
  - Body: {mobileNumber, alternateEmail}
  - Returns: updated profile

PATCH /api/profile/basic-info
  - Update basic information
  - Body: {fullName, dateOfBirth, gender, bio, currentCity, ...}
  - Returns: updated profile

PATCH /api/profile/academic-info
  - Update academic information
  - Body: complete academicInfo object
  - Returns: updated profile

// ===== IMAGE UPLOAD =====
POST /api/profile/upload-picture
  - Upload profile picture
  - File upload (FormData)
  - Returns: {pictureUrl}

// ===== VERIFICATION =====
POST /api/profile/verify-phone
  - Send OTP to phone number
  - Body: {mobileNumber}
  - Returns: {message: "OTP sent"}

POST /api/profile/verify-email
  - Send verification email
  - Body: {alternateEmail}
  - Returns: {message: "Email sent"}
```

### 3.4 Component Code Templates

#### Template: DashboardButton.jsx
```javascript
import { useNavigate } from "react-router-dom";
import "./DashboardButton.css";

function DashboardButton() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const getDashboardRoute = (userRole) => {
    const routes = {
      student: "/student-dashboard",
      admin: "/admin-dashboard",
      company: "/company-dashboard"
    };
    return routes[userRole] || "/home";
  };

  const getDashboardLabel = (userRole) => {
    const labels = {
      student: "Student Dashboard",
      admin: "Admin Dashboard",
      company: "Company Dashboard"
    };
    return labels[userRole] || "Dashboard";
  };

  const handleNavigate = () => {
    const route = getDashboardRoute(role);
    navigate(route);
  };

  return (
    <button 
      className={`dashboard-button dashboard-button-${role}`}
      onClick={handleNavigate}
    >
      {getDashboardLabel(role)} →
    </button>
  );
}

export default DashboardButton;
```

#### Template: ProfileProgressBar.jsx
```javascript
import "./ProfileProgressBar.css";

function ProfileProgressBar({ completionPercentage = 0, sections = [] }) {
  const getProgressColor = (percentage) => {
    if (percentage <= 33) return "red";
    if (percentage <= 66) return "yellow";
    if (percentage < 100) return "lightgreen";
    return "green";
  };

  return (
    <div className="profile-progress-container">
      <div className="progress-header">
        <h3>Profile Completion</h3>
        <span className="percentage">{completionPercentage}%</span>
      </div>
      
      <div className="progress-bar-wrapper">
        <div 
          className="progress-bar"
          style={{
            width: `${completionPercentage}%`,
            backgroundColor: getProgressColor(completionPercentage)
          }}
        />
      </div>

      <div className="sections-list">
        {sections.map((section) => (
          <div key={section.name} className="section-item">
            <span className={`status-icon ${section.completed ? 'completed' : 'pending'}`}>
              {section.completed ? "✓" : "○"}
            </span>
            <span className="section-name">{section.name}</span>
          </div>
        ))}
      </div>

      {completionPercentage < 100 && (
        <div className="recommendation">
          Complete your profile to increase job match accuracy!
        </div>
      )}
    </div>
  );
}

export default ProfileProgressBar;
```

---

## 4. IMPLEMENTATION ROADMAP

### Phase 1: Backend Updates (Week 1)
- [ ] Update User model with extended schema
- [ ] Create Profile controller with CRUD operations
- [ ] Implement profile routes
- [ ] Add profile completion calculation logic
- [ ] Add authentication middleware verification
- [ ] Update login response to include profile data

### Phase 2: Frontend - Authentication Flow (Week 1-2)
- [ ] Update Login.jsx to redirect to `/home` instead of dashboards
- [ ] Create AuthenticatedHome.jsx component
- [ ] Update App.jsx routing
- [ ] Add route protection logic
- [ ] Implement logout functionality

### Phase 3: Frontend - Profile Components (Week 2-3)
- [ ] Create DashboardButton.jsx
- [ ] Create ProfileProgressBar.jsx
- [ ] Create ContactManagement.jsx
- [ ] Create BasicInformationForm.jsx
- [ ] Create AcademicInformationForm.jsx
- [ ] Implement form validation
- [ ] Add API integration

### Phase 4: Testing & Deployment (Week 3-4)
- [ ] Unit tests for components
- [ ] Integration tests for API endpoints
- [ ] End-to-end user flow testing
- [ ] Performance optimization
- [ ] Deployment

---

## 5. STATE MANAGEMENT SUGGESTION

### Using localStorage (Current Approach - Simple)
```javascript
// Store on login
localStorage.setItem("token", response.token);
localStorage.setItem("role", response.role);
localStorage.setItem("email", response.email);
localStorage.setItem("name", response.name);
localStorage.setItem("profileCompletion", response.profileCompletion);

// Access anywhere
const role = localStorage.getItem("role");
```

### OR Using Context API (Recommended for Scalability)
```javascript
// Create AuthContext
const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const login = async (credentials) => {
    const response = await loginUser(credentials);
    setToken(response.token);
    setUser(response.user);
    // ... store in localStorage
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    // ... clear localStorage
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Use anywhere
const { user, token } = useContext(AuthContext);
```

---

## 6. ERROR HANDLING & EDGE CASES

### Case 1: Token Expiration
```javascript
// axios interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.clear();
      navigate("/login");
    }
    return Promise.reject(error);
  }
);
```

### Case 2: Incomplete Profile on Dashboard Access
```javascript
// Protected route component
function ProtectedRoute({ element }) {
  const token = localStorage.getItem("token");
  const profileCompletion = localStorage.getItem("profileCompletion");
  
  if (!token) return <Navigate to="/login" />;
  if (profileCompletion < 50) {
    // Show warning, allow access but suggest completion
  }
  
  return element;
}
```

### Case 3: Network Errors
```javascript
function handleApiError(error) {
  if (!error.response) {
    // Network error
    return "Network error. Please check your connection.";
  }
  
  switch(error.response.status) {
    case 400:
      return error.response.data.message;
    case 401:
      return "Session expired. Please login again.";
    case 500:
      return "Server error. Please try again later.";
    default:
      return "An error occurred.";
  }
}
```

---

## 7. SECURITY CONSIDERATIONS

1. **JWT Token Storage**
   - Store in localStorage (vulnerable to XSS)
   - Alternative: Store in HttpOnly cookie (more secure)

2. **CORS Configuration**
   ```javascript
   // server.js
   const cors = require('cors');
   app.use(cors({
     origin: process.env.CLIENT_URL,
     credentials: true
   }));
   ```

3. **Input Validation**
   - Sanitize all user inputs
   - Use schema validation (Joi or similar)

4. **Rate Limiting**
   ```javascript
   // Limit login attempts
   const rateLimit = require('express-rate-limit');
   const loginLimiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 5
   });
   ```

---

## 8. SUMMARY OF CHANGES

| Component | Change | Impact |
|-----------|--------|--------|
| User Model | Extended with profile fields | Database migration required |
| Login Flow | Redirect to /home instead of dashboard | Frontend routing update |
| Home Page | Add authenticated view with profile management | New components needed |
| Dashboard Routes | Add role-based redirect logic | Component interaction |
| API Endpoints | Add profile CRUD operations | Backend expansion |

---

## Conclusion

This design provides a comprehensive, scalable architecture for the Campus Placement Portal with:
- **Secure authentication** with proper token management
- **Dynamic role-based** redirection
- **Comprehensive profile management** system
- **Clean separation** of concerns
- **Extensible** component structure for future features
