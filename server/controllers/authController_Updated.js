/**
 * Updated Authentication Controller
 * File: server/controllers/authController_Updated.js
 * 
 * Changes from original:
 * 1. Login response now includes profile completion percentage
 * 2. Frontend should redirect to /home instead of /student, /admin, /company
 * 3. Updated token includes additional user data
 */

const User = require("../models/User");
const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const { sendMail } = require('../utils/mailer');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

/**
 * Register a new user
 * POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, adminToken, enrollmentNumber } = req.body;

    // Fail fast if DB not ready
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Service temporarily unavailable. Please try again later.' });
    }

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Restrict admin account creation
    const requestedRole = role || "student";
    if (requestedRole === "admin") {
      const ADMIN_CREATION_TOKEN = String(process.env.ADMIN_CREATION_TOKEN || "").trim();
      const providedAdminToken = typeof adminToken === 'string' ? adminToken.trim() : adminToken;
      if (!ADMIN_CREATION_TOKEN) {
        return res.status(500).json({ message: "Admin creation token is not configured on the server" });
      }
      if (!providedAdminToken || providedAdminToken !== ADMIN_CREATION_TOKEN) {
        console.warn("[ADMIN REGISTER] Invalid admin creation token", {
          providedAdminToken,
          tokenConfigured: !!ADMIN_CREATION_TOKEN
        });
        return res.status(403).json({ message: "Unauthorized: Invalid admin creation token" });
      }
    }

    const normalizedEnrollment = typeof enrollmentNumber === 'string' ? enrollmentNumber.trim().toUpperCase() : null;
    if (requestedRole === "student") {
      if (!normalizedEnrollment) {
        return res.status(400).json({ message: "Enrollment number is required for student registration" });
      }

      const duplicateEnrollment = await User.findOne({ enrollmentNumber: normalizedEnrollment });
      if (duplicateEnrollment) {
        return res.status(400).json({ message: "Enrollment number already exists" });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user payload
    const userPayload = {
      name,
      email,
      password: hashedPassword,
      role: requestedRole,
      approvalStatus: requestedRole === "admin" ? "approved" : "pending",
      approved: requestedRole === "admin"
    };

    if (requestedRole === "student") {
      userPayload.enrollmentNumber = normalizedEnrollment;
    }

    // Create user
    const newUser = await User.create(userPayload);

    // Send welcome email to user
    try {
      const approvalMessage = newUser.approvalStatus === "pending"
        ? "Your account has been created and is waiting for admin approval."
        : "Your account has been created and is approved. You can login immediately.";

      const html = `<p>Hi ${newUser.name},</p>
        <p>Welcome to Campus Placement Portal. Your account has been created with role <strong>${newUser.role}</strong>.</p>
        <p>${approvalMessage}</p>
        <p>You can login at <a href="${CLIENT_URL}/login">Login</a></p>
      `;
      await sendMail({ to: newUser.email, subject: 'Welcome to Campus Placement Portal', html });
    } catch (err) {
      console.warn('Failed to send registration email', err.message);
    }

    // Notify admin
    if (ADMIN_EMAIL) {
      try {
        const htmlAdmin = `<p>New user registered:</p>
          <ul>
            <li>Name: ${newUser.name}</li>
            <li>Email: ${newUser.email}</li>
            <li>Role: ${newUser.role}</li>
            ${newUser.enrollmentNumber ? `<li>Enrollment Number: ${newUser.enrollmentNumber}</li>` : ""}
            <li>Status: ${newUser.approvalStatus}</li>
          </ul>`;
        await sendMail({ to: ADMIN_EMAIL, subject: 'New User Registration', html: htmlAdmin });
      } catch (err) {
        console.warn('Failed to send admin notification', err.message);
      }
    }

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 * 
 * UPDATED: Returns profile completion percentage
 * Frontend should redirect to /home (not /student, /admin, /company)
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.approvalStatus === "pending") {
      return res.status(403).json({ message: "Your account is pending approval by an admin." });
    }

    if (user.approvalStatus === "rejected") {
      return res.status(403).json({ message: "Your account has been rejected by admin." });
    }

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save();

    // Send login notification to user and admin
    try {
      const loginHtml = `<p>Hi ${user.name},</p>
        <p>Your account was just accessed on ${new Date().toLocaleString()} from the Campus Placement Portal.</p>
        <p>If this wasn't you, please reset your password immediately.</p>`;
      await sendMail({ to: user.email, subject: 'New Login to your account', html: loginHtml });
    } catch (err) {
      console.warn('Failed to send login email to user', err.message);
    }

    if (ADMIN_EMAIL) {
      try {
        const adminHtml = `<p>User logged in:</p><ul><li>Name: ${user.name}</li><li>Email: ${user.email}</li><li>Time: ${new Date().toLocaleString()}</li></ul>`;
        await sendMail({ to: ADMIN_EMAIL, subject: 'User Login Activity', html: adminHtml });
      } catch (err) {
        console.warn('Failed to send admin login notification', err.message);
      }
    }

    // Calculate profile completion
    const profileCompletionPercentage = user.getProfileCompletionPercentage();
    const profileCompletionStatus = user.getProfileCompletionStatus();

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      process.env.JWT_SECRET || "your_secret_key",
      { expiresIn: "24h" }
    );

    // Success response
    res.status(200).json({
      success: true,
      token,
      role: user.role,
      name: user.name,
      email: user.email,
      userId: user._id,
      profileCompletion: {
        percentage: profileCompletionPercentage,
        status: profileCompletionStatus,
        isComplete: profileCompletionPercentage === 100
      },
      message: "Login successful"
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

/**
 * Verify token validity
 * GET /api/auth/verify
 */
