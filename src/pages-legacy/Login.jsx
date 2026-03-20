import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!phone.trim()) {
      setError('Enter phone number');
      return;
    }
    if (!password) {
      setError('Enter password');
      return;
    }
    setLoading(true);
    try {
      const res = await login(phone.trim(), password);
      if (res.needVerify) navigate('/verify?flow=login');
      else navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__card">
        <h1 className="auth-page__title">Welcome Back</h1>
        <p className="auth-page__sub">Sign in to continue</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-form__label">Phone Number</label>
          <input
            type="tel"
            className="auth-form__input"
            placeholder="(+965) 123 435 7565"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
          />
          <label className="auth-form__label">Password</label>
          <input
            type="password"
            className="auth-form__input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <Link to="/forgot-password" className="auth-form__link">Forgot Password?</Link>
          {error && <p className="auth-form__error">{error}</p>}
          <button type="submit" className="btn auth-form__btn" disabled={loading}>
            Login
          </button>
        </form>
        <p className="auth-page__footer">
          Don&apos;t have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
