import { Link } from 'react-router-dom';
import { IconArrowLeft } from '../components/Icons';

export default function HelpCenter() {
  return (
    <div className="content">
      <header className="page-header">
        <Link to="/profile" className="page-header__back"><IconArrowLeft style={{ width: 24, height: 24 }} /></Link>
        <h1 className="page-header__title">Help Center</h1>
      </header>
      <div className="help-center">
        <p className="help-center__lead">Tell us how we can help</p>
        <p className="help-center__sub">Chapter are standing by for service &amp; support!</p>
        <div className="help-center__options">
          <a href="mailto:support@example.com" className="help-option">
            <span className="help-option__icon">✉</span>
            <span className="help-option__label">Email</span>
            <span className="help-option__desc">Send to your email</span>
          </a>
          <a href="tel:+1234567890" className="help-option">
            <span className="help-option__icon">📱</span>
            <span className="help-option__label">Phone Number</span>
            <span className="help-option__desc">Send to your phone</span>
          </a>
        </div>
      </div>
    </div>
  );
}
