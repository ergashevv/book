import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { apiGet } from '../api';
import { useLang } from '../contexts/LangContext';

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
        <p className="muted">{t('books.loading')}</p>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="content">
        <Link to="/books" className="back-link">← {t('bookDetail.back')}</Link>
        <div className="card">
          <p className="home-error">{error || 'Book not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="content">
      <Link to="/books" className="back-link">← {t('bookDetail.back')}</Link>
      <div className="book-detail">
        <div className="book-detail__cover">📕</div>
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
