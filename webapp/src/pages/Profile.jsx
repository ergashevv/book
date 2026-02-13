import { Link } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';

export default function Profile({ user, isDev }) {
  const { t } = useLang();
  return (
    <div className="app">
      <header className="header">
        <h1 style={{ flex: 1, margin: 0 }}>{t('profile.title')}</h1>
      </header>
      <div className="content">
        <div className="card card--static">
          <h3 style={{ marginTop: 0, fontSize: '1rem', fontWeight: 600 }}>{t('profile.login')}</h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: 12 }}>
            {t('profile.loginDesc')}
          </p>
          {user && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '1.05rem' }}>
                {user.first_name} {user.last_name || ''}
              </p>
              {user.username && (
                <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: '0.9rem' }}>@{user.username}</p>
              )}
            </div>
          )}
          {isDev && (
            <p style={{ marginTop: 12, color: 'var(--accent)', fontSize: '0.85rem' }}>{t('profile.devMode')}</p>
          )}
        </div>
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
    </div>
  );
}
