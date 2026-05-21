/**
 * Profile Controller
 * File: server/controllers/profileController.js
 * 
 * Handles all profile-related operations:
 * - Get user profile
 * - Update contact information
 * - Update basic information
 * - Update academic information
 * - Upload files
 * - Get profile completion status
 */

const User = require("../models/User");
const jwt = require("jsonwebtoken");

// ===== HELPER FUNCTIONS =====

/**
 * Extract user ID from JWT token in Authorization header
 */
const getUserIdFromToken = (req) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) throw new Error("No token provided");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch (error) {
    throw new Error("Invalid token");
  }
};

// ===== GET ENDPOINTS =====

/**
 * GET /api/profile/me
 * Get complete user profile
 */
exports.getUserProfile = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const completionPercentage = user.getProfileCompletionPercentage();
    const completionStatus = user.getProfileCompletionStatus();

    res.status(200).json({
      user: user.getPublicProfile(),
      profileCompletion: {
        percentage: completionPercentage,
        status: completionStatus
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching profile",
      error: error.message
    });
  }
};

/**
 * GET /api/profile/completion
 * Get profile completion percentage
 */
exports.getProfileCompletion = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const percentage = user.getProfileCompletionPercentage();
    const status = user.getProfileCompletionStatus();

    res.status(200).json({
      completionPercentage: percentage,
      completionStatus: status,
      isComplete: percentage === 100
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching profile completion",
      error: error.message
    });
  }
};

// ===== UPDATE ENDPOINTS =====

/**
 * PATCH /api/profile/contact
 * Update contact information (mobile number, alternate email)
 */
exports.updateContactInfo = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const { mobileNumber, alternateEmail } = req.body;

    // Validation
    if (mobileNumber && !/^[0-9]{10}$/.test(mobileNumber)) {
      return res.status(400).json({ message: "Invalid mobile number format" });
    }

    if (alternateEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(alternateEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          "profile.mobileNumber": mobileNumber || null,
          "profile.alternateEmail": alternateEmail || null,
          updatedAt: Date.now(),
          lastProfileUpdate: Date.now()
        }
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Contact information updated successfully",
      user: user.getPublicProfile()
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating contact information",
      error: error.message
    });
  }
};

/**
 * PATCH /api/profile/basic-info
 * Update basic information
 */
exports.updateBasicInfo = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const {
      fullName,
      dateOfBirth,
      gender,
      bio,
      currentCity,
      permanentCity
    } = req.body;

    // Validation
    if (bio && bio.length > 500) {
      return res.status(400).json({ message: "Bio must be less than 500 characters" });
    }

    if (gender && !["Male", "Female", "Other"].includes(gender)) {
      return res.status(400).json({ message: "Invalid gender value" });
    }

    const updateData = {
      "profile.basicInfo.fullName": fullName || null,
      "profile.basicInfo.dateOfBirth": dateOfBirth || null,
      "profile.basicInfo.gender": gender || null,
      "profile.basicInfo.bio": bio || null,
      "profile.basicInfo.currentCity": currentCity || null,
      "profile.basicInfo.permanentCity": permanentCity || null,
      updatedAt: Date.now(),
      lastProfileUpdate: Date.now()
    };

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Basic information updated successfully",
      user: user.getPublicProfile()
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating basic information",
      error: error.message
    });
  }
};

/**
 * PATCH /api/profile/academic-info
 * Update academic information
 */
exports.updateAcademicInfo = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const {
      // Current degree
      currentDegree,
      specialization,
      institution,
      enrollmentYear,
      expectedGraduationYear,
      cgpa,
      // 10th
      board10,
      percentage10,
      yearPassed10,
      // 12th
      board12,
      percentage12,
      yearPassed12,
      // Diploma
      diplomaDegree,
      diplomaBranch,
      diplomaCGPA,
      diplomaPassed,
      // Backlogs
      activeBacklogs,
      totalBacklogs
    } = req.body;

    // Validations
    if (cgpa && (cgpa < 0 || cgpa > 10)) {
      return res.status(400).json({ message: "CGPA must be between 0 and 10" });
    }

    if (percentage10 && (percentage10 < 0 || percentage10 > 100)) {
      return res.status(400).json({ message: "10th percentage must be between 0 and 100" });
    }

    if (percentage12 && (percentage12 < 0 || percentage12 > 100)) {
      return res.status(400).json({ message: "12th percentage must be between 0 and 100" });
    }

    const updateData = {
      "profile.academicInfo.currentDegree": currentDegree || null,
      "profile.academicInfo.specialization": specialization || null,
      "profile.academicInfo.institution": institution || null,
      "profile.academicInfo.enrollmentYear": enrollmentYear || null,
      "profile.academicInfo.expectedGraduationYear": expectedGraduationYear || null,
      "profile.academicInfo.cgpa": cgpa || null,
      "profile.academicInfo.board10": board10 || null,
      "profile.academicInfo.percentage10": percentage10 || null,
      "profile.academicInfo.yearPassed10": yearPassed10 || null,
      "profile.academicInfo.board12": board12 || null,
      "profile.academicInfo.percentage12": percentage12 || null,
      "profile.academicInfo.yearPassed12": yearPassed12 || null,
      "profile.academicInfo.diplomaDegree": diplomaDegree || null,
      "profile.academicInfo.diplomaBranch": diplomaBranch || null,
      "profile.academicInfo.diplomaCGPA": diplomaCGPA || null,
      "profile.academicInfo.diplomaPassed": diplomaPassed || null,
      "profile.academicInfo.activeBacklogs": activeBacklogs || 0,
      "profile.academicInfo.totalBacklogs": totalBacklogs || 0,
      updatedAt: Date.now(),
      lastProfileUpdate: Date.now()
    };

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Academic information updated successfully",
      user: user.getPublicProfile()
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating academic information",
      error: error.message
    });
  }
};

