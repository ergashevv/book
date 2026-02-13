import { useNavigate } from 'react-router-dom';

export default function Congratulation() {
  const navigate = useNavigate();

  return (
    <div className="auth-page auth-page--center">
      <div className="auth-page__card congratulation">
        <div className="congratulation__illus" aria-hidden />
        <h1 className="auth-page__title">Congratulation!</h1>
        <p className="auth-page__sub">Your account is complete, please enjoy the best menu from us.</p>
        <button type="button" className="btn auth-form__btn" onClick={() => navigate('/', { replace: true })}>
          Get Started
        </button>
      </div>
    </div>
  );
}
