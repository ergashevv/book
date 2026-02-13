import { Link } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { IconUser } from '../components/Icons';

export default function Profile({ user, isDev }) {
  const { t } = useLang();
  return (
    <div className="content">
      <div className="profile-card card card--static">
        <h2 className="profile-card__title">{t('profile.title')}</h2>
        {user && (
          <div className="profile-card__user">
            <div className="profile-card__avatar" aria-hidden>
              <IconUser style={{ width: 26, height: 26 }} />
            </div>
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
        <h3 className="card__heading">{t('profile.app')}</h3>
        <p className="card__desc">{t('profile.appDesc')}</p>
        <Link to="/" className="btn btn-secondary profile-to-home">
          {t('profile.toHome')}
        </Link>
      </div>
    </div>
  );
}
