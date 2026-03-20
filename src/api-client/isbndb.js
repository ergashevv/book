/**
 * ISBNdb API v2 – https://isbndb.com/apidocs/v2
 * API kaliti majburiy: VITE_ISBNDB_API_KEY env o'zgaruvchisi.
 * Kalit bo'lmasa qidiruv o'tkazilmaydi.
 */

const BASE = 'https://api2.isbndb.com';

function getApiKey() {
  return typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_ISBNDB_API_KEY
    ? String(import.meta.env.VITE_ISBNDB_API_KEY).trim()
    : '';
}

function normalizeBook(b) {
  if (!b) return null;
  const isbn = b.isbn13 || b.isbn || '';
  const title = b.title || '';
  const author = Array.isArray(b.authors) ? b.authors.join(', ') : (b.author || '');
  return {
    id: `isbndb_${isbn || b.title?.slice(0, 20) || Math.random().toString(36).slice(2)}`,
    isbn,
    title,
    author,
    cover_url: b.image || null,
    coverUrl: b.image || null,
    publisher: b.publisher || null,
    infoLink: isbn ? `https://isbndb.com/book/${isbn}` : null,
    source: 'isbndb',
  };
}

/**
 * ISBNdb orqali kitob qidirish (API kaliti kerak).
 * @param {string} q - Qidiruv so'zi (sarlavha yoki tavsif)
 */
export async function searchIsbndb(q) {
  const key = getApiKey();
  if (!key || !q || !String(q).trim()) return { items: [], hasKey: !!key };

  const query = encodeURIComponent(String(q).trim());
  const res = await fetch(`${BASE}/books/${query}`, {
    headers: { Authorization: key, Accept: 'application/json' },
  });
  if (!res.ok) return { items: [], hasKey: true };

  const data = await res.json();
  const books = Array.isArray(data.books) ? data.books : (data.data ? [data.data] : []);
  return {
    items: books.map(normalizeBook).filter(Boolean),
    hasKey: true,
  };
}

export function isbndbHasKey() {
  return !!getApiKey();
}
