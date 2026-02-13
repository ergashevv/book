import { NavLink, useLocation } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import { useCart } from '../contexts/CartContext';
import { IconSearch, IconBook, IconCart, IconUser } from '../components/Icons';

const HomeIcon = ({ className = '', ...props }) => (
  <svg className={`icons-svg ${className}`} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const tabs = [
  { path: '/', labelKey: 'nav.home', icon: HomeIcon },
  { path: '/category', labelKey: 'nav.category', icon: IconBook },
  { path: '/cart', labelKey: 'nav.cart', icon: IconCart, badge: true },
  { path: '/profile', labelKey: 'nav.profile', icon: IconUser },
];

export default function BottomNav() {
  const location = useLocation();
  const pathname = location.pathname;
  const { totalItems } = useCart();
  const isReader = /^\/books\/[^/]+$/.test(pathname) && !pathname.endsWith('/detail');
  const isBookDetail = /^\/books\/[^/]+\/detail$/.test(pathname);
  const { t } = useLang();

  if (isReader || isBookDetail) return null;

  return (
    <nav className="bottom-nav" aria-label={t('nav.aria')}>
      {tabs.map(({ path, labelKey, icon: Icon, badge }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) => `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`}
          end={path === '/'}
        >
          <span className="bottom-nav__icon">
            <Icon />
            {badge && totalItems > 0 && <span className="bottom-nav__badge">{totalItems}</span>}
          </span>
          <span className="bottom-nav__label">{t(labelKey)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
