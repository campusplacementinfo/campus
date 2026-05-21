import { useState, useEffect } from 'react';
import { resetPassword } from '../services/api';
import { useSearchParams, Link } from 'react-router-dom';
import './AuthStyles.css';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
  }, [emailParam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!email || !token) return setError('Invalid reset link');
    if (!newPassword || newPassword.length < 6) return setError('Password must be at least 6 characters');
    if (newPassword !== confirm) return setError('Passwords do not match');
    setLoading(true);
    const res = await resetPassword({ email, token, newPassword });
    setLoading(false);
    if (res.success) {
      setMessage(res.message || 'Password changed successfully');
    } else {
      setError(res.message || 'Failed to reset password');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Reset Password</h2>
        {message && <div className="success-message">✅ {message}</div>}
        {error && <div className="error-message">❌ {error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
          </div>

          <div className="form-group">
            <label>New Password</label>
            <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" />
          </div>

          <button className="auth-button" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Reset Password'}</button>
        </form>
        <div style={{ marginTop: 12 }}>
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