exports.verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ valid: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ valid: false, message: "User not found" });
    }

    if (user.approvalStatus !== "approved") {
      return res.status(401).json({ valid: false, message: "User account is not approved." });
    }

    res.status(200).json({
      valid: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    res.status(401).json({
      valid: false,
      message: "Token verification failed",
      error: error.message
    });
  }
};

/**
 * Logout user (mainly for client-side cleanup)
 * POST /api/auth/logout
 */
exports.logout = async (req, res) => {
  try {
    // Note: JWT tokens can't be invalidated on server without a blacklist
    // This endpoint is mainly for logging audit trails

    res.status(200).json({
      message: "Logout successful",
      success: true
    });
  } catch (error) {
    res.status(500).json({
      message: "Logout failed",
      error: error.message
    });
  }
};

/**
 * Refresh token
 * POST /api/auth/refresh
 */
exports.refreshToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key", {
      ignoreExpiration: true // Allow expired tokens for refresh
    });

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Generate new token
    const newToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      process.env.JWT_SECRET || "your_secret_key",
      { expiresIn: "24h" }
    );

    res.status(200).json({
      token: newToken,
      message: "Token refreshed successfully"
    });
  } catch (error) {
    res.status(401).json({
      message: "Token refresh failed",
      error: error.message
    });
  }
};

/**
 * Change password
 * POST /api/auth/change-password
 */
exports.changePassword = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Validate inputs
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      message: "Password changed successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Error changing password",
      error: error.message
    });
  }
};

/**
 * Request password reset
 * POST /api/auth/forgot-password
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Fail fast if DB not ready
    if (mongoose.connection.readyState !== 1) {
      // For security, return generic message so callers can't probe DB status
      return res.status(503).json({ message: "If the email exists, a password reset link has been sent" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      // For security, don't reveal if email exists
      return res.status(200).json({
        message: "If the email exists, a password reset link has been sent"
      });
    }

    // Generate secure reset token (not stored in plain text)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const resetUrl = `${CLIENT_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

    const html = `<p>Hi ${user.name},</p>
      <p>You requested a password reset. Click the link below to reset your password. The link expires in 1 hour.</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>If you did not request this, please ignore this email.</p>`;

    await sendMail({ to: user.email, subject: 'Password Reset Request', html });

    if (ADMIN_EMAIL) {
      try {
        const adminHtml = `<p>Password reset requested for user: ${user.email} at ${new Date().toLocaleString()}</p>`;
        await sendMail({ to: ADMIN_EMAIL, subject: 'Password Reset Requested', html: adminHtml });
      } catch (err) {
        console.warn('Failed to notify admin about password reset', err.message);
      }
    }

    res.status(200).json({
      message: "Password reset link sent to your email"
    });
  } catch (error) {
    res.status(500).json({
      message: "Error processing request",
      error: error.message
    });
  }
};

/**
 * Reset password endpoint
 * POST /api/auth/reset-password
 * body: { email, token, newPassword }
 */
exports.resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: 'Missing parameters' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      email,
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Hash and set new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    // Notify user and admin
    try {
      const html = `<p>Hi ${user.name},</p><p>Your password was successfully changed. If you did not perform this, contact support immediately.</p>`;
      await sendMail({ to: user.email, subject: 'Password Changed', html });
    } catch (err) {
      console.warn('Failed to send password changed email', err.message);
    }

    if (ADMIN_EMAIL) {
      try {
        const adminHtml = `<p>User changed password: ${user.email} at ${new Date().toLocaleString()}</p>`;
        await sendMail({ to: ADMIN_EMAIL, subject: 'User Password Changed', html: adminHtml });
      } catch (err) {
        console.warn('Failed to notify admin about password change', err.message);
      }
    }

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error resetting password', error: err.message });
  }
};

exports.sendTestEmail = async (req, res) => {
  try {
    const recipient = process.env.EMAIL_USER;
    if (!recipient) {
      return res.status(400).json({ success: false, message: 'EMAIL_USER is not configured' });
    }

    const html = `<p>This is a test email from Campus Placement Portal.</p>
      <p>If you received this, the mailer configuration is correct.</p>`;

    const result = await sendMail({
      to: recipient,
      subject: 'Test Email from Campus Placement Portal',
      html
    });

    if (!result.success) {
      return res.status(500).json({ success: false, message: 'Failed to send test email', error: result.error });
    }

    res.status(200).json({ success: true, message: `Test email sent to ${recipient}` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Mailer test failed', error: err.message });
  }
};
