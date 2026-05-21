# Architecture & Flow Diagrams

## 1. AUTHENTICATION & REDIRECTION FLOW

```
┌─────────────────────────────────────────────────────────────┐
│              Campus Placement Portal Flow                    │
└─────────────────────────────────────────────────────────────┘

BEFORE LOGIN:
┌──────────────┐
│ Public Home  │ (Visible to all - login/register buttons)
└──────────────┘
       ↓
   Click Login
       ↓
┌──────────────┐
│ Login Page   │ (Enter email/password)
└──────────────┘
       ↓
  BACKEND VALIDATION
       ↓
  Password matches?
  ├─ NO  → Error message
  └─ YES → Generate JWT token
            ├─ user._id
            ├─ user.role
            ├─ user.email
            └─ Expires: 24h
       ↓
  RETURN RESPONSE:
  {
    token: "jwt_token",
    role: "student|admin|company",
    name: "User Name",
    profileCompletion: {
      percentage: 45,
      status: {...}
    }
  }
       ↓
  FRONTEND ACTIONS:
  ├─ localStorage.setItem("token", response.token)
  ├─ localStorage.setItem("role", response.role)
  ├─ localStorage.setItem("profileCompletion", 45)
  └─ navigate("/home")
       ↓
┌─────────────────────────────────────────────────────────┐
│      AUTHENTICATED HOME PAGE                             │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Header:                                         │   │
│  │ 🎓 Campus Placement Portal                      │   │
│  │ Welcome back, John Doe!        [Logout]        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────┐  ┌───────────────────────────┐  │
│  │ SIDEBAR          │  │ MAIN CONTENT              │  │
│  │ ─────────────    │  │ ────────────────────────  │  │
│  │ 📋 Profile       │  │ Profile Completion: 45%   │  │
│  │ 📞 Contact       │  │ ████░░░░░░░░░░░░░░░░░    │  │
│  │ 👤 Basic Info    │  │                           │  │
│  │ 🎓 Academic      │  │ [Go to Dashboard] ────┐   │  │
│  │                  │  │                        │   │  │
│  └──────────────────┘  └───────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
       ↓
  ROLE-BASED REDIRECTION:
  ┌────────────────────────────────────┐
  │    DashboardButton Component        │
  │                                    │
  │  onClick → Check role:             │
  │  ├─ role === "student"             │
  │  │  └─ navigate("/student-dash")   │
  │  ├─ role === "admin"               │
  │  │  └─ navigate("/admin-dash")     │
  │  └─ role === "company"             │
  │     └─ navigate("/company-dash")   │
  └────────────────────────────────────┘
       ↓
  ┌──────────────────────────────────────────┐
  │  ROLE-SPECIFIC DASHBOARD                 │
  │  ├─ Student Dashboard (Apply to jobs)   │
  │  ├─ Admin Dashboard (Manage drives)     │
  │  └─ Company Dashboard (Post jobs)       │
  └──────────────────────────────────────────┘
```

---

## 2. DATA FLOW - Profile Update

