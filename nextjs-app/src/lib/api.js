const API = '/api';

function headers(initData) {
  const h = { 'Content-Type': 'application/json' };
  if (initData) h['X-Telegram-Init-Data'] = initData;
  return h;
}

/**
 * Kitob muqovasi uchun ishlatiladigan URL.
 * cover_url to'liq http(s) bo'lsa o'sha, aks holda API /books/:id/cover (auth uchun initData query).
 */
export function getBookCoverUrl(book, initData) {
  if (!book || !book.cover_url) return null;
  const url = book.cover_url.trim();
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = `${API}/books/${book.id}/cover`;
  if (initData) return base + '?initData=' + encodeURIComponent(initData);
  return base;
}

export async function apiGet(path, initData) {
  const url = API + path + (initData ? (path.includes('?') ? '&' : '?') + 'initData=' + encodeURIComponent(initData) : '');
  const res = await fetch(url, { headers: headers(initData) });
  if (!res.ok) throw new Error(res.status === 401 ? 'AUTH_REQUIRED' : await res.text());
  return res.json();
}

export async function apiPost(path, body, initData) {
  const url = API + path + (initData ? (path.includes('?') ? '&' : '?') + 'initData=' + encodeURIComponent(initData) : '');
  const res = await fetch(url, {
    method: 'POST',
    headers: headers(initData),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function bookFileUrl(bookId, initData) {
  const base = window.location.origin + (window.location.pathname || '/').replace(/\/$/, '');
  let url = `${base}${API}/books/${bookId}/file`;
  if (initData && initData !== 'dev') url += '?initData=' + encodeURIComponent(initData);
  return url;
}

export async function fetchBookFile(bookId, initData) {
  const url = bookFileUrl(bookId, initData);
  const res = await fetch(url, { headers: initData ? { 'X-Telegram-Init-Data': initData } : {} });
  if (!res.ok) throw new Error('File not found');
  return res.arrayBuffer();
}

/**
 * Translate text to target language (uz, ru, en).
 * POST /api/translate { text, target_lang, source_lang? }
 * Falls back to returning original text if endpoint missing.
 */
export async function translateText(text, targetLang, initData, sourceLang) {
  if (!text || !String(text).trim()) return { translated: '', error: null };
  const body = { text: String(text).trim(), target_lang: targetLang };
  if (sourceLang) body.source_lang = sourceLang;
  try {
    const res = await fetch(API + '/translate' + (initData ? '?initData=' + encodeURIComponent(initData) : ''), {
      method: 'POST',
      headers: headers(initData),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return { translated: data.translated ?? data.text ?? String(text), error: null };
  } catch (e) {
    return { translated: '', error: e?.message || 'Translation unavailable' };
  }
}
