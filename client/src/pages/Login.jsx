 import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { checkBackend } from "../services/api";
import "./AuthStyles.css";

function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, getDashboardPath, role } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [backendAvailable, setBackendAvailable] = useState(true);

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      const dashboardPath = getDashboardPath(role);
      navigate(dashboardPath, { replace: true });
    }
  }, [isAuthenticated, getDashboardPath, navigate, role]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
    setError(""); // clear error while typing
  };

  useEffect(() => {
    const verifyBackend = async () => {
      const available = await checkBackend();
      setBackendAvailable(available);
      if (!available) {
        setError("Backend unavailable. Please start the server before logging in.");
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

    try {
      if (!form.email || !form.password) {
        setError("Please fill in all fields");
        setLoading(false);
        return;
      }

      const result = await login({
        email: form.email.trim().toLowerCase(),
        password: form.password
      });

      if (!result.success) {
        setError(result.message || "Invalid email or password");
      }
      // Navigation is handled by the login function in AuthContext
    } catch (err) {
      console.error("[LOGIN EXCEPTION]:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="auth-content">
        <div className="auth-card login-card">
            <div className="auth-header auth-header-topbar">
              <div>
                <div className="logo-circle">🎓</div>
                <h1>Campus Placement Portal</h1>
                <p>Sign in to your account</p>
              </div>
            </div>
          {error && <div className="error-message">❌ {error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">📧</span>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="remember-forgot">
              <label className="remember">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={loading || !backendAvailable}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="auth-divider">
            <span>New to our platform?</span>
          </div>

          <Link to="/register" className="switch-auth">
            Create an account
          </Link>
        </div>

        <div className="auth-info">
          <div className="info-card">
            <div className="info-icon">🚀</div>
            <h3>Get Started Today</h3>
            <p>Connect with top companies and launch your career</p>
          </div>
          <div className="info-card">
            <div className="info-icon">💼</div>
            <h3>Find Opportunities</h3>
            <p>Explore thousands of job opportunities</p>
          </div>
          <div className="info-card">
            <div className="info-icon">🌟</div>
            <h3>Grow Your Skills</h3>
            <p>Learn and develop professionally</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;