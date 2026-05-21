/**
 * Profile Routes
 * File: server/routes/profileRoutes.js
 * 
 * Handles all profile-related endpoints
 * All routes require JWT authentication
 */

const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const authMiddleware = require("../middleware/authMiddleware");

// ===== MIDDLEWARE =====
// Apply authentication middleware to all profile routes
router.use(authMiddleware);

// ===== GET ENDPOINTS =====

/**
 * GET /api/profile/me
 * Get complete user profile with completion status
 * Access: Authenticated users
 */
router.get("/me", profileController.getUserProfile);

/**
 * GET /api/profile/completion
 * Get profile completion percentage and detailed status
 * Access: Authenticated users
 */
router.get("/completion", profileController.getProfileCompletion);

/**
 * GET /api/profile/all
 * Get all user profiles (paginated, searchable)
 * Access: Admin users only
 * Query params: ?role=student&searchTerm=name&page=1&limit=20
 */
router.get("/all", profileController.getAllProfiles);

// ===== UPDATE ENDPOINTS (PATCH) =====

/**
 * PATCH /api/profile/contact
 * Update contact information
 * Access: Profile owner
 * Body: {mobileNumber, alternateEmail}
 */
router.patch("/contact", profileController.updateContactInfo);

/**
 * PATCH /api/profile/basic-info
 * Update basic personal information
 * Access: Profile owner
 * Body: {fullName, dateOfBirth, gender, bio, currentCity, permanentCity}
 */
router.patch("/basic-info", profileController.updateBasicInfo);

/**
 * PATCH /api/profile/academic-info
 * Update academic information
 * Access: Profile owner
 * Body: {currentDegree, specialization, institution, cgpa, ...}
 */
router.patch("/academic-info", profileController.updateAcademicInfo);

/**
 * PATCH /api/profile/skills
 * Update technical skills and languages
 * Access: Profile owner
 * Body: {technical: [{name, proficiency}], languages: [{language, proficiency}]}
 */
router.patch("/skills", profileController.updateSkills);

/**
 * PATCH /api/profile/experience
 * Update work experience and internships
 * Access: Profile owner
 * Body: {internships: [...], workExperience: [...]}
 */
router.patch("/experience", profileController.updateExperience);

// ===== FILE UPLOAD ENDPOINTS (POST) =====

/**
 * POST /api/profile/upload-picture
 * Upload profile picture
 * Access: Profile owner
 * Note: Requires multer middleware setup for file handling
 */
router.post("/upload-picture", profileController.uploadProfilePicture);

/**
 * POST /api/profile/upload-resume
 * Upload resume document
 * Access: Profile owner
 * Note: Requires multer middleware setup for file handling
 */
router.post("/upload-resume", profileController.uploadResume);

// ===== VERIFICATION ENDPOINTS (POST) =====

/**
 * POST /api/profile/verify-phone
 * Send OTP to verify phone number
 * Access: Profile owner
 * Body: {mobileNumber}
 */
router.post("/verify-phone", profileController.verifyPhone);

/**
 * POST /api/profile/verify-email
 * Send verification email
 * Access: Profile owner
 * Body: {alternateEmail}
 */
router.post("/verify-email", profileController.verifyEmail);

module.exports = router;