```
┌─────────────────────────────────────────────────────────────┐
│          Profile Update Data Flow                           │
└─────────────────────────────────────────────────────────────┘

USER UPDATES CONTACT INFO:
┌──────────────────────────┐
│ ContactManagement.jsx    │
│                          │
│ Form Fields:             │
│ ├─ Mobile Number (Input) │
│ └─ Alternate Email       │
│                          │
│ [Save] [Cancel]          │
└──────────────────────────┘
         ↓
  ON CLICK SAVE:
  ├─ Validate inputs
  │  ├─ Mobile: 10 digits?
  │  └─ Email: valid format?
  ├─ If errors → Show error message
  └─ If valid → Send API request
         ↓
  API REQUEST:
  ┌──────────────────────────────────────┐
  │ PATCH /api/profile/contact           │
  │                                      │
  │ Headers:                             │
  │ ├─ Authorization: Bearer {token}    │
  │ └─ Content-Type: application/json    │
  │                                      │
  │ Body:                                │
  │ {                                    │
  │   mobileNumber: "9876543210",        │
  │   alternateEmail: "user@email.com"   │
  │ }                                    │
  └──────────────────────────────────────┘
         ↓
  BACKEND PROCESSING:
  ┌──────────────────────────────────────┐
  │ profileController.updateContactInfo  │
  │                                      │
  │ 1. Extract userId from token        │
  │ 2. Validate input format            │
  │ 3. Update database:                 │
  │    User.findByIdAndUpdate({         │
  │      "profile.mobileNumber": ...,  │
  │      "profile.alternateEmail": ...  │
  │    })                               │
  │ 4. Return updated user object       │
  └──────────────────────────────────────┘
         ↓
  DATABASE UPDATE:
  ┌──────────────────────────────────────┐
  │ MongoDB - Users Collection           │
  │                                      │
  │ Before:                              │
  │ {                                    │
  │   profile: {                         │
  │     mobileNumber: null,              │
  │     alternateEmail: null             │
  │   }                                  │
  │ }                                    │
  │           ↓↓↓                        │
  │ After:                               │
  │ {                                    │
  │   profile: {                         │
  │     mobileNumber: "9876543210",      │
  │     alternateEmail: "user@..."       │
  │   }                                  │
  │ }                                    │
  └──────────────────────────────────────┘
         ↓
  RESPONSE TO FRONTEND:
  ┌──────────────────────────────────────┐
  │ HTTP 200 - Success                   │
  │                                      │
  │ {                                    │
  │   message: "Updated successfully",   │
  │   user: {                            │
  │     email: "user@example.com",       │
  │     profile: {                       │
  │       mobileNumber: "9876543210",    │
  │       alternateEmail: "user@..."     │
  │     }                                │
  │   }                                  │
  │ }                                    │
  └──────────────────────────────────────┘
         ↓
  FRONTEND UPDATE:
  ├─ Show success message
  ├─ Update form state
  ├─ Close edit mode
  └─ Refetch profile data
         ↓
  PROGRESS BAR UPDATES:
  ├─ Recalculate completion %
  ├─ Update visual display
  └─ Show "Contact Info ✓" as complete
```

---

## 3. PROFILE COMPLETION CALCULATION

```
┌─────────────────────────────────────────────────────────────┐
│          Profile Completion Scoring System                  │
└─────────────────────────────────────────────────────────────┘

SECTIONS TRACKED:
┌──────────────────────────────────────────────────────────┐
│ 1. CONTACT INFO (Weight: 20%)                           │
│    ├─ Mobile Number              ✓/✗                   │
│    └─ Alternate Email            ✓/✗                   │
│                                                          │
│ 2. BASIC INFORMATION (Weight: 20%)                      │
│    ├─ Full Name                  ✓/✗                   │
│    ├─ Date of Birth              ✓/✗                   │
│    └─ Bio                         ✓/✗                   │
│                                                          │
│ 3. ACADEMIC INFORMATION (Weight: 30%)                   │
│    ├─ Current Degree             ✓/✗                   │
│    ├─ Institution                ✓/✗                   │
│    ├─ CGPA                        ✓/✗                   │
│    └─ Backlogs Status            ✓/✗                   │
│                                                          │
│ 4. SKILLS (Weight: 15%)                                 │
│    └─ At least 1 technical skill ✓/✗                   │
│                                                          │
│ 5. EXPERIENCE & DOCUMENTS (Weight: 15%)                 │
│    ├─ Resume Upload              ✓/✗                   │
│    └─ Experience Entry           ✓/✗                   │
└──────────────────────────────────────────────────────────┘

CALCULATION LOGIC:
┌──────────────────────────────────────────────────────────┐
│ getProfileCompletionPercentage():                        │
│                                                          │
│ completed = 0                                            │
│ total = 10 (sections)                                    │
│                                                          │
│ if (fullName exists) completed++      // 1/10          │
│ if (dateOfBirth exists) completed++    // 2/10         │
│ if (institution exists) completed++    // 3/10         │
│ if (cgpa exists) completed++           // 4/10         │
│ if (skills.length > 0) completed++     // 5/10         │
│ if (mobileNumber exists) completed++   // 6/10         │
│ if (resume exists) completed++         // 7/10         │
│ if (degree exists) completed++         // 8/10         │
│ if (experience.length > 0) completed++ // 9/10         │
│ if (bio exists) completed++            // 10/10        │
│                                                          │
│ percentage = (completed / total) * 100                 │
│                                                          │
│ Examples:                                               │
│ ├─ 3/10 completed = 30%  → "Incomplete"               │
│ ├─ 5/10 completed = 50%  → "Partial"                  │
│ ├─ 7/10 completed = 70%  → "Almost Complete"          │
│ └─ 10/10 completed = 100% → "Complete ✓"             │
└──────────────────────────────────────────────────────────┘
```

