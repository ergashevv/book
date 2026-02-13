import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useLang } from '../contexts/LangContext';
import { IconLogo } from './Icons';
import BottomNav from './BottomNav';

const TITLES = {
  '/': 'layout.appName',
  '/books': 'books.title',
  '/profile': 'profile.title',
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
    document.title = `${title} · Kitobxona`;
  }, [location.pathname, t]);
}

export default function Layout() {
  useDocumentTitle();
  return (
    <div className="layout">
      <header className="layout__header">
        <span className="layout__logo" aria-hidden>
          <IconLogo />
        </span>
        <h1 className="layout__title">Kitobxona</h1>
      </header>
      <main className="layout__main">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
