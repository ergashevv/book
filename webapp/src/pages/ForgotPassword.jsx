import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const TELEGRAM_BOT = 'https://t.me/VerificationCodes';

function StepMethod({ onSelect }) {
  return (
    <div className="auth-page">
      <div className="auth-page__card">
        <h1 className="auth-page__title">Forgot Password</h1>
        <p className="auth-page__sub">Select which contact details should we use to reset your password</p>
        <div className="forgot-methods">
          <button type="button" className="forgot-method forgot-method--active" onClick={() => onSelect('telegram')}>
            <span className="forgot-method__icon">✉</span>
            <span className="forgot-method__label">Telegram</span>
            <span className="forgot-method__desc">Send via @VerificationCodes bot</span>
          </button>
          <button type="button" className="forgot-method" onClick={() => onSelect('sms')}>
            <span className="forgot-method__icon">📱</span>
            <span className="forgot-method__label">Phone Number</span>
            <span className="forgot-method__desc">Send to your phone</span>
          </button>
        </div>
        <button type="button" className="btn auth-form__btn" onClick={() => onSelect('sms')}>
          Continue
        </button>
      </div>
    </div>
  );
}

function StepPhone({ method, onSent }) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { forgotPasswordRequest } = useAuth();

  const handleSend = async (e) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError('Enter phone number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await forgotPasswordRequest(phone.trim(), method);
      onSent(phone);
    } catch (err) {
      setError(err.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__card">
        <h1 className="auth-page__title">Reset Password</h1>
        <p className="auth-page__sub">
          Please enter your phone number, we will send a verification code to your phone number.
        </p>
        <form onSubmit={handleSend} className="auth-form">
          <label className="auth-form__label">Phone Number</label>
          <input
            type="tel"
            className="auth-form__input"
            placeholder="(+965) 123 435 7565"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          {method === 'telegram' && (
            <p className="auth-form__hint">
              Or get code from <a href={TELEGRAM_BOT} target="_blank" rel="noopener noreferrer">@VerificationCodes</a> bot
            </p>
          )}
          {error && <p className="auth-form__error">{error}</p>}
          <button type="submit" className="btn auth-form__btn" disabled={loading}>Send</button>
        </form>
      </div>
    </div>
  );
}

function StepNewPassword({ onDone }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Minimum 8 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setLoading(true);
    try {
      resetPassword(password);
      onDone();
    } catch (err) {
      setError(err.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__card">
        <h1 className="auth-page__title">New Password</h1>
        <p className="auth-page__sub">Create your new password, so you can login to your account.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-form__label">New Password</label>
          <input
            type="password"
            className="auth-form__input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label className="auth-form__label">Confirm Password</label>
          <input
            type="password"
            className="auth-form__input"
            placeholder="Your password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          {error && <p className="auth-form__error">{error}</p>}
          <button type="submit" className="btn auth-form__btn" disabled={loading}>Send</button>
        </form>
      </div>
    </div>
  );
}

function StepSuccess({ onLogin }) {
  return (
    <div className="auth-page auth-page--center">
      <div className="auth-page__card congratulation">
        <div className="congratulation__illus" aria-hidden />
        <h1 className="auth-page__title">Password Changed!</h1>
        <p className="auth-page__sub">Password changed successfully, you can login again with a new password</p>
        <button type="button" className="btn auth-form__btn" onClick={onLogin}>Login</button>
      </div>
    </div>
  );
}

export default function ForgotPassword() {
  const location = useLocation();
  const isNewPassword = location.pathname.includes('new-password');
  const [step, setStep] = useState('method');
  const [method, setMethod] = useState('sms');
  const navigate = useNavigate();

  if (isNewPassword) {
    return (
      <StepNewPassword onDone={() => navigate('/forgot-password/success', { replace: true })} />
    );
  }
  if (location.pathname.includes('success')) {
    return <StepSuccess onLogin={() => navigate('/login', { replace: true })} />;
  }

  if (step === 'method') {
    return (
      <StepMethod onSelect={(m) => { setMethod(m); setStep('phone'); }} />
    );
  }
  return (
    <StepPhone
      method={method}
      onSent={() => navigate('/verify?flow=forgot', { replace: true })}
    />
  );
}
