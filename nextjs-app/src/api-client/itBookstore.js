/**
 * IT Bookstore API – https://api.itbook.store/
 * Dasturiy ta'minot / IT kitoblari. API kaliti shart emas.
 */

const BASE = 'https://api.itbook.store/1.0';

function normalizeBook(b) {
  if (!b || !b.isbn13) return null;
  const title = [b.title, b.subtitle].filter(Boolean).join(' – ') || b.title || '';
  return {
    id: `it_${b.isbn13}`,
    isbn13: b.isbn13,
    title,
    author: b.authors || '',
    cover_url: b.image || null,
    coverUrl: b.image || null,
    price: b.price || null,
    url: b.url || `https://itbook.store/books/${b.isbn13}`,
    infoLink: b.url || `https://itbook.store/books/${b.isbn13}`,
    source: 'itbookstore',
  };
}

/**
 * IT Bookstore orqali kitob qidirish (IT/dasturlash kitoblari).
 * @param {string} q - Qidiruv so'zi
 * @param {{ page?: number }} options
 */
export async function searchItBookstore(q, options = {}) {
  const { page = 1 } = options;
  if (!q || !String(q).trim()) return { items: [], total: '0' };

  const query = encodeURIComponent(String(q).trim());
  const url = `${BASE}/search/${query}/${Math.max(1, page)}`;
  const res = await fetch(url);
  if (!res.ok) return { items: [], total: '0' };

  const data = await res.json();
  const books = Array.isArray(data.books) ? data.books : [];
  return {
    items: books.map(normalizeBook).filter(Boolean),
    total: data.total || '0',
    page: data.page || page,
  };
}

/**
 * Bitta kitob ma'lumotini ISBN-13 bo'yicha olish.
 */
export async function getItBookstoreBook(isbn13) {
  if (!isbn13 || !String(isbn13).trim()) return null;
  const res = await fetch(`${BASE}/books/${encodeURIComponent(String(isbn13).trim())}`);
  if (!res.ok) return null;
  const b = await res.json();
  const title = [b.title, b.subtitle].filter(Boolean).join(' – ') || b.title || '';
  return {
    id: `it_${b.isbn13}`,
    isbn13: b.isbn13,
    title,
    author: b.authors || '',
    cover_url: b.image || null,
    coverUrl: b.image || null,
    price: b.price || null,
    description: b.desc || '',
    url: b.url || `https://itbook.store/books/${b.isbn13}`,
    infoLink: b.url || `https://itbook.store/books/${b.isbn13}`,
    source: 'itbookstore',
  };
}
