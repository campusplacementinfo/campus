import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser, checkBackend } from "../services/api";
import "./AuthStyles.css";

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [backendAvailable, setBackendAvailable] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    adminToken: "",
    enrollmentNumber: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
    setError("");
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

    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (form.role === "student" && !form.enrollmentNumber.trim()) {
      setError("Enrollment number is required for student registration");
      setLoading(false);
      return;
    }

    if (form.role === "admin" && !form.adminToken) {
      setError("Admin creation token is required to create an admin account");
      setLoading(false);
      return;
    }

    console.log("[REGISTER] Submitting with role:", form.role);
    const res = await registerUser(form);
    console.log("[REGISTER RESPONSE]:", res);

    if (res.message === "User registered successfully") {
      setSuccess(`✅ Registration successful. Your account has been created and is waiting for admin approval.`);
      setTimeout(() => {
        navigate("/login");
      }, 2500);
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

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="auth-content">
        <div className="auth-card register-card">
          <div className="auth-header">
            <div className="logo-circle">
              🎓
            </div>
            <h1>Join Our Community</h1>
            <p>Create your account and get started</p>
          </div>

          {error && <div className="error-message">❌ {error}</div>}
          {success && <div className="success-message">✅ {success}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                {/* <span className="input-icon">👤</span> */}
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                {/* <span className="input-icon">📧</span> */}
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                {/* <span className="input-icon">🔒</span> */}
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>
              <small className="password-hint">
                Minimum 6 characters
              </small>
            </div>

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

            {form.role === "student" && (
              <div className="form-group">
                <label htmlFor="enrollmentNumber">Enrollment Number</label>
                <div className="input-wrapper">
                  <input
                    id="enrollmentNumber"
                    type="text"
                    name="enrollmentNumber"
                    placeholder="Enter your enrollment number"
                    value={form.enrollmentNumber}
                    onChange={handleChange}
                  />
                </div>
                <small className="password-hint">
                  Required for student registration
                </small>
              </div>
            )}

            {form.role === "admin" && (
              <div className="form-group">
                <label htmlFor="adminToken">Admin Creation Token</label>
                <div className="input-wrapper">
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

            <div className="terms-check">
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms">
                I agree to the <a href="#terms">Terms & Conditions</a>
              </label>
            </div>

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