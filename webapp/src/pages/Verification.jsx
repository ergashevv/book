import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import VerificationCodeInput from '../components/VerificationCodeInput';

export default function Verification() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const flow = searchParams.get('flow') || 'login'; // login | signup | forgot
  const { verifyCode, pendingPhone, authMethod, resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 4) {
      setError('Enter 4-digit code');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = verifyCode(code, {
        afterSignUp: flow === 'signup',
        afterForgotPassword: flow === 'forgot',
      });
      if (!res.success) {
        setError(res.error || 'Invalid code');
        return;
      }
      if (flow === 'signup' && res.isNewUser) {
        navigate('/congratulation', { replace: true });
        return;
      }
      if (flow === 'forgot') {
        navigate('/forgot-password/new-password', { replace: true });
        return;
      }
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const channelText = authMethod === 'telegram'
    ? 'Telegram @VerificationCodes bot'
    : `phone number ${pendingPhone || ''}`;

  return (
    <div className="auth-page">
      <div className="auth-page__card">
        <h1 className="auth-page__title">
          {flow === 'forgot' ? 'Verification Code' : 'Verification'}
        </h1>
        <p className="auth-page__sub">
          Please enter the code we just sent to {channelText}.
        </p>
        <form onSubmit={handleSubmit} className="auth-form">
          <VerificationCodeInput value={code} onChange={setCode} disabled={loading} />
          <button type="button" className="auth-form__resend">Resend</button>
          {error && <p className="auth-form__error">{error}</p>}
          <button type="submit" className="btn auth-form__btn" disabled={loading || code.length !== 4}>
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
