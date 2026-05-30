
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

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

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