---

## 4. DATABASE SCHEMA - User Document

```
┌─────────────────────────────────────────────────────────────┐
│             MongoDB User Document Structure                 │
└─────────────────────────────────────────────────────────────┘

{
  _id: ObjectId("..."),
  
  // =================== AUTHENTICATION ===================
  name: "John Doe",
  email: "john.doe@example.com",
  password: "$2b$10$hashed_password_here...",
  role: "student",  // student | admin | company
  
  // =================== STATUS FLAGS ====================
  verified: false,
  approved: false,
  placed: false,
  profileComplete: false,
  
  // =================== PROFILE (Nested) ===============
  profile: {
    // ------- CONTACT INFO -------
    mobileNumber: "9876543210",
    alternateEmail: "alternate@example.com",
    phoneVerified: false,
    emailVerified: false,
    
    // ------- BASIC INFO -------
    basicInfo: {
      fullName: "John Doe",
      dateOfBirth: ISODate("2000-01-15"),
      gender: "Male",
      profilePicture: "https://cdn.example.com/pic.jpg",
      bio: "Aspiring software engineer",
      currentCity: "Vaishali",
      permanentCity: "Patna"
    },
    
    // ------- ACADEMIC INFO -------
    academicInfo: {
      // Current Education
      currentDegree: "B.Tech",
      specialization: "Computer Science",
      institution: "Dr. C.V. Raman University Vaishali",
      enrollmentYear: 2020,
      expectedGraduationYear: 2024,
      cgpa: 8.5,
      
      // 10th Standard
      board10: "CBSE",
      percentage10: 92,
      yearPassed10: 2017,
      
      // 12th Standard
      board12: "CBSE",
      percentage12: 88,
      yearPassed12: 2019,
      
      // Backlog Info
      activeBacklogs: 0,
      totalBacklogs: 0
    },
    
    // ------- SKILLS -------
    skills: {
      technical: [
        { name: "JavaScript", proficiency: "Advanced" },
        { name: "React", proficiency: "Advanced" },
        { name: "MongoDB", proficiency: "Intermediate" }
      ],
      languages: [
        { language: "English", proficiency: "Advanced" },
        { language: "Hindi", proficiency: "Native" }
      ]
    },
    
    // ------- EXPERIENCE -------
    experience: {
      internships: [
        {
          company: "Tech Startup XYZ",
          position: "Frontend Developer Intern",
          duration: "3 months",
          description: "Developed React components",
          startDate: ISODate("2023-06-01"),
          endDate: ISODate("2023-09-01"),
          skills: ["React", "JavaScript"]
        }
      ],
      workExperience: [] // Empty for student
    },
    
    // ------- DOCUMENTS -------
    documents: {
      resumeUrl: "https://cdn.example.com/resume.pdf",
      coverLetter: null,
      certificates: [
        {
          name: "AWS Solutions Architect",
          url: "https://cdn.example.com/cert.pdf",
          issuer: "Amazon",
          issueDate: ISODate("2023-05-01"),
          credentialId: "AWS-12345"
        }
      ]
    }
  },
  
  // =================== TIMESTAMPS ====================
  createdAt: ISODate("2024-01-10T10:30:00Z"),
  updatedAt: ISODate("2024-05-08T15:45:00Z"),
  lastProfileUpdate: ISODate("2024-05-08T15:45:00Z"),
  lastLogin: ISODate("2024-05-08T14:20:00Z")
}
```

