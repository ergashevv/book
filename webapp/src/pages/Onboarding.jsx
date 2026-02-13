import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const STEPS = [
  {
    titleKey: 'onboarding.step1Title',
    descKey: 'onboarding.step1Desc',
    cta: 'Continue',
  },
  {
    titleKey: 'onboarding.step2Title',
    descKey: 'onboarding.step2Desc',
    cta: 'Get Started',
  },
  {
    titleKey: 'onboarding.step3Title',
    descKey: 'onboarding.step3Desc',
    cta: 'Get Started',
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const { finishOnboarding } = useAuth();

  const t = (key) => {
    const map = {
      'onboarding.step1Title': "Now reading books will be easier",
      'onboarding.step1Desc': "Discover new worlds, join a vibrant reading community. Start your reading adventure effortlessly with us.",
      'onboarding.step2Title': "Your Bookish Soulmate Awaits",
      'onboarding.step2Desc': "Let us be your guide to the perfect read. Discover books tailored to your tastes for a truly rewarding experience.",
      'onboarding.step3Title': "Start Your Adventure",
      'onboarding.step3Desc': "Ready to embark on a quest for inspiration and knowledge? Your adventure begins now. Let's go!",
    };
    return map[key] || key;
  };

  const handleNext = () => {
    if (step < 2) setStep((s) => s + 1);
    else {
      finishOnboarding();
      navigate('/login', { replace: true });
    }
  };

  const handleSkip = () => {
    finishOnboarding();
    navigate('/login', { replace: true });
  };

  const handleSignIn = () => {
    finishOnboarding();
    navigate('/login', { replace: true });
  };

  return (
    <div className="onboarding">
      <header className="onboarding__header">
        <button type="button" className="onboarding__skip" onClick={handleSkip}>Skip</button>
      </header>
      <div className="onboarding__illus">
        <div className="onboarding__illus-placeholder" aria-hidden />
      </div>
      <h2 className="onboarding__title">{t(STEPS[step].titleKey)}</h2>
      <p className="onboarding__desc">{t(STEPS[step].descKey)}</p>
      <div className="onboarding__dots">
        {[0, 1, 2].map((i) => (
          <span key={i} className={`onboarding__dot ${i === step ? 'onboarding__dot--active' : ''}`} />
        ))}
      </div>
      <div className="onboarding__actions">
        <button type="button" className="btn onboarding__btn" onClick={handleNext}>
          {STEPS[step].cta}
        </button>
        <button type="button" className="btn btn-secondary onboarding__btn" onClick={handleSignIn}>
          Sign in
        </button>
      </div>
    </div>
  );
}
