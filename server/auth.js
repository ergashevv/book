import crypto from 'crypto';

const BOT_TOKEN = process.env.BOT_TOKEN || '';

/**
 * Telegram Web App initData ni tekshiradi.
 * @param {string} initData - Telegram.WebApp.initData
 * @returns {object|null} - Parsed user yoki null
 */
export function validateTelegramWebAppData(initData) {
  try {
    // Dev rejim: localhost da test qilish uchun
    if (initData === 'dev' && process.env.NODE_ENV !== 'production') {
      return { id: 123456789, first_name: 'Dev', last_name: 'User', username: 'devuser' };
    }
    if (!initData || typeof initData !== 'string' || !BOT_TOKEN) return null;
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');
    const dataCheckString = [...urlParams.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(BOT_TOKEN)
      .digest();
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    if (calculatedHash !== hash) return null;
    const userStr = urlParams.get('user');
    if (!userStr) return null;
    return JSON.parse(decodeURIComponent(userStr));
  } catch {
    return null;
  }
}

/**
 * Admin parol tekshirish (env dan)
 */
export function validateAdminPassword(password) {
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  return password === adminPassword;
}