---

## 5. COMPONENT HIERARCHY

```
┌─────────────────────────────────────────────────────────────┐
│                    App.jsx (Router)                         │
└─────────────────────────────────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ↓                   ↓                   ↓
    ┌─────────┐      ┌─────────────┐    ┌──────────────┐
    │  Home   │      │   Login     │    │  Register    │
    └─────────┘      └─────────────┘    └──────────────┘
    (Public)         (Public)            (Public)
         │
         ↓ (after login redirect)
    ┌──────────────────────────────────────────────────┐
    │        AuthenticatedHome.jsx                     │
    │  ┌────────────────────────────────────────────┐ │
    │  │ Header (Logo, User Name, Logout)           │ │
    │  └────────────────────────────────────────────┘ │
    │  ┌─────────────────┐ ┌─────────────────────────┐│
    │  │   Sidebar       │ │   Main Content          ││
    │  ├─────────────────┤ │ ┌─────────────────────┐││
    │  │ 📋 Profile      │ │ │ Profile Overview    │││
    │  │ 📞 Contact      │ │ │ ┌─────────────────┐ ││
    │  │ 👤 Basic Info   │ │ │ │ Progress Bar    │ │││
    │  │ 🎓 Academic     │ │ │ └─────────────────┘ │││
    │  └─────────────────┘ │ │ [Dashboard Button]  │││
    │                      │ └─────────────────────┘││
    │                      │ ┌─────────────────────┐││
    │  Tab Content Areas:  │ │ Contact Form        │││
    │  ├─ Overview         │ │ ┌─────────────────┐ │││
    │  ├─ Contact Form     │ │ │ Mobile Number   │ │││
    │  ├─ Basic Form       │ │ │ Email           │ │││
    │  └─ Academic Form    │ │ [Save] [Cancel]  │ │││
    │                      │ └─────────────────┘││
    │                      └─────────────────────────┘│
    └──────────────────────────────────────────────────┘
         │
         ├─→ DashboardButton.jsx
         │   ├─ onClick: Check role
         │   └─ navigate(/student|admin|company-dashboard)
         │
         ├─→ ProfileProgressBar.jsx
         │   ├─ Display %
         │   ├─ Section checklist
         │   └─ Recommendation
         │
         ├─→ ContactManagement.jsx
         │   ├─ Mobile input
         │   ├─ Email input
         │   └─ Save/Cancel
         │
         ├─→ BasicInformationForm.jsx
         │   ├─ Name, DOB, Gender
         │   ├─ Bio, Cities
         │   └─ Profile Picture
         │
         └─→ AcademicInformationForm.jsx
             ├─ Degree, Institution
             ├─ CGPA, Backlogs
             └─ 10th, 12th details

         ↓ (Click Dashboard Button)
    
    ┌──────────────────────────────────────────────────┐
    │  Student/Admin/Company Dashboard.jsx             │
    │  (Role-specific content)                         │
    └──────────────────────────────────────────────────┘
```

---

## 6. API ENDPOINT STRUCTURE

```
┌─────────────────────────────────────────────────────────────┐
│            Campus Placement Portal - API Routes             │
└─────────────────────────────────────────────────────────────┘

BASE_URL: http://localhost:5000/api

// ==================== AUTHENTICATION ====================
POST   /auth/register              → Create account
POST   /auth/login                 → Login (returns token + profile %)
GET    /auth/verify                → Verify token
POST   /auth/logout                → Logout
POST   /auth/refresh               → Refresh token
POST   /auth/change-password       → Change password
POST   /auth/forgot-password       → Reset password

// ==================== PROFILE - GET ====================
GET    /profile/me                 → Get complete profile
GET    /profile/completion         → Get completion %
GET    /profile/all                → List all (Admin only)

// ==================== PROFILE - UPDATE ====================
PATCH  /profile/contact            → Update mobile/email
PATCH  /profile/basic-info         → Update basic info
PATCH  /profile/academic-info      → Update academic info
PATCH  /profile/skills             → Update skills
PATCH  /profile/experience         → Update experience

// ==================== PROFILE - UPLOADS ====================
POST   /profile/upload-picture     → Upload profile pic
POST   /profile/upload-resume      → Upload resume

// ==================== PROFILE - VERIFICATION ====================
POST   /profile/verify-phone       → Send OTP
POST   /profile/verify-email       → Send verification

// ==================== OTHER RESOURCES ====================
GET    /jobs                       → List jobs (public)
POST   /jobs                       → Create job (company)
GET    /applications               → List applications
POST   /applications               → Apply for job
GET    /companies                  → List companies (admin)
etc...
```

