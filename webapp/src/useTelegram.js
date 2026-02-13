import { useState, useEffect } from 'react';

export function useTelegram() {
  const [user, setUser] = useState(null);
  const [initData, setInitData] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      if (tg.enableClosingConfirmation) tg.enableClosingConfirmation();
      const data = tg.initData || '';
      setInitData(data);
      if (data) {
        try {
          const params = new URLSearchParams(data);
          const userStr = params.get('user');
          if (userStr) setUser(JSON.parse(decodeURIComponent(userStr)));
        } catch (e) {}
      }
    }
    // Dev: Telegram emulyatsiya
    if (!window.Telegram?.WebApp?.initData && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      setUser({
        id: 123456789,
        first_name: 'Dev',
        last_name: 'User',
        username: 'devuser',
      });
      setInitData('dev');
    }
    setReady(true);
  }, []);

  return { user, initData, ready };
}
