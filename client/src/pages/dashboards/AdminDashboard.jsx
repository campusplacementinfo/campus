import { useState, useEffect, useRef } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import { getUserProfile } from "../../services/api";
import DashboardLayout from "./DashboardLayout";
import {
  Overview,
  ManageStudents,
  ManageCompanies,
  PendingApprovals,
  PendingJobPosts,
  PlacementDrives,
  PlacementReports,
  SendEmails,
  Announcements,
  AdvancedAnalytics,
  ActivityLogs
} from "./admin/AdminDashboardViews";
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
  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [drives, setDrives] = useState([]);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(false);
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
    studentEngagement: {
      totalStudents: 0,
      activeStudents: 0,
      placedStudents: 0,
      avgApplications: 0
    }
  });

  const statsCards = [
    { label: "Total Students", value: students.length || "0", color: "#3498db" },
    { label: "Total Companies", value: companies.length || "0", color: "#e74c3c" },
    { label: "Active Placements", value: placements.length || "0", color: "#27ae60" },
    { label: "Pending Applications", value: pendingUsers.length || "0", color: "#f39c12" }
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
    path: `/admin/dashboard/${item.id}`
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
    setEmailForm((prev) => ({ ...prev, [name]: value }));
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
      } else {
        alert(response.message || "Error sending email");
      }
    } catch (error) {
      alert("Error sending email: " + error.message);
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

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.message) {
      alert("Please fill in title and message");
      return;
    }
    const announcement = {
      id: Date.now(),
      ...newAnnouncement,
      createdAt: new Date().toISOString(),
      createdBy: "Admin"
    };
    setAnnouncements((prev) => [announcement, ...prev]);
    setNewAnnouncement({ title: "", message: "", targetAudience: "all", priority: "normal" });
    alert("Announcement created successfully!");
  };

  const handleDeleteAnnouncement = (id) => {
    setAnnouncements((prev) => prev.filter((ann) => ann.id !== id));
    alert("Announcement deleted successfully!");
  };

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
        activeStudents: students.filter((s) => s.verified).length,
        placedStudents: students.filter((s) => s.placed).length,
        avgApplications: 2.3
      }
    });
  };

  useEffect(() => {
    const loadAdminData = async () => {
      await Promise.all([fetchAllData(), fetchUserProfile()]);
    };
    loadAdminData();
    generateActivityLogs();
    generateAnalyticsData();
  }, []);

  return (
    <DashboardLayout sidebarLinks={sidebarLinks} title="Admin / TPO Dashboard" subtitle="Manage campus placement activities">
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
        <button className="action-btn" type="button" onClick={() => window.location.href = "/#/profile"}>
          Open Profile
        </button>
      </div>

      <div className="stats-grid">
        {statsCards.map((card, idx) => (
          <div key={idx} className="stat-card" style={{ borderLeftColor: card.color }}>
            <div className="stat-value">{card.value}</div>
            <div className="stat-label">{card.label}</div>
          </div>
        ))}
      </div>

      <Routes>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<Overview profile={profile} user={user} statsCards={statsCards} />} />
        <Route
          path="students"
          element={
            <ManageStudents
              students={students}
              loading={loading}
              selectedStudents={selectedStudents}
              setSelectedStudents={setSelectedStudents}
              handleVerifyStudent={handleVerifyStudent}
              handleDeleteStudent={handleDeleteStudent}
              fetchAllData={fetchAllData}
            />
          }
        />
        <Route
          path="companies"
          element={
            <ManageCompanies
              companies={companies}
              loading={loading}
              selectedCompanies={selectedCompanies}
              setSelectedCompanies={setSelectedCompanies}
              handleApproveCompany={handleApproveCompany}
              handleDeleteCompany={handleDeleteCompany}
              fetchAllData={fetchAllData}
            />
          }
        />
        <Route
          path="pending-users"
          element={
            <PendingApprovals
              pendingUsers={pendingUsers}
              loading={loading}
              handleApproveUser={handleApproveUser}
              handleRejectUser={handleRejectUser}
            />
          }
        />
        <Route
          path="pending-jobs"
          element={
            <PendingJobPosts
              pendingJobs={pendingJobs}
              loading={loading}
              handleApproveJob={handleApproveJob}
              handleRejectJob={handleRejectJob}
            />
          }
        />
        <Route path="drives" element={<PlacementDrives drives={drives} loading={loading} />} />
        <Route path="reports" element={<PlacementReports reports={reports} companies={companies} placements={placements} />} />
        <Route
          path="email"
          element={
            <SendEmails
              emailForm={emailForm}
              handleEmailChange={handleEmailChange}
              handleSendEmail={handleSendEmail}
              students={students}
              companies={companies}
              setEmailForm={setEmailForm}
            />
          }
        />
        <Route
          path="announcements"
          element={
            <Announcements
              announcements={announcements}
              newAnnouncement={newAnnouncement}
              setNewAnnouncement={setNewAnnouncement}
              handleCreateAnnouncement={handleCreateAnnouncement}
              handleDeleteAnnouncement={handleDeleteAnnouncement}
            />
          }
        />
        <Route path="analytics" element={<AdvancedAnalytics analyticsData={analyticsData} />} />
        <Route path="activity" element={<ActivityLogs activityLogs={activityLogs} />} />
        <Route path="*" element={<Navigate to="overview" replace />} />
      </Routes>

      {(selectedStudents.length > 0 || selectedCompanies.length > 0) && (
        <div className="bulk-actions-bar">
          <span>{selectedStudents.length + selectedCompanies.length} items selected</span>
          <div className="bulk-buttons">
            {selectedStudents.length > 0 && (
              <button className="bulk-btn" type="button" onClick={handleBulkVerifyStudents}>
                ✅ Verify Selected Students
              </button>
            )}
            {selectedCompanies.length > 0 && (
              <button className="bulk-btn" type="button" onClick={handleBulkApproveCompanies}>
                ✅ Approve Selected Companies
              </button>
            )}
            <button className="bulk-btn secondary" type="button" onClick={() => {
              setSelectedStudents([]);
              setSelectedCompanies([]);
            }}>
              ❌ Clear Selection
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default AdminDashboard;