---

## 7. STATE MANAGEMENT - localStorage

```
┌─────────────────────────────────────────────────────────────┐
│         Frontend State Management (localStorage)            │
└─────────────────────────────────────────────────────────────┘

ON LOGIN:
└─ localStorage.setItem("token", "jwt_token_here")
└─ localStorage.setItem("role", "student|admin|company")
└─ localStorage.setItem("name", "User Name")
└─ localStorage.setItem("email", "user@example.com")
└─ localStorage.setItem("userId", "user_id_here")
└─ localStorage.setItem("profileCompletion", 45)

BEFORE REDIRECT:
└─ Check token exists
└─ Check role exists
└─ If missing → navigate("/login")

ON HOME PAGE:
└─ Retrieve token for API calls
└─ Retrieve role for conditional rendering
└─ Retrieve profileCompletion for display

ON LOGOUT:
└─ localStorage.clear()
└─ Remove token, role, name, email, userId, etc.
└─ Navigate to "/login"

API CALLS:
└─ Add to every request:
   └─ headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
```

---

## 8. ERROR HANDLING FLOW

```
┌─────────────────────────────────────────────────────────────┐
│         Error Handling & Recovery Flow                      │
└─────────────────────────────────────────────────────────────┘

USER ACTION
    ↓
API CALL
    ├─ Network Error?
    │  └─ Show: "Network error. Check connection."
    │     └─ Allow retry
    │
    ├─ 401 Unauthorized?
    │  └─ Token expired or invalid
    │     └─ Clear localStorage
    │     └─ Redirect to /login
    │     └─ Show: "Session expired. Please login again."
    │
    ├─ 400 Bad Request?
    │  └─ Invalid input data
    │     └─ Show: "Please check your input and try again."
    │     └─ Highlight form fields with errors
    │
    ├─ 403 Forbidden?
    │  └─ User doesn't have permission
    │     └─ Show: "You don't have access to this resource."
    │
    ├─ 404 Not Found?
    │  └─ Resource doesn't exist
    │     └─ Show: "Resource not found."
    │
    ├─ 500 Server Error?
    │  └─ Backend error
    │     └─ Show: "Server error. Please try again later."
    │     └─ Log error for debugging
    │
    └─ 200 Success
       └─ Process response
       └─ Update UI
       └─ Show success message
```

---

## Quick Reference Visual

```
USER JOURNEY:
┌──────────┐   ┌──────────┐   ┌──────────────┐   ┌─────────────┐
│ Register │ → │  Login   │ → │ Auth Home    │ → │ Dashboard   │
└──────────┘   └──────────┘   └──────────────┘   └─────────────┘
  (Create)    (Get Token)  (Complete Profile)  (Role-specific)


PROFILE COMPLETION:
0% ────────────────────→ 25% ──────────────→ 50% ────────→ 100%
❌ Incomplete          ⚠️  Partial       ⏳ Almost      ✓ Complete
Basic info needed    Some info added   Most info added  Ready!


ROLE-BASED REDIRECTS:
                    /home (after login)
                         ↓
               [Click Dashboard Button]
                         ↓
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓
      Student        Admin          Company
      Dashboard      Dashboard      Dashboard
```

This visual guide helps understand the complete architecture and data flow!
