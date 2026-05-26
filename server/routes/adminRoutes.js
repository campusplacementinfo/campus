const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");
const Job = require("../models/job");
const Application = require("../models/Application");
const Drive = require("../models/Drive");
const { sendMail, wrapHtmlEmail } = require("../utils/mailer");
const { getCache, setCache, clearCache } = require("../utils/cache");

const CACHE_KEYS = {
  students: 'admin:students',
  companies: 'admin:companies',
  pendingUsers: 'admin:pendingUsers',
  reports: 'admin:reports',
  pendingJobs: 'admin:pendingJobs',
  drives: 'admin:drives'
};
const CACHE_TTL_MS = 30000;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const router = express.Router();

// Middleware to check if admin
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }
  next();
};

// Get all students
router.get("/students", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const cached = getCache(CACHE_KEYS.students);
    if (cached) {
      return res.json({ success: true, data: cached });
    }

    const students = await User.find({ role: "student" }).select("-password");
    setCache(CACHE_KEYS.students, students, CACHE_TTL_MS);
    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ message: "Error fetching students", error: error.message });
  }
});

// Get all companies
router.get("/companies", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const cached = getCache(CACHE_KEYS.companies);
    if (cached) {
      return res.json({ success: true, data: cached });
    }

    const companies = await User.find({ role: "company" }).select("-password");
    setCache(CACHE_KEYS.companies, companies, CACHE_TTL_MS);
    res.json({ success: true, data: companies });
  } catch (error) {
    res.status(500).json({ message: "Error fetching companies", error: error.message });
  }
});

// Get placement reports
router.get("/reports", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const cached = getCache(CACHE_KEYS.reports);
    if (cached) {
      return res.json({ success: true, data: cached });
    }

    const totalStudents = await User.countDocuments({ role: "student" });
    const totalCompanies = await User.countDocuments({ role: "company" });
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();
    const pendingApprovals = await User.countDocuments({ approvalStatus: "pending" });
    const pendingJobPosts = await Job.countDocuments({ jobStatus: "pending" });
    const pendingApplications = await Application.countDocuments({ status: "pending" });

    const reports = {
      totalStudents,
      totalCompanies,
      totalJobs,
      totalApplications,
      pendingApprovals,
      pendingJobPosts,
      pendingApplications,
      placementRate: Math.floor((totalApplications / totalStudents) * 100) || 0,
      averagePackage: "₹6.5 LPA"
    };

    setCache(CACHE_KEYS.reports, reports, CACHE_TTL_MS);
    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ message: "Error fetching reports", error: error.message });
  }
});

// Send email to users
router.post("/send-email", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { recipientType, subject, message } = req.body;

    if (!recipientType || !subject || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let recipients = [];

    if (recipientType === "students" || recipientType === "both") {
      const students = await User.find({ role: "student" });
      recipients = [...recipients, ...students.map(s => s.email)];
    }

    if (recipientType === "companies" || recipientType === "both") {
      const companies = await User.find({ role: "company" });
      recipients = [...recipients, ...companies.map(c => c.email)];
    }

    if (recipients.length === 0) {
      return res.status(400).json({ message: "No recipients found" });
    }

    await sendMail({
      to: recipients.join(","),
      subject,
      html: `<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;"><div style="background-color: white; padding: 30px; border-radius: 8px; max-width: 600px; margin: 0 auto;"><h2 style="color: #2c3e50; margin-bottom: 20px;">Campus Placement Portal</h2><div style="color: #555; line-height: 1.6; white-space: pre-wrap;">${message}</div><hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;"><p style="color: #999; font-size: 12px; margin: 0;">© 2024 Campus Placement Portal. All rights reserved.</p></div></div>`
    });

    res.json({
      success: true,
      message: `Email sent successfully to ${recipients.length} recipient(s)`
    });
  } catch (error) {
    console.error("Email Error:", error);
    res.status(500).json({
      message: "Error sending email",
      error: error.message
    });
  }
});

// Verify/Approve student
router.put("/students/:id/verify", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const student = await User.findByIdAndUpdate(
      req.params.id,
      { verified: true, approvalStatus: "approved", approved: true },
      { new: true }
    );

    if (student) {
      clearCache(CACHE_KEYS.students);
      clearCache(CACHE_KEYS.pendingUsers);
      clearCache(CACHE_KEYS.reports);
      try {
        const html = wrapHtmlEmail('Account Approved', `
          <p>Hi ${student.name},</p>
          <p>Your student account has been approved by the admin. You can now log in and continue using the Campus Placement Portal.</p>
          <p><a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login">Login to your account</a></p>
        `);
        await sendMail({ to: student.email, subject: 'Account Approved', html });
      } catch (sendErr) {
        console.warn('Failed to send student approval email', sendErr.message);
      }

      if (ADMIN_EMAIL) {
        try {
          const adminHtml = wrapHtmlEmail('Student Account Approved', `
            <p>The following student account was approved:</p>
            <ul>
              <li><strong>Name:</strong> ${student.name}</li>
              <li><strong>Email:</strong> ${student.email}</li>
            </ul>
          `);
          await sendMail({ to: ADMIN_EMAIL, subject: 'Student Approved', html: adminHtml });
        } catch (adminErr) {
          console.warn('Failed to send admin notification for student approval', adminErr.message);
        }
      }
    }

    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ message: "Error verifying student", error: error.message });
  }
});

