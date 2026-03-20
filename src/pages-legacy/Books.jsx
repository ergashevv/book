import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { apiGet, getBookCoverUrl } from '../api';
import { fetchExploreFree } from '../api/exploreFree';
import { useLang } from '../contexts/LangContext';
import { useReading } from '../contexts/ReadingContext';
import BookCover from '../components/BookCover';
import { IconSearch, IconChevronRight } from '../components/Icons';
import { SkeletonBookList } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

const SORT_OPTIONS = [
  { id: 'recent', labelKey: 'library.sortRecent' },
  { id: 'az', labelKey: 'library.sortAZ' },
  { id: 'progress', labelKey: 'library.sortProgress' },
];

const FILTER_OPTIONS = [
  { id: 'all', labelKey: 'library.filterAll' },
  { id: 'reading', labelKey: 'library.filterReading' },
  { id: 'unread', labelKey: 'library.filterUnread' },
  { id: 'read', labelKey: 'library.filterRead' },
];

export default function Books({ initData }) {
  const { t } = useLang();
  const { getProgress } = useReading();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryId = searchParams.get('category_id');
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catLoading, setCatLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState(() => (typeof localStorage !== 'undefined' ? localStorage.getItem('libraryView') || 'grid' : 'grid'));
  const [sortBy, setSortBy] = useState('recent');
  const [filterBy, setFilterBy] = useState('all');
  const [exploreFree, setExploreFree] = useState({ gutendex: [], openLibrary: [], google: [] });

  useEffect(() => {
    let cancelled = false;
    fetchExploreFree().then((data) => { if (!cancelled) setExploreFree(data); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    apiGet('/categories', initData)
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.categories ?? res?.data ?? [];
        setCategories(Array.isArray(list) ? list : []);
      })
      .catch(() => {})
      .finally(() => setCatLoading(false));
  }, [initData]);

  useEffect(() => {
    const path = categoryId ? `/books?category_id=${categoryId}` : '/books';
    setLoading(true);
    apiGet(path, initData)
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.books ?? res?.data ?? [];
        setBooks(Array.isArray(list) ? list : []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [initData, categoryId]);

  const filteredBooks = useMemo(() => {
    let list = books;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = books.filter(
        (b) =>
          (b.title && b.title.toLowerCase().includes(q)) ||
          (b.author && b.author.toLowerCase().includes(q))
      );
    }
    const withProgress = list.map((b) => ({ ...b, reading: getProgress(b.id) }));
    let filtered = withProgress;
    if (filterBy === 'reading') {
      filtered = withProgress.filter((b) => {
        const pct = b.reading?.totalPages > 0 ? (b.reading.page / b.reading.totalPages) * 100 : 0;
        return pct > 0 && pct < 100;
      });
    } else if (filterBy === 'unread') {
      filtered = withProgress.filter((b) => {
        const pct = b.reading?.totalPages > 0 ? (b.reading.page / b.reading.totalPages) * 100 : 0;
        return pct === 0;
      });
    } else if (filterBy === 'read') {
      filtered = withProgress.filter((b) => {
        const pct = b.reading?.totalPages > 0 ? (b.reading.page / b.reading.totalPages) * 100 : 0;
        return pct >= 100;
      });
    }
    if (sortBy === 'az') return [...filtered].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    if (sortBy === 'progress') return [...filtered].sort((a, b) => {
      const pa = a.reading?.totalPages > 0 ? (a.reading.page / a.reading.totalPages) * 100 : 0;
      const pb = b.reading?.totalPages > 0 ? (b.reading.page / b.reading.totalPages) * 100 : 0;
      return pb - pa;
    });
    return [...filtered].sort((a, b) => (b.reading?.lastOpened ?? 0) - (a.reading?.lastOpened ?? 0));
  }, [books, searchQuery, sortBy, filterBy, getProgress]);

  const setCategory = (id) => {
    if (id) setSearchParams({ category_id: id });
    else setSearchParams({});
  };

  const toggleView = () => {
    const next = viewMode === 'list' ? 'grid' : 'list';
    setViewMode(next);
    if (typeof localStorage !== 'undefined') localStorage.setItem('libraryView', next);
  };

  return (
    <div className="content content--kindle">
      <div className="books-search-wrap">
        <span className="books-search-icon" aria-hidden>
          <IconSearch style={{ width: 20, height: 20 }} />
        </span>
        <input
          type="search"
          className="books-search-input"
          placeholder={t('books.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label={t('books.search')}
        />
      </div>

      {/* Kindle-style: All / Reading / Unread / Read */}
      <div className="library-filters-kindle">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={`library-filter-tab ${filterBy === opt.id ? 'library-filter-tab--active' : ''}`}
            onClick={() => setFilterBy(opt.id)}
          >
            {t(opt.labelKey)}
          </button>
        ))}
      </div>

      <div className="library-toolbar">
        <div className="library-sort">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`books-filter-btn ${sortBy === opt.id ? 'books-filter-btn--active' : ''}`}
              onClick={() => setSortBy(opt.id)}
            >
              {t(opt.labelKey)}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={`library-view-toggle ${viewMode}`}
          onClick={toggleView}
          aria-label={viewMode === 'list' ? t('library.gridView') : t('library.listView')}
          title={viewMode === 'list' ? t('library.gridView') : t('library.listView')}
        >
          <span className="library-view-icon library-view-icon--grid" aria-hidden>⊞</span>
          <span className="library-view-icon library-view-icon--list" aria-hidden>≡</span>
        </button>
      </div>

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
              key={typeof cat === 'object' ? cat.id : cat}
              type="button"
              className={`books-filter-btn ${categoryId === String(typeof cat === 'object' ? cat.id : cat) ? 'books-filter-btn--active' : ''}`}
              onClick={() => setCategory(typeof cat === 'object' ? cat.id : cat)}
            >
              {typeof cat === 'string' ? cat : (cat.name_uz ?? cat.name ?? cat.id ?? '')}
            </button>
          ))}
        </div>
      )}

      {(exploreFree.gutendex?.length > 0 || exploreFree.openLibrary?.length > 0 || exploreFree.google?.length > 0) && (
        <section className="home-section books-explore-free">
          <h2 className="section-title">{t('books.exploreFree')} · {t('books.freeBooks')}</h2>
          <div className="top-books-row top-books-row--scroll">
            {exploreFree.gutendex.slice(0, 6).map((book) => (
              <Link key={book.id} to={`/books/external/gutendex/${book.gutenbergId}/detail`} className="top-book-card">
                <BookCover coverUrl={book.coverUrl ?? book.cover_url} size="md" alt={book.title} />
                <span className="top-book-card__title">{book.title}</span>
                {book.author && <span className="top-book-card__author">{book.author}</span>}
              </Link>
            ))}
            {exploreFree.openLibrary.slice(0, 6).map((book) => (
              <Link key={book.id} to={`/books/external/openlibrary/${book.workKey}/detail`} className="top-book-card">
                <BookCover coverUrl={book.coverUrl ?? book.cover_url} size="md" alt={book.title} />
                <span className="top-book-card__title">{book.title}</span>
                {book.author && <span className="top-book-card__author">{book.author}</span>}
              </Link>
            ))}
            {exploreFree.google.slice(0, 6).map((book) => (
              <Link key={book.id} to={`/books/external/google/${book.volumeId}/detail`} className="top-book-card">
                <BookCover coverUrl={book.coverUrl ?? book.cover_url} size="md" alt={book.title} />
                <span className="top-book-card__title">{book.title}</span>
                {book.author && <span className="top-book-card__author">{book.author}</span>}
              </Link>
            ))}
          </div>
        </section>
      )}

      {loading && <SkeletonBookList count={5} />}
      {error && <p className="home-error">{t('books.error')}: {error}</p>}
      {!loading && !error && filteredBooks.length === 0 && (
        <EmptyState
          message={searchQuery.trim() ? t('books.noResults') : t('books.noBooks')}
        >
          {searchQuery.trim() && (
            <button type="button" className="btn btn-secondary" onClick={() => setSearchQuery('')}>
              {t('books.all')}
            </button>
          )}
        </EmptyState>
      )}
      {!loading && !error && filteredBooks.length > 0 && (
        <div className={viewMode === 'grid' ? 'book-grid' : 'book-list'}>
          {filteredBooks.map((book) => {
            const prog = book.reading;
            const pct = prog?.totalPages > 0 ? Math.round((prog.page / prog.totalPages) * 100) : 0;
            return (
              <Link key={book.id} to={`/books/${book.id}/detail`} className={viewMode === 'grid' ? 'book-grid-card' : 'book-card'}>
                <div className="book-card__cover-wrap">
                  <BookCover coverUrl={getBookCoverUrl(book, initData)} size={viewMode === 'grid' ? 'cover' : 'sm'} alt={book.title} />
                  {pct > 0 && pct < 100 && (
                    <div className="book-card__progress" title={`${pct}%`}>
                      <div className="book-card__progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  )}
                </div>
                <div className="book-card__body">
                  <h3 className="book-card__title">{book.title}</h3>
                  {book.author && <p className="book-card__author">{book.author}</p>}
                  <p className="book-card__meta">
                    {book.page_count ? <span>{book.page_count} {t('books.pages')}</span> : null}
                    {pct > 0 && <span className="book-card__progress-pct">{pct}%</span>}
                    {book.category_name && <span className="book-card__category">{book.category_name}</span>}
                  </p>
                </div>
                {viewMode === 'list' && (
                  <span className="book-card__chevron" aria-hidden>
                    <IconChevronRight style={{ width: 20, height: 20 }} />
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
