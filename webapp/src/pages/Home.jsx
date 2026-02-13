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
        <p style={{ color: 'var(--muted)', marginBottom: 16 }}>
          {t('home.welcomeHint')} <Link to="/books">{t('home.booksLink')}</Link> {t('home.welcomeHint2')}
        </p>
        <h3 style={{ marginBottom: 8 }}>{t('home.categories')}</h3>
        {loading && <p>{t('home.loading')}</p>}
        {error && <p style={{ color: 'var(--accent)' }}>{t('home.error')}: {error}</p>}
        {!loading && !error && categories.length === 0 && (
          <p style={{ color: 'var(--muted)' }}>{t('home.noCategories')}</p>
        )}
        {categories.map((cat) => (
          <Link key={cat.id} to={`/books?category_id=${cat.id}`} style={{ display: 'block', marginBottom: 8 }}>
            <div className="card" style={{ cursor: 'pointer' }}>
              {cat.name_uz}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
