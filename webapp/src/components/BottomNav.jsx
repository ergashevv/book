import { NavLink, useLocation } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';

const HomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const BooksIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    <line x1="8" y1="6" x2="16" y2="6" />
    <line x1="8" y1="10" x2="16" y2="10" />
  </svg>
);
const NewsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
    <path d="M18 14h-8" />
    <path d="M15 18h-5" />
    <path d="M10 6h8v4h-8V6Z" />
  </svg>
);
const ProfileIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const tabs = [
  { path: '/', labelKey: 'nav.home', icon: HomeIcon },
  { path: '/books', labelKey: 'nav.books', icon: BooksIcon },
  { path: '/news', labelKey: 'nav.news', icon: NewsIcon },
  { path: '/profile', labelKey: 'nav.profile', icon: ProfileIcon },
];

export default function BottomNav() {
  const location = useLocation();
  const pathname = location.pathname;
  const isReader = /^\/books\/[^/]+$/.test(pathname);
  const isBookDetail = /^\/books\/[^/]+\/detail$/.test(pathname);
  const { t } = useLang();

  if (isReader || isBookDetail) return null;

  return (
    <nav className="bottom-nav" aria-label={t('nav.aria')}>
      {tabs.map(({ path, labelKey, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) => `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`}
          end={path === '/'}
        >
          <span className="bottom-nav__icon"><Icon /></span>
          <span className="bottom-nav__label">{t(labelKey)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
