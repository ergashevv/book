import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { apiGet } from '../api';
import { useLang } from '../contexts/LangContext';

export default function Books({ initData }) {
  const { t } = useLang();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryId = searchParams.get('category_id');
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catLoading, setCatLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiGet('/categories', initData).then(setCategories).catch(() => {}).finally(() => setCatLoading(false));
  }, [initData]);

  useEffect(() => {
    const path = categoryId ? `/books?category_id=${categoryId}` : '/books';
    setLoading(true);
    apiGet(path, initData)
      .then(setBooks)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [initData, categoryId]);

  const setCategory = (id) => {
    if (id) setSearchParams({ category_id: id });
    else setSearchParams({});
  };

  return (
    <div className="app">
      <header className="header">
        <h1 style={{ flex: 1, margin: 0 }}>{t('books.title')}</h1>
      </header>
      <div className="content">
        {!catLoading && categories.length > 0 && (
          <div className="books-filters">
            <button
              type="button"
              className={`books-filter-btn ${!categoryId ? 'books-filter-btn--active' : ''}`}
              onClick={() => setCategory(null)}
            >
              {t('books.all')}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`books-filter-btn ${categoryId === String(cat.id) ? 'books-filter-btn--active' : ''}`}
                onClick={() => setCategory(cat.id)}
              >
                {cat.name_uz}
              </button>
            ))}
          </div>
        )}
        {loading && <p>{t('books.loading')}</p>}
        {error && <p style={{ color: 'var(--accent)' }}>{t('books.error')}: {error}</p>}
        {!loading && !error && books.length === 0 && (
          <p style={{ color: 'var(--muted)' }}>{t('books.noBooks')}</p>
        )}
        {books.map((book) => (
          <Link key={book.id} to={`/books/${book.id}`} style={{ display: 'block', marginBottom: 8, color: 'inherit' }}>
            <div className="card">
              <strong>{book.title}</strong>
              {book.author && <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: '0.9rem' }}>{book.author}</p>}
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--muted)' }}>
                {book.page_count ? `${book.page_count} ${t('books.pages')}` : ''} • {book.category_name}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
