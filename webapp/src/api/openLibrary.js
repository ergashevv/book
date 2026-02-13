/**
 * Open Library API – https://openlibrary.org/dev/docs/api/search
 * API kaliti shart emas.
 */

const BASE = 'https://openlibrary.org';

function normalizeDoc(doc) {
  if (!doc || !doc.key) return null;
  const title = doc.title || '';
  const author = (Array.isArray(doc.author_name) ? doc.author_name : []).join(', ') || '';
  let coverUrl = null;
  if (doc.cover_i) {
    coverUrl = `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`;
  }
  const workKey = doc.key?.replace(/^\/works\//, '') || doc.key;
  const infoLink = workKey ? `https://openlibrary.org${doc.key}` : null;
  return {
    id: `ol_${workKey}`,
    workKey,
    title,
    author,
    cover_url: coverUrl,
    coverUrl,
    first_publish_year: doc.first_publish_year || null,
    infoLink,
    source: 'openlibrary',
  };
}

/**
 * Open Library orqali kitob qidirish.
 * @param {string} q - Qidiruv so'zi
 * @param {{ limit?: number, page?: number }} options
 */
export async function searchOpenLibrary(q, options = {}) {
  const { limit = 15, page = 1 } = options;
  if (!q || !String(q).trim()) return { items: [], numFound: 0 };

  const params = new URLSearchParams({
    q: String(q).trim(),
    limit: Math.min(20, Math.max(1, limit)),
    offset: Math.max(0, (page - 1) * limit),
  });
  const res = await fetch(`${BASE}/search.json?${params.toString()}`);
  if (!res.ok) return { items: [], numFound: 0 };

  const data = await res.json();
  const docs = Array.isArray(data.docs) ? data.docs : [];
  const numFound = typeof data.numFound === 'number' ? data.numFound : 0;
  return {
    items: docs.map(normalizeDoc).filter(Boolean),
    numFound,
  };
}

/**
 * Bitta asar (work) ma'lumotini olish.
 */
export async function getOpenLibraryWork(workKey) {
  const key = workKey?.replace(/^\/works\//, '') || workKey;
  if (!key) return null;
  const res = await fetch(`${BASE}/works/${key}.json`);
  if (!res.ok) return null;
  const data = await res.json();
  const title = data.title || '';
  const authors = Array.isArray(data.authors) ? data.authors : [];
  const authorKeys = authors.map((a) => a.author?.key).filter(Boolean);
  const description = typeof data.description === 'string' ? data.description : data.description?.value || '';
  let coverUrl = null;
  if (data.covers?.[0]) {
    coverUrl = `https://covers.openlibrary.org/b/id/${data.covers[0]}-M.jpg`;
  }
  return {
    id: `ol_${key}`,
    workKey: key,
    title,
    author: authorKeys.length ? '…' : '', // Open Library work doesn't include author names in work endpoint easily
    cover_url: coverUrl,
    coverUrl: coverUrl,
    description,
    infoLink: `https://openlibrary.org/works/${key}`,
    source: 'openlibrary',
  };
}
