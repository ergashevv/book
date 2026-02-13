import { Link } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import { MOCK_BOOKS, MOCK_VENDORS, MOCK_AUTHORS, BANNER_SPECIAL_IMAGE } from '../mock';
import { IconSearch, IconChevronRight } from '../components/Icons';
import BookCover from '../components/BookCover';

export default function HomeNew() {
  const { t } = useLang();
  const topBooks = MOCK_BOOKS.slice(0, 3);
  const vendors = MOCK_VENDORS.slice(0, 6);
  const authors = MOCK_AUTHORS.slice(0, 3);

  return (
    <div className="content">
      <Link to="/search" className="home-search-bar animate-fade-in" aria-label={t('home.search')}>
        <IconSearch style={{ width: 20, height: 20 }} />
        <span>{t('home.search')}</span>
      </Link>

      <Link
        to="/books/4/detail"
        className="banner banner--offer animate-fade-in-up"
        style={{ backgroundImage: `linear-gradient(to right, rgba(30,58,95,0.92) 0%, rgba(45,90,135,0.85) 100%), url(${BANNER_SPECIAL_IMAGE})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="banner__inner">
          <span className="banner__tag">{t('home.specialOffer')}</span>
          <h2 className="banner__title">{t('home.discount20')}</h2>
          <span className="banner__cta">{t('home.orderNow')}</span>
        </div>
        <div className="banner__book">APOLLO</div>
      </Link>

      <section className="home-section animate-fade-in-up" style={{ animationDelay: '0.05s', animationFillMode: 'both' }}>
        <div className="section-head">
          <h3 className="section-title">{t('home.topOfWeek')}</h3>
          <Link to="/books" className="section-link">{t('home.seeAll')} <IconChevronRight style={{ width: 16, height: 16, marginLeft: 2 }} /></Link>
        </div>
        <div className="top-books-row">
          {topBooks.map((book) => (
            <Link key={book.id} to={`/books/${book.id}/detail`} className="top-book-card">
              <BookCover coverUrl={book.coverUrl} size="md" alt={book.title} />
              <span className="top-book-card__title">{book.title}</span>
              <span className="top-book-card__price">${book.price.toFixed(2)}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
        <div className="section-head">
          <h3 className="section-title">{t('home.bestVendors')}</h3>
          <Link to="/vendors" className="section-link">{t('home.seeAll')} <IconChevronRight style={{ width: 16, height: 16, marginLeft: 2 }} /></Link>
        </div>
        <div className="vendors-row">
          {vendors.map((v) => (
            <Link key={v.id} to={`/vendors/${v.id}`} className="vendor-chip">
              {v.logo && <img src={v.logo} alt="" className="vendor-chip__logo" width={40} height={40} />}
              <span className="vendor-chip__name">{v.name}</span>
              <span className="vendor-chip__stars">★ {v.rating}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section animate-fade-in-up" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
        <div className="section-head">
          <h3 className="section-title">{t('home.authors')}</h3>
          <Link to="/authors" className="section-link">{t('home.seeAll')} <IconChevronRight style={{ width: 16, height: 16, marginLeft: 2 }} /></Link>
        </div>
        <div className="authors-row">
          {authors.map((a) => (
            <Link key={a.id} to={`/authors/${a.id}`} className="author-card">
              <div className="author-card__avatar" style={a.image ? { backgroundImage: `url(${a.image})`, backgroundSize: 'cover' } : {}} />
              <span className="author-card__name">{a.name}</span>
              <span className="author-card__role">{a.role}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
