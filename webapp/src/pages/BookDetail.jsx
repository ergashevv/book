import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { apiGet, getBookCoverUrl } from '../api';
import { useLang } from '../contexts/LangContext';
import BookCover from '../components/BookCover';
import { IconArrowLeft } from '../components/Icons';
import Spinner from '../components/Spinner';
import { SkeletonBookDetail } from '../components/Skeleton';

export default function BookDetail({ initData }) {
  const { bookId } = useParams();
  const { t } = useLang();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!bookId) return;
    apiGet(`/books/${bookId}`, initData)
      .then(setBook)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [bookId, initData]);

  if (loading) {
    return (
      <div className="content">
        <SkeletonBookDetail />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="content">
        <Link to="/books" className="back-link">
          <IconArrowLeft style={{ width: 18, height: 18, verticalAlign: 'middle', marginRight: 4 }} />
          {t('bookDetail.back')}
        </Link>
        <div className="card card--static error-card">
          <p className="home-error">{error || 'Book not found'}</p>
          <Link to="/books" className="btn btn-secondary" style={{ marginTop: 12 }}>{t('bookDetail.back')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="content">
      <Link to="/books" className="back-link">
        <IconArrowLeft style={{ width: 18, height: 18, verticalAlign: 'middle', marginRight: 4 }} />
        {t('bookDetail.back')}
      </Link>
      <div className="book-detail">
        <BookCover coverUrl={getBookCoverUrl(book, initData)} size="lg" alt={book.title} className="book-detail__cover" />
        <h1 className="book-detail__title">{book.title}</h1>
        {book.author && <p className="book-detail__author">{book.author}</p>}
        {book.page_count > 0 && (
          <p className="book-detail__meta">
            {book.page_count} {t('bookDetail.pages')}
            {book.category_name && ` • ${book.category_name}`}
          </p>
        )}
        <Link to={`/books/${book.id}`} className="btn book-detail__btn">
          {t('bookDetail.read')}
        </Link>
      </div>
    </div>
  );
}
