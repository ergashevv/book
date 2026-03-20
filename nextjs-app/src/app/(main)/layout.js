'use client';

import BottomNav from '@/components/BottomNav';
import { useTelegram } from '@/lib/useTelegram';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/contexts/LangContext';
import Spinner from '@/components/Spinner';

export default function MainLayout({ children }) {
  const { ready, initData } = useTelegram();
  const { isRestoring } = useAuth();
  const { t } = useLang();

  if (!ready || isRestoring) {
    return (
      <div className="app-loading">
        <Spinner size="lg" />
        <p className="app-loading__text">{t('app.loading')}</p>
      </div>
    );
  }

  return (
    <div className="layout">
      <main className="layout__main">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