// Approve company
router.put("/companies/:id/approve", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const company = await User.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: "approved", approved: true },
      { new: true }
    );

    if (company) {
      clearCache(CACHE_KEYS.companies);
      clearCache(CACHE_KEYS.pendingUsers);
      clearCache(CACHE_KEYS.reports);
      try {
        const html = wrapHtmlEmail('Company Account Approved', `
          <p>Hi ${company.name || 'Company'},</p>
          <p>Your company account has been approved by the admin. You can now post jobs and manage applications.</p>
          <p><a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login">Login to your account</a></p>
        `);
        await sendMail({ to: company.email, subject: 'Company Account Approved', html });
      } catch (sendErr) {
        console.warn('Failed to send company approval email', sendErr.message);
      }

      if (ADMIN_EMAIL) {
        try {
          const adminHtml = wrapHtmlEmail('Company Account Approved', `
            <p>The following company account was approved:</p>
            <ul>
              <li><strong>Name:</strong> ${company.name || 'N/A'}</li>
              <li><strong>Email:</strong> ${company.email}</li>
            </ul>
          `);
          await sendMail({ to: ADMIN_EMAIL, subject: 'Company Approved', html: adminHtml });
        } catch (adminErr) {
          console.warn('Failed to send admin notification for company approval', adminErr.message);
        }
      }
    }

    res.json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({ message: "Error approving company", error: error.message });
  }
});

// Delete student
router.delete("/students/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    clearCache(CACHE_KEYS.students);
    clearCache(CACHE_KEYS.pendingUsers);
    clearCache(CACHE_KEYS.reports);
    res.json({ success: true, message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting student", error: error.message });
  }
});

// Delete company
router.delete("/companies/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    clearCache(CACHE_KEYS.companies);
    clearCache(CACHE_KEYS.pendingUsers);
    clearCache(CACHE_KEYS.reports);
    res.json({ success: true, message: "Company deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting company", error: error.message });
  }
});

// Get pending users (students and companies)
router.get("/pending-users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const cached = getCache(CACHE_KEYS.pendingUsers);
    if (cached) {
      return res.json({ success: true, data: cached });
    }

    const users = await User.find({
      role: { $in: ["student", "company"] },
      approvalStatus: "pending"
    }).select("name email role enrollmentNumber approvalStatus createdAt");

    setCache(CACHE_KEYS.pendingUsers, users, CACHE_TTL_MS);
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ message: "Error fetching pending users", error: error.message });
  }
});

// Approve user
router.put("/users/:id/approve", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: "approved", approved: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    clearCache(CACHE_KEYS.pendingUsers);
    clearCache(user.role === 'student' ? CACHE_KEYS.students : CACHE_KEYS.companies);
    clearCache(CACHE_KEYS.reports);

    const html = wrapHtmlEmail('Account Approved', `
      <p>Hi ${user.name},</p>
      <p>Your account has been approved by admin. You can now login and access the dashboard.</p>
      <p><a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login">Login to your account</a></p>
    `);
    await sendMail({ to: user.email, subject: 'Account Approved', html });

    if (ADMIN_EMAIL) {
      const adminHtml = wrapHtmlEmail('User Approved', `
        <p>The following user has been approved:</p>
        <ul>
          <li><strong>Name:</strong> ${user.name}</li>
          <li><strong>Email:</strong> ${user.email}</li>
        </ul>
      `);
      await sendMail({ to: ADMIN_EMAIL, subject: 'User Approved', html: adminHtml });
    }

    res.json({ success: true, data: user, message: 'User approved successfully' });
  } catch (error) {
    res.status(500).json({ message: "Error approving user", error: error.message });
  }
});

// Reject user
router.put("/users/:id/reject", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: "rejected", approved: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    clearCache(CACHE_KEYS.pendingUsers);
    clearCache(user.role === 'student' ? CACHE_KEYS.students : CACHE_KEYS.companies);
    clearCache(CACHE_KEYS.reports);

    const html = wrapHtmlEmail('Account Rejected', `
      <p>Hi ${user.name},</p>
      <p>We are sorry to inform you that your account registration has been rejected by our admin team.</p>
      <p>If you believe this is a mistake, please contact support.</p>
    `);
    await sendMail({ to: user.email, subject: 'Account Rejected', html });

    if (ADMIN_EMAIL) {
      const adminHtml = wrapHtmlEmail('User Rejected', `
        <p>The following user registration was rejected:</p>
        <ul>
          <li><strong>Name:</strong> ${user.name}</li>
          <li><strong>Email:</strong> ${user.email}</li>
        </ul>
      `);
      await sendMail({ to: ADMIN_EMAIL, subject: 'User Rejected', html: adminHtml });
    }

    res.json({ success: true, data: user, message: 'User rejected successfully' });
  } catch (error) {
    res.status(500).json({ message: "Error rejecting user", error: error.message });
  }
});

