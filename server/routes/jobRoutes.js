console.log("JOB ROUTES LOADED");
 const express = require("express");
const router = express.Router();

const { createJob, getJobs } = require("../controllers/jobController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createJob);
router.get("/", authMiddleware, getJobs);

module.exports = router;