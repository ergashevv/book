import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useTelegram } from './useTelegram';
import { useLang } from './contexts/LangContext';
import Layout from './components/Layout';
import Spinner from './components/Spinner';
import HomeNew from './pages/HomeNew';
import Books from './pages/Books';
import BookDetail from './pages/BookDetail';
import GoogleBookDetail from './pages/GoogleBookDetail';
import Reader from './pages/Reader';
import News from './pages/News';
import Profile from './pages/Profile';
import Category from './pages/Category';
import Cart from './pages/Cart';
import ConfirmOrder from './pages/ConfirmOrder';
import Vendors from './pages/Vendors';
import Authors from './pages/Authors';
import AuthorDetail from './pages/AuthorDetail';
import Search from './pages/Search';
import Notifications from './pages/Notifications';
import Promotion from './pages/Promotion';
import Location from './pages/Location';
import OrderStatus from './pages/OrderStatus';
import OrderFeedback from './pages/OrderFeedback';
import MyAccount from './pages/MyAccount';
import Favorites from './pages/Favorites';
import OrderHistory from './pages/OrderHistory';
import HelpCenter from './pages/HelpCenter';
import Coupons from './pages/Coupons';

import Splash from './pages/Splash';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Verification from './pages/Verification';
import Congratulation from './pages/Congratulation';
import ForgotPassword from './pages/ForgotPassword';

const AUTH_PATHS = ['/splash', '/onboarding', '/login', '/signup', '/verify', '/congratulation', '/forgot-password'];

function useIsAuthPath() {
  const loc = useLocation();
  const path = loc.pathname || '';
  return AUTH_PATHS.some((p) => path.startsWith(p));
}

function AppLoadingScreen({ t }) {
  return (
    <div className="app-loading">
      <div className="app-loading__logo" aria-hidden>
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 4L28 16L40 20L28 24L24 36L20 24L8 20L20 16L24 4Z" fill="white" />
        </svg>
      </div>
      <h1 className="app-loading__title">Sphere</h1>
      <Spinner size="lg" />
      <p className="app-loading__text">{t('app.loading')}</p>
    </div>
  );
}

function AppContent() {
  const { user, isRestoring } = useAuth();
  const { user: tgUser, initData, ready } = useTelegram();
  const { t } = useLang();
  const isAuthPath = useIsAuthPath();

  /* Telegram tayyor bo‘lishi va auth (localStorage) tekshirilguncha loader */
  if (!ready || isRestoring) {
    return <AppLoadingScreen t={t} />;
  }

  const isDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && !initData;
  const hasTelegramUser = Boolean(initData && tgUser);
  const hasAppUser = Boolean(user && typeof user === 'object');
  const showMainApp = hasAppUser || hasTelegramUser;
  const displayUser = user || (tgUser ? { id: tgUser.id, name: [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ').trim() || 'User', phone: '', first_name: tgUser.first_name, last_name: tgUser.last_name, username: tgUser.username } : null);

  if (!isRestoring && !showMainApp && !isAuthPath) {
    return <Navigate to="/splash" replace />;
  }

  return (
    <Routes>
      <Route path="/splash" element={<Splash />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/verify" element={<Verification />} />
      <Route path="/congratulation" element={<Congratulation />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/forgot-password/new-password" element={<ForgotPassword />} />
      <Route path="/forgot-password/success" element={<ForgotPassword />} />

      <Route element={<Layout />}>
        <Route path="/" element={<HomeNew />} />
        <Route path="/books" element={<Books initData={initData} />} />
        <Route path="/books/:bookId/detail" element={<BookDetail initData={initData} />} />
        <Route path="/books/google/:volumeId/detail" element={<GoogleBookDetail />} />
        <Route path="/category" element={<Category />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/confirm-order" element={<ConfirmOrder />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/authors" element={<Authors />} />
        <Route path="/authors/:authorId" element={<AuthorDetail />} />
        <Route path="/search" element={<Search />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/promotion/:id" element={<Promotion />} />
        <Route path="/location" element={<Location />} />
        <Route path="/order-status/:orderId" element={<OrderStatus />} />
        <Route path="/order-feedback/:orderId" element={<OrderFeedback />} />
        <Route path="/news" element={<News />} />
        <Route path="/profile" element={<Profile user={displayUser} isDev={isDev} />} />
        <Route path="/profile/account" element={<MyAccount />} />
        <Route path="/profile/address" element={<Location />} />
        <Route path="/profile/offers" element={<Coupons />} />
        <Route path="/profile/favorites" element={<Favorites />} />
        <Route path="/profile/orders" element={<OrderHistory />} />
        <Route path="/profile/help" element={<HelpCenter />} />
      </Route>
      <Route path="/books/:bookId" element={<Reader initData={initData} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}
