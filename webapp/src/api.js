const API = '/api';

function headers(initData) {
  const h = { 'Content-Type': 'application/json' };
  if (initData) h['X-Telegram-Init-Data'] = initData;
  return h;
}

export async function apiGet(path, initData) {
  const res = await fetch(API + path, { headers: headers(initData) });
  if (!res.ok) throw new Error(res.status === 401 ? 'AUTH_REQUIRED' : await res.text());
  return res.json();
}

export async function apiPost(path, body, initData) {
  const res = await fetch(API + path, {
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
