import { useState, useEffect } from "react";
import { useAuth } from "../../AuthContext";
import { getUserProfile } from "../../services/api";
import Sidebar from "../../components/Sidebar";
import "./DashboardStyles.css";
import "./AdminDashboardStyles.css";
import {
  getAllStudents,
  getAllCompanies,
  getAllJobs,
  getAllDrives,
  sendEmailToUsers,
  verifyStudent,
  deleteStudent,
  approveCompany,
  deleteCompany,
  getPlacementReports,
  getPendingUsers,
  getPendingJobs,
  approveUser,
  rejectUser,
  approveJob,
  rejectJob
} from "../../services/api";

function AdminDashboard() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [drives, setDrives] = useState([]);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailForm, setEmailForm] = useState({
    recipientType: "students",
    subject: "",
    message: "",
    selectedIds: []
  });
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    message: "",
    targetAudience: "all",
    priority: "normal"
  });
  const [activityLogs, setActivityLogs] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [analyticsData, setAnalyticsData] = useState({
    monthlyApplications: [],
    placementTrends: [],
    companyActivity: [],
    studentEngagement: []
  });

  const statsCards = [
    { label: "Total Students", value: students.length || "0", color: "#3498db" },
    { label: "Total Companies", value: companies.length || "0", color: "#e74c3c" },
    { label: "Active Placements", value: placements.length || "0", color: "#27ae60" },
    { label: "Pending Applications", value: "34", color: "#f39c12" }
  ];

  const menuItems = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "pending-users", label: "Pending Approvals", icon: "⏳" },
    { id: "pending-jobs", label: "Pending Job Posts", icon: "📄" },
    { id: "students", label: "Manage Students", icon: "👥" },
    { id: "companies", label: "Manage Companies", icon: "🏢" },
    { id: "drives", label: "Placement Drives", icon: "🎯" },
    { id: "reports", label: "Placement Reports", icon: "📈" },
    { id: "email", label: "Send Emails", icon: "✉️" },
    { id: "announcements", label: "Announcements", icon: "📢" },
    { id: "analytics", label: "Advanced Analytics", icon: "📊" },
    { id: "activity", label: "Activity Logs", icon: "📋" }
  ];
