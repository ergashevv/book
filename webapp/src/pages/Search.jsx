import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IconArrowLeft } from '../components/Icons';
import { useTelegram } from '../useTelegram';
import { useLang } from '../contexts/LangContext';
import { fetchBooks } from '../api/content';
import { searchAllSources } from '../api/bookSearchAll';
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

function SearchSection({ title, loading, items, emptyMsg, t, linkTo, sourceLabel, externalLink }) {
  if (loading) return (<section className="search-results-section"><h3 className="section-title">{title}</h3><div className="skeleton-card" style={{ minHeight: 80 }} /></section>);
  if (!items?.length) return (<section className="search-results-section"><h3 className="section-title">{title}</h3><p className="muted">{emptyMsg}</p></section>);
  const to = linkTo;
  return (
    <section className="search-results-section">
      <h3 className="section-title">{title}</h3>
      <div className="book-list book-list--search">
        {items.map((book) => {
          const href = to(book);
          const content = (
            <>
              <BookCover coverUrl={book.coverUrl ?? book.cover_url} size="sm" alt={book.title} />
              <div className="book-card__body">
                <span className="book-card__title">{book.title}</span>
                {book.author && <span className="book-card__author">{book.author}</span>}
                <span className="book-card__meta book-card__meta--source">{sourceLabel}</span>
              </div>
            </>
          );
          if (externalLink && href) return (<a key={book.id} href={href} target="_blank" rel="noopener noreferrer" className="book-card">{content}</a>);
          return (<Link key={book.id} to={href} className="book-card">{content}</Link>);
        })}
      </div>
    </section>
  );
}

export default function Search() {
  const navigate = useNavigate();
  const { t } = useLang();
  const { initData } = useTelegram();
  const [q, setQ] = useState('');
  const [recent, setRecent] = useState(getRecent());
  const [allBooks, setAllBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [externalLoading, setExternalLoading] = useState(false);
  const [external, setExternal] = useState({
    google: [],
    openLibrary: [],
    itBookstore: [],
    isbndb: [],
    hardcover: [],
    gutendex: [],
    isbndbHasKey: false,
    hardcoverHasKey: false,
  });

  useEffect(() => {
    let cancelled = false;
    fetchBooks(initData).then((list) => { if (!cancelled) setAllBooks(list); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [initData]);

  useEffect(() => {
    const term = q.trim();
    if (!term || term.length < 2) {
      setExternal((prev) => ({ ...prev, google: [], openLibrary: [], itBookstore: [], isbndb: [], hardcover: [], gutendex: [] }));
      setExternalLoading(false);
      return;
    }
    setExternalLoading(true);
    const tId = setTimeout(() => {
      searchAllSources(term)
        .then((data) => { setExternal(data); })
        .catch(() => { setExternal({ google: [], openLibrary: [], itBookstore: [], isbndb: [], hardcover: [], gutendex: [], isbndbHasKey: false, hardcoverHasKey: false }); })
        .finally(() => { setExternalLoading(false); });
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
              {results.length === 0 && !externalLoading && [external.google, external.openLibrary, external.itBookstore, external.isbndb, external.hardcover, external.gutendex].every((arr) => !arr?.length) && (
                <p className="muted">{t('books.noResults')} &quot;{q}&quot;</p>
              )}

              {/* Google Books */}
              <SearchSection title={t('books.googleBooks')} loading={externalLoading} items={external.google} emptyMsg={t('books.noResultsGoogle')} t={t} linkTo={(book) => `/books/external/google/${book.volumeId}/detail`} sourceLabel={t('books.googleResults')} />
              {/* Open Library */}
              <SearchSection title={t('books.openLibrary')} loading={externalLoading} items={external.openLibrary} emptyMsg={t('books.noResultsOpenLibrary')} t={t} linkTo={(book) => `/books/external/openlibrary/${book.workKey}/detail`} sourceLabel={t('books.openLibraryResults')} />
              {/* IT Bookstore */}
              <SearchSection title={t('books.itBookstore')} loading={externalLoading} items={external.itBookstore} emptyMsg={t('books.noResultsItBookstore')} t={t} linkTo={(book) => `/books/external/itbookstore/${encodeURIComponent(book.isbn13)}/detail`} sourceLabel={t('books.itBookstoreResults')} />
              {/* ISBNdb */}
              {external.isbndbHasKey && <SearchSection title={t('books.isbndb')} loading={externalLoading} items={external.isbndb} emptyMsg={t('books.noResultsIsbndb')} t={t} linkTo={(book) => book.infoLink} externalLink sourceLabel={t('books.isbndbResults')} />}
              {!external.isbndbHasKey && q.trim().length >= 2 && <section className="search-results-section"><h3 className="section-title">{t('books.isbndb')}</h3><p className="muted">{t('books.isbndbNeedKey')}</p></section>}
              {/* Hardcover */}
              {external.hardcoverHasKey && <SearchSection title={t('books.hardcover')} loading={externalLoading} items={external.hardcover} emptyMsg={t('books.noResultsHardcover')} t={t} linkTo={(book) => book.infoLink} externalLink sourceLabel={t('books.hardcoverResults')} />}
              {!external.hardcoverHasKey && q.trim().length >= 2 && <section className="search-results-section"><h3 className="section-title">{t('books.hardcover')}</h3><p className="muted">{t('books.hardcoverNeedKey')}</p></section>}
              {/* Gutendex */}
              <SearchSection title={t('books.gutendex')} loading={externalLoading} items={external.gutendex} emptyMsg={t('books.noResultsGutendex')} t={t} linkTo={(book) => `/books/external/gutendex/${book.gutenbergId}/detail`} sourceLabel={t('books.gutendexResults')} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
