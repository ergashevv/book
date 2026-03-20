import { Link, useParams } from 'react-router-dom';
import { IconArrowLeft } from '../components/Icons';

export default function Promotion() {
  const { id } = useParams();

  return (
    <div className="content">
      <header className="page-header">
        <Link to="/notifications" className="page-header__back"><IconArrowLeft style={{ width: 24, height: 24 }} /></Link>
        <h1 className="page-header__title">Promotion</h1>
      </header>
      <div className="promo-hero">
        <h2>50% Discount On All Desert</h2>
        <p>Grab it now!</p>
        <button type="button" className="btn">Order Now</button>
      </div>
      <article className="promo-body">
        <h3>Today 50% discount on all products in Chapter with online orders</h3>
        <p>Excuse me... Who could ever resist a discount feast? Hear me out. Today, October 21, 2021, Chapter has a 50% discount for any product. What are you waiting for, let&apos;s order now before it runs out. All of the products are discounted, just order through the Chapter app to enjoy this discount.</p>
      </article>
    </div>
  );
}
