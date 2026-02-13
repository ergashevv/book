import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IconArrowLeft } from '../components/Icons';
import { useTelegram } from '../useTelegram';
import { useLang } from '../contexts/LangContext';
import { fetchBooks } from '../api/content';
import { searchGoogleBooks } from '../api/googleBooks';
import BookCover from '../components/BookCover';

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

const DEBOUNCE_MS = 400;

export default function Search() {
  const navigate = useNavigate();
  const { t } = useLang();
  const { initData } = useTelegram();
  const [q, setQ] = useState('');
  const [recent, setRecent] = useState(getRecent());
  const [allBooks, setAllBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [googleResults, setGoogleResults] = useState([]);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchBooks(initData).then((list) => { if (!cancelled) setAllBooks(list); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [initData]);

  useEffect(() => {
    const term = q.trim();
    if (!term || term.length < 2) {
      setGoogleResults([]);
      setGoogleLoading(false);
      return;
    }
    setGoogleLoading(true);
    const tId = setTimeout(() => {
      searchGoogleBooks(term, { maxResults: 15 })
        .then(({ items }) => { setGoogleResults(items || []); })
        .catch(() => { setGoogleResults([]); })
        .finally(() => { setGoogleLoading(false); });
    }, DEBOUNCE_MS);
    return () => clearTimeout(tId);
  }, [q]);

  const results = q.trim()
    ? allBooks.filter((b) => (b.title && b.title.toLowerCase().includes(q.toLowerCase())) || (b.author && b.author.toLowerCase().includes(q.toLowerCase())))
    : [];

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
          {/* Kutubxonada */}
          {loading ? (
            <div className="skeleton-card" style={{ minHeight: 100 }} />
          ) : (
            <>
              {results.length > 0 && (
                <section className="search-results-section">
                  <h3 className="section-title">{t('books.libraryResults')}</h3>
                  <div className="book-list book-list--search">
                    {results.map((book) => (
                      <Link key={book.id} to={`/books/${book.id}/detail`} className="book-card">
                        <BookCover coverUrl={book.coverUrl ?? book.cover_url} size="sm" alt={book.title} />
                        <div className="book-card__body">
                          <span className="book-card__title">{book.title}</span>
                          {book.author && <span className="book-card__author">{book.author}</span>}
                          {typeof book.price === 'number' && <span className="book-card__meta">${book.price.toFixed(2)}</span>}
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
              {results.length === 0 && !googleLoading && googleResults.length === 0 && (
                <p className="muted">{t('books.noResults')} &quot;{q}&quot;</p>
              )}

              {/* Google Books */}
              <section className="search-results-section search-results-section--google">
                <h3 className="section-title">{t('books.googleBooks')}</h3>
                {googleLoading ? (
                  <div className="skeleton-card" style={{ minHeight: 80 }} />
                ) : googleResults.length === 0 ? (
                  <p className="muted">{t('books.noResultsGoogle')}</p>
                ) : (
                  <div className="book-list book-list--search">
                    {googleResults.map((book) => (
                      <Link key={book.id} to={`/books/google/${book.volumeId}/detail`} className="book-card">
                        <BookCover coverUrl={book.coverUrl ?? book.cover_url} size="sm" alt={book.title} />
                        <div className="book-card__body">
                          <span className="book-card__title">{book.title}</span>
                          {book.author && <span className="book-card__author">{book.author}</span>}
                          <span className="book-card__meta book-card__meta--source">{t('books.googleResults')}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      )}
    </div>
  );
}
