/**
 * Hardcover API (GraphQL) – https://docs.hardcover.app/api/guides/searching
 * API kaliti majburiy: VITE_HARDCOVER_API_KEY env o'zgaruvchisi.
 * Kitob qidiruvi: query_type: "Book".
 */

const ENDPOINT = 'https://api.hardcover.app/v1/graphql';

function getApiKey() {
  return typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_HARDCOVER_API_KEY
    ? String(import.meta.env.VITE_HARDCOVER_API_KEY).trim()
    : '';
}

function normalizeResult(r) {
  if (!r) return null;
  const title = r.title || '';
  const author = Array.isArray(r.author_names) ? r.author_names.join(', ') : (r.author_names || '');
  const coverUrl = r.image?.url || r.cover_image_url || null;
  const slug = r.slug || '';
  const infoLink = slug ? `https://hardcover.app/book/${slug}` : null;
  return {
    id: `hardcover_${r.id || r.slug || Math.random().toString(36).slice(2)}`,
    title,
    author,
    cover_url: coverUrl,
    coverUrl: coverUrl,
    description: r.description || '',
    infoLink,
    source: 'hardcover',
  };
}

/**
 * Hardcover orqali kitob qidirish (API kaliti kerak).
 * @param {string} q - Qidiruv so'zi
 * @param {{ perPage?: number, page?: number }} options
 */
export async function searchHardcover(q, options = {}) {
  const key = getApiKey();
  if (!key || !q || !String(q).trim()) return { items: [], hasKey: !!key };

  const { perPage = 10, page = 1 } = options;
  const query = `
    query SearchBooks($query: String!, $perPage: Int!, $page: Int!) {
      search(query: $query, query_type: "Book", per_page: $perPage, page: $page) {
        results
      }
    }
  `;
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      query,
      variables: { query: String(q).trim(), perPage, page },
    }),
  });
  if (!res.ok) return { items: [], hasKey: true };

  const data = await res.json();
  const results = data?.data?.search?.results;
  const list = Array.isArray(results) ? results : [];
  return {
    items: list.map(normalizeResult).filter(Boolean),
    hasKey: true,
  };
}

export function hardcoverHasKey() {
  return !!getApiKey();
}
