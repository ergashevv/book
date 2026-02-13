import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { IconSearch, IconArrowLeft } from '../components/Icons';
import { MOCK_VENDORS, CATEGORIES } from '../mock';

export default function Vendors() {
  const [filter, setFilter] = useState('All');
  const vendors = MOCK_VENDORS;

  return (
    <div className="content">
      <header className="page-header">
        <Link to="/" className="page-header__back"><IconArrowLeft style={{ width: 24, height: 24 }} /></Link>
        <h1 className="page-header__title">Vendors</h1>
        <Link to="/search" className="page-header__icon"><IconSearch style={{ width: 22, height: 22 }} /></Link>
      </header>
      <div className="category-filters">
        {CATEGORIES.slice(0, 5).map((c) => (
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
      <div className="vendors-grid">
        {vendors.map((v) => (
          <Link key={v.id} to={`/vendors/${v.id}`} className="vendor-card">
            <div className="vendor-card__logo" />
            <span className="vendor-card__name">{v.name}</span>
            <span className="vendor-card__stars">★ {v.rating}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
