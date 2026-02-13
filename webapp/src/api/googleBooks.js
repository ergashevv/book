/**
 * Google Books API integratsiyasi.
 * Ma'lumot: https://developers.google.com/books/docs/v1/reference/volumes
 * API kaliti shart emas (kunlik limit bilan).
 */

const BASE = 'https://www.googleapis.com/books/v1';

/**
 * Google volume javobini ilovadagi kitob formatiga o'giradi.
 */
function normalizeVolume(item) {
  if (!item?.id || !item?.volumeInfo) return null;
  const v = item.volumeInfo;
  const authors = Array.isArray(v.authors) ? v.authors : [];
  const author = authors.join(', ') || '';
  let coverUrl = v.imageLinks?.thumbnail || v.imageLinks?.smallThumbnail || null;
  if (coverUrl) {
    coverUrl = coverUrl.replace(/^http:\/\//i, 'https://');
    // Kattaroq rasm uchun zoom parametri
    try {
      const u = new URL(coverUrl);
      if (!u.searchParams.has('zoom')) u.searchParams.set('zoom', '2');
      coverUrl = u.toString();
    } catch (_) {}
  }
  return {
    id: `gb_${item.id}`,
    volumeId: item.id,
    title: v.title || '',
    author,
    cover_url: coverUrl,
    coverUrl,
    description: v.description || '',
    page_count: v.pageCount || null,
    publishedDate: v.publishedDate || null,
    infoLink: v.infoLink || (item.id ? `https://books.google.com/books?id=${item.id}` : null),
    source: 'google',
  };
}

/**
 * Google Books orqali kitoblar qidirish.
 * @param {string} q - Qidiruv so'zi (sarlavha, muallif, ISBN va hokazo)
 * @param {{ maxResults?: number, startIndex?: number, langRestrict?: string, printType?: string }} options
 */
export async function searchGoogleBooks(q, options = {}) {
  const {
    maxResults = 20,
    startIndex = 0,
    langRestrict,
    printType = 'books',
  } = options;

  if (!q || !String(q).trim()) return { items: [], totalItems: 0 };

  const params = new URLSearchParams({
    q: String(q).trim(),
    maxResults: Math.min(40, Math.max(1, maxResults)),
    startIndex: Math.max(0, startIndex),
    printType,
  });
  if (langRestrict) params.set('langRestrict', langRestrict);

  const url = `${BASE}/volumes?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Google Books API error');

  const data = await res.json();
  const items = Array.isArray(data.items) ? data.items : [];
  const totalItems = typeof data.totalItems === 'number' ? data.totalItems : 0;

  return {
    items: items.map(normalizeVolume).filter(Boolean),
    totalItems,
  };
}

/**
 * Bitta volume ma'lumotini ID bo'yicha olish.
 * @param {string} volumeId - Google Books volume ID
 */
export async function getGoogleVolume(volumeId) {
  if (!volumeId || !String(volumeId).trim()) return null;
  const id = String(volumeId).trim();
  const res = await fetch(`${BASE}/volumes/${encodeURIComponent(id)}`);
  if (!res.ok) return null;
  const data = await res.json();
  return normalizeVolume(data);
}
