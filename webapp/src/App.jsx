import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTelegram } from './useTelegram';
import { useLang } from './contexts/LangContext';
import Layout from './components/Layout';
import Spinner from './components/Spinner';
import Home from './pages/Home';
import Books from './pages/Books';
import BookDetail from './pages/BookDetail';
import Reader from './pages/Reader';
import News from './pages/News';
import Profile from './pages/Profile';

export default function App() {
  const { user, initData, ready } = useTelegram();
  const { t } = useLang();

  if (!ready) {
    return (
      <div className="app app--loading">
        <div className="content content--center">
          <Spinner size="lg" />
          <p className="loading-text">{t('app.loading')}</p>
        </div>
      </div>
    );
  }

  const isDev = !initData && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  if (!initData && !isDev) {
    return (
      <div className="app">
        <div className="content">
          <div className="card">
            <p>{t('app.telegramOnly')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home user={user} initData={initData} isDev={isDev} />} />
          <Route path="/books" element={<Books initData={initData} />} />
          <Route path="/books/:bookId/detail" element={<BookDetail initData={initData} />} />
          <Route path="/news" element={<News />} />
          <Route path="/profile" element={<Profile user={user} isDev={isDev} />} />
        </Route>
        <Route path="/books/:bookId" element={<Reader initData={initData} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
