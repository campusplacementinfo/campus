const Job = require("../models/job");
const User = require("../models/User");
const { sendMail } = require("../utils/mailer");
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

// ✅ Create Job (Company)
exports.createJob = async (req, res) => {
  try {
    const { title, location, description, salary, positions, eligibility, experience, skills } = req.body;

    // Basic validation
    if (!title || !location || !description) {
      return res.status(400).json({ message: "Title, location, and description are required" });
    }

    const companyUser = await User.findById(req.user?.id);
    if (!companyUser || companyUser.role !== "company") {
      return res.status(403).json({ message: "Only approved companies can post jobs" });
    }

    if (companyUser.approvalStatus !== "approved") {
      return res.status(403).json({ message: "Your company account needs admin approval before posting jobs" });
    }

    const job = await Job.create({
      title,
      company: companyUser.name || companyUser.email,
      description,
      location,
      salary: salary || null,
      positions: positions ? Number(positions) : 1,
      eligibility: eligibility || null,
      experience: experience || null,
      skills: typeof skills === "string"
        ? skills.split(",").map(s => s.trim()).filter(Boolean)
        : Array.isArray(skills) ? skills : [],
      createdBy: companyUser._id,
      jobStatus: "pending"
    });

    if (ADMIN_EMAIL) {
      try {
        const html = `<p>A new job has been posted and requires admin approval:</p>
          <ul>
            <li>Title: ${job.title}</li>
            <li>Company: ${job.company}</li>
            <li>Location: ${job.location}</li>
            <li>Salary: ${job.salary || "Not specified"}</li>
            <li>Eligibility: ${job.eligibility || "Not specified"}</li>
            <li>Description: ${job.description}</li>
            <li>Posted At: ${new Date(job.createdAt).toLocaleString()}</li>
          </ul>`;
        await sendMail({ to: ADMIN_EMAIL, subject: 'Pending Job Approval', html });
      } catch (err) {
        console.warn('Failed to send job approval notification to admin', err.message);
      }
    }

    res.status(201).json({
      message: "Job created successfully and is pending admin approval",
      job
    });

  } catch (error) {
    console.log("Create Job Error:", error.message);
    res.status(500).json({ message: "Error creating job" });
  }
};

// ✅ Get Jobs (Student)
exports.getJobs = async (req, res) => {
  try {
    const query = req.user?.role === "student" ? { jobStatus: "approved" } : {};
    const jobs = await Job.find(query)
      .populate("createdBy", "name email approvalStatus")
      .sort({ createdAt: -1 });

    res.status(200).json(jobs);

  } catch (error) {
    console.log("Get Jobs Error:", error.message);
    res.status(500).json({ message: "Error fetching jobs" });
  }
};