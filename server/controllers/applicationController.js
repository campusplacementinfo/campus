const Application = require("../models/Application");
const Job = require("../models/job");
const User = require('../models/User');
const { sendMail, wrapHtmlEmail } = require('../utils/mailer');
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

const runInBackground = (promise) => {
  promise.catch((err) => console.error('Background task error:', err?.message || err));
};

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

    res.status(201).json({
      message: "Application submitted successfully",
      application
    });

    runInBackground((async () => {
      try {
        const populated = await application.populate('job').populate('student', 'name email');
        const jobDoc = populated.job;
        const studentDoc = populated.student;

        const applicantHtml = wrapHtmlEmail('Application Submitted', `
          <p>Hi ${studentDoc.name},</p>
          <p>Your application for <strong>${jobDoc.title}</strong> at <strong>${jobDoc.company}</strong> has been successfully submitted on <strong>${new Date(application.createdAt).toLocaleString()}</strong>.</p>
          <p>Current status: <strong>${application.status || 'submitted'}</strong></p>
          <p>Thank you for applying. We will notify you if your application status changes.</p>
        `);
        await sendMail({ to: studentDoc.email, subject: 'Application Submitted', html: applicantHtml });

        if (jobDoc.createdBy) {
          const companyUser = await User.findById(jobDoc.createdBy).select('name email');
          if (companyUser && companyUser.email) {
            const companyHtml = wrapHtmlEmail('New Job Application Received', `
              <p>Hi ${companyUser.name || 'Recruiter'},</p>
              <p>A new application has been received for your job posting <strong>${jobDoc.title}</strong>.</p>
              <ul>
                <li><strong>Applicant:</strong> ${studentDoc.name}</li>
                <li><strong>Email:</strong> ${studentDoc.email}</li>
                <li><strong>Applied on:</strong> ${new Date(application.createdAt).toLocaleString()}</li>
              </ul>
              <p>Please review the application in your dashboard.</p>
            `);
            await sendMail({ to: companyUser.email, subject: 'New Job Application Received', html: companyHtml });
          }
        }

        if (ADMIN_EMAIL) {
          const adminHtml = wrapHtmlEmail('New Job Application', `
            <p>A new job application has been submitted.</p>
            <ul>
              <li><strong>Job:</strong> ${jobDoc.title}</li>
              <li><strong>Company:</strong> ${jobDoc.company}</li>
              <li><strong>Applicant:</strong> ${studentDoc.name} (${studentDoc.email})</li>
              <li><strong>Submitted on:</strong> ${new Date(application.createdAt).toLocaleString()}</li>
            </ul>
          `);
          await sendMail({ to: ADMIN_EMAIL, subject: 'New Job Application', html: adminHtml });
        }
      } catch (err) {
        console.warn('Failed to send application emails', err.message);
      }
    })());
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

exports.getCompanyApplications = async (req, res) => {
  try {
    const companyJobIds = await Job.find({ createdBy: req.user.id }).select('_id');
    const jobIds = companyJobIds.map((job) => job._id);

    if (jobIds.length === 0) {
      return res.status(200).json([]);
    }

    const companyApplications = await Application.find({ job: { $in: jobIds } })
      .populate('job', 'title company location createdBy')
      .populate('student', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json(companyApplications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching applicants" });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.status = status;
    await application.save();

    try {
      const populated = await application.populate('job').populate('student', 'name email');
      const student = populated.student;
      const jobDoc = populated.job;

      const bccRecipients = [];
      if (jobDoc.createdBy) {
        const companyUser = await User.findById(jobDoc.createdBy).select('name email');
        if (companyUser && companyUser.email) {
          bccRecipients.push(companyUser.email);
        }
      }
      if (ADMIN_EMAIL) {
        bccRecipients.push(ADMIN_EMAIL);
      }

      const userHtml = wrapHtmlEmail('Application Status Updated', `
        <p>Hi ${student.name},</p>
        <p>Your application for <strong>${jobDoc.title}</strong> at <strong>${jobDoc.company}</strong> has been updated to <strong>${status}</strong>.</p>
        <p>Please check your dashboard for more details and next steps.</p>
      `);
      const userResult = await sendMail({ to: student.email, subject: 'Application Status Updated', html: userHtml });
      if (!userResult.success) console.warn('Failed to send status update to student', userResult);

      if (jobDoc.createdBy) {
        const companyUser = await User.findById(jobDoc.createdBy).select('name email');
        if (companyUser && companyUser.email) {
          const companyHtml = wrapHtmlEmail('Application Status Changed', `
            <p>Hi ${companyUser.name || 'Recruiter'},</p>
            <p>The application status for <strong>${jobDoc.title}</strong> has changed.</p>
            <ul>
              <li><strong>Applicant:</strong> ${student.name}</li>
              <li><strong>Email:</strong> ${student.email}</li>
              <li><strong>New status:</strong> ${status}</li>
            </ul>
          `);
          const companyResult = await sendMail({ to: companyUser.email, subject: 'Application Status Changed', html: companyHtml });
          if (!companyResult.success) console.warn('Failed to send status update to company', companyResult);
        }
      }

      if (ADMIN_EMAIL) {
        const adminHtml = wrapHtmlEmail('Application Status Changed', `
          <p>An application status has been changed:</p>
          <ul>
            <li><strong>Job:</strong> ${jobDoc.title}</li>
            <li><strong>Applicant:</strong> ${student.name} (${student.email})</li>
            <li><strong>Status:</strong> ${status}</li>
          </ul>
        `);
        const adminResult = await sendMail({ to: ADMIN_EMAIL, subject: 'Application Status Changed', html: adminHtml });
        if (!adminResult.success) console.warn('Failed to send status update to admin', adminResult);
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
