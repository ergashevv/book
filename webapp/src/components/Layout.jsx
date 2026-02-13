import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function Layout() {
  return (
    <div className="layout">
      <header className="layout__header">
        <span className="layout__logo" aria-hidden>📖</span>
        <h1 className="layout__title">Kitobxona</h1>
      </header>
      <main className="layout__main">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