/**
 * PATCH /api/profile/skills
 * Update technical skills
 */
exports.updateSkills = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const { technical, languages } = req.body;

    const updateData = {
      updatedAt: Date.now(),
      lastProfileUpdate: Date.now()
    };

    if (technical) {
      updateData["profile.skills.technical"] = technical;
    }

    if (languages) {
      updateData["profile.skills.languages"] = languages;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Skills updated successfully",
      user: user.getPublicProfile()
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating skills",
      error: error.message
    });
  }
};

/**
 * PATCH /api/profile/experience
 * Update work experience and internships
 */
exports.updateExperience = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const { internships, workExperience } = req.body;

    const updateData = {
      updatedAt: Date.now(),
      lastProfileUpdate: Date.now()
    };

    if (internships) {
      updateData["profile.experience.internships"] = internships;
    }

    if (workExperience) {
      updateData["profile.experience.workExperience"] = workExperience;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Experience updated successfully",
      user: user.getPublicProfile()
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating experience",
      error: error.message
    });
  }
};

// ===== FILE UPLOAD ENDPOINTS =====

/**
 * POST /api/profile/upload-picture
 * Upload profile picture
 * Note: This is a placeholder. Integrate with multer and cloud storage (AWS S3, Cloudinary, etc.)
 */
exports.uploadProfilePicture = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Placeholder: In real implementation, upload to cloud storage
    const pictureUrl = `/uploads/profiles/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          "profile.basicInfo.profilePicture": pictureUrl,
          updatedAt: Date.now(),
          lastProfileUpdate: Date.now()
        }
      },
      { new: true }
    ).select("-password");

    res.status(200).json({
      message: "Profile picture uploaded successfully",
      pictureUrl,
      user: user.getPublicProfile()
    });
  } catch (error) {
    res.status(500).json({
      message: "Error uploading profile picture",
      error: error.message
    });
  }
};

/**
 * POST /api/profile/upload-resume
 * Upload resume document
 */
exports.uploadResume = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const resumeUrl = `/uploads/resumes/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          "profile.documents.resumeUrl": resumeUrl,
          updatedAt: Date.now(),
          lastProfileUpdate: Date.now()
        }
      },
      { new: true }
    ).select("-password");

    res.status(200).json({
      message: "Resume uploaded successfully",
      resumeUrl,
      user: user.getPublicProfile()
    });
  } catch (error) {
    res.status(500).json({
      message: "Error uploading resume",
      error: error.message
    });
  }
};

// ===== VERIFICATION ENDPOINTS =====

/**
 * POST /api/profile/verify-phone
 * Send OTP to verify phone number
 */
exports.verifyPhone = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const { mobileNumber } = req.body;

    if (!mobileNumber || !/^[0-9]{10}$/.test(mobileNumber)) {
      return res.status(400).json({ message: "Invalid mobile number" });
    }

    // Placeholder: In real implementation, send SMS OTP using Twilio, AWS SNS, etc.
    console.log(`OTP sent to ${mobileNumber}`);

    res.status(200).json({
      message: "OTP sent to your phone number",
      mobileNumber
    });
  } catch (error) {
    res.status(500).json({
      message: "Error verifying phone",
      error: error.message
    });
  }
};

/**
 * POST /api/profile/verify-email
 * Send verification email
 */
exports.verifyEmail = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const { alternateEmail } = req.body;

    if (!alternateEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(alternateEmail)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    // Placeholder: In real implementation, send verification link using nodemailer, AWS SES, etc.
    console.log(`Verification email sent to ${alternateEmail}`);

    res.status(200).json({
      message: "Verification email sent",
      email: alternateEmail
    });
  } catch (error) {
    res.status(500).json({
      message: "Error verifying email",
      error: error.message
    });
  }
};

// ===== ADMIN ENDPOINTS =====

/**
 * GET /api/profile/all
 * Get all user profiles (Admin only)
 */
exports.getAllProfiles = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const requester = await User.findById(userId);

    if (requester.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized: Admin access required" });
    }

    const { role, searchTerm, page = 1, limit = 20 } = req.query;

    const query = {};
    if (role) query.role = role;
    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } }
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await User.countDocuments(query);

    res.status(200).json({
      users: users.map((u) => u.getPublicProfile()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching profiles",
      error: error.message
    });
  }
};
