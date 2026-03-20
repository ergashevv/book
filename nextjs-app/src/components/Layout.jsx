import { useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import { IconSearch, IconBell } from './Icons';
import BottomNav from './BottomNav';

const TITLES = {
  '/': 'nav.home',
  '/books': 'nav.library',
  '/news': 'news.title',
  '/profile': 'profile.title',
  '/category': 'category.title',
  '/cart': 'nav.cart',
};

function useDocumentTitle() {
  const location = useLocation();
  const { t } = useLang();
  useEffect(() => {
    const path = location.pathname;
    let titleKey = TITLES[path];
    if (path.startsWith('/books/') && path.endsWith('/detail')) titleKey = 'bookDetail.pageTitle';
    if (path.match(/^\/books\/[^/]+$/) && !path.endsWith('/detail')) titleKey = 'reader.pageTitle';
    const title = titleKey ? t(titleKey) : t('layout.appName');
    document.title = `${title} · Sphere`;
  }, [location.pathname, t]);
}

export default function Layout() {
  const { t } = useLang();
  useDocumentTitle();
  const location = useLocation();
  const path = location.pathname || '';
  const showSimpleHeader = path.startsWith('/profile/') || path.startsWith('/books/') || path === '/category' || path === '/cart' || path === '/confirm-order' || path === '/location' || path === '/notifications' || path === '/vendors' || path === '/authors' || path === '/search';

  return (
    <div className="layout">
      {!showSimpleHeader && (
        <header className="layout__header layout__header--yandex">
          <Link to="/search" className="layout__icon" aria-label={t('home.search')}><IconSearch style={{ width: 22, height: 22 }} /></Link>
          <h1 className="layout__title">{t(TITLES[path] || 'layout.appName')}</h1>
          <Link to="/notifications" className="layout__icon" aria-label={t('nav.notifications')}><IconBell style={{ width: 22, height: 22 }} /></Link>
        </header>
      )}
      <main className="layout__main">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
