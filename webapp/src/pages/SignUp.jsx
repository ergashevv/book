import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RULES = [
  { key: 'min8', label: 'Minimum 8 characters', test: (s) => s.length >= 8 },
  { key: 'number', label: 'At least 1 number (1-9)', test: (s) => /\d/.test(s) },
  { key: 'letter', label: 'At least lowercase or uppercase letters', test: (s) => /[a-zA-Z]/.test(s) },
];

export default function SignUp() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const rulesStatus = RULES.map((r) => ({ ...r, ok: r.test(password) }));
  const allValid = rulesStatus.every((r) => r.ok);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Enter your name');
      return;
    }
    if (!phone.trim()) {
      setError('Enter phone number');
      return;
    }
    if (!allValid) {
      setError('Password does not meet requirements');
      return;
    }
    setLoading(true);
    try {
      const res = await signUp(name.trim(), phone.trim(), password);
      if (res.needVerify) navigate('/verify?flow=signup');
      else navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__card">
        <h1 className="auth-page__title">Sign Up</h1>
        <p className="auth-page__sub">Create account and choose favorite menu.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-form__label">Name</label>
          <input
            type="text"
            className="auth-form__input"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
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
            autoComplete="new-password"
          />
          <div className="auth-form__rules">
            {rulesStatus.map((r) => (
              <span key={r.key} className={r.ok ? 'auth-form__rule--ok' : 'auth-form__rule'}>
                {r.ok ? '✓' : '✗'} {r.label}
              </span>
            ))}
          </div>
          {error && <p className="auth-form__error">{error}</p>}
          <button type="submit" className="btn auth-form__btn" disabled={loading || !allValid}>
            Register
          </button>
        </form>
        <p className="auth-page__footer">
          By clicking Register, you agree to our Terms and Data Policy.
        </p>
        <p className="auth-page__footer">
          Have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
