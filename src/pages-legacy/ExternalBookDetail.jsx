import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getGoogleVolume } from '../api/googleBooks';
import { getOpenLibraryWork } from '../api/openLibrary';
import { getItBookstoreBook } from '../api/itBookstore';
import { getGutendexBook } from '../api/gutendex';
import { useLang } from '../contexts/LangContext';
import BookCover from '../components/BookCover';
import { IconArrowLeft } from '../components/Icons';
import { SkeletonBookDetail } from '../components/Skeleton';

const SOURCE_FETCH = {
  google: getGoogleVolume,
  openlibrary: getOpenLibraryWork,
  itbookstore: (id) => getItBookstoreBook(decodeURIComponent(id)),
  gutendex: (id) => getGutendexBook(id.replace(/^gutenberg_/, '')),
};

const SOURCE_LABEL_KEYS = {
  google: 'books.googleBooks',
  openlibrary: 'books.openLibrary',
  itbookstore: 'books.itBookstore',
  gutendex: 'books.gutendex',
};

const VIEW_ON_KEYS = {
  google: 'bookDetail.viewOnGoogleBooks',
  openlibrary: 'bookDetail.viewOnOpenLibrary',
  itbookstore: 'bookDetail.viewOnItBookstore',
  gutendex: 'bookDetail.viewOnGutendex',
};

export default function ExternalBookDetail() {
  const { source, id } = useParams();
  const navigate = useNavigate();
  const { t } = useLang();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchFn = source ? SOURCE_FETCH[source.toLowerCase()] : null;

  useEffect(() => {
    if (!source || !id || !fetchFn) {
      setError(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    Promise.resolve(fetchFn(id))
      .then((data) => { setBook(data || null); })
      .catch(() => { setError(true); })
      .finally(() => { setLoading(false); });
  }, [source, id]);

  if (loading && !book) {
    return (
      <div className="content content--kindle">
        <SkeletonBookDetail />
      </div>
    );
  }

  const sourceLabel = source ? t(SOURCE_LABEL_KEYS[source.toLowerCase()] || 'books.googleBooks') : '';
  const viewOnLabel = source ? t(VIEW_ON_KEYS[source.toLowerCase()] || 'bookDetail.viewOnGoogleBooks') : '';

  if (error || !book) {
    return (
      <div className="content content--kindle">
        <header className="page-header page-header--kindle">
          <button type="button" className="page-header__back" onClick={() => navigate(-1)} aria-label={t('bookDetail.back')}>
            <IconArrowLeft style={{ width: 24, height: 24 }} />
          </button>
          <h1 className="page-header__title">{sourceLabel}</h1>
        </header>
        <div className="card card--static">
          <p className="home-error">{t('books.noResultsGoogle')}</p>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>{t('bookDetail.back')}</button>
        </div>
      </div>
    );
  }

  const coverUrl = book.cover_url ?? book.coverUrl;

  return (
    <div className="content content--kindle">
      <header className="page-header page-header--kindle">
        <button type="button" className="page-header__back" onClick={() => navigate(-1)} aria-label={t('bookDetail.back')}>
          <IconArrowLeft style={{ width: 24, height: 24 }} />
        </button>
        <h1 className="page-header__title page-header__title--ellipsis">{book.title}</h1>
      </header>
      <div className="book-detail book-detail--kindle">
        <BookCover coverUrl={coverUrl} size="lg" alt={book.title} className="book-detail__cover book-detail__cover--kindle" />
        <h2 className="book-detail__title book-detail__title--kindle">{book.title}</h2>
        {book.author && <p className="book-detail__author book-detail__author--kindle">{book.author}</p>}
        {book.page_count && <p className="book-detail__meta book-detail__meta--kindle">{book.page_count} {t('bookDetail.pages')}</p>}
        {book.price && <p className="book-detail__meta book-detail__meta--kindle">{book.price}</p>}
        <div className="book-detail__actions book-detail__actions--kindle">
          {book.infoLink && (
            <a href={book.infoLink} target="_blank" rel="noopener noreferrer" className="btn book-detail__btn book-detail__btn--primary">
              {viewOnLabel}
            </a>
          )}
        </div>
        <div className="book-detail__about">
          <h3 className="book-detail__about-title">{t('bookDetail.about')}</h3>
          <p className="book-detail__about-text">{book.description || t('books.noResultsGoogle')}</p>
        </div>
      </div>
    </div>
  );
}
