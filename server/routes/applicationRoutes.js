 const express = require("express");
const router = express.Router();

const {
  applyJob,
  myApplications,
  getCompanyApplications,
  updateApplicationStatus
} = require("../controllers/applicationController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/apply", authMiddleware, applyJob);
router.get("/my-applications", authMiddleware, myApplications);

router.get("/company-applications", authMiddleware, getCompanyApplications);
router.put("/status/:id", authMiddleware, updateApplicationStatus);

module.exports = router;