import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconBell, IconMapPin } from '../components/Icons';
import { DEFAULT_ADDRESS } from '../data/mock';

export default function Location() {
  const navigate = useNavigate();
  const [label, setLabel] = useState(DEFAULT_ADDRESS.label || 'Home');
  const [form, setForm] = useState({
    phone: '',
    name: '',
    governorate: '',
    city: '',
    block: '',
    street: '',
    building: '',
    floor: '',
    flat: '',
    avenue: '',
  });

  return (
    <div className="content">
      <header className="page-header">
        <button type="button" className="page-header__back" onClick={() => navigate(-1)}><IconArrowLeft style={{ width: 24, height: 24 }} /></button>
        <h1 className="page-header__title">Location</h1>
        <Link to="/notifications" className="page-header__icon"><IconBell style={{ width: 22, height: 22 }} /></Link>
      </header>
      <div className="location-map">
        <div className="location-map__placeholder">Map · New York</div>
      </div>
      <section className="location-detail">
        <h3><IconMapPin style={{ width: 18, height: 18 }} /> Detail Address</h3>
        <p>{DEFAULT_ADDRESS.full}</p>
      </section>
      <section className="location-save">
        <h3>Save Address As</h3>
        <div className="location-tabs">
          <button type="button" className={label === 'Home' ? 'active' : ''} onClick={() => setLabel('Home')}>Home</button>
          <button type="button" className={label === 'Office' ? 'active' : ''} onClick={() => setLabel('Office')}>Office</button>
        </div>
      </section>
      <button type="button" className="btn" onClick={() => navigate(-1)}>Confirmation</button>
    </div>
  );
}
