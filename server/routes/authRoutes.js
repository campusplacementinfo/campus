const express = require("express");
const {
	register,
	login,
	forgotPassword,
	resetPassword,
	verifyToken,
	logout,
	sendTestEmail
} = require("../controllers/authController_Updated");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/verify', verifyToken);
router.post('/logout', logout);
router.get('/test-email', sendTestEmail);

module.exports = router;