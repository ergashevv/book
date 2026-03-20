import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Splash() {
  const navigate = useNavigate();
  const { user, onboardingSeen, isRestoring } = useAuth();

  useEffect(() => {
    if (isRestoring) return;
    const t = setTimeout(() => {
      if (user) {
        navigate('/', { replace: true });
        return;
      }
      if (onboardingSeen) {
        navigate('/login', { replace: true });
        return;
      }
      navigate('/onboarding', { replace: true });
    }, 1500);
    return () => clearTimeout(t);
  }, [user, onboardingSeen, isRestoring, navigate]);

  return (
    <div className="splash">
      <div className="splash__logo" aria-hidden>
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 4L28 16L40 20L28 24L24 36L20 24L8 20L20 16L24 4Z" fill="white" />
        </svg>
      </div>
      <h1 className="splash__title">Sphere</h1>
    </div>
  );
}
