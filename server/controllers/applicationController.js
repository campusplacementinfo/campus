const Application = require("../models/Application");
const Job = require("../models/job");
const User = require('../models/User');
const { sendMail } = require('../utils/mailer');
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

exports.applyJob = async (req, res) => {
  try {
    const { jobId } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const existingApplication = await Application.findOne({
      job: jobId,
      student: req.user.id
    });

    if (existingApplication) {
      return res.status(400).json({ message: "Already applied for this job" });
    }

    const application = await Application.create({
      job: jobId,
      student: req.user.id
    });

    // Send confirmation email to applicant and notification to company/admin
    try {
      const populated = await application.populate('job').populate('student', 'name email');
      const jobDoc = populated.job;
      const studentDoc = populated.student;

      // Email to applicant
      const applicantHtml = `<p>Hi ${studentDoc.name},</p>
        <p>Your application for <strong>${jobDoc.title}</strong> at <strong>${jobDoc.company}</strong> was submitted on ${new Date(application.createdAt).toLocaleString()}.</p>
        <p>Current status: ${application.status || 'submitted'}</p>`;
      await sendMail({ to: studentDoc.email, subject: 'Application Submitted', html: applicantHtml });

      // Notify company (job.createdBy)
      if (jobDoc.createdBy) {
        const companyUser = await User.findById(jobDoc.createdBy).select('name email');
        if (companyUser && companyUser.email) {
          const companyHtml = `<p>Hi ${companyUser.name || 'Recruiter'},</p>
            <p>A new application has been received for your job posting <strong>${jobDoc.title}</strong>.</p>
            <p>Applicant: ${studentDoc.name} (${studentDoc.email})</p>
            <p>Applied on: ${new Date(application.createdAt).toLocaleString()}</p>`;
          await sendMail({ to: companyUser.email, subject: 'New Job Application Received', html: companyHtml });
        }
      }

      // Admin notification
      if (ADMIN_EMAIL) {
        const adminHtml = `<p>New job application:</p>
          <ul><li>Job: ${jobDoc.title}</li><li>Company: ${jobDoc.company}</li><li>Applicant: ${studentDoc.name} (${studentDoc.email})</li></ul>`;
        await sendMail({ to: ADMIN_EMAIL, subject: 'New Job Application', html: adminHtml });
      }
    } catch (err) {
      console.warn('Failed to send application emails', err.message);
    }

    res.status(201).json({
      message: "Application submitted successfully",
      application
    });
  } catch (error) {
    res.status(500).json({ message: "Error applying for job" });
  }
};

exports.myApplications = async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user.id })
      .populate("job")
      .populate("student", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching applications" });
  }
};

// Company views applicants for its jobs
exports.getCompanyApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("job")
      .populate("student", "name email role")
      .sort({ createdAt: -1 });

    const companyApplications = applications.filter(
      (app) => app.job?.createdBy?.toString() === req.user.id
    );

    res.status(200).json(companyApplications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching applicants" });
  }
};

// Company updates application status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.status = status;
    await application.save();

    // Notify applicant and admin/company about status change
    try {
      const populated = await application.populate('job').populate('student', 'name email');
      const student = populated.student;
      const jobDoc = populated.job;

      const userHtml = `<p>Hi ${student.name},</p>
        <p>Your application for <strong>${jobDoc.title}</strong> at <strong>${jobDoc.company}</strong> has been updated to: <strong>${status}</strong>.</p>`;
      await sendMail({ to: student.email, subject: 'Application Status Updated', html: userHtml });

      // Notify company
      if (jobDoc.createdBy) {
        const companyUser = await User.findById(jobDoc.createdBy).select('name email');
        if (companyUser && companyUser.email) {
          const companyHtml = `<p>Application status updated for ${jobDoc.title}:</p>
            <p>Applicant: ${student.name} (${student.email})</p>
            <p>New status: ${status}</p>`;
          await sendMail({ to: companyUser.email, subject: 'Application Status Changed', html: companyHtml });
        }
      }

      if (ADMIN_EMAIL) {
        const adminHtml = `<p>Application status changed:</p>
          <ul><li>Job: ${jobDoc.title}</li><li>Applicant: ${student.name} (${student.email})</li><li>Status: ${status}</li></ul>`;
        await sendMail({ to: ADMIN_EMAIL, subject: 'Application Status Changed', html: adminHtml });
      }
    } catch (err) {
      console.warn('Failed to send status change emails', err.message);
    }

    res.status(200).json({
      message: "Status updated successfully",
      application
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating status" });
  }
};