import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IconSearch, IconArrowLeft } from '../components/Icons';
import { useTelegram } from '../useTelegram';
import { fetchVendors, fetchCategories } from '../api/content';

export default function Vendors() {
  const [filter, setFilter] = useState('All');
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const { initData } = useTelegram();

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchVendors(initData), fetchCategories(initData)])
      .then(([v, cats]) => {
        if (cancelled) return;
        setVendors(v);
        setCategories(Array.isArray(cats) && cats.length ? cats : ['All']);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [initData]);

  return (
    <div className="content">
      <header className="page-header">
        <Link to="/" className="page-header__back"><IconArrowLeft style={{ width: 24, height: 24 }} /></Link>
        <h1 className="page-header__title">Vendors</h1>
        <Link to="/search" className="page-header__icon"><IconSearch style={{ width: 22, height: 22 }} /></Link>
      </header>
      <div className="category-filters">
        {categories.slice(0, 5).map((c) => (
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
        {loading ? (
          <div className="skeleton-card" style={{ minHeight: 120 }} />
        ) : (
        vendors.map((v) => (
          <Link key={v.id} to={`/vendors/${v.id}`} className="vendor-card">
            {v.logo ? <img src={v.logo} alt="" className="vendor-card__logo" width={64} height={64} /> : <div className="vendor-card__logo" />}
            <span className="vendor-card__name">{v.name}</span>
            <span className="vendor-card__stars">★ {v.rating}</span>
          </Link>
        ))
        )}
      </div>
    </div>
  );
}
