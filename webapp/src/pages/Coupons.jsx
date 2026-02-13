import { Link } from 'react-router-dom';
import { IconArrowLeft } from '../components/Icons';
import { COUPONS } from '../data/mock';

export default function Coupons() {
  const copyCode = (code) => {
    navigator.clipboard?.writeText(code);
  };

  return (
    <div className="content">
      <header className="page-header">
        <Link to="/profile" className="page-header__back"><IconArrowLeft style={{ width: 24, height: 24 }} /></Link>
        <h1 className="page-header__title">Order History</h1>
      </header>
      <p className="coupons-lead">You Have 5 Coupons to use</p>
      <div className="coupons-grid">
        {COUPONS.map((c) => (
          <div key={c.id} className="coupon-card" style={{ backgroundColor: c.color }}>
            <span className="coupon-card__discount">{c.discount}</span>
            <button type="button" className="coupon-card__copy" onClick={() => copyCode(c.code)}>Copy</button>
          </div>
        ))}
      </div>
    </div>
  );
}
