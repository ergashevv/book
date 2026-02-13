import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { apiGet } from '../api';
import { useLang } from '../contexts/LangContext';

export default function Home({ initData }) {
  const { t } = useLang();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiGet('/categories', initData)
      .then(setCategories)
      .catch((e) => {
        const msg = e.message || '';
        if (msg === 'AUTH_REQUIRED' || msg.includes('pattern')) {
          setError(t('home.authError'));
        } else {
          setError(msg);
        }
      })
      .finally(() => setLoading(false));
  }, [initData]);

  return (
    <div className="app">
      <header className="header">
        <h1>📚 Kitobxona</h1>
      </header>
      <div className="content">
        <div className="hero">
          <h2 className="hero__title">Kitobxona</h2>
          <p className="hero__sub">{t('home.welcomeHint')} {t('home.booksLink')} {t('home.welcomeHint2')}</p>
          <div className="hero__cta">
            <Link to="/books" className="btn">{t('home.booksLink')} →</Link>
          </div>
        </div>
        <p className="section-title">{t('home.categories')}</p>
        {loading && <p className="muted">{t('home.loading')}</p>}
        {error && <p style={{ color: 'var(--accent)' }}>{t('home.error')}: {error}</p>}
        {!loading && !error && categories.length === 0 && (
          <p style={{ color: 'var(--muted)' }}>{t('home.noCategories')}</p>
        )}
        <div className="cat-grid">
          {categories.map((cat) => (
            <Link key={cat.id} to={`/books?category_id=${cat.id}`} className="cat-card">
              <span className="cat-card__icon">📖</span>
              {cat.name_uz}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
