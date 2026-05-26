export function Overview({ profile, user, statsCards }) {
  return (
    <div className="content-section">
      <div className="section-content">
        <h2>Dashboard Overview</h2>
        <div className="info-grid">
          <div className="info-box">
            <h3>📊 Quick Stats</h3>
            <p>Monitor key placement metrics in real-time.</p>
          </div>
          <div className="info-box">
            <h3>⚡ Recent Activity</h3>
            <p>Track latest student applications and company registrations.</p>
          </div>
          <div className="info-box">
            <h3>⚙️ System Health</h3>
            <p>Monitor platform performance and user activity.</p>
          </div>
        </div>

        <div className="stats-grid">
          {statsCards.map((card, idx) => (
            <div key={idx} className="stat-card" style={{ borderLeftColor: card.color }}>
              <div className="stat-value">{card.value}</div>
              <div className="stat-label">{card.label}</div>
            </div>
          ))}
        </div>

        <div className="info-grid" style={{ marginTop: "24px" }}>
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
      </div>
    </div>
  );
}

export function ManageStudents({ students, loading, selectedStudents, setSelectedStudents, handleVerifyStudent, handleDeleteStudent, fetchAllData }) {
  return (
    <div className="content-section">
      <h2>Manage Students</h2>
      <div className="action-card">
        <h3>👥 Student Management</h3>
        <p>Manage student profiles and placement eligibility.</p>
        <button className="action-btn" type="button" onClick={fetchAllData}>
          🔄 Refresh List
        </button>
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
              <p>{students.filter((s) => s.verified).length}</p>
            </div>
            <div className="stat-mini">
              <h4>Placed</h4>
              <p>{students.filter((s) => s.placed).length}</p>
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
                      setSelectedStudents(students.map((s) => s._id));
                    } else {
                      setSelectedStudents([]);
                    }
                  }}
                />
                <label>Select All</label>
              </div>
              {selectedStudents.length > 0 && <span className="selection-count">{selectedStudents.length} selected</span>}
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
                            setSelectedStudents((prev) => [...prev, student._id]);
                          } else {
                            setSelectedStudents((prev) => prev.filter((id) => id !== student._id));
                          }
                        }}
                      />
                    </td>
                    <td>{student.name || "N/A"}</td>
                    <td>{student.email}</td>
                    <td>
                      <span className="badge active">Active</span>
                    </td>
                    <td>{student.verified ? "✅" : "❌"}</td>
                    <td>{student.placed ? "✅" : "❌"}</td>
                    <td>
                      {!student.verified && (
                        <button className="action-btn-sm" type="button" onClick={() => handleVerifyStudent(student._id)}>
                          Verify
                        </button>
                      )}
                      <button className="action-btn-sm secondary" type="button" onClick={() => handleDeleteStudent(student._id)}>
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
  );
}

export function ManageCompanies({ companies, loading, selectedCompanies, setSelectedCompanies, handleApproveCompany, handleDeleteCompany, fetchAllData }) {
  return (
    <div className="content-section">
      <h2>Manage Companies</h2>
      <div className="action-card">
        <h3>🏢 Company Management</h3>
        <p>Approve and manage company recruiters.</p>
        <button className="action-btn" type="button" onClick={fetchAllData}>
          🔄 Refresh List
        </button>
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
              <p>{companies.filter((c) => c.approved).length}</p>
            </div>
            <div className="stat-mini">
              <h4>Pending</h4>
              <p>{companies.filter((c) => !c.approved).length}</p>
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
                      setSelectedCompanies(companies.map((c) => c._id));
                    } else {
                      setSelectedCompanies([]);
                    }
                  }}
                />
                <label>Select All</label>
              </div>
              {selectedCompanies.length > 0 && <span className="selection-count">{selectedCompanies.length} selected</span>}
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
                            setSelectedCompanies((prev) => [...prev, company._id]);
                          } else {
                            setSelectedCompanies((prev) => prev.filter((id) => id !== company._id));
                          }
                        }}
                      />
                    </td>
                    <td>{company.name || "N/A"}</td>
                    <td>{company.email}</td>
                    <td>
                      <span className="badge active">Active</span>
                    </td>
                    <td>{company.approved ? "✅" : "⏳"}</td>
                    <td>{Math.floor(Math.random() * 5) + 1}</td>
                    <td>
                      {!company.approved && (
                        <button className="action-btn-sm" type="button" onClick={() => handleApproveCompany(company._id)}>
                          Approve
                        </button>
                      )}
                      <button className="action-btn-sm secondary" type="button" onClick={() => handleDeleteCompany(company._id)}>
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
  );
}

export function PendingApprovals({ pendingUsers, loading, handleApproveUser, handleRejectUser }) {
  return (
    <div className="content-section">
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
                    <button className="action-btn-sm" type="button" onClick={() => handleApproveUser(user._id)}>
                      Approve
                    </button>
                    <button className="action-btn-sm secondary" type="button" onClick={() => handleRejectUser(user._id)}>
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
  );
}

export function PendingJobPosts({ pendingJobs, loading, handleApproveJob, handleRejectJob }) {
  return (
    <div className="content-section">
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
                  <td>{job.location || "N/A"}</td>
                  <td>{job.eligibility || "N/A"}</td>
                  <td>{(job.description || "").slice(0, 80)}...</td>
                  <td>{job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "N/A"}</td>
                  <td>{job.jobStatus || "Pending"}</td>
                  <td>
                    <button className="action-btn-sm" type="button" onClick={() => handleApproveJob(job._id)}>
                      Approve
                    </button>
                    <button className="action-btn-sm secondary" type="button" onClick={() => handleRejectJob(job._id)}>
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
  );
}

export function PlacementDrives({ drives, loading }) {
  return (
    <div className="content-section">
      <h2>Placement Drives</h2>
      <div className="action-card">
        <h3>🎯 Active Placement Drives</h3>
        <p>View and manage ongoing recruitment drives.</p>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : drives.length > 0 ? (
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
                <p><strong>Posted:</strong> {drive.createdAt ? new Date(drive.createdAt).toLocaleDateString() : "N/A"}</p>
              </div>
              <div className="drive-footer">
                <button className="action-btn-sm" type="button">View Details</button>
                <button className="action-btn-sm secondary" type="button">Edit</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No placement drives available.</p>
      )}
    </div>
  );
}

export function PlacementReports({ reports, companies, placements }) {
  return (
    <div className="content-section">
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
        <button className="action-btn" type="button">📥 Download Full Report</button>
        <button className="action-btn secondary" type="button">📊 View Charts</button>
      </div>
    </div>
  );
}

export function SendEmails({ emailForm, handleEmailChange, handleSendEmail, students, companies, setEmailForm }) {
  return (
    <div className="content-section">
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
          />
        </div>

        <div className="email-preview">
          <h4>Preview:</h4>
          <div className="preview-box">
            <p>
              <strong>To:</strong>{" "}
              {emailForm.recipientType === "students"
                ? "All Students"
                : emailForm.recipientType === "companies"
                ? "All Companies"
                : "Students & Companies"}
            </p>
            <p>
              <strong>Subject:</strong> {emailForm.subject || "(No subject)"}
            </p>
            <hr />
            <p>{emailForm.message || "(No message)"}</p>
          </div>
        </div>

        <div className="form-actions">
          <button className="action-btn" type="button" onClick={handleSendEmail}>
            ✉️ Send Email
          </button>
          <button
            className="action-btn secondary"
            type="button"
            onClick={() => setEmailForm({ recipientType: "students", subject: "", message: "", selectedIds: [] })}
          >
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
  );
}

export function Announcements({ announcements, newAnnouncement, setNewAnnouncement, handleCreateAnnouncement, handleDeleteAnnouncement }) {
  return (
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
            onChange={(e) => setNewAnnouncement((prev) => ({ ...prev, title: e.target.value }))}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>Message:</label>
          <textarea
            placeholder="Announcement message..."
            value={newAnnouncement.message}
            onChange={(e) => setNewAnnouncement((prev) => ({ ...prev, message: e.target.value }))}
            className="form-textarea"
            rows="4"
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Target Audience:</label>
            <select
              value={newAnnouncement.targetAudience}
              onChange={(e) => setNewAnnouncement((prev) => ({ ...prev, targetAudience: e.target.value }))}
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
              onChange={(e) => setNewAnnouncement((prev) => ({ ...prev, priority: e.target.value }))}
              className="form-input"
            >
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
        <button className="action-btn" type="button" onClick={handleCreateAnnouncement}>
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
                  <span className={`priority-badge priority-${ann.priority}`}>{ann.priority.toUpperCase()}</span>
                  <span className="audience-badge">{ann.targetAudience}</span>
                  <button className="delete-btn" type="button" onClick={() => handleDeleteAnnouncement(ann.id)}>
                    🗑️
                  </button>
                </div>
              </div>
              <p>{ann.message}</p>
              <div className="announcement-footer">
                <small>
                  Created by {ann.createdBy} on {new Date(ann.createdAt).toLocaleDateString()}
                </small>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function AdvancedAnalytics({ analyticsData }) {
  return (
    <div className="content-section">
      <h2>📊 Advanced Analytics Dashboard</h2>
      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>📈 Monthly Applications Trend</h3>
          <div className="chart-placeholder">
            <div className="bar-chart">
              {analyticsData.monthlyApplications.map((data, idx) => (
                <div key={idx} className="bar-item">
                  <div className="bar" style={{ height: `${(data.count / 70) * 100}%` }} />
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
                <div
                  key={idx}
                  className="line-point"
                  style={{ left: `${(idx / 5) * 100}%`, bottom: `${(data.placed / 20) * 100}%` }}
                >
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
        <button className="action-btn" type="button">
          📥 Export Analytics Report
        </button>
        <button className="action-btn secondary" type="button">
          📊 Generate Custom Report
        </button>
      </div>
    </div>
  );
}

export function ActivityLogs({ activityLogs }) {
  return (
    <div className="content-section">
      <h2>📋 System Activity Logs</h2>
      <div className="activity-filters">
        <button className="filter-btn active" type="button">
          All Activities
        </button>
        <button className="filter-btn" type="button">
          User Actions
        </button>
        <button className="filter-btn" type="button">
          System Events
        </button>
        <button className="filter-btn" type="button">
          Security Logs
        </button>
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
                <td>
                  <span className="activity-badge">{log.action}</span>
                </td>
                <td>{log.user}</td>
                <td>{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="activity-actions">
        <button className="action-btn" type="button">
          📥 Export Logs
        </button>
        <button className="action-btn secondary" type="button">
          🔍 Advanced Search
        </button>
      </div>
    </div>
  );
}
