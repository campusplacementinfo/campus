import { useState } from 'react';
import { forgotPassword } from '../services/api';
import { Link } from 'react-router-dom';
import './AuthStyles.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!email) return setError('Please enter your registered email');
    setLoading(true);
    const res = await forgotPassword(email);
    setLoading(false);
    if (res.success) {
      setMessage(res.message || 'If the email exists, a reset link was sent');
    } else {
      setError(res.message || 'Error sending reset link');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Forgot Password</h2>
        {message && <div className="success-message">✅ {message}</div>}
        {error && <div className="error-message">❌ {error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Registered Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
          </div>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        <div style={{ marginTop: 12 }}>
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
