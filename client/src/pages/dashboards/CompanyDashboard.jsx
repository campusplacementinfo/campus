import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import Sidebar from "../../components/Sidebar";
import ThemeToggleButton from "../../components/ThemeToggleButton";
import { request, getUserProfile } from "../../services/api"; // Re-exported from api.js
import "./DashboardStyles.css";
import "./CompanyDashboardStyles.css";
import "./DarkTheme.css";
import "./LightTheme.css";

function CompanyDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const mainContentRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const [job, setJob] = useState({
    title: "",
    company: "",
    location: "",
    description: "",
    salary: "",
    positions: "",
    experience: "",
    skills: "",
    eligibility: ""
  });

  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [jobs, setJobs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [backendError, setBackendError] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [advancedFilters, setAdvancedFilters] = useState({
    status: "all",
    department: "all",
    sortBy: "date"
  });
  const [hiringPipeline, setHiringPipeline] = useState({
    stage: "all",
    stats: {}
  });
  const [companyAnalytics, setCompanyAnalytics] = useState({
    totalReach: 0,
    profileViews: 0,
    applicationConversion: 0
  });

  const [managedStudents, setManagedStudents] = useState([
    { id: 1, name: "Riya Sharma", email: "riya@university.edu", department: "CSE", status: "Active" },
    { id: 2, name: "Amit Patel", email: "amit@university.edu", department: "ECE", status: "Interviewing" }
  ]);

  const [managedCompanies, setManagedCompanies] = useState([
    { id: 1, name: "TechCorp", contact: "hr@techcorp.com", status: "Approved" },
    { id: 2, name: "BizSoft", contact: "talent@bizsoft.com", status: "Pending" }
  ]);

  const [placementDrives, setPlacementDrives] = useState([
    { id: 1, title: "Spring 2026 Drive", date: "2026-05-20", location: "Campus Hall", status: "Open" },
    { id: 2, title: "Summer Internship Drive", date: "2026-06-10", location: "Online", status: "Scheduled" }
  ]);

  const [announcements, setAnnouncements] = useState([
    { id: 1, title: "Campus Drive Update", message: "TechCorp will conduct on-campus interviews next Wednesday.", date: "2026-04-28" },
    { id: 2, title: "Resume Workshop", message: "Join the resume workshop tomorrow at 5PM.", date: "2026-04-30" }
  ]);

  const [activityLogs, setActivityLogs] = useState([
    { id: 1, action: "Job Posted", detail: "Senior Developer opening", time: "2026-04-27 10:00" },
    { id: 2, action: "Application Received", detail: "Application received for Frontend role", time: "2026-04-27 12:30" }
  ]);

  const [emailForm, setEmailForm] = useState({ recipientType: "students", subject: "", message: "" });
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  const sidebarLinks = [
    { id: "dashboard", label: "Dashboard", icon: "📊", action: () => handleTabChange("dashboard") },
    { id: "post", label: "Post New Job", icon: "➕", action: () => handleTabChange("post") },
    { id: "jobs", label: "Posted Jobs", icon: "📋", action: () => handleTabChange("jobs") },
    { id: "applicants", label: "Applications", icon: "👥", action: () => handleTabChange("applicants") },
    { id: "shortlisted", label: "Shortlisted Students", icon: "⭐", action: () => handleTabChange("shortlisted") },
    { id: "analytics", label: "Analytics", icon: "📊", action: () => handleTabChange("analytics") },
    { id: "hiring", label: "Hiring Pipeline", icon: "🎯", action: () => handleTabChange("hiring") },
    { id: "profile", label: "Profile", icon: "👤", action: () => handleTabChange("profile") }
  ];

  const dashboardMenuItems = [
    { id: "post", label: "Post New Job", icon: "➕" },
    { id: "jobs", label: "Posted Jobs", icon: "📋" },
    { id: "applicants", label: "Applications", icon: "👥" },
    { id: "shortlisted", label: "Shortlisted", icon: "⭐" },
    { id: "analytics", label: "Analytics", icon: "📊" },
    { id: "hiring", label: "Hiring Pipeline", icon: "🎯" },
    { id: "students", label: "Manage Students", icon: "👨‍🎓" },
    { id: "companies", label: "Manage Companies", icon: "🏢" },
    { id: "drives", label: "Placement Drives", icon: "🚀" },
    { id: "reports", label: "Placement Reports", icon: "📈" },
    { id: "email", label: "Send Emails", icon: "✉️" },
    { id: "announcements", label: "Announcements", icon: "📢" },
    { id: "advanced", label: "Advanced Analytics", icon: "📊" },
    { id: "activity", label: "Activity Logs", icon: "📝" }
  ];

  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    setJob({ ...job, [e.target.name]: e.target.value });
  };

  const postJob = async () => {
    if (!job.title || !job.company || !job.location || !job.description) {
      alert("Please fill all required fields");
      return;
    }

    const res = await request(
      "/jobs",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(job)
      },
      3
    );

    alert(res.message || "Job posting failed");

    if (res.success) {
      setJob({
        title: "",
        company: "",
        location: "",
        description: "",
        salary: "",
        positions: "",
        experience: "",
        skills: ""
      });
      fetchJobs();
    }
  };

  const fetchJobs = async () => {
    const res = await request(
      "/jobs",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      },
      3
    );

    if (!res.success) {
      setBackendError(res.message);
      setJobs([]);
      return;
    }

    setJobs(Array.isArray(res.data) ? res.data : []);
  };

  const fetchApplicants = async () => {
    const res = await request(
      "/applications/company-applications",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      },
      3
    );

    if (!res.success) {
      setBackendError(res.message);
      setApplications([]);
      return;
    }

    setApplications(Array.isArray(res.data) ? res.data : []);
  };

  const fetchUserProfile = async () => {
    try {
      const res = await getUserProfile();
      if (res.user) {
        setProfile(res.user);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoadingData(true);
      setBackendError("");
      await Promise.all([fetchApplicants(), fetchJobs(), fetchUserProfile()]);
      generateAnalytics();
      setLoadingData(false);
    };

    const params = new URLSearchParams(location.search);
    const tabFromUrl = params.get("tab");
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }

    loadDashboardData();
  }, [location]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`${location.pathname}?tab=${tab}`, { replace: true });
    
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  };

  const updateStatus = async (applicationId, status) => {
    const res = await request(
      `/applications/status/${applicationId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      },
      3
    );

    alert(res.message || "Unable to update status.");
    if (res.success) {
      fetchApplicants();
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#f39c12",
      shortlisted: "#3498db",
      selected: "#27ae60",
      rejected: "#e74c3c"
    };
    return colors[status] || "#95a5a6";
  };

  const generateAnalytics = () => {
    setCompanyAnalytics({
      totalReach: Math.floor(Math.random() * 5000) + 1000,
      profileViews: Math.floor(Math.random() * 3000) + 500,
      applicationConversion: (Math.random() * 15 + 5).toFixed(2)
    });
  };

  const handleApplyAdvancedFilters = () => {
    console.log("Applying filters:", advancedFilters);
    alert("Filters applied! (Filtered data will be displayed)");
  };

  const exportReport = () => {
    const reportData = {
      totalJobs: jobs.length,
      totalApplications: applications.length,
      generatedAt: new Date().toLocaleString(),
      applicationStats: {
        pending: applications.filter(a => a.status === "pending").length,
        shortlisted: applications.filter(a => a.status === "shortlisted").length,
        selected: applications.filter(a => a.status === "selected").length,
        rejected: applications.filter(a => a.status === "rejected").length
      },
      analytics: companyAnalytics
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `company_report_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    alert("Report exported successfully!");
  };

  const stats = [
    { label: "Total Job Posts", value: jobs.length, color: "#3498db" },
    {
      label: "Total Applications",
      value: applications.length,
      color: "#e74c3c"
    },
    {
      label: "Shortlisted",
      value: applications.filter((a) => a.status === "shortlisted").length,
      color: "#f39c12"
    },
    {
      label: "Selected",
      value: applications.filter((a) => a.status === "selected").length,
      color: "#27ae60"
    }
  ];

  return (
<div className="dashboard-container company-dashboard"> <>
  <div
    className={`sidebar-overlay ${sidebarOpen ? "show" : ""}`}
    onClick={() => setSidebarOpen(false)}
  ></div>

  <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
    <Sidebar links={sidebarLinks} activeItem={activeTab} closeSidebar={() => setSidebarOpen(false)} />
  </div>
</>
      <main className="dashboard-main" ref={mainContentRef}>
        <div className="dashboard-topbar">
  <button
    className={`menu-btn ${sidebarOpen ? "active" : ""}`}
    onClick={() => setSidebarOpen(!sidebarOpen)}
  >
    <span></span>
  </button>

  <h3>Placement Portal</h3>
  <div className="topbar-actions">
    <ThemeToggleButton />
  </div>
</div>
        <div className="dashboard-header">
          <h1>Company Dashboard</h1>
          <p>Manage recruitment activities and track applications</p>
        </div>

        <div className="info-grid">
          <div className="info-box">
            <h3>👔 Company</h3>
            <p>{profile?.profile?.basicInfo?.fullName || user?.name || "Not provided"}</p>
          </div>
          <div className="info-box">
            <h3>📧 Email</h3>
            <p>{profile?.email || user?.email || "Not provided"}</p>
          </div>
          <div className="info-box">
            <h3>📝 Role</h3>
            <p>{profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : "Company"}</p>
          </div>
        </div>

        <div className="action-card">
          <h3>Update Profile</h3>
          <p>Keep your company profile and contact details up to date.</p>
          <button className="action-btn" onClick={() => navigate("/profile")}>Open Profile</button>
        </div>

        {backendError && (
          <div className="dashboard-error-banner">
            <p>⚠️ {backendError}</p>
            <button className="retry-button" onClick={async () => {
              setBackendError("");
              setLoadingData(true);
              await Promise.all([fetchApplicants(), fetchJobs()]);
              setLoadingData(false);
            }}>
              Retry Backend Connection
            </button>
          </div>
        )}

        {loadingData && (
          <div className="dashboard-loading-banner">
            <p>⏳ Checking backend connection. Please wait...</p>
          </div>
        )}

        {/* Stats */}
        <div className="stats-grid">
          {stats.map((stat, idx) => (
            <div key={idx} className="stat-card" style={{ borderLeftColor: stat.color }}>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        <button className="menu-toggle-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? "📋 Hide Menu" : "📋 Show Menu"}
        </button>

        <div className={`section-menu ${isMenuOpen ? "open" : "closed"}`}>
          {dashboardMenuItems.map((item) => (
            <button
              key={item.id}
              className={`menu-btn ${activeTab === item.id ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {activeTab === "dashboard" && (
  <div className="content-section">
    <h2>Company Dashboard Overview</h2>
    <div className="info-grid">
      <div className="info-box">
        <h3>➕ Post New Job</h3>
        <p>Create placement openings for eligible students.</p>
      </div>
      <div className="info-box">
        <h3>📋 Posted Jobs</h3>
        <p>View and manage jobs posted by your company.</p>
      </div>
      <div className="info-box">
        <h3>👥 Applications</h3>
        <p>Review applicants and update selection status.</p>
      </div>
      <div className="info-box">
        <h3>⭐ Shortlisted Students</h3>
        <p>Track shortlisted and selected candidates.</p>
      </div>
      <div className="info-box">
        <h3>📊 Analytics</h3>
        <p>Monitor application counts and hiring performance.</p>
      </div>
      <div className="info-box">
        <h3>🎯 Hiring Pipeline</h3>
        <p>Manage candidates through recruitment stages.</p>
      </div>
    </div>
  </div>
)}

        {/* Post Job Section */}
        {activeTab === "post" && (
          <div className="content-section">
            <h2>Post a New Job Opening</h2>
            <form className="job-form">
              <div className="form-group">
                <label>Job Title</label>
                <input
                  name="title"
                  value={job.title}
                  placeholder="e.g., Senior Software Engineer"
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Company Name</label>
                <input
                  name="company"
                  value={job.company}
                  placeholder="e.g., Tech Corporation"
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  name="location"
                  value={job.location}
                  placeholder="e.g., Bangalore, India"
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Job Description</label>
                <textarea
                  name="description"
                  value={job.description}
                  placeholder="Describe the job role, requirements, and benefits..."
                  onChange={handleChange}
                  rows="6"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Salary (Optional)</label>
                  <input
                    name="salary"
                    value={job.salary}
                    placeholder="e.g., 5-7 LPA"
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Number of Positions</label>
                  <input
                    name="positions"
                    type="number"
                    value={job.positions}
                    placeholder="e.g., 5"
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Eligibility</label>
                  <input
                    name="eligibility"
                    value={job.eligibility}
                    placeholder="e.g., CSE / IT students only"
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Years of Experience</label>
                  <input
                    name="experience"
                    value={job.experience}
                    placeholder="e.g., 2-3 years"
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Required Skills</label>
                  <input
                    name="skills"
                    value={job.skills}
                    placeholder="e.g., Java, Spring Boot, MySQL"
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button type="button" onClick={postJob} className="submit-btn">
                🚀 Post Job
              </button>
            </form>
          </div>
        )}

        {/* Analytics Section */}
        {activeTab === "analytics" && (
          <div className="content-section">
            <h2>📊 Company Analytics & Performance</h2>

            <div className="analytics-grid">
              <div className="analytics-card">
                <h3>📢 Total Reach</h3>
                <div className="metric">
                  <span className="metric-value">{companyAnalytics.totalReach}</span>
                  <span className="metric-label">Student views</span>
                </div>
              </div>

              <div className="analytics-card">
                <h3>👁️ Profile Views</h3>
                <div className="metric">
                  <span className="metric-value">{companyAnalytics.profileViews}</span>
                  <span className="metric-label">Profile visits</span>
                </div>
              </div>

              <div className="analytics-card">
                <h3>📈 Conversion Rate</h3>
                <div className="metric">
                  <span className="metric-value">{companyAnalytics.applicationConversion}%</span>
                  <span className="metric-label">Applications per view</span>
                </div>
              </div>

              <div className="analytics-card">
                <h3>💼 Active Jobs</h3>
                <div className="metric">
                  <span className="metric-value">{jobs.length}</span>
                  <span className="metric-label">Job openings</span>
                </div>
              </div>
            </div>

            <div className="advanced-filters-section">
              <h3>Filter & Analyze Applications</h3>
              <div className="filter-row">
                <div className="filter-group">
                  <label>By Status:</label>
                  <select
                    value={advancedFilters.status}
                    onChange={(e) => setAdvancedFilters({...advancedFilters, status: e.target.value})}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="selected">Selected</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>By Department:</label>
                  <select
                    value={advancedFilters.department}
                    onChange={(e) => setAdvancedFilters({...advancedFilters, department: e.target.value})}
                  >
                    <option value="all">All Departments</option>
                    <option value="engineering">Engineering</option>
                    <option value="sales">Sales</option>
                    <option value="marketing">Marketing</option>
                    <option value="operations">Operations</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Sort By:</label>
                  <select
                    value={advancedFilters.sortBy}
                    onChange={(e) => setAdvancedFilters({...advancedFilters, sortBy: e.target.value})}
                  >
                    <option value="date">Most Recent</option>
                    <option value="name">Name</option>
                    <option value="status">Status</option>
                  </select>
                </div>

                <button className="action-btn" onClick={handleApplyAdvancedFilters}>
                  🔍 Apply Filters
                </button>
              </div>
            </div>

            <div className="export-section">
              <button className="action-btn" onClick={exportReport}>
                📥 Export Report
              </button>
              <button className="action-btn secondary" onClick={generateAnalytics}>
                🔄 Refresh Analytics
              </button>
            </div>
          </div>
        )}

        {/* Hiring Pipeline Section */}
        {activeTab === "hiring" && (
          <div className="content-section">
            <h2>🎯 Hiring Pipeline & Candidate Management</h2>

            <div className="pipeline-view">
              <div className="pipeline-stage">
                <h3>Applied</h3>
                <div className="stage-count">
                  {applications.filter(a => a.status === "pending").length}
                </div>
                <div className="stage-candidates">
                  {applications
                    .filter(a => a.status === "pending")
                    .slice(0, 3)
                    .map(app => (
                      <div key={app._id} className="candidate-tag">
                        {app.student?.name || "Unknown"}
                      </div>
                    ))}
                </div>
              </div>

              <div className="pipeline-arrow">→</div>

              <div className="pipeline-stage">
                <h3>Shortlisted</h3>
                <div className="stage-count">
                  {applications.filter(a => a.status === "shortlisted").length}
                </div>
                <div className="stage-candidates">
                  {applications
                    .filter(a => a.status === "shortlisted")
                    .slice(0, 3)
                    .map(app => (
                      <div key={app._id} className="candidate-tag">
                        {app.student?.name || "Unknown"}
                      </div>
                    ))}
                </div>
              </div>

              <div className="pipeline-arrow">→</div>

              <div className="pipeline-stage">
                <h3>Selected</h3>
                <div className="stage-count">
                  {applications.filter(a => a.status === "selected").length}
                </div>
                <div className="stage-candidates">
                  {applications
                    .filter(a => a.status === "selected")
                    .slice(0, 3)
                    .map(app => (
                      <div key={app._id} className="candidate-tag">
                        {app.student?.name || "Unknown"}
                      </div>
                    ))}
                </div>
              </div>

              <div className="pipeline-arrow">→</div>

              <div className="pipeline-stage">
                <h3>Rejected</h3>
                <div className="stage-count">
                  {applications.filter(a => a.status === "rejected").length}
                </div>
              </div>
            </div>

            <div className="hiring-stats">
              <div className="stat-box">
                <h4>Average Time to Hire</h4>
                <p>7-14 days</p>
              </div>
              <div className="stat-box">
                <h4>Acceptance Rate</h4>
                <p>78%</p>
              </div>
              <div className="stat-box">
                <h4>Quality Score</h4>
                <p>8.5/10</p>
              </div>
              <div className="stat-box">
                <h4>Time per Application</h4>
                <p>4.2 mins</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "shortlisted" && (
          <div className="content-section">
            <h2>⭐ Shortlisted Students</h2>
            {applications.filter((a) => a.status === "shortlisted").length === 0 ? (
              <div className="empty-state">
                <p>No shortlisted students currently. Shortlist deserving candidates from the Applications tab.</p>
              </div>
            ) : (
              <div className="applications-list">
                {applications.filter((a) => a.status === "shortlisted").map((app) => (
                  <div key={app._id} className="applicant-card status-shortlisted">
                    <div className="applicant-header">
                      <div className="applicant-info">
                        <h3>{app.student?.name}</h3>
                        <p className="job-title">Applied for: {app.job?.title}</p>
                      </div>
                      <span className="status-badge" style={{ backgroundColor: getStatusColor("shortlisted") }}>
                        SHORTLISTED
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "students" && (
          <div className="content-section">
            <h2>Manage Students</h2>
            <div className="info-grid">
              {managedStudents.map((student) => (
                <div key={student.id} className="info-box">
                  <h3>{student.name}</h3>
                  <p>{student.email}</p>
                  <p><strong>Department:</strong> {student.department}</p>
                  <p><strong>Status:</strong> {student.status}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "companies" && (
          <div className="content-section">
            <h2>Manage Companies</h2>
            <div className="info-grid">
              {managedCompanies.map((company) => (
                <div key={company.id} className="info-box">
                  <h3>{company.name}</h3>
                  <p>{company.contact}</p>
                  <p><strong>Status:</strong> {company.status}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "drives" && (
          <div className="content-section">
            <h2>Placement Drives</h2>
            <div className="info-grid">
              {placementDrives.map((drive) => (
                <div key={drive.id} className="info-box">
                  <h3>{drive.title}</h3>
                  <p><strong>Date:</strong> {drive.date}</p>
                  <p><strong>Location:</strong> {drive.location}</p>
                  <p><strong>Status:</strong> {drive.status}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "reports" && (
          <div className="content-section">
            <h2>Placement Reports</h2>
            <p>Download placement reports and review hiring performance.</p>
            <button className="action-btn" onClick={exportReport}>
              📥 Export Placement Report
            </button>
          </div>
        )}

        {activeTab === "email" && (
          <div className="content-section">
            <h2>Send Emails</h2>
            <div className="form-group">
              <label>Recipient Group</label>
              <select
                name="recipientType"
                value={emailForm.recipientType}
                onChange={(e) => setEmailForm({ ...emailForm, recipientType: e.target.value })}
              >
                <option value="students">Students</option>
                <option value="companies">Companies</option>
                <option value="all">All Users</option>
              </select>
            </div>
            <div className="form-group">
              <label>Subject</label>
              <input
                type="text"
                name="subject"
                value={emailForm.subject}
                onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea
                rows="5"
                name="message"
                value={emailForm.message}
                onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
              />
            </div>
            <button className="submit-btn" type="button" onClick={() => alert("Email sent to " + emailForm.recipientType)}>
              Send Email
            </button>
          </div>
        )}

        {activeTab === "announcements" && (
          <div className="content-section">
            <h2>Announcements</h2>
            <div className="info-grid">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="info-box">
                  <h3>{announcement.title}</h3>
                  <p>{announcement.message}</p>
                  <small>{announcement.date}</small>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "advanced" && (
          <div className="content-section">
            <h2>Advanced Analytics</h2>
            <div className="analytics-grid">
              <div className="analytics-card">
                <h3>Profile Reach</h3>
                <p>{companyAnalytics.totalReach}</p>
              </div>
              <div className="analytics-card">
                <h3>Conversion Rate</h3>
                <p>{companyAnalytics.applicationConversion}%</p>
              </div>
              <div className="analytics-card">
                <h3>Profile Views</h3>
                <p>{companyAnalytics.profileViews}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="content-section">
            <h2>Activity Logs</h2>
            <div className="applications-list">
              {activityLogs.map((log) => (
                <div key={log.id} className="applicant-card">
                  <div className="applicant-header">
                    <div className="applicant-info">
                      <h3>{log.action}</h3>
                      <p>{log.detail}</p>
                    </div>
                    <span className="status-badge">{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Posted Jobs Section */}
        {activeTab === "jobs" && (
          <div className="content-section">
            <h2>Your Posted Jobs</h2>

            {jobs.length === 0 ? (
              <div className="empty-state">
                <p>📭 No jobs posted yet. Start by posting a new job!</p>
              </div>
            ) : (
              <div className="jobs-list">
                {jobs.map((jobItem) => (
                  <div key={jobItem._id} className="job-list-card">
                    <div className="job-list-header">
                      <h3>{jobItem.title}</h3>
                      <span className="badge">
                        {
                          applications.filter((a) => a.job?._id === jobItem._id)
                            .length
                        }{" "}
                        applications
                      </span>
                    </div>
                    <div className="job-list-details">
                      <p className="company">
                        <span className="icon">🏢</span> {jobItem.company}
                      </p>
                      <p className="location">
                        <span className="icon">📍</span> {jobItem.location}
                      </p>
                    </div>
                    <p className="description">{jobItem.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Applicants Section */}
        {activeTab === "applicants" && (
          <div className="content-section">
            <h2>Application Management</h2>

            {applications.length === 0 ? (
              <div className="empty-state">
                <p>📭 No applications received yet.</p>
              </div>
            ) : (
              <div className="applications-list">
                {applications.map((app) => (
                  <div
                    key={app._id}
                    className={`applicant-card status-${app.status}`}
                  >
                    <div className="applicant-header">
                      <div className="applicant-info">
                        <h3>{app.student?.name}</h3>
                        <p className="job-title">Applied for: {app.job?.title}</p>
                      </div>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(app.status) }}
                      >
                        {app.status?.toUpperCase()}
                      </span>
                    </div>

                    <div className="applicant-details">
                      <p>
                        <strong>📧 Email:</strong> {app.student?.email}
                      </p>
                      <p>
                        <strong>🎯 Position:</strong> {app.job?.title}
                      </p>
                      <p>
                        <strong>📍 Location:</strong> {app.job?.location}
                      </p>
                    </div>

                    <div className="action-buttons">
                      <button
                        className="action-btn shortlist"
                        onClick={() => updateStatus(app._id, "shortlisted")}
                        disabled={app.status === "rejected"}
                      >
                        ⭐ Shortlist
                      </button>
                      <button
                        className="action-btn select"
                        onClick={() => updateStatus(app._id, "selected")}
                        disabled={app.status === "rejected"}
                      >
                        ✅ Select
                      </button>
                      <button
                        className="action-btn reject"
                        onClick={() => updateStatus(app._id, "rejected")}
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default CompanyDashboard;
