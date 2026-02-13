import { Link, useNavigate } from 'react-router-dom';
import { IconArrowLeft } from '../components/Icons';
import { MOCK_BOOKS } from '../mock';

const NOTIFICATIONS = [
  { id: '1', type: 'current', title: 'Carrie Fisher', status: 'On the way', items: 1, bookId: '6' },
  { id: '2', type: 'oct', title: 'The Da vinci Code', status: 'Delivered', items: 1, bookId: '5' },
  { id: '3', type: 'oct', title: 'Carrie Fisher', status: 'Delivered', items: 5, bookId: '6' },
  { id: '4', type: 'oct', title: 'The Waiting', status: 'Cancelled', items: 2, bookId: '8' },
];

const PROMOS = [
  { id: '1', type: 'Promotion', title: 'Today 50% discount on all Books in Novel category with online orders worldwide.', date: 'Oct 21 • 08.00' },
  { id: '2', type: 'Promotion', title: 'Buy 2 get 1 free for since books from 08 - 10 October 2021.', date: 'Oct 08 • 20.30' },
  { id: '3', type: 'Information', title: 'There is a new book now are available', date: 'Sept 16 • 11.00' },
];

export default function Notifications() {
  const navigate = useNavigate();
  return (
    <div className="content">
      <header className="page-header">
        <button type="button" className="page-header__back" onClick={() => navigate(-1)}><IconArrowLeft style={{ width: 24, height: 24 }} /></button>
        <h1 className="page-header__title">Notification</h1>
      </header>
      <section className="notif-section">
        <h3 className="notif-section__title">Current</h3>
        {NOTIFICATIONS.filter((n) => n.type === 'current').map((n) => (
          <Link key={n.id} to={`/order-status/${n.id}`} className="notif-item">
            <div className="notif-item__thumb" />
            <div className="notif-item__body">
              <span className="notif-item__title">{n.title}</span>
              <span className={`notif-item__status notif-item__status--${n.status === 'On the way' ? 'way' : n.status.toLowerCase()}`}>{n.status}</span>
              <span className="notif-item__meta">{n.items} items</span>
            </div>
          </Link>
        ))}
      </section>
      <section className="notif-section">
        <h3 className="notif-section__title">October 2021</h3>
        {NOTIFICATIONS.filter((n) => n.type === 'oct').map((n) => (
          <Link key={n.id} to={`/order-status/${n.id}`} className="notif-item">
            <div className="notif-item__thumb" />
            <div className="notif-item__body">
              <span className="notif-item__title">{n.title}</span>
              <span className={`notif-item__status notif-item__status--${n.status.toLowerCase()}`}>{n.status}</span>
              <span className="notif-item__meta">{n.items} items</span>
            </div>
          </Link>
        ))}
      </section>
      <section className="notif-section">
        <h3 className="notif-section__title">Promotions &amp; Information</h3>
        {PROMOS.map((n) => (
          <Link key={n.id} to={`/promotion/${n.id}`} className="notif-promo-item">
            <span className="notif-promo-item__type">{n.type}</span>
            <span className="notif-promo-item__title">{n.title}</span>
            <span className="notif-promo-item__date">{n.date}</span>
          </Link>
        ))}
      </section>
    </div>
  );
}
