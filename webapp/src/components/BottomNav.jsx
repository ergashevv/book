import { NavLink, useLocation } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';

const tabs = [
  { path: '/', labelKey: 'nav.home', icon: '🏠' },
  { path: '/books', labelKey: 'nav.books', icon: '📚' },
  { path: '/profile', labelKey: 'nav.profile', icon: '👤' },
];

export default function BottomNav() {
  const location = useLocation();
  const pathname = location.pathname;
  const isReader = /^\/books\/[^/]+$/.test(pathname);
  const { t } = useLang();

  if (isReader) return null;

  return (
    <nav className="bottom-nav" aria-label={t('nav.aria')}>
      {tabs.map(({ path, labelKey, icon }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) => `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`}
          end={path === '/'}
        >
          <span className="bottom-nav__icon">{icon}</span>
          <span className="bottom-nav__label">{t(labelKey)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
