 const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  validatePassword,
  validateEnrollmentNumber,
  validateEmail,
  validateName,
  validateAdminToken
} = require("../utils/validation");

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, enrollmentNumber, adminToken } = req.body;
    console.log("[REGISTER] Received role:", role);

    // Validate all fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    // Validate name format
    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
      return res.status(400).json({ message: nameValidation.message });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        message: "Password does not meet security requirements",
        passwordErrors: passwordValidation.errors
      });
    }

    // Validate student enrollment number if role is student
    if (role === "student") {
      if (!enrollmentNumber || enrollmentNumber.trim() === "") {
        return res.status(400).json({ message: "Enrollment number is required for students" });
      }

      const enrollmentValidation = validateEnrollmentNumber(enrollmentNumber);
      if (!enrollmentValidation.isValid) {
        return res.status(400).json({ message: enrollmentValidation.message });
      }
    }

    // Validate admin token if role is admin
    if (role === "admin") {
      if (!adminToken || adminToken.trim() === "") {
        return res.status(400).json({ message: "Admin token is required to create an admin account" });
      }

      const tokenValidation = validateAdminToken(adminToken);
      if (!tokenValidation.isValid) {
        return res.status(400).json({ message: tokenValidation.message });
      }

      // Verify admin token matches environment variable
      if (adminToken !== process.env.ADMIN_TOKEN) {
        return res.status(403).json({ message: "Invalid admin token" });
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Check if enrollment number already exists (for students)
    if (role === "student" && enrollmentNumber) {
      const existingEnrollment = await User.findOne({
        enrollmentNumber: enrollmentNumber.toUpperCase().trim()
      });
      if (existingEnrollment) {
        return res.status(400).json({ message: "Enrollment number already in use" });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user object
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role || "student"
    };

    // Add enrollment number for students
    if (role === "student" && enrollmentNumber) {
      userData.enrollmentNumber = enrollmentNumber.toUpperCase().trim();
    }

    // Create user in database
    const newUser = await User.create(userData);

    console.log("[REGISTER] User created successfully with role:", newUser.role);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        enrollmentNumber: newUser.enrollmentNumber || null
      }
    });
  } catch (error) {
    console.error("[REGISTER ERROR]:", error.message);
    
    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors)
        .map(err => err.message)
        .join("; ");
      return res.status(400).json({ message: messages });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        message: `${field === "email" ? "Email" : "Enrollment number"} already in use`
      });
    }

    res.status(500).json({
      message: "Server error during registration",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("[LOGIN] Attempting login for:", email); // Debug log

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    console.log("[LOGIN] User role:", user.role); // Debug log

    // Calculate profile completion
    const profileCompletionPercentage = user.getProfileCompletionPercentage();
    const profileCompletionStatus = user.getProfileCompletionStatus();

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const responseData = {
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
      }
    };

    console.log("[LOGIN] Response role:", responseData.role); // Debug log

    res.status(200).json(responseData);
  } catch (error) {
    console.error("[LOGIN ERROR]:", error.message);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};