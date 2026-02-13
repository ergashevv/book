import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconBell, IconMapPin, IconCalendar, IconCard } from '../components/Icons';
import { useCart } from '../contexts/CartContext';
import { DEFAULT_ADDRESS, PAYMENT_METHODS } from '../data/mock';

export default function ConfirmOrder() {
  const navigate = useNavigate();
  const { items, subtotal, shipping, total } = useCart();
  const [payment, setPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState('Today 12 Jan');
  const [deliveryTime, setDeliveryTime] = useState('Between 10PM : 11PM');

  const handleOrder = () => {
    navigate('/order-status/2930541');
  };

  return (
    <div className="content">
      <header className="page-header">
        <button type="button" className="page-header__back" onClick={() => navigate(-1)}><IconArrowLeft style={{ width: 24, height: 24 }} /></button>
        <h1 className="page-header__title">Confirm Order</h1>
        <Link to="/notifications" className="page-header__icon"><IconBell style={{ width: 22, height: 22 }} /></Link>
      </header>

      <section className="confirm-section">
        <h3 className="confirm-section__title"><IconMapPin style={{ width: 18, height: 18 }} /> Address</h3>
        <p className="confirm-section__text">{DEFAULT_ADDRESS.full}</p>
        <Link to="/location" className="confirm-section__link">Change</Link>
      </section>

      <section className="confirm-section">
        <h3 className="confirm-section__title">Summary</h3>
        <p className="confirm-section__text">Price ${subtotal.toFixed(2)}</p>
        <p className="confirm-section__text">Shipping ${shipping.toFixed(2)}</p>
        <p className="confirm-section__total">Total Payment ${total.toFixed(2)}</p>
        <button type="button" className="confirm-section__link-btn" onClick={() => setShowDetailsModal(true)}>See details &gt;</button>
      </section>

      <section className="confirm-section">
        <h3 className="confirm-section__title"><IconCalendar style={{ width: 18, height: 18 }} /> Date and time</h3>
        <button type="button" className="confirm-section__row" onClick={() => setShowDateModal(true)}>
          <span>Choose date and time</span>
          <span>›</span>
        </button>
      </section>

      <section className="confirm-section">
        <h3 className="confirm-section__title"><IconCard style={{ width: 18, height: 18 }} /> Payment</h3>
        <button type="button" className="confirm-section__row" onClick={() => setShowPaymentModal(true)}>
          <span>{payment ? payment.name : 'Choose your payment'}</span>
          <span>›</span>
        </button>
      </section>

      <button type="button" className="btn confirm-order-btn" onClick={handleOrder}>Order</button>

      {showDetailsModal && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Payment Details</h3>
            <p>Price ${subtotal.toFixed(2)}</p>
            {items.map((i) => (
              <p key={i.id}>{i.quantity}x {i.title} ${(i.price * i.quantity).toFixed(2)}</p>
            ))}
            <p>Shipping ${shipping.toFixed(2)}</p>
            <p><strong>Total Payment ${total.toFixed(2)}</strong></p>
            <button type="button" className="btn" onClick={() => setShowDetailsModal(false)}>Close</button>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Your Payments</h3>
            {PAYMENT_METHODS.map((m) => (
              <button key={m.id} type="button" className="modal-payment-row" onClick={() => { setPayment(m); setShowPaymentModal(false); }}>
                <span>{m.name}</span>
                <span>›</span>
              </button>
            ))}
            <button type="button" className="btn btn-secondary" onClick={() => setShowPaymentModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {showDateModal && (
        <div className="modal-overlay" onClick={() => setShowDateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delivery date</h3>
            <div className="date-options">
              {['Today 12 Jan', 'Tomorrow 12 Jan', 'Pick a date'].map((d) => (
                <button key={d} type="button" className={`books-filter-btn ${deliveryDate === d ? 'books-filter-btn--active' : ''}`} onClick={() => setDeliveryDate(d)}>{d}</button>
              ))}
            </div>
            <div className="time-options">
              <button type="button" className={`books-filter-btn books-filter-btn--active`}>{deliveryTime}</button>
            </div>
            <button type="button" className="btn" onClick={() => setShowDateModal(false)}>Confirm</button>
          </div>
        </div>
      )}
    </div>
  );
}
