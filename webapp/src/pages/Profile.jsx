import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LangContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { IconUser, IconMapPin, IconTag, IconHeart, IconDoc, IconHelp } from '../components/Icons';

const menuItems = [
  { path: '/profile/account', labelKey: 'profile.myAccount', icon: IconUser },
  { path: '/profile/address', labelKey: 'profile.address', icon: IconMapPin },
  { path: '/profile/offers', labelKey: 'profile.offers', icon: IconTag },
  { path: '/profile/favorites', labelKey: 'profile.favorites', icon: IconHeart },
  { path: '/profile/orders', labelKey: 'profile.orderHistory', icon: IconDoc },
  { path: '/profile/help', labelKey: 'profile.helpCenter', icon: IconHelp },
];

export default function Profile({ user, isDev }) {
  const { t } = useLang();
  const { logout } = useAuth();
  const [showLogout, setShowLogout] = useState(false);

  const displayName = user?.name || (user?.first_name && [user.first_name, user.last_name].filter(Boolean).join(' ')) || 'User';
  const displayPhone = user?.phone || '(+1) 234 567 890';

  return (
    <div className="content">
      <h1 className="profile-main-title">{t('profile.title')}</h1>
      <div className="profile-main-card">
        <div className="profile-card__avatar profile-card__avatar--lg" aria-hidden>
          <IconUser style={{ width: 40, height: 40 }} />
        </div>
        <p className="profile-card__name profile-card__name--main">{displayName}</p>
        <p className="profile-card__phone">{displayPhone}</p>
        <button type="button" className="profile-logout-link" onClick={() => setShowLogout(true)}>Logout</button>
      </div>
      <nav className="profile-menu">
        {menuItems.map(({ path, labelKey, icon: Icon }) => (
          <Link key={path} to={path} className="profile-menu__item">
            <span className="profile-menu__icon"><Icon style={{ width: 22, height: 22 }} /></span>
            <span>{t(labelKey)}</span>
            <span className="profile-menu__chevron">›</span>
          </Link>
        ))}
      </nav>
      {isDev && (
        <section className="settings-section">
          <h3 className="section-title">{t('profile.settings')}</h3>
          <div className="card card--static settings-card">
            <div className="settings-row">
              <span className="settings-row__label">{t('profile.language')}</span>
              <LanguageSwitcher />
            </div>
          </div>
        </section>
      )}

      {showLogout && (
        <div className="modal-overlay" onClick={() => setShowLogout(false)}>
          <div className="modal modal--logout" onClick={(e) => e.stopPropagation()}>
            <h3>Logout</h3>
            <p className="muted">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
            <div className="modal-actions">
              <button type="button" className="btn" onClick={() => { logout(); setShowLogout(false); }}>Logout</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowLogout(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
