import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function OrderFeedback() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  return (
    <div className="content">
      <div className="congratulation__illus" style={{ margin: '0 auto 16px' }} aria-hidden />
      <h1>You Received The Order!</h1>
      <p className="order-feedback__id">Order #{orderId}</p>
      <div className="feedback-card">
        <h3>Tell us your feedback 👋</h3>
        <p className="muted">Lorem ipsum dolor sit amet consectetur. Dignissim magna vitae.</p>
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((s) => (
            <button key={s} type="button" className={`star-rating__btn ${s <= rating ? 'star-rating__btn--on' : ''}`} onClick={() => setRating(s)}>★</button>
          ))}
        </div>
        <textarea className="feedback-input" placeholder="Write something for us!" value={comment} onChange={(e) => setComment(e.target.value)} rows={3} />
      </div>
      <button type="button" className="btn" onClick={() => navigate('/')}>Done</button>
    </div>
  );
}
