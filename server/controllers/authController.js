 const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    console.log("[REGISTER] Received role:", role); // Debug log

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "student"
    });

    console.log("[REGISTER] User created with role:", newUser.role); // Debug log

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
    console.error("[REGISTER ERROR]:", error.message);
    res.status(500).json({
      message: "Server error",
      error: error.message
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