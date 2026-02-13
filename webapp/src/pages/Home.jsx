import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { apiGet } from '../api';

export default function Home({ user, initData, isDev }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiGet('/categories', initData)
      .then(setCategories)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [initData]);

  return (
    <div className="app">
      <header className="header">
        <h1>📚 Kitobxona</h1>
      </header>
      <div className="content">
        {/* Profile */}
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Profil</h3>
          {user && (
            <p>
              {user.first_name} {user.last_name || ''}
              {user.username && ` @${user.username}`}
            </p>
          )}
          {isDev && <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Dev rejim</p>}
        </div>

        {/* Kategoriyalar */}
        <h3>Kategoriyalar</h3>
        {loading && <p>Yuklanmoqda...</p>}
        {error && <p style={{ color: 'var(--accent)' }}>Xatolik: {error}</p>}
        {!loading && !error && categories.length === 0 && (
          <p style={{ color: 'var(--muted)' }}>Hali kategoriya yoʻq. Admin paneldan qoʻshing.</p>
        )}
        {categories.map((cat) => (
          <Link key={cat.id} to={`/books?category_id=${cat.id}`} style={{ display: 'block', marginBottom: 8 }}>
            <div className="card" style={{ cursor: 'pointer' }}>
              {cat.name_uz}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
