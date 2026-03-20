import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import { useTelegram } from '../useTelegram';
import { IconSearch, IconBell } from '../components/Icons';
import { fetchBooks, fetchCategories } from '../api/content';
import BookCover from '../components/BookCover';

export default function Category() {
  const { t } = useLang();
  const { initData } = useTelegram();
  const [filter, setFilter] = useState('All');
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchBooks(initData), fetchCategories(initData)])
      .then(([b, cats]) => {
        if (cancelled) return;
        setBooks(b);
        setCategories(Array.isArray(cats) && cats.length ? cats : ['All']);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [initData]);

  const filteredBooks = filter === 'All' ? books : books.filter((b) => b.category === filter);

  return (
    <div className="content">
      <header className="category-header">
        <Link to="/search" className="category-header__icon" aria-label={t('home.search')}>
          <IconSearch style={{ width: 22, height: 22 }} />
        </Link>
        <h1 className="category-header__title">{t('category.title')}</h1>
        <Link to="/notifications" className="category-header__icon" aria-label="Notifications">
          <IconBell style={{ width: 22, height: 22 }} />
        </Link>
      </header>
      <div className="category-filters">
        {categories.map((c) => (
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
        {loading ? (
          <div className="category-grid skeleton-card" style={{ minHeight: 200 }} />
        ) : (
        filteredBooks.map((book) => (
          <Link key={book.id} to={`/books/${book.id}/detail`} className="category-book animate-fade-in-up">
            <BookCover coverUrl={book.coverUrl} size="md" alt={book.title} />
            <span className="category-book__title">{book.title}</span>
            <span className="category-book__price">${book.price.toFixed(2)}</span>
          </Link>
        ))
        )}
      </div>
    </div>
  );
}
