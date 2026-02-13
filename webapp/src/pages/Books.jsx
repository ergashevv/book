import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { apiGet } from '../api';
import { useLang } from '../contexts/LangContext';
import BookCover from '../components/BookCover';
import { IconSearch } from '../components/Icons';
import { SkeletonBookList } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { IconChevronRight } from '../components/Icons';

export default function Books({ initData }) {
  const { t } = useLang();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryId = searchParams.get('category_id');
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catLoading, setCatLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredBooks = useMemo(() => {
    if (!searchQuery.trim()) return books;
    const q = searchQuery.trim().toLowerCase();
    return books.filter(
      (b) =>
        (b.title && b.title.toLowerCase().includes(q)) ||
        (b.author && b.author.toLowerCase().includes(q))
    );
  }, [books, searchQuery]);

  const setCategory = (id) => {
    if (id) setSearchParams({ category_id: id });
    else setSearchParams({});
  };

  return (
    <div className="content">
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
        <div className="book-list">
          {filteredBooks.map((book) => (
            <Link key={book.id} to={`/books/${book.id}/detail`} className="book-card">
              <BookCover coverUrl={book.cover_url} size="sm" alt={book.title} />
              <div className="book-card__body">
                <h3 className="book-card__title">{book.title}</h3>
                {book.author && <p className="book-card__author">{book.author}</p>}
                <p className="book-card__meta">
                  {book.page_count ? `${book.page_count} ${t('books.pages')}` : ''}
                  {book.page_count && book.category_name ? ' • ' : ''}
                  {book.category_name}
                </p>
              </div>
              <span className="book-card__chevron" aria-hidden>
                <IconChevronRight style={{ width: 20, height: 20 }} />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
