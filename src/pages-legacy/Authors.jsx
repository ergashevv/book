import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IconSearch, IconArrowLeft } from '../components/Icons';
import { useTelegram } from '../useTelegram';
import { fetchAuthors } from '../api/content';

const AUTHOR_FILTERS = ['All', 'Poets', 'Playwrights', 'Novelists', 'Journalists'];

export default function Authors() {
  const [filter, setFilter] = useState('All');
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { initData } = useTelegram();

  useEffect(() => {
    let cancelled = false;
    fetchAuthors(initData)
      .then((list) => { if (!cancelled) setAuthors(list); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [initData]);

  return (
    <div className="content">
      <header className="page-header">
        <Link to="/" className="page-header__back"><IconArrowLeft style={{ width: 24, height: 24 }} /></Link>
        <h1 className="page-header__title">Authors</h1>
        <Link to="/search" className="page-header__icon"><IconSearch style={{ width: 22, height: 22 }} /></Link>
      </header>
      <div className="category-filters">
        {AUTHOR_FILTERS.map((c) => (
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
      <div className="authors-list">
        {loading ? (
          <div className="skeleton-card" style={{ minHeight: 80 }} />
        ) : (
        authors.map((a) => (
          <Link key={a.id} to={`/authors/${a.id}`} className="author-row">
            <div className="author-row__avatar" style={a.image ? { backgroundImage: `url(${a.image})`, backgroundSize: 'cover' } : {}} />
            <div className="author-row__body">
              <span className="author-row__name">{a.name}</span>
              <span className="author-row__bio">{a.bio || a.role}</span>
            </div>
            <span className="author-row__chevron">›</span>
          </Link>
        ))
        )}
      </div>
    </div>
  );
}
