import { Link } from 'react-router-dom';
import { IconArrowLeft } from '../components/Icons';

const ORDERS = [
  { id: '1', title: 'The Da vinci Code', status: 'Delivered', items: 1 },
  { id: '2', title: 'Carrie Fisher', status: 'Delivered', items: 5 },
  { id: '3', title: 'The Waiting', status: 'Cancelled', items: 2 },
];

export default function OrderHistory() {
  return (
    <div className="content">
      <header className="page-header">
        <Link to="/profile" className="page-header__back"><IconArrowLeft style={{ width: 24, height: 24 }} /></Link>
        <h1 className="page-header__title">Order History</h1>
      </header>
      <section className="notif-section">
        <h3 className="notif-section__title">October 2021</h3>
        {ORDERS.map((o) => (
          <Link key={o.id} to={`/order-status/${o.id}`} className="notif-item">
            <div className="notif-item__thumb" />
            <div className="notif-item__body">
              <span className="notif-item__title">{o.title}</span>
              <span className={`notif-item__status notif-item__status--${o.status.toLowerCase()}`}>{o.status}</span>
              <span className="notif-item__meta">{o.items} items</span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