const sidebarLinks = menuItems.map((item) => ({
  label: item.label === "Overview" ? "Dashboard" : item.label,
  icon: item.icon,
  action: () => setActiveSection(item.id)
}));

  const fetchUserProfile = async () => {
    try {
      const res = await getUserProfile();
      if (res.user) {
        setProfile(res.user);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  useEffect(() => {
    const loadAdminData = async () => {
      await Promise.all([fetchAllData(), fetchUserProfile()]);
    };

    loadAdminData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [studentsRes, companiesRes, jobsRes, drivesRes, reportsRes, pendingUsersRes, pendingJobsRes] = await Promise.all([
        getAllStudents(),
        getAllCompanies(),
        getAllJobs(),
        getAllDrives(),
        getPlacementReports(),
        getPendingUsers(),
        getPendingJobs()
      ]);

      if (studentsRes.success) setStudents(studentsRes.data || []);
      if (companiesRes.success) setCompanies(companiesRes.data || []);
      if (jobsRes.success) setPlacements(jobsRes.data || []);
      if (drivesRes.success) setDrives(drivesRes.data || []);
      if (reportsRes.success) setReports(reportsRes.data || null);
      if (pendingUsersRes.success) setPendingUsers(pendingUsersRes.data || []);
      if (pendingJobsRes.success) setPendingJobs(pendingJobsRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  const handleVerifyStudent = async (studentId) => {
    const response = await verifyStudent(studentId);
    if (response.success) {
      alert("Student verified successfully.");
      fetchAllData();
    } else {
      alert(response.message || "Unable to verify student");
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm("Delete this student permanently?")) return;
    const response = await deleteStudent(studentId);
    if (response.success) {
      alert("Student deleted successfully.");
      fetchAllData();
    } else {
      alert(response.message || "Unable to delete student");
    }
  };

  const handleApproveCompany = async (companyId) => {
    const response = await approveCompany(companyId);
    if (response.success) {
      alert("Company approved successfully.");
      fetchAllData();
    } else {
      alert(response.message || "Unable to approve company");
    }
  };

  const handleDeleteCompany = async (companyId) => {
    if (!window.confirm("Delete this company permanently?")) return;
    const response = await deleteCompany(companyId);
    if (response.success) {
      alert("Company deleted successfully.");
      fetchAllData();
    } else {
      alert(response.message || "Unable to delete company");
    }
  };

  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setEmailForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSendEmail = async () => {
    if (!emailForm.subject || !emailForm.message) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const response = await sendEmailToUsers({
        recipientType: emailForm.recipientType,
        subject: emailForm.subject,
        message: emailForm.message
      });

      if (response.success) {
        alert("Email sent successfully!");
        setEmailForm({ recipientType: "students", subject: "", message: "", selectedIds: [] });
        setShowEmailModal(false);
      } else {
        alert(response.message || "Error sending email");
      }
    } catch (error) {
      alert("Error sending email: " + error.message);
    }
  };

  // Bulk operations
  const handleBulkVerifyStudents = async () => {
    if (selectedStudents.length === 0) {
      alert("Please select students to verify");
      return;
    }
    try {
      for (const studentId of selectedStudents) {
        await verifyStudent(studentId);
      }
      alert(`${selectedStudents.length} students verified successfully`);
      setSelectedStudents([]);
      fetchAllData();
    } catch (error) {
      alert("Error verifying students");
    }
  };

  const handleBulkApproveCompanies = async () => {
    if (selectedCompanies.length === 0) {
      alert("Please select companies to approve");
      return;
    }
    try {
      for (const companyId of selectedCompanies) {
        await approveCompany(companyId);
      }
      alert(`${selectedCompanies.length} companies approved successfully`);
      setSelectedCompanies([]);
      fetchAllData();
    } catch (error) {
      alert("Error approving companies");
    }
  };

  const handleApproveUser = async (userId) => {
    const response = await approveUser(userId);
    if (response.success) {
      alert("User approved successfully.");
      fetchAllData();
    } else {
      alert(response.message || "Unable to approve user");
    }
  };

  const handleRejectUser = async (userId) => {
    const response = await rejectUser(userId);
    if (response.success) {
      alert("User rejected successfully.");
      fetchAllData();
    } else {
      alert(response.message || "Unable to reject user");
    }
  };

  const handleApproveJob = async (jobId) => {
    const response = await approveJob(jobId);
    if (response.success) {
      alert("Job approved successfully.");
      fetchAllData();
    } else {
      alert(response.message || "Unable to approve job");
    }
  };

  const handleRejectJob = async (jobId) => {
    const response = await rejectJob(jobId);
    if (response.success) {
      alert("Job rejected successfully.");
      fetchAllData();
    } else {
      alert(response.message || "Unable to reject job");
    }
  };

  // Announcements
  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.message) {
      alert("Please fill in title and message");
      return;
    }
    // In a real app, this would make an API call
    const announcement = {
      id: Date.now(),
      ...newAnnouncement,
      createdAt: new Date().toISOString(),
      createdBy: "Admin"
    };
    setAnnouncements(prev => [announcement, ...prev]);
    setNewAnnouncement({
      title: "",
      message: "",
      targetAudience: "all",
      priority: "normal"
    });
    alert("Announcement created successfully!");
  };

  const handleDeleteAnnouncement = (id) => {
    setAnnouncements(prev => prev.filter(ann => ann.id !== id));
    alert("Announcement deleted successfully!");
  };

  // Activity logs simulation
  const generateActivityLogs = () => {
    const logs = [
      { id: 1, action: "Student verified", user: "Admin", timestamp: "2024-01-15 10:30", details: "Verified student John Doe" },
      { id: 2, action: "Company approved", user: "Admin", timestamp: "2024-01-15 09:45", details: "Approved TechCorp Inc." },
      { id: 3, action: "Job posted", user: "TechCorp", timestamp: "2024-01-15 08:20", details: "Posted Software Engineer position" },
      { id: 4, action: "Application submitted", user: "Jane Smith", timestamp: "2024-01-14 16:15", details: "Applied for Frontend Developer" },
      { id: 5, action: "Email sent", user: "Admin", timestamp: "2024-01-14 14:00", details: "Sent placement update to all students" }
    ];
    setActivityLogs(logs);
  };

  // Analytics data simulation
  const generateAnalyticsData = () => {
    setAnalyticsData({
      monthlyApplications: [
        { month: "Jan", count: 45 },
        { month: "Feb", count: 52 },
        { month: "Mar", count: 38 },
        { month: "Apr", count: 61 },
        { month: "May", count: 49 },
        { month: "Jun", count: 55 }
      ],
      placementTrends: [
        { month: "Jan", placed: 12 },
        { month: "Feb", placed: 15 },
        { month: "Mar", placed: 8 },
        { month: "Apr", placed: 18 },
        { month: "May", placed: 14 },
        { month: "Jun", placed: 16 }
      ],
      companyActivity: [
        { company: "TechCorp", jobs: 5, applications: 23 },
        { company: "InnovateLtd", jobs: 3, applications: 15 },
        { company: "GlobalTech", jobs: 4, applications: 19 },
        { company: "StartUpInc", jobs: 2, applications: 8 }
      ],
      studentEngagement: {
        totalStudents: students.length,
        activeStudents: students.filter(s => s.verified).length,
        placedStudents: students.filter(s => s.placed).length,
        avgApplications: 2.3
      }
    });
  };

  useEffect(() => {
    fetchAllData();
    generateActivityLogs();
    generateAnalyticsData();
  }, []);

  return (
    <div className="dashboard-container">
 <>
  <div
    className={`sidebar-overlay ${sidebarOpen ? "show" : ""}`}
    onClick={() => setSidebarOpen(false)}
  ></div>

  <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
    <Sidebar links={sidebarLinks} />
  </div>
</>
      <main className="dashboard-main">
        <div className="dashboard-topbar">
  <button
    className={`menu-btn ${sidebarOpen ? "active" : ""}`}
    onClick={() => setSidebarOpen(!sidebarOpen)}
  >
    <span></span>
  </button>

  <h3>Placement Portal</h3>
</div>
        <div className="dashboard-header">
          <h1>Admin / TPO Dashboard</h1>
          <p>Manage campus placement activities</p>
        </div>

        <div className="info-grid">
          <div className="info-box">
            <h3>👤 Name</h3>
            <p>{profile?.profile?.basicInfo?.fullName || user?.name || "Not provided"}</p>
          </div>
          <div className="info-box">
            <h3>📧 Email</h3>
            <p>{profile?.email || user?.email || "Not provided"}</p>
          </div>
          <div className="info-box">
            <h3>📝 Role</h3>
            <p>{profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : "Admin"}</p>
          </div>
        </div>

        <div className="action-card">
          <h3>Update Profile</h3>
          <p>Review and edit your account profile information anytime.</p>
          <button className="action-btn" onClick={() => window.location.href = "/#/profile"}>Open Profile</button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          {statsCards.map((card, idx) => (
            <div key={idx} className="stat-card" style={{ borderLeftColor: card.color }}>
              <div className="stat-value">{card.value}</div>
              <div className="stat-label">{card.label}</div>
            </div>
          ))}
        </div>

        {/* Navigation Menu */}
        <div className="section-menu">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`menu-btn ${activeSection === item.id ? "active" : ""}`}
              onClick={() => setActiveSection(item.id)}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* Content Sections */}
        <div className="content-section">
          {activeSection === "overview" && (
            <div className="section-content">
              <h2>Dashboard Overview</h2>
              <div className="info-grid">
                <div className="info-box">
                  <h3>📊 Quick Stats</h3>
                  <p>Monitor key placement metrics in real-time</p>
                </div>
                <div className="info-box">
                  <h3>⚡ Recent Activity</h3>
                  <p>Track latest student applications and company registrations</p>
                </div>
                <div className="info-box">
                  <h3>⚙️ System Health</h3>
                  <p>Monitor platform performance and user activity</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === "students" && (
            <div className="section-content">
              <h2>Manage Students</h2>
              <div className="action-card">
                <h3>👥 Student Management</h3>
                <p>Manage student profiles and placement eligibility.</p>
                <button className="action-btn" onClick={fetchAllData}>🔄 Refresh List</button>
              </div>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <>
                  <div className="stats-mini">
                    <div className="stat-mini">
                      <h4>Total Students</h4>
                      <p>{students.length}</p>
                    </div>
                    <div className="stat-mini">
                      <h4>Verified</h4>
                      <p>{students.filter(s => s.verified).length}</p>
                    </div>
                    <div className="stat-mini">
                      <h4>Placed</h4>
                      <p>{students.filter(s => s.placed).length}</p>
                    </div>
                  </div>

                  <div className="table-container">
                    <div className="table-header-actions">
                      <div className="bulk-select-all">
                        <input
                          type="checkbox"
                          checked={selectedStudents.length === students.length && students.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudents(students.map(s => s._id));
                            } else {
                              setSelectedStudents([]);
                            }
                          }}
                        />
                        <label>Select All</label>
                      </div>
                      {selectedStudents.length > 0 && (
                        <span className="selection-count">{selectedStudents.length} selected</span>
                      )}
                    </div>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Select</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Status</th>
                          <th>Verified</th>
                          <th>Placed</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.slice(0, 10).map((student) => (
                          <tr key={student._id}>
                            <td>
                              <input
                                type="checkbox"
                                checked={selectedStudents.includes(student._id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedStudents(prev => [...prev, student._id]);
                                  } else {
                                    setSelectedStudents(prev => prev.filter(id => id !== student._id));
                                  }
                                }}
                              />
                            </td>
                            <td>{student.name || "N/A"}</td>
                            <td>{student.email}</td>
                            <td><span className="badge active">Active</span></td>
                            <td>{student.verified ? "✅" : "❌"}</td>
                            <td>{student.placed ? "✅" : "❌"}</td>
                            <td>
                              {!student.verified && (
                                <button className="action-btn-sm" onClick={() => handleVerifyStudent(student._id)}>
                                  Verify
                                </button>
                              )}
                              <button className="action-btn-sm secondary" onClick={() => handleDeleteStudent(student._id)}>
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {activeSection === "companies" && (
            <div className="section-content">
              <h2>Manage Companies</h2>
              <div className="action-card">
                <h3>🏢 Company Management</h3>
                <p>Approve and manage company recruiters.</p>
                <button className="action-btn" onClick={fetchAllData}>🔄 Refresh List</button>
              </div>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <>
                  <div className="stats-mini">
                    <div className="stat-mini">
                      <h4>Total Companies</h4>
                      <p>{companies.length}</p>
                    </div>
                    <div className="stat-mini">
                      <h4>Active</h4>
                      <p>{companies.filter(c => c.approved).length}</p>
                    </div>
                    <div className="stat-mini">
                      <h4>Pending</h4>
                      <p>{companies.filter(c => !c.approved).length}</p>
                    </div>
                  </div>

                  <div className="table-container">
                    <div className="table-header-actions">
                      <div className="bulk-select-all">
                        <input
                          type="checkbox"
                          checked={selectedCompanies.length === companies.length && companies.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCompanies(companies.map(c => c._id));
                            } else {
                              setSelectedCompanies([]);
                            }
                          }}
                        />
                        <label>Select All</label>
                      </div>
                      {selectedCompanies.length > 0 && (
                        <span className="selection-count">{selectedCompanies.length} selected</span>
                      )}
                    </div>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Select</th>
                          <th>Company Name</th>
                          <th>Email</th>
                          <th>Status</th>
                          <th>Approved</th>
                          <th>Open Positions</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {companies.slice(0, 10).map((company) => (
                          <tr key={company._id}>
                            <td>
                              <input
                                type="checkbox"
                                checked={selectedCompanies.includes(company._id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedCompanies(prev => [...prev, company._id]);
                                  } else {
                                    setSelectedCompanies(prev => prev.filter(id => id !== company._id));
                                  }
                                }}
                              />
                            </td>
                            <td>{company.name || "N/A"}</td>
                            <td>{company.email}</td>
                            <td><span className="badge active">Active</span></td>
                            <td>{company.approved ? "✅" : "⏳"}</td>
                            <td>{Math.floor(Math.random() * 5) + 1}</td>
                            <td>
                              {!company.approved && (
                                <button className="action-btn-sm" onClick={() => handleApproveCompany(company._id)}>
                                  Approve
                                </button>
                              )}
                              <button className="action-btn-sm secondary" onClick={() => handleDeleteCompany(company._id)}>
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {activeSection === "pending-users" && (
            <div className="section-content">
              <h2>Pending Account Approvals</h2>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Enrollment</th>
                        <th>Registered</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingUsers.map((user) => (
                        <tr key={user._id}>
                          <td>{user.name || "N/A"}</td>
                          <td>{user.email}</td>
                          <td>{user.role}</td>
                          <td>{user.enrollmentNumber || "—"}</td>
                          <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td>{user.approvalStatus}</td>
                          <td>
                            <button className="action-btn-sm" onClick={() => handleApproveUser(user._id)}>
                              Approve
                            </button>
                            <button className="action-btn-sm secondary" onClick={() => handleRejectUser(user._id)}>
                              Reject
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeSection === "pending-jobs" && (
            <div className="section-content">
              <h2>Pending Job Posts</h2>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Job Title</th>
                        <th>Company</th>
                        <th>Package</th>
                        <th>Location</th>
                        <th>Eligibility</th>
                        <th>Description</th>
                        <th>Posted</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingJobs.map((job) => (
                        <tr key={job._id}>
                          <td>{job.title}</td>
                          <td>{job.company || job.createdBy?.name || "N/A"}</td>
                          <td>{job.salary || "N/A"}</td>
                          <td>{job.location}</td>
                          <td>{job.eligibility || "N/A"}</td>
                          <td>{job.description.slice(0, 80)}...</td>
                          <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                          <td>{job.jobStatus}</td>
                          <td>
                            <button className="action-btn-sm" onClick={() => handleApproveJob(job._id)}>
                              Approve
                            </button>
                            <button className="action-btn-sm secondary" onClick={() => handleRejectJob(job._id)}>
                              Reject
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeSection === "drives" && (
            <div className="section-content">
              <h2>Placement Drives</h2>
              <div className="action-card">
                <h3>🎯 Active Placement Drives</h3>
                <p>View and manage ongoing recruitment drives.</p>
                <button className="action-btn">+ Create New Drive</button>
              </div>
              {loading ? (
                <p>Loading...</p>
              ) : drives.length > 0 ? (
                <>
                  <div className="drives-grid">
                    {drives.slice(0, 6).map((drive) => (
                      <div key={drive._id} className="drive-card">
                        <div className="drive-header">
                          <h4>{drive.title || "Job Title"}</h4>
                          <span className="badge">{drive.status || "active"}</span>
                        </div>
                        <div className="drive-body">
                          <p><strong>Company:</strong> {drive.company?.name || "N/A"}</p>
                          <p><strong>Package:</strong> ₹{drive.salary || "N/A"} LPA</p>
                          <p><strong>Location:</strong> {drive.location || "N/A"}</p>
                          <p><strong>Positions:</strong> {drive.positions || "N/A"}</p>
                          <p><strong>Posted:</strong> {new Date(drive.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="drive-footer">
                          <button className="action-btn-sm">View Details</button>
                          <button className="action-btn-sm secondary">Edit</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p>No placement drives available.</p>
              )}
            </div>
          )}

          {activeSection === "reports" && (
            <div className="section-content">
              <h2>Placement Reports</h2>
              <div className="action-card">
                <h3>📈 Analytics & Reports</h3>
                <p>Generate and view placement statistics.</p>
              </div>

              <div className="reports-grid">
                <div className="report-card">
                  <h3>📊 Placement Rate</h3>
                  <div className="report-stat">
                    <div className="percentage">{reports ? `${reports.placementRate}%` : "--"}</div>
                    <p>{reports ? `${reports.totalApplications} total applications` : "Loading..."}</p>
                  </div>
                </div>

                <div className="report-card">
                  <h3>💰 Average Package</h3>
                  <div className="report-stat">
                    <div className="percentage">{reports ? `₹${reports.averagePackage}` : "--"}</div>
                    <p>Average salary LPA</p>
                  </div>
                </div>

                <div className="report-card">
                  <h3>🏢 Companies</h3>
                  <div className="report-stat">
                    <div className="percentage">{reports ? reports.totalCompanies : companies.length}</div>
                    <p>Active recruiters</p>
                  </div>
                </div>

                <div className="report-card">
                  <h3>🎯 Open Positions</h3>
                  <div className="report-stat">
                    <div className="percentage">{reports ? reports.totalJobs : placements.length}</div>
                    <p>Available jobs</p>
                  </div>
                </div>
              </div>

              <div className="action-card" style={{ marginTop: "30px" }}>
                <button className="action-btn">📥 Download Full Report</button>
                <button className="action-btn secondary">📊 View Charts</button>
              </div>
            </div>
          )}

          {activeSection === "email" && (
            <div className="section-content">
              <h2>Send Emails to Users</h2>
              <div className="email-form-container">
                <div className="form-group">
                  <label>Send To:</label>
                  <select
                    name="recipientType"
                    value={emailForm.recipientType}
                    onChange={handleEmailChange}
                    className="form-input"
                  >
                    <option value="students">All Students</option>
                    <option value="companies">All Companies</option>
                    <option value="both">Students & Companies</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Subject:</label>
                  <input
                    type="text"
                    name="subject"
                    placeholder="Email subject"
                    value={emailForm.subject}
                    onChange={handleEmailChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Message:</label>
                  <textarea
                    name="message"
                    placeholder="Type your message here..."
                    value={emailForm.message}
                    onChange={handleEmailChange}
                    className="form-textarea"
                    rows="8"
                  ></textarea>
                </div>

                <div className="email-preview">
                  <h4>Preview:</h4>
                  <div className="preview-box">
                    <p><strong>To:</strong> {emailForm.recipientType === "students" ? "All Students" : emailForm.recipientType === "companies" ? "All Companies" : "Students & Companies"}</p>
                    <p><strong>Subject:</strong> {emailForm.subject || "(No subject)"}</p>
                    <hr />
                    <p>{emailForm.message || "(No message)"}</p>
                  </div>
                </div>

                <div className="form-actions">
                  <button className="action-btn" onClick={handleSendEmail}>
                    ✉️ Send Email
                  </button>
                  <button className="action-btn secondary" onClick={() => setEmailForm({ recipientType: "students", subject: "", message: "", selectedIds: [] })}>
                    Clear
                  </button>
                </div>
              </div>

              <div className="email-stats">
                <div className="stat-card">
                  <h4>📧 Recipients:</h4>
                  {emailForm.recipientType === "students" && <p>{students.length} students</p>}
                  {emailForm.recipientType === "companies" && <p>{companies.length} companies</p>}
                  {emailForm.recipientType === "both" && <p>{students.length + companies.length} total users</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Email Modal */}
      {showEmailModal && (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>Send Email</h3>
          <div className="form-group">
            <label>Send To:</label>
            <select
              name="recipientType"
              value={emailForm.recipientType}
              onChange={handleEmailChange}
              className="form-input"
            >
              <option value="students">All Students</option>
              <option value="companies">All Companies</option>
              <option value="both">Students & Companies</option>
            </select>
          </div>
          <div className="form-group">
            <label>Subject:</label>
            <input
              type="text"
              name="subject"
              placeholder="Email subject"
              value={emailForm.subject}
              onChange={handleEmailChange}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Message:</label>
            <textarea
              name="message"
              placeholder="Type your message here..."
              value={emailForm.message}
              onChange={handleEmailChange}
              className="form-textarea"
              rows="8"
            ></textarea>
          </div>
          <div className="modal-actions">
            <button className="action-btn" onClick={handleSendEmail}>
              ✉️ Send Email
            </button>
            <button className="action-btn secondary" onClick={() => setShowEmailModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Announcements Section */}
    {activeSection === "announcements" && (
      <div className="content-section">
        <h2>📢 System Announcements</h2>
        <div className="announcement-form">
          <h3>Create New Announcement</h3>
          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              placeholder="Announcement title"
              value={newAnnouncement.title}
              onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Message:</label>
            <textarea
              placeholder="Announcement message..."
              value={newAnnouncement.message}
              onChange={(e) => setNewAnnouncement(prev => ({ ...prev, message: e.target.value }))}
              className="form-textarea"
              rows="4"
            ></textarea>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Target Audience:</label>
              <select
                value={newAnnouncement.targetAudience}
                onChange={(e) => setNewAnnouncement(prev => ({ ...prev, targetAudience: e.target.value }))}
                className="form-input"
              >
                <option value="all">All Users</option>
                <option value="students">Students Only</option>
                <option value="companies">Companies Only</option>
              </select>
            </div>
            <div className="form-group">
              <label>Priority:</label>
              <select
                value={newAnnouncement.priority}
                onChange={(e) => setNewAnnouncement(prev => ({ ...prev, priority: e.target.value }))}
                className="form-input"
              >
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <button className="action-btn" onClick={handleCreateAnnouncement}>
            📢 Create Announcement
          </button>
        </div>

        <div className="announcements-list">
          <h3>Recent Announcements</h3>
          {announcements.length === 0 ? (
            <p>No announcements created yet.</p>
          ) : (
            announcements.map((ann) => (
              <div key={ann.id} className={`announcement-card priority-${ann.priority}`}>
                <div className="announcement-header">
                  <h4>{ann.title}</h4>
                  <div className="announcement-meta">
                    <span className={`priority-badge priority-${ann.priority}`}>
                      {ann.priority.toUpperCase()}
                    </span>
                    <span className="audience-badge">{ann.targetAudience}</span>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <p>{ann.message}</p>
                <div className="announcement-footer">
                  <small>Created by {ann.createdBy} on {new Date(ann.createdAt).toLocaleDateString()}</small>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    )}

    {/* Advanced Analytics Section */}
    {activeSection === "analytics" && (
      <div className="content-section">
        <h2>📊 Advanced Analytics Dashboard</h2>

        <div className="analytics-grid">
          <div className="analytics-card">
            <h3>📈 Monthly Applications Trend</h3>
            <div className="chart-placeholder">
              <div className="bar-chart">
                {analyticsData.monthlyApplications.map((data, idx) => (
                  <div key={idx} className="bar-item">
                    <div
                      className="bar"
                      style={{ height: `${(data.count / 70) * 100}%` }}
                    ></div>
                    <span className="bar-label">{data.month}</span>
                    <span className="bar-value">{data.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="analytics-card">
            <h3>🎯 Placement Success Rate</h3>
            <div className="chart-placeholder">
              <div className="line-chart">
                {analyticsData.placementTrends.map((data, idx) => (
                  <div key={idx} className="line-point" style={{ left: `${(idx / 5) * 100}%`, bottom: `${(data.placed / 20) * 100}%` }}>
                    <span className="point-label">{data.placed}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="analytics-card">
            <h3>🏢 Company Activity</h3>
            <div className="company-activity-table">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Jobs Posted</th>
                    <th>Applications</th>
                    <th>Conversion Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.companyActivity.map((company, idx) => (
                    <tr key={idx}>
                      <td>{company.company}</td>
                      <td>{company.jobs}</td>
                      <td>{company.applications}</td>
                      <td>{((company.applications / company.jobs) * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="analytics-card">
            <h3>👥 Student Engagement Metrics</h3>
            <div className="engagement-metrics">
              <div className="metric-item">
                <span className="metric-label">Total Students:</span>
                <span className="metric-value">{analyticsData.studentEngagement.totalStudents}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Active Students:</span>
                <span className="metric-value">{analyticsData.studentEngagement.activeStudents}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Placed Students:</span>
                <span className="metric-value">{analyticsData.studentEngagement.placedStudents}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Avg Applications:</span>
                <span className="metric-value">{analyticsData.studentEngagement.avgApplications}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="analytics-actions">
          <button className="action-btn">📥 Export Analytics Report</button>
          <button className="action-btn secondary">📊 Generate Custom Report</button>
        </div>
      </div>
    )}

    {/* Activity Logs Section */}
    {activeSection === "activity" && (
      <div className="content-section">
        <h2>📋 System Activity Logs</h2>
        <div className="activity-filters">
          <button className="filter-btn active">All Activities</button>
          <button className="filter-btn">User Actions</button>
          <button className="filter-btn">System Events</button>
          <button className="filter-btn">Security Logs</button>
        </div>

        <div className="activity-log-table">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>User</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {activityLogs.map((log) => (
                <tr key={log.id}>
                  <td>{log.timestamp}</td>
                  <td><span className="activity-badge">{log.action}</span></td>
                  <td>{log.user}</td>
                  <td>{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="activity-actions">
          <button className="action-btn">📥 Export Logs</button>
          <button className="action-btn secondary">🔍 Advanced Search</button>
        </div>
      </div>
    )}

    {/* Bulk Operations Modal */}
    {(selectedStudents.length > 0 || selectedCompanies.length > 0) && (
      <div className="bulk-actions-bar">
        <span>{selectedStudents.length + selectedCompanies.length} items selected</span>
        <div className="bulk-buttons">
          {selectedStudents.length > 0 && (
            <button className="bulk-btn" onClick={handleBulkVerifyStudents}>
              ✅ Verify Selected Students
            </button>
          )}
          {selectedCompanies.length > 0 && (
            <button className="bulk-btn" onClick={handleBulkApproveCompanies}>
              ✅ Approve Selected Companies
            </button>
          )}
          <button
            className="bulk-btn secondary"
            onClick={() => {
              setSelectedStudents([]);
              setSelectedCompanies([]);
            }}
          >
            ❌ Clear Selection
          </button>
        </div>
      </div>
    )}
    </div>
  );
}

export default AdminDashboard;