// Get pending jobs
router.get("/pending-jobs", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const cached = getCache(CACHE_KEYS.pendingJobs);
    if (cached) {
      return res.json({ success: true, data: cached });
    }

    const jobs = await Job.find({ jobStatus: "pending" })
      .select("title company location salary positions eligibility createdAt createdBy")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    setCache(CACHE_KEYS.pendingJobs, jobs, CACHE_TTL_MS);
    res.json({ success: true, data: jobs });
  } catch (error) {
    res.status(500).json({ message: "Error fetching pending jobs", error: error.message });
  }
});

// Approve job
router.put("/jobs/:id/approve", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { jobStatus: "approved" },
      { new: true }
    ).populate("createdBy", "name email");
    clearCache(CACHE_KEYS.pendingJobs);
    clearCache(CACHE_KEYS.reports);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const companyEmail = job.createdBy?.email;
    if (companyEmail) {
      const html = wrapHtmlEmail('Job Approved', `
        <p>Hi ${job.createdBy.name || 'Recruiter'},</p>
        <p>Your job post <strong>${job.title}</strong> has been approved and is now visible to students.</p>
      `);
      await sendMail({ to: companyEmail, subject: 'Job Approved', html });
    }

    if (ADMIN_EMAIL) {
      const adminHtml = wrapHtmlEmail('Job Approved', `
        <p>The job post <strong>${job.title}</strong> by <strong>${job.company}</strong> has been approved.</p>
      `);
      await sendMail({ to: ADMIN_EMAIL, subject: 'Job Approved', html: adminHtml });
    }

    res.json({ success: true, data: job, message: 'Job approved successfully' });
  } catch (error) {
    res.status(500).json({ message: "Error approving job", error: error.message });
  }
});

// Reject job
router.put("/jobs/:id/reject", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { jobStatus: "rejected" },
      { new: true }
    ).populate("createdBy", "name email");
    clearCache(CACHE_KEYS.pendingJobs);
    clearCache(CACHE_KEYS.reports);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const companyEmail = job.createdBy?.email;
    if (companyEmail) {
      const html = wrapHtmlEmail('Job Rejected', `
        <p>Hi ${job.createdBy.name || 'Recruiter'},</p>
        <p>Your job post <strong>${job.title}</strong> has been rejected by admin.</p>
        <p>If you would like more detail, please contact support.</p>
      `);
      await sendMail({ to: companyEmail, subject: 'Job Rejected', html });
    }

    if (ADMIN_EMAIL) {
      const adminHtml = wrapHtmlEmail('Job Rejected', `
        <p>The job post <strong>${job.title}</strong> by <strong>${job.company}</strong> has been rejected.</p>
      `);
      await sendMail({ to: ADMIN_EMAIL, subject: 'Job Rejected', html: adminHtml });
    }

    res.json({ success: true, data: job, message: 'Job rejected successfully' });
  } catch (error) {
    res.status(500).json({ message: "Error rejecting job", error: error.message });
  }
});

// Get all placement drives
router.get("/drives", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const cached = getCache(CACHE_KEYS.drives);
    if (cached) {
      return res.json({ success: true, data: cached });
    }

    const drives = await Drive.find()
      .populate("company", "name email")
      .populate("selectedStudents", "name email");

    setCache(CACHE_KEYS.drives, drives, CACHE_TTL_MS);
    res.json({ success: true, data: drives });
  } catch (error) {
    res.status(500).json({ message: "Error fetching drives", error: error.message });
  }
});

// Create placement drive
router.post("/drives", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { company, title, description, salary, location, eligibility, positions, applicationDeadline } = req.body;

    const drive = await Drive.create({
      company,
      title,
      description,
      salary,
      location,
      eligibility,
      positions,
      applicationDeadline
    });

    clearCache(CACHE_KEYS.drives);
    res.status(201).json({ success: true, data: drive });
  } catch (error) {
    res.status(500).json({ message: "Error creating drive", error: error.message });
  }
});

// Update placement drive status
router.put("/drives/:id/status", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const drive = await Drive.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    clearCache(CACHE_KEYS.drives);
    res.json({ success: true, data: drive });
  } catch (error) {
    res.status(500).json({ message: "Error updating drive", error: error.message });
  }
});

// Delete placement drive
router.delete("/drives/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Drive.findByIdAndDelete(req.params.id);
    clearCache(CACHE_KEYS.drives);
    res.json({ success: true, message: "Drive deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting drive", error: error.message });
  }
});

module.exports = router;
