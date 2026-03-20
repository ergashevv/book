import { Link, useParams } from 'react-router-dom';

export default function OrderStatus() {
  const { orderId } = useParams();
  const order = {
    id: orderId,
    items: [
      { name: 'Carrie Fisher', qty: 1, price: 19.99 },
      { name: 'The Da vinci Code', qty: 1, price: 39.99 },
      { name: 'Arcu ipsum feugiat leo odio', qty: 1, price: 27.12 },
    ],
    subtotal: 87.10,
    shipping: 2,
    total: 89.10,
    delivery: '10 - 15 mins',
    time: '15.24 - 15.39',
  };

  return (
    <div className="content">
      <h1>Thank you 👋</h1>
      <p className="order-status__placeholder">Lorem ipsum dolor sit</p>
      <p className="order-status__id">Order #{order.id}</p>
      <p className="order-status__cancel">Do you want to cancel your order? <a href="#cancel">Cancel</a></p>
      <section className="order-details">
        <h3>Order Details</h3>
        {order.items.map((i) => (
          <p key={i.name}>{i.qty}x {i.name} - ${i.price.toFixed(2)}</p>
        ))}
        <p>Subtotal ${order.subtotal.toFixed(2)}</p>
        <p>Shipping ${order.shipping.toFixed(2)}</p>
        <p><strong>Total Payment ${order.total.toFixed(2)}</strong></p>
        <p>Delivery in {order.delivery}</p>
        <p>Time {order.time}</p>
      </section>
      <Link to={`/order-feedback/${order.id}`} className="btn btn-secondary">Order Status</Link>
    </div>
  );
}
