import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import { useTelegram } from '../useTelegram';
import { useReading } from '../contexts/ReadingContext';
import { fetchBooks, fetchVendors, fetchAuthors, fetchBanner } from '../api/content';
import { IconSearch, IconChevronRight } from '../components/Icons';
import BookCover from '../components/BookCover';

export default function HomeNew() {
  const { t } = useLang();
  const { initData } = useTelegram();
  const { getRecentlyRead } = useReading();
  const continueReading = getRecentlyRead();
  const [topBooks, setTopBooks] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [bannerImage, setBannerImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetchBooks(initData),
      fetchVendors(initData),
      fetchAuthors(initData),
      fetchBanner(initData),
    ])
      .then(([books, v, a, banner]) => {
        if (cancelled) return;
        setTopBooks(books.slice(0, 3));
        setVendors(v.slice(0, 6));
        setAuthors(a.slice(0, 3));
        setBannerImage(banner);
      })
      .catch(() => {
        if (!cancelled) {
          setTopBooks([]);
          setVendors([]);
          setAuthors([]);
          setBannerImage(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [initData]);

  const bannerBg = bannerImage
    ? `linear-gradient(to right, rgba(30,58,95,0.92) 0%, rgba(45,90,135,0.85) 100%), url(${bannerImage})`
    : 'linear-gradient(135deg, rgba(30,58,95,0.92), rgba(45,90,135,0.85))';

  return (
    <div className="content">
      <Link to="/search" className="home-search-bar animate-fade-in" aria-label={t('home.search')}>
        <IconSearch style={{ width: 20, height: 20 }} />
        <span>{t('home.search')}</span>
      </Link>

      <Link
        to="/books/4/detail"
        className="banner banner--offer animate-fade-in-up"
        style={{ backgroundImage: bannerBg, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="banner__inner">
          <span className="banner__tag">{t('home.specialOffer')}</span>
          <h2 className="banner__title">{t('home.discount20')}</h2>
          <span className="banner__cta">{t('home.orderNow')}</span>
        </div>
        <div className="banner__book">APOLLO</div>
      </Link>

      {continueReading.length > 0 && (
        <section className="home-section animate-fade-in-up" style={{ animationDelay: '0.03s', animationFillMode: 'both' }}>
          <div className="section-head">
            <h3 className="section-title">{t('home.continueReading')}</h3>
            <Link to="/books" className="section-link">{t('home.seeAll')} <IconChevronRight style={{ width: 16, height: 16, marginLeft: 2 }} /></Link>
          </div>
          <div className="continue-scroll">
            {continueReading.map((item) => (
              <Link key={item.id} to={`/books/${item.id}`} className="continue-card">
                <BookCover coverUrl={item.coverUrl} size="md" alt={item.title} />
                <div className="continue-card__body">
                  <span className="continue-card__title">{item.title || t('reader.pageTitle')}</span>
                  <span className="continue-card__meta">{Math.round(item.progressPct)}% {t('home.read')} · {item.page}/{item.totalPages}</span>
                  <div className="continue-card__progress">
                    <div className="continue-card__progress-fill" style={{ width: `${item.progressPct}%` }} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="home-section animate-fade-in-up" style={{ animationDelay: '0.05s', animationFillMode: 'both' }}>
        <div className="section-head">
          <h3 className="section-title">{t('home.topOfWeek')}</h3>
          <Link to="/books" className="section-link">{t('home.seeAll')} <IconChevronRight style={{ width: 16, height: 16, marginLeft: 2 }} /></Link>
        </div>
        <div className="top-books-row">
          {loading ? (
            <div className="top-books-row skeleton-card" style={{ minHeight: 180 }} />
          ) : (
            topBooks.map((book) => (
              <Link key={book.id} to={`/books/${book.id}/detail`} className="top-book-card">
                <BookCover coverUrl={book.coverUrl} size="md" alt={book.title} />
                <span className="top-book-card__title">{book.title}</span>
                <span className="top-book-card__price">${book.price.toFixed(2)}</span>
              </Link>
            ))
          )}
        </div>
      </section>

      <section className="home-section animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
        <div className="section-head">
          <h3 className="section-title">{t('home.bestVendors')}</h3>
          <Link to="/vendors" className="section-link">{t('home.seeAll')} <IconChevronRight style={{ width: 16, height: 16, marginLeft: 2 }} /></Link>
        </div>
        <div className="vendors-row">
          {!loading && vendors.map((v) => (
            <Link key={v.id} to={`/vendors/${v.id}`} className="vendor-chip">
              {v.logo && <img src={v.logo} alt="" className="vendor-chip__logo" width={40} height={40} />}
              <span className="vendor-chip__name">{v.name}</span>
              <span className="vendor-chip__stars">★ {v.rating}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section animate-fade-in-up" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
        <div className="section-head">
          <h3 className="section-title">{t('home.authors')}</h3>
          <Link to="/authors" className="section-link">{t('home.seeAll')} <IconChevronRight style={{ width: 16, height: 16, marginLeft: 2 }} /></Link>
        </div>
        <div className="authors-row">
          {!loading && authors.map((a) => (
            <Link key={a.id} to={`/authors/${a.id}`} className="author-card">
              <div className="author-card__avatar" style={a.image ? { backgroundImage: `url(${a.image})`, backgroundSize: 'cover' } : {}} />
              <span className="author-card__name">{a.name}</span>
              <span className="author-card__role">{a.role}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
