import { Link } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import { MOCK_BOOKS, MOCK_VENDORS, MOCK_AUTHORS } from '../mock';
import { IconSearch, IconChevronRight } from '../components/Icons';
import BookCover from '../components/BookCover';

export default function HomeNew() {
  const { t } = useLang();
  const topBooks = MOCK_BOOKS.slice(0, 3);
  const vendors = MOCK_VENDORS.slice(0, 6);
  const authors = MOCK_AUTHORS.slice(0, 3);

  return (
    <div className="content">
      <Link to="/search" className="home-search-bar" aria-label="Search">
        <IconSearch style={{ width: 20, height: 20 }} />
        <span>Search</span>
      </Link>

      <Link to="/books/4/detail" className="banner banner--offer">
        <div className="banner__inner">
          <span className="banner__tag">Special Offer</span>
          <h2 className="banner__title">Discount 20%</h2>
          <span className="banner__cta">Order Now</span>
        </div>
        <div className="banner__book">APOLLO</div>
      </Link>

      <section className="home-section">
        <div className="section-head">
          <h3 className="section-title">Top of Week</h3>
          <Link to="/books" className="section-link">See all <IconChevronRight style={{ width: 16, height: 16, marginLeft: 2 }} /></Link>
        </div>
        <div className="top-books-row">
          {topBooks.map((book) => (
            <Link key={book.id} to={`/books/${book.id}/detail`} className="top-book-card">
              <BookCover coverUrl={book.coverUrl} size="md" alt="" />
              <span className="top-book-card__title">{book.title}</span>
              <span className="top-book-card__price">${book.price.toFixed(2)}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="section-head">
          <h3 className="section-title">Best Vendors</h3>
          <Link to="/vendors" className="section-link">See all <IconChevronRight style={{ width: 16, height: 16, marginLeft: 2 }} /></Link>
        </div>
        <div className="vendors-row">
          {vendors.map((v) => (
            <Link key={v.id} to={`/vendors/${v.id}`} className="vendor-chip">
              <span className="vendor-chip__name">{v.name}</span>
              <span className="vendor-chip__stars">★ {v.rating}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="section-head">
          <h3 className="section-title">Authors</h3>
          <Link to="/authors" className="section-link">See all <IconChevronRight style={{ width: 16, height: 16, marginLeft: 2 }} /></Link>
        </div>
        <div className="authors-row">
          {authors.map((a) => (
            <Link key={a.id} to={`/authors/${a.id}`} className="author-card">
              <div className="author-card__avatar" />
              <span className="author-card__name">{a.name}</span>
              <span className="author-card__role">{a.role}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
