import { Link } from 'react-router-dom';
import { IconArrowLeft, IconHeart } from '../components/Icons';
import { MOCK_BOOKS } from '../mock';
import BookCover from '../components/BookCover';

const favorites = MOCK_BOOKS.slice(0, 3).map((b, i) => ({ ...b, price: 19.99 + i * 2 }));

export default function Favorites() {
  return (
    <div className="content">
      <header className="page-header">
        <Link to="/profile" className="page-header__back"><IconArrowLeft style={{ width: 24, height: 24 }} /></Link>
        <h1 className="page-header__title">Your Favorites</h1>
      </header>
      <div className="favorites-list">
        {favorites.map((item) => (
          <div key={item.id} className="favorite-item">
            <BookCover coverUrl={item.coverUrl} size="sm" alt="" />
            <div className="favorite-item__body">
              <span className="favorite-item__title">In in amet ultrices sit.</span>
              <span className="favorite-item__price">${item.price.toFixed(2)}</span>
            </div>
            <button type="button" className="favorite-item__heart" aria-label="Remove"><IconHeart style={{ width: 22, height: 22 }} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
