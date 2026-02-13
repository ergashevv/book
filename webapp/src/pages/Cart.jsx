import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { IconBell } from '../components/Icons';
import BookCover from '../components/BookCover';

export default function Cart() {
  const { items, totalItems, subtotal, shipping, total, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="content">
        <header className="page-header">
          <h1 className="page-header__title">My Cart</h1>
          <Link to="/notifications" className="page-header__icon" aria-label="Notifications">
            <IconBell style={{ width: 22, height: 22 }} />
          </Link>
        </header>
        <div className="empty-state">
          <div className="empty-state__icon empty-state__icon--cart" aria-hidden />
          <p className="empty-state__text">There is no products</p>
          <Link to="/books" className="btn btn-secondary">Continue shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="content">
      <header className="page-header">
        <h1 className="page-header__title">My Cart</h1>
        <Link to="/notifications" className="page-header__icon" aria-label="Notifications">
          <IconBell style={{ width: 22, height: 22 }} />
        </Link>
      </header>
      <div className="cart-list">
        {items.map((item) => (
          <div key={item.id} className="cart-item">
            <BookCover coverUrl={item.coverUrl} size="sm" alt="" />
            <div className="cart-item__body">
              <span className="cart-item__title">{item.title}</span>
              <span className="cart-item__price">${(item.price * (item.quantity || 1)).toFixed(2)}</span>
              <div className="cart-item__qty">
                <button type="button" onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}>−</button>
                <span>{item.quantity || 1}</span>
                <button type="button" onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}>+</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="cart-summary">
        <p>Subtotal ${subtotal.toFixed(2)}</p>
        <p>Shipping ${shipping.toFixed(2)}</p>
        <p className="cart-summary__total">Total ${total.toFixed(2)}</p>
      </div>
      <Link to="/confirm-order" className="btn cart-checkout">Proceed to checkout</Link>
    </div>
  );
}
