import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { apiGet, getBookCoverUrl } from '../api';
import { useLang } from '../contexts/LangContext';
import { useCart } from '../contexts/CartContext';
import { useReading } from '../contexts/ReadingContext';
import BookCover from '../components/BookCover';
import { IconArrowLeft, IconHeart } from '../components/Icons';
import Spinner from '../components/Spinner';
import { SkeletonBookDetail } from '../components/Skeleton';
import { MOCK_BOOKS, MOCK_VENDORS } from '../mock';

export default function BookDetail({ initData }) {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { t } = useLang();
  const { addItem } = useCart();
  const { getProgress } = useReading();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!bookId) return;
    apiGet(`/books/${bookId}`, initData)
      .then(setBook)
      .catch(() => {
        const mock = MOCK_BOOKS.find((b) => b.id === bookId);
        if (mock) setBook({ ...mock, id: mock.id, title: mock.title, author: mock.author, cover_url: mock.coverUrl });
        else setError('Book not found');
      })
      .finally(() => setLoading(false));
  }, [bookId, initData]);

  if (loading && !book) {
    return (
      <div className="content">
        <SkeletonBookDetail />
      </div>
    );
  }

  const displayBook = book || MOCK_BOOKS.find((b) => b.id === bookId);
  const vendor = displayBook?.vendorId ? MOCK_VENDORS.find((v) => v.id === displayBook.vendorId) : null;
  const price = displayBook?.price ?? 99.99;

  if (error && !displayBook) {
    return (
      <div className="content">
        <Link to="/books" className="back-link">
          <IconArrowLeft style={{ width: 18, height: 18, verticalAlign: 'middle', marginRight: 4 }} />
          {t('bookDetail.back')}
        </Link>
        <div className="card card--static error-card">
          <p className="home-error">{error}</p>
          <Link to="/books" className="btn btn-secondary" style={{ marginTop: 12 }}>{t('bookDetail.back')}</Link>
        </div>
      </div>
    );
  }

  const coverUrl = displayBook?.cover_url ?? displayBook?.coverUrl ?? (initData && displayBook ? getBookCoverUrl(displayBook, initData) : null);
  const progress = displayBook?.id ? getProgress(displayBook.id) : null;
  const progressPct = progress?.totalPages > 0 ? (progress.page / progress.totalPages) * 100 : 0;
  const hasStarted = progressPct > 0 && progressPct < 100;
  const isFinished = progressPct >= 100;

  const handleAddToCart = () => {
    addItem({ id: displayBook.id, title: displayBook.title, price, coverUrl }, quantity);
  };

  return (
    <div className="content content--kindle">
      <header className="page-header page-header--kindle">
        <button type="button" className="page-header__back" onClick={() => navigate(-1)} aria-label={t('bookDetail.back')}><IconArrowLeft style={{ width: 24, height: 24 }} /></button>
        <h1 className="page-header__title page-header__title--ellipsis">{displayBook?.title}</h1>
        <button type="button" className="page-header__icon" aria-label={t('bookDetail.favorite')}><IconHeart style={{ width: 22, height: 22 }} /></button>
      </header>
      <div className="book-detail book-detail--kindle">
        <BookCover coverUrl={coverUrl} size="lg" alt={displayBook?.title} className="book-detail__cover book-detail__cover--kindle" />
        <h2 className="book-detail__title book-detail__title--kindle">{displayBook?.title}</h2>
        {(displayBook?.author || vendor) && (
          <p className="book-detail__author book-detail__author--kindle">{displayBook?.author || (vendor && vendor.name)}</p>
        )}
        {hasStarted && progress && (
          <p className="book-detail__progress-line">{Math.round(progressPct)}% {t('home.read')} · {progress.page} / {progress.totalPages}</p>
        )}
        <div className="book-detail__actions book-detail__actions--kindle">
          {displayBook?.id && (
            <Link to={`/books/${displayBook.id}`} className="btn book-detail__btn book-detail__btn--primary">
              {hasStarted ? t('home.resume') : t('home.startReading')}
            </Link>
          )}
          <button type="button" className="btn btn-secondary book-detail__btn" onClick={handleAddToCart}>{t('bookDetail.addToCart')}</button>
          <Link to="/cart" className="btn btn-secondary book-detail__btn">{t('bookDetail.viewCart')}</Link>
        </div>
        <div className="book-detail__about">
          <h3 className="book-detail__about-title">{t('bookDetail.about')}</h3>
          <p className="book-detail__about-text">{displayBook?.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'}</p>
        </div>
        {vendor && <p className="book-detail__vendor book-detail__vendor--kindle">{vendor.name}</p>}
      </div>
    </div>
  );
}
