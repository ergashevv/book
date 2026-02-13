import { useState } from 'react';
import { Link } from 'react-router-dom';
import { IconSearch, IconBell } from '../components/Icons';
import { MOCK_BOOKS, CATEGORIES } from '../mock';
import BookCover from '../components/BookCover';

export default function Category() {
  const [filter, setFilter] = useState('All');
  const books = filter === 'All' ? MOCK_BOOKS : MOCK_BOOKS.filter((b) => b.category === filter);

  return (
    <div className="content">
      <header className="category-header">
        <Link to="/search" className="category-header__icon" aria-label="Search">
          <IconSearch style={{ width: 22, height: 22 }} />
        </Link>
        <h1 className="category-header__title">Category</h1>
        <Link to="/notifications" className="category-header__icon" aria-label="Notifications">
          <IconBell style={{ width: 22, height: 22 }} />
        </Link>
      </header>
      <div className="category-filters">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            className={`books-filter-btn ${c === filter ? 'books-filter-btn--active' : ''}`}
            onClick={() => setFilter(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="category-grid">
        {books.map((book) => (
          <Link key={book.id} to={`/books/${book.id}/detail`} className="category-book">
            <BookCover coverUrl={book.coverUrl} size="md" alt="" />
            <span className="category-book__title">{book.title}</span>
            <span className="category-book__price">${book.price.toFixed(2)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
