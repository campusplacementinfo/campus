
const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);


router.get("/me", profileController.getUserProfile);

router.get("/completion", profileController.getProfileCompletion);

router.get("/all", profileController.getAllProfiles);


router.patch("/contact", profileController.updateContactInfo);

router.patch("/basic-info", profileController.updateBasicInfo);

router.patch("/academic-info", profileController.updateAcademicInfo);

router.patch("/skills", profileController.updateSkills);

router.patch("/experience", profileController.updateExperience);


router.post("/upload-picture", profileController.uploadProfilePicture);

router.post("/upload-resume", profileController.uploadResume);


router.post("/verify-phone", profileController.verifyPhone);

router.post("/verify-email", profileController.verifyEmail);

module.exports = router;
