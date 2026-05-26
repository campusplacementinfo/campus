/**
 * Validation utilities for registration and form inputs
 */

/**
 * Validate password strength
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character (!@#$%^&*)
 */
const validatePassword = (password) => {
  const errors = [];

  if (!password) {
    return { isValid: false, errors: ["Password is required"] };
  }

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter (A-Z)");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter (a-z)");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number (0-9)");
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push("Password must contain at least one special character (!@#$%^&*)");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate enrollment number
 * Requirements:
 * - Exactly 10 uppercase alphanumeric characters
 * - Example: CVB2100001
 */
const validateEnrollmentNumber = (enrollmentNumber) => {
  if (!enrollmentNumber) {
    return { isValid: false, message: "Enrollment number is required" };
  }

  const trimmed = enrollmentNumber.trim().toUpperCase();

  if (!/^(?=.*[A-Z])(?=.*\d)[A-Z0-9]{10}$/.test(trimmed)) {
    return {
      isValid: false,
      message: "Enrollment number must be exactly 10 uppercase alphanumeric characters, e.g. CVB2100001"
    };
  }

  return { isValid: true, message: "Valid" };
};

/**
 * Validate email format
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate full name
 * Requirements:
 * - At least 2 characters
 * - No numbers or special characters (except spaces and hyphens)
 */
const validateName = (name) => {
  if (!name || name.trim().length < 2) {
    return { isValid: false, message: "Name must be at least 2 characters" };
  }

  if (!/^[a-zA-Z\s\-']+$/.test(name)) {
    return {
      isValid: false,
      message: "Name can only contain letters, spaces, hyphens, and apostrophes"
    };
  }

  return { isValid: true, message: "Valid" };
};

/**
 * Validate admin token format (basic check)
 */
const validateAdminToken = (token) => {
  if (!token || token.trim().length < 8) {
    return {
      isValid: false,
      message: "Admin token must be at least 8 characters"
    };
  }
  return { isValid: true, message: "Valid" };
};

module.exports = {
  validatePassword,
  validateEnrollmentNumber,
  validateEmail,
  validateName,
  validateAdminToken
};
