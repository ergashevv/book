import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { apiGet } from '../api';

export default function Books({ initData }) {
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('category_id');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const path = categoryId ? `/books?category_id=${categoryId}` : '/books';
    apiGet(path, initData)
      .then(setBooks)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [initData, categoryId]);

  return (
    <div className="app">
      <header className="header">
        <Link to="/" style={{ color: 'var(--text)' }}>← Orqaga</Link>
        <h1 style={{ flex: 1, textAlign: 'center', margin: 0 }}>Kitoblar</h1>
        <span style={{ width: 48 }} />
      </header>
      <div className="content">
        {loading && <p>Yuklanmoqda...</p>}
        {error && <p style={{ color: 'var(--accent)' }}>Xatolik: {error}</p>}
        {!loading && !error && books.length === 0 && (
          <p style={{ color: 'var(--muted)' }}>Bu boʻlimda hali kitob yoʻq.</p>
        )}
        {books.map((book) => (
          <Link key={book.id} to={`/books/${book.id}`} style={{ display: 'block', marginBottom: 8, color: 'inherit' }}>
            <div className="card">
              <strong>{book.title}</strong>
              {book.author && <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: '0.9rem' }}>{book.author}</p>}
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--muted)' }}>
                {book.page_count ? `${book.page_count} sahifa` : ''} • {book.category_name}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
