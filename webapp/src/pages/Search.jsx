import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IconArrowLeft } from '../components/Icons';
import { MOCK_BOOKS } from '../data/mock';

const RECENT_KEY = 'search_recent';

function getRecent() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function addRecent(query) {
  if (!query.trim()) return;
  const prev = getRecent().filter((q) => q !== query.trim());
  const next = [query.trim(), ...prev].slice(0, 10);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

export default function Search() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [recent, setRecent] = useState(getRecent());
  const results = q.trim() ? MOCK_BOOKS.filter((b) => b.title.toLowerCase().includes(q.toLowerCase()) || (b.author && b.author.toLowerCase().includes(q.toLowerCase()))) : [];

  useEffect(() => {
    setRecent(getRecent());
  }, []);

  const handleSearch = (term) => {
    const t = term || q;
    if (t.trim()) {
      addRecent(t.trim());
      setRecent(getRecent());
    }
  };

  return (
    <div className="content">
      <header className="page-header">
        <button type="button" className="page-header__back" onClick={() => navigate(-1)}><IconArrowLeft style={{ width: 24, height: 24 }} /></button>
        <h1 className="page-header__title">Search</h1>
      </header>
      <div className="search-bar-wrap">
        <input
          type="search"
          className="search-bar"
          placeholder="Search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
      </div>
      {!q.trim() && (
        <section className="search-recent">
          <h3 className="section-title">Recent Searches</h3>
          {recent.map((term) => (
            <button key={term} type="button" className="search-recent-item" onClick={() => { setQ(term); handleSearch(term); }}>
              {term}
            </button>
          ))}
        </section>
      )}
      {q.trim() && (
        <div className="search-results">
          {results.length === 0 ? (
            <p className="muted">No results for &quot;{q}&quot;</p>
          ) : (
            results.map((book) => (
              <Link key={book.id} to={`/books/${book.id}/detail`} className="book-card">
                <BookCover coverUrl={book.coverUrl} size="sm" alt="" />
                <div className="book-card__body">
                  <span className="book-card__title">{book.title}</span>
                  <span className="book-card__author">{book.author}</span>
                  <span className="book-card__meta">${book.price.toFixed(2)}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
