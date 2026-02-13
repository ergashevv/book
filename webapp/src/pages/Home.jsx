import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { apiGet, getBookCoverUrl } from '../api';
import { useLang } from '../contexts/LangContext';
import BookCover from '../components/BookCover';
import Banner from '../components/Banner';
import NewsCard from '../components/NewsCard';
import { IconBook } from '../components/Icons';
import { SkeletonContinueRow } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { IconChevronRight } from '../components/Icons';
import { BANNERS, NEWS } from '../bannersNews';

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

  const heroBanner = BANNERS.find((b) => b.type === 'hero') || BANNERS[0];
  const latestNews = NEWS.slice(0, 3);

  return (
    <div className="content">
      <Banner
        gradient={heroBanner.gradient}
        titleKey={heroBanner.titleKey}
        subKey={heroBanner.subKey}
        ctaKey={heroBanner.ctaKey}
        link={heroBanner.link}
        size="lg"
      />
      <div className="hero">
        <h2 className="hero__title">{t('home.heroTitle')}</h2>
        <p className="hero__sub">{t('home.heroSub')}</p>
      </div>

      <section className="home-section">
        <div className="section-head">
          <h3 className="section-title">{t('home.continueReading')}</h3>
          {continueReading.length > 0 && (
            <Link to="/books" className="section-link">
              {t('home.popularBooks')}
              <IconChevronRight style={{ width: 16, height: 16, marginLeft: 2 }} />
            </Link>
          )}
        </div>
        {loadingContinue ? (
          <SkeletonContinueRow count={3} />
        ) : continueReading.length > 0 ? (
          <div className="continue-scroll">
            {continueReading.map((item) => {
              const pct = item.page_count > 0 ? Math.round((item.page_number / item.page_count) * 100) : 0;
              return (
                <Link
                  key={item.book_id}
                  to={`/books/${item.book_id}/detail`}
                  className="continue-card"
                >
                  <BookCover coverUrl={getBookCoverUrl({ id: item.book_id, cover_url: item.cover_url }, initData)} size="md" alt="" />
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
          <EmptyState message={t('home.noContinueReading')}>
            <Link to="/books" className="btn btn-secondary">{t('home.booksLink')}</Link>
          </EmptyState>
        )}
      </section>

      <section className="home-section">
        <div className="section-head">
          <h3 className="section-title">{t('news.latest')}</h3>
          <Link to="/news" className="section-link">
            {t('news.title')}
            <IconChevronRight style={{ width: 16, height: 16, marginLeft: 2 }} />
          </Link>
        </div>
        {latestNews.map((item) => (
          <NewsCard
            key={item.id}
            titleKey={item.titleKey}
            excerptKey={item.excerptKey}
            dateKey={item.dateKey}
            tagKey={item.tagKey}
          />
        ))}
      </section>

      <section className="home-section">
        <h3 className="section-title">{t('home.categories')}</h3>
        {loading && (
          <p className="muted">{t('home.loading')}</p>
        )}
        {error && <p className="home-error">{t('home.error')}: {error}</p>}
        {!loading && !error && categories.length === 0 && (
          <EmptyState message={t('home.noCategories')} />
        )}
        {!loading && !error && categories.length > 0 && (
          <>
            <div className="cat-grid">
              {categories.map((cat) => (
                <Link key={cat.id} to={`/books?category_id=${cat.id}`} className="cat-card">
                  <span className="cat-card__icon">
                    <IconBook style={{ width: 20, height: 20 }} />
                  </span>
                  {cat.name_uz}
                </Link>
              ))}
            </div>
            <div className="hero__cta" style={{ marginTop: 16 }}>
              <Link to="/books" className="btn">
                {t('home.booksLink')}
                <IconChevronRight style={{ width: 18, height: 18 }} />
              </Link>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
