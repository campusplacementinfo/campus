import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser, checkBackend } from "../services/api";
import { validatePassword, validateEnrollmentNumber, validateEmail, validateName } from "../utils/validation";
import "./AuthStyles.css";

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [backendAvailable, setBackendAvailable] = useState(true);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [enrollmentError, setEnrollmentError] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
    adminToken: "",
    enrollmentNumber: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });
    setError("");

    // Real-time validation feedback
    if (name === "password" && value) {
      const validation = validatePassword(value);
      setPasswordErrors(validation.errors);
      if (form.confirmPassword) {
        setConfirmPasswordError(value === form.confirmPassword ? "" : "Passwords do not match");
      }
    } else if (name === "password" && !value) {
      setPasswordErrors([]);
      setConfirmPasswordError("");
    }

    if (name === "confirmPassword") {
      setConfirmPasswordError(value === form.password ? "" : "Passwords do not match");
    }

    if (name === "enrollmentNumber" && value && form.role === "student") {
      const validation = validateEnrollmentNumber(value);
      setEnrollmentError(validation.isValid ? "" : validation.message);
    } else if (name === "enrollmentNumber" && !value) {
      setEnrollmentError("");
    }

    if (name === "name" && value) {
      const validation = validateName(value);
      setNameError(validation.isValid ? "" : validation.message);
    } else if (name === "name" && !value) {
      setNameError("");
    }

    if (name === "email" && value) {
      const isValid = validateEmail(value);
      setEmailError(isValid ? "" : "Invalid email format");
    } else if (name === "email" && !value) {
      setEmailError("");
    }
  };

  useEffect(() => {
    const verifyBackend = async () => {
      const available = await checkBackend();
      setBackendAvailable(available);
      if (!available) {
        setError("Backend unavailable. Please start the server before registering.");
      }
    };
    verifyBackend();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!backendAvailable) {
      setError("Backend unavailable. Start the server and try again.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    // Validate required fields
    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    // Validate name
    const nameValidation = validateName(form.name);
    if (!nameValidation.isValid) {
      setError(nameValidation.message);
      setLoading(false);
      return;
    }

    // Validate email
    if (!validateEmail(form.email)) {
      setError("Invalid email format");
      setLoading(false);
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(form.password);
    if (!passwordValidation.isValid) {
      setError("Password does not meet security requirements. Please review the requirements below.");
      setLoading(false);
      return;
    }

    // Validate confirm password
    if (!form.confirmPassword) {
      setError("Please confirm your password");
      setLoading(false);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate student enrollment number
    if (form.role === "student") {
      if (!form.enrollmentNumber.trim()) {
        setError("Enrollment number is required for student registration");
        setLoading(false);
        return;
      }

      const enrollmentValidation = validateEnrollmentNumber(form.enrollmentNumber);
      if (!enrollmentValidation.isValid) {
        setError(enrollmentValidation.message);
        setLoading(false);
        return;
      }
    }

    // Validate admin token
    if (form.role === "admin" && !form.adminToken.trim()) {
      setError("Admin creation token is required");
      setLoading(false);
      return;
    }

    const registerPayload = {
      ...form,
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      enrollmentNumber: form.enrollmentNumber ? form.enrollmentNumber.trim() : "",
      adminToken: form.adminToken ? form.adminToken.trim() : ""
    };

    console.log("[REGISTER] Submitting with role:", registerPayload.role);
    const res = await registerUser(registerPayload);
    console.log("[REGISTER RESPONSE]:", res);

    if (res.message === "User registered successfully") {
      setSuccess(`✅ Registration successful! Your account has been created and is waiting for admin approval.`);
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } else if (res.passwordErrors) {
      setError(res.message || "Password does not meet security requirements");
      setPasswordErrors(res.passwordErrors);
    } else {
      setError(res.message || "Registration failed");
    }
    setLoading(false);
  };

  const roleDescriptions = {
    student: "👨‍🎓 Browse jobs and apply to opportunities",
    admin: "👨‍💼 Manage platform and oversee placements",
    company: "🏢 Post jobs and manage recruitment"
  };

  const getPasswordStrength = () => {
    if (!form.password) return { strength: 0, label: "" };
    const errors = passwordErrors.length;
    if (errors === 0) return { strength: 100, label: "Strong ✅", color: "#27ae60" };
    if (errors <= 1) return { strength: 75, label: "Good", color: "#f39c12" };
    if (errors <= 2) return { strength: 50, label: "Fair", color: "#e67e22" };
    return { strength: 25, label: "Weak", color: "#e74c3c" };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="auth-content">
        <div className="auth-card register-card">
          <div className="auth-header auth-header-topbar">
            <div>
              <div className="logo-circle">🎓</div>
              <h1>Join Our Community</h1>
              <p>Create your account and get started</p>
            </div>
          </div>

          {error && <div className="error-message">❌ {error}</div>}
          {passwordErrors.length > 0 && (
            <div className="error-message">
              <strong>Password requirements:</strong>
              <ul style={{ marginTop: "8px", paddingLeft: "18px" }}>
                {passwordErrors.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {success && <div className="success-message">✅ {success}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Name Field */}
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
              {nameError && <small className="error-text">❌ {nameError}</small>}
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">📧</span>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
              {emailError && <small className="error-text">❌ {emailError}</small>}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={{ marginLeft: "8px", background: "transparent", border: "none", cursor: "pointer", color: "#667eea" }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {/* Confirm Password Field */}
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    style={{ marginLeft: "8px", background: "transparent", border: "none", cursor: "pointer", color: "#667eea" }}
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {confirmPasswordError && <small className="error-text">❌ {confirmPasswordError}</small>}
              </div>

              {/* Password Strength Indicator */}
              {form.password && (
                <>
                  <div className="password-strength-bar">
                    <div
                      className="strength-fill"
                      style={{
                        width: `${passwordStrength.strength}%`,
                        backgroundColor: passwordStrength.color
                      }}
                    ></div>
                  </div>
                  <small style={{ color: passwordStrength.color }}>
                    Strength: {passwordStrength.label}
                  </small>
                </>
              )}

              {/* Password Requirements Checklist */}
              <div className="password-requirements">
                <p style={{ fontSize: "12px", fontWeight: "bold", marginTop: "8px", marginBottom: "4px" }}>
                  Password must have:
                </p>
                <ul style={{ fontSize: "12px", margin: "4px 0", paddingLeft: "20px" }}>
                  <li style={{ color: form.password.length >= 8 ? "#27ae60" : "#e74c3c" }}>
                    {form.password.length >= 8 ? "✅" : "❌"} At least 8 characters
                  </li>
                  <li style={{ color: /[A-Z]/.test(form.password) ? "#27ae60" : "#e74c3c" }}>
                    {/[A-Z]/.test(form.password) ? "✅" : "❌"} One uppercase letter (A-Z)
                  </li>
                  <li style={{ color: /[a-z]/.test(form.password) ? "#27ae60" : "#e74c3c" }}>
                    {/[a-z]/.test(form.password) ? "✅" : "❌"} One lowercase letter (a-z)
                  </li>
                  <li style={{ color: /[0-9]/.test(form.password) ? "#27ae60" : "#e74c3c" }}>
                    {/[0-9]/.test(form.password) ? "✅" : "❌"} One number (0-9)
                  </li>
                  <li style={{ color: /[!@#$%^&*]/.test(form.password) ? "#27ae60" : "#e74c3c" }}>
                    {/[!@#$%^&*]/.test(form.password) ? "✅" : "❌"} One special character (!@#$%^&*)
                  </li>
                </ul>
              </div>
            </div>

            {/* Role Selection */}
            <div className="form-group">
              <label htmlFor="role">I am a...</label>
              <div className="role-selector">
                {["student", "company", "admin"].map((roleOption) => (
                  <label
                    key={roleOption}
                    className={`role-option ${form.role === roleOption ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={roleOption}
                      checked={form.role === roleOption}
                      onChange={handleChange}
                    />
                    <div className="role-content">
                      <div className="role-title">
                        {roleOption === "student" && "👨‍🎓 Student"}
                        {roleOption === "company" && "🏢 Company"}
                        {roleOption === "admin" && "👨‍💼 Admin/TPO"}
                      </div>
                      <div className="role-desc">
                        {roleDescriptions[roleOption]}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Enrollment Number (for students) */}
            {form.role === "student" && (
              <div className="form-group">
                <label htmlFor="enrollmentNumber">Enrollment Number *</label>
                <div className="input-wrapper">
                  <span className="input-icon">🧾</span>
                  <input
                    id="enrollmentNumber"
                    type="text"
                    name="enrollmentNumber"
                    placeholder="1234567890"
                    value={form.enrollmentNumber}
                    onChange={handleChange}
                    maxLength="10"
                  />
                </div>
                <small className="password-hint">
                  Must be exactly 10 uppercase alphanumeric characters, e.g. CVB2100001
                </small>
                {enrollmentError && <small className="error-text">❌ {enrollmentError}</small>}
                {form.enrollmentNumber && !enrollmentError && (
                  <small style={{ color: "#27ae60" }}>✅ Valid enrollment number</small>
                )}
              </div>
            )}

            {/* Admin Token (for admins) */}
            {form.role === "admin" && (
              <div className="form-group">
                <label htmlFor="adminToken">Admin Creation Token *</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔐</span>
                  <input
                    id="adminToken"
                    type="password"
                    name="adminToken"
                    placeholder="Enter admin token"
                    value={form.adminToken}
                    onChange={handleChange}
                  />
                </div>
                <small className="password-hint">
                  A secret token is required to create an admin account
                </small>
              </div>
            )}

            {/* Terms & Conditions */}
            <div className="terms-check">
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms">
                I agree to the <a href="#terms">Terms & Conditions</a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="auth-button"
              disabled={loading || !backendAvailable}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="auth-divider">
            <span>Already have an account?</span>
          </div>

          <Link to="/" className="switch-auth">
            Sign in here
          </Link>
        </div>

        <div className="auth-info">
          <div className="info-card">
            <div className="info-icon">🎯</div>
            <h3>Easy Registration</h3>
            <p>Simple and quick signup process</p>
          </div>
          <div className="info-card">
            <div className="info-icon">🔐</div>
            <h3>Secure & Safe</h3>
            <p>Your data is protected and secure</p>
          </div>
          <div className="info-card">
            <div className="info-icon">⚡</div>
            <h3>Get Started Instantly</h3>
            <p>Access all features right away</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;