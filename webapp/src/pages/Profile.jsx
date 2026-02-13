import { Link } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function Profile({ user, isDev }) {
  const { t } = useLang();
  return (
    <div className="content">
      <div className="profile-card card card--static">
        <h2 className="profile-card__title">{t('profile.title')}</h2>
        {user && (
          <div className="profile-card__user">
            <div className="profile-card__avatar" aria-hidden>👤</div>
            <div>
              <p className="profile-card__name">
                {user.first_name} {user.last_name || ''}
              </p>
              {user.username && (
                <p className="profile-card__username">@{user.username}</p>
              )}
            </div>
          </div>
        )}
        <p className="profile-card__desc">{t('profile.loginDesc')}</p>
        {isDev && (
          <p className="profile-card__dev">{t('profile.devMode')}</p>
        )}
      </div>

      <section className="settings-section">
        <h3 className="section-title">{t('profile.settings')}</h3>
        <div className="card card--static settings-card">
          <div className="settings-row">
            <span className="settings-row__label">{t('profile.language')}</span>
            <LanguageSwitcher />
          </div>
        </div>
      </section>

      <div className="card card--static">
        <h3 style={{ marginTop: 0, fontSize: '1rem', fontWeight: 600 }}>{t('profile.app')}</h3>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>
          {t('profile.appDesc')}
        </p>
        <Link to="/" className="btn btn-secondary" style={{ display: 'inline-block', marginTop: 16 }}>
          {t('profile.toHome')}
        </Link>
      </div>
    </div>
  );
}
