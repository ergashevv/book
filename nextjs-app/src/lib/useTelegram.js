import { useState, useEffect } from 'react';

function isDevHost() {
  if (typeof window === 'undefined') return false;
  const h = window.location?.hostname || '';
  return h === 'localhost' || h === '127.0.0.1';
}

export function useTelegram() {
  const [user, setUser] = useState(null);
  const [initData, setInitData] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    try {
      const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
      if (tg) {
        tg.ready();
        if (typeof tg.expand === 'function') tg.expand();
        if (typeof tg.enableClosingConfirmation === 'function') tg.enableClosingConfirmation();
        const data = tg.initData || '';
        if (mounted) setInitData(data);
        if (data) {
          try {
            const params = new URLSearchParams(data);
            const userStr = params.get('user');
            if (userStr) {
              const parsed = JSON.parse(decodeURIComponent(userStr));
              if (mounted) setUser(parsed);
            }
          } catch (_) {}
        }
      }
      // Dev: emulate Telegram only when not in Telegram and on localhost
      if (!tg?.initData && isDevHost()) {
        if (mounted) {
          setUser({
            id: 123456789,
            first_name: 'Dev',
            last_name: 'User',
            username: 'devuser',
          });
          setInitData('dev');
        }
      }
    } catch (_) {
      if (isDevHost() && mounted) {
        setUser({ id: 123456789, first_name: 'Dev', last_name: 'User', username: 'devuser' });
        setInitData('dev');
      }
    }
    if (mounted) setReady(true);
    return () => { mounted = false; };
  }, []);

  return { user, initData, ready };
}
