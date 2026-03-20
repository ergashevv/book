/**
 * Gutendex API – Project Gutenberg kitoblari (bepul)
 * https://gutendex.com/ – API kaliti shart emas.
 */

const BASE = 'https://gutendex.com';

function normalizeBook(b) {
  if (!b || b.id == null) return null;
  const authors = Array.isArray(b.authors) ? b.authors : [];
  const author = authors.map((a) => a.name).filter(Boolean).join(', ') || '';
  const coverUrl = b.formats?.['image/jpeg'] || null;
  const summary = Array.isArray(b.summaries) && b.summaries[0] ? b.summaries[0] : '';
  const readUrl = b.formats?.['text/html'] || b.formats?.['text/html; charset=utf-8'] || `https://www.gutenberg.org/ebooks/${b.id}`;
  return {
    id: `gutenberg_${b.id}`,
    gutenbergId: b.id,
    title: b.title || '',
    author,
    cover_url: coverUrl,
    coverUrl: coverUrl,
    description: summary,
    infoLink: readUrl,
    source: 'gutendex',
  };
}

/**
 * Gutendex orqali kitob qidirish (Project Gutenberg).
 * @param {string} q - Qidiruv so'zi (sarlavha yoki muallif)
 * @param {{ page?: number }} options
 */
export async function searchGutendex(q, options = {}) {
  const { page = 1 } = options;
  if (!q || !String(q).trim()) return { items: [], count: 0 };

  const params = new URLSearchParams({
    search: String(q).trim(),
    page: String(Math.max(1, page)),
  });
  const res = await fetch(`${BASE}/books?${params.toString()}`);
  if (!res.ok) return { items: [], count: 0 };

  const data = await res.json();
  const results = Array.isArray(data.results) ? data.results : [];
  const count = typeof data.count === 'number' ? data.count : 0;
  return {
    items: results.map(normalizeBook).filter(Boolean),
    count,
    next: data.next || null,
    previous: data.previous || null,
  };
}

/**
 * Bitta kitob ma'lumotini Gutenberg ID bo'yicha olish.
 */
export async function getGutendexBook(gutenbergId) {
  if (gutenbergId == null || gutenbergId === '') return null;
  const id = String(gutenbergId).replace(/^gutenberg_/, '');
  const res = await fetch(`${BASE}/books/${id}`);
  if (!res.ok) return null;
  const b = await res.json();
  return normalizeBook(b);
}
