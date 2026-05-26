/**
 * Frontend validation utilities for registration form
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
export const validatePassword = (password) => {
  const errors = [];

  if (!password) {
    return { isValid: false, errors: ["Password is required"] };
  }

  if (password.length < 8) {
    errors.push("At least 8 characters");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("One uppercase letter (A-Z)");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("One lowercase letter (a-z)");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("One number (0-9)");
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push("One special character (!@#$%^&*)");
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
export const validateEnrollmentNumber = (enrollmentNumber) => {
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
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate full name
 */
export const validateName = (name) => {
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
