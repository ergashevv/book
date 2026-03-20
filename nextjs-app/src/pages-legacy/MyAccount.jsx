import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { IconArrowLeft } from '../components/Icons';

export default function MyAccount() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || 'John');
  const [email, setEmail] = useState('Johndoe@email.com');
  const [phone, setPhone] = useState(user?.phone || '(+1) 234 567 890');
  const [password, setPassword] = useState('');

  return (
    <div className="content">
      <header className="page-header">
        <Link to="/profile" className="page-header__back"><IconArrowLeft style={{ width: 24, height: 24 }} /></Link>
        <h1 className="page-header__title">My Account</h1>
      </header>
      <div className="my-account">
        <div className="my-account__avatar" />
        <button type="button" className="my-account__change-pic">Change Picture</button>
        <div className="auth-form" style={{ marginTop: 24 }}>
          <label className="auth-form__label">Name</label>
          <input type="text" className="auth-form__input" value={name} onChange={(e) => setName(e.target.value)} />
          <label className="auth-form__label">Email</label>
          <input type="email" className="auth-form__input" value={email} onChange={(e) => setEmail(e.target.value)} />
          <label className="auth-form__label">Phone Number</label>
          <input type="tel" className="auth-form__input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <label className="auth-form__label">Password</label>
          <input type="password" className="auth-form__input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="button" className="btn auth-form__btn">Save Changes</button>
        </div>
      </div>
    </div>
  );
}
