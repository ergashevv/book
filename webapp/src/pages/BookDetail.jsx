import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { apiGet, getBookCoverUrl } from '../api';
import { useLang } from '../contexts/LangContext';
import { useCart } from '../contexts/CartContext';
import BookCover from '../components/BookCover';
import { IconArrowLeft, IconHeart } from '../components/Icons';
import Spinner from '../components/Spinner';
import { SkeletonBookDetail } from '../components/Skeleton';
import { MOCK_BOOKS, MOCK_VENDORS } from '../data/mock';

export default function BookDetail({ initData }) {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { t } = useLang();
  const { addItem } = useCart();
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

  const handleAddToCart = () => {
    addItem({ id: displayBook.id, title: displayBook.title, price, coverUrl }, quantity);
  };

  return (
    <div className="content">
      <header className="page-header">
        <button type="button" className="page-header__back" onClick={() => navigate(-1)}><IconArrowLeft style={{ width: 24, height: 24 }} /></button>
        <h1 className="page-header__title page-header__title--ellipsis">{displayBook?.title}</h1>
        <button type="button" className="page-header__icon" aria-label="Favorite"><IconHeart style={{ width: 22, height: 22 }} /></button>
      </header>
      <div className="book-detail book-detail--commerce">
        <BookCover coverUrl={coverUrl} size="lg" alt={displayBook?.title} className="book-detail__cover" />
        <h2 className="book-detail__title">{displayBook?.title}</h2>
        {vendor && <p className="book-detail__vendor">Vendor: {vendor.name}</p>}
        <p className="book-detail__meta">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        <div className="book-detail__review">Review ★ 4.0 (44)</div>
        <div className="book-detail__purchase">
          <div className="book-detail__qty">
            <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
            <span>{quantity}</span>
            <button type="button" onClick={() => setQuantity((q) => q + 1)}>+</button>
          </div>
          <span className="book-detail__price">${(price * quantity).toFixed(2)}</span>
        </div>
        <button type="button" className="btn book-detail__btn" onClick={handleAddToCart}>Continue shopping</button>
        <Link to="/cart" className="btn btn-secondary book-detail__btn">View cart</Link>
        {displayBook?.id && (
          <Link to={`/books/${displayBook.id}`} className="btn btn-secondary book-detail__btn" style={{ marginTop: 8 }}>
            {t('bookDetail.read')}
          </Link>
        )}
      </div>
    </div>
  );
}
