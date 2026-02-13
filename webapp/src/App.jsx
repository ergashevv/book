import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTelegram } from './useTelegram';
import Home from './pages/Home';
import Books from './pages/Books';
import Reader from './pages/Reader';

export default function App() {
  const { user, initData, ready } = useTelegram();

  if (!ready) {
    return (
      <div className="app">
        <div className="content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
          Yuklanmoqda...
        </div>
      </div>
    );
  }

  // Telegram ichida ochilmasa ham test qilish: initData bo'lmasa dev rejim
  const isDev = !initData && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  if (!initData && !isDev) {
    return (
      <div className="app">
        <div className="content">
          <div className="card">
            <p>Bu ilova faqat Telegram orqali ishlatiladi. Bot orqali kirishingiz kerak.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home user={user} initData={initData} isDev={isDev} />} />
        <Route path="/books" element={<Books initData={initData} />} />
        <Route path="/books/:bookId" element={<Reader initData={initData} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
