import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import LanguageSwitcher from './LanguageSwitcher';

export default function Layout() {
  return (
    <div className="layout">
      <div className="layout__lang">
        <LanguageSwitcher />
      </div>
      <main className="layout__main">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
