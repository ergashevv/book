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
        setTopBooks(books.slice(0, 8));
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

  const firstContinue = continueReading[0];

  return (
    <div className="content content--kindle">
      <Link to="/search" className="home-search-bar" aria-label={t('home.search')}>
        <IconSearch style={{ width: 20, height: 20 }} />
        <span>{t('home.search')}</span>
      </Link>

      {/* Kindle: Continue Reading – bitta katta kartochka yoki gorizontal strip */}
      {continueReading.length > 0 && (
        <section className="home-section home-section--continue">
          <div className="section-head">
            <h2 className="section-title">{t('home.continueReading')}</h2>
            <Link to="/books" className="section-link">{t('home.seeAll')} <IconChevronRight style={{ width: 14, height: 14, marginLeft: 2 }} /></Link>
          </div>
          {firstContinue && (
            <Link to={`/books/${firstContinue.id}`} className="kindle-continue-hero">
              <BookCover coverUrl={firstContinue.coverUrl} size="md" alt={firstContinue.title} />
              <div className="kindle-continue-hero__body">
                <span className="kindle-continue-hero__title">{firstContinue.title || t('reader.pageTitle')}</span>
                <span className="kindle-continue-hero__meta">
                  {Math.round(firstContinue.progressPct)}% {t('home.read')} · {firstContinue.page} / {firstContinue.totalPages}
                </span>
                <div className="kindle-continue-hero__progress">
                  <div className="kindle-continue-hero__progress-fill" style={{ width: `${firstContinue.progressPct}%` }} />
                </div>
                <span className="kindle-continue-hero__btn">{t('home.resume')}</span>
              </div>
            </Link>
          )}
          {continueReading.length > 1 && (
            <div className="continue-scroll">
              {continueReading.slice(1, 6).map((item) => (
                <Link key={item.id} to={`/books/${item.id}`} className="continue-card">
                  <BookCover coverUrl={item.coverUrl} size="md" alt={item.title} />
                  <div className="continue-card__body">
                    <span className="continue-card__title">{item.title || t('reader.pageTitle')}</span>
                    <span className="continue-card__meta">{Math.round(item.progressPct)}% · {item.page}/{item.totalPages}</span>
                    <div className="continue-card__progress">
                      <div className="continue-card__progress-fill" style={{ width: `${item.progressPct}%` }} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Kindle: Recommended for you */}
      <section className="home-section">
        <div className="section-head">
          <h2 className="section-title">{t('home.recommended')}</h2>
          <Link to="/books" className="section-link">{t('home.seeAll')} <IconChevronRight style={{ width: 14, height: 14, marginLeft: 2 }} /></Link>
        </div>
        <div className="top-books-row">
          {loading ? (
            <div className="skeleton-card" style={{ width: 100, minHeight: 150, borderRadius: 4 }} />
          ) : (
            topBooks.map((book) => (
              <Link key={book.id} to={`/books/${book.id}/detail`} className="top-book-card">
                <BookCover coverUrl={book.coverUrl} size="md" alt={book.title} />
                <span className="top-book-card__title">{book.title}</span>
                {book.price != null && <span className="top-book-card__price">${Number(book.price).toFixed(2)}</span>}
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Kindle: Categories / Browse – minimal */}
      <section className="home-section">
        <div className="section-head">
          <h2 className="section-title">{t('home.browseCategories')}</h2>
          <Link to="/category" className="section-link">{t('home.seeAll')} <IconChevronRight style={{ width: 14, height: 14, marginLeft: 2 }} /></Link>
        </div>
        <div className="cat-grid">
          <Link to="/books" className="cat-card">{t('books.all')}</Link>
          <Link to="/authors" className="cat-card">{t('home.authors')}</Link>
        </div>
      </section>
    </div>
  );
}
