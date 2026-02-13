import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { apiGet } from '../api';
import { useLang } from '../contexts/LangContext';

export default function Home({ initData }) {
  const { t } = useLang();
  const [categories, setCategories] = useState([]);
  const [continueReading, setContinueReading] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingContinue, setLoadingContinue] = useState(true);
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
  }, [initData, t]);

  useEffect(() => {
    apiGet('/me/continue-reading', initData)
      .then(setContinueReading)
      .catch(() => setContinueReading([]))
      .finally(() => setLoadingContinue(false));
  }, [initData]);

  return (
    <div className="content">
      <div className="hero">
        <h2 className="hero__title">{t('home.heroTitle')}</h2>
        <p className="hero__sub">{t('home.heroSub')}</p>
      </div>

      {!loadingContinue && (
        <section className="home-section">
          <div className="section-head">
            <h3 className="section-title">{t('home.continueReading')}</h3>
            {continueReading.length > 0 && (
              <Link to="/books" className="section-link">{t('home.popularBooks')}</Link>
            )}
          </div>
          {continueReading.length > 0 ? (
            <div className="continue-scroll">
              {continueReading.map((item) => {
                const pct = item.page_count > 0 ? Math.round((item.page_number / item.page_count) * 100) : 0;
                return (
                  <Link
                    key={item.book_id}
                    to={`/books/${item.book_id}/detail`}
                    className="continue-card"
                  >
                    <div className="continue-card__cover">📕</div>
                    <div className="continue-card__body">
                      <span className="continue-card__title">{item.title}</span>
                      <span className="continue-card__meta">
                        {item.page_number} / {item.page_count || '—'} {t('books.pages')}
                      </span>
                      {item.page_count > 0 && (
                        <div className="continue-card__progress">
                          <div className="continue-card__progress-fill" style={{ width: `${pct}%` }} />
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="home-empty">{t('home.noContinueReading')}</p>
          )}
        </section>
      )}

      <section className="home-section">
        <h3 className="section-title">{t('home.categories')}</h3>
        {loading && <p className="muted">{t('home.loading')}</p>}
        {error && <p className="home-error">{t('home.error')}: {error}</p>}
        {!loading && !error && categories.length === 0 && (
          <p className="home-empty">{t('home.noCategories')}</p>
        )}
        <div className="cat-grid">
          {categories.map((cat) => (
            <Link key={cat.id} to={`/books?category_id=${cat.id}`} className="cat-card">
              <span className="cat-card__icon">📖</span>
              {cat.name_uz}
            </Link>
          ))}
        </div>
        <div className="hero__cta" style={{ marginTop: 16 }}>
          <Link to="/books" className="btn">{t('home.booksLink')} →</Link>
        </div>
      </section>
    </div>
  );
}
