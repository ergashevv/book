/**
 * Kontent (kitoblar, mualliflar, vendorlar, kategoriyalar) – API orqali, xato bo‘lsa mock.
 */
import { apiGet } from '../api';
import {
  MOCK_BOOKS,
  MOCK_AUTHORS,
  MOCK_VENDORS,
  CATEGORIES,
  BANNER_SPECIAL_IMAGE,
} from '../mock';

function normalizeBook(b) {
  if (!b) return null;
  const cover = b.cover_url ?? b.coverUrl ?? null;
  return {
    id: String(b.id),
    title: b.title ?? '',
    author: b.author ?? '',
    cover_url: cover,
    coverUrl: cover,
    price: typeof b.price === 'number' ? b.price : parseFloat(b.price) || 0,
    vendorId: b.vendor_id ?? b.vendorId ?? null,
    category: b.category ?? '',
  };
}

function normalizeAuthor(a) {
  if (!a) return null;
  return {
    id: String(a.id),
    name: a.name ?? '',
    role: a.role ?? '',
    bio: a.bio ?? '',
    image: a.image ?? a.avatar_url ?? null,
    bookIds: Array.isArray(a.book_ids) ? a.book_ids.map(String) : (a.bookIds ?? []),
    rating: a.rating ?? 0,
  };
}

function normalizeVendor(v) {
  if (!v) return null;
  return {
    id: String(v.id),
    name: v.name ?? '',
    logo: v.logo ?? v.logo_url ?? null,
    rating: v.rating ?? 0,
  };
}

function takeList(data) {
  if (Array.isArray(data)) return data;
  if (data?.books) return data.books;
  if (data?.authors) return data.authors;
  if (data?.vendors) return data.vendors;
  if (data?.categories) return data.categories;
  if (data?.data) return data.data;
  return [];
}

export async function fetchBooks(initData) {
  try {
    const raw = await apiGet('/books', initData);
    const list = takeList(raw);
    return list.map(normalizeBook).filter(Boolean);
  } catch (e) {
    if (typeof console !== 'undefined' && console.warn) console.warn('fetchBooks fallback to mock', e?.message);
    return [...MOCK_BOOKS];
  }
}

export async function fetchAuthors(initData) {
  try {
    const raw = await apiGet('/authors', initData);
    const list = takeList(raw);
    return list.map(normalizeAuthor).filter(Boolean);
  } catch (e) {
    if (typeof console !== 'undefined' && console.warn) console.warn('fetchAuthors fallback to mock', e?.message);
    return [...MOCK_AUTHORS];
  }
}

export async function fetchVendors(initData) {
  try {
    const raw = await apiGet('/vendors', initData);
    const list = takeList(raw);
    return list.map(normalizeVendor).filter(Boolean);
  } catch (e) {
    if (typeof console !== 'undefined' && console.warn) console.warn('fetchVendors fallback to mock', e?.message);
    return [...MOCK_VENDORS];
  }
}

export async function fetchCategories(initData) {
  try {
    const raw = await apiGet('/categories', initData);
    const list = takeList(raw);
    if (Array.isArray(list) && list.length > 0) {
      const cats = list.map((c) => (typeof c === 'string' ? c : c?.name ?? c?.id ?? ''));
      return ['All', ...cats.filter(Boolean)];
    }
  } catch {}
  return [...CATEGORIES];
}

export async function fetchAuthorById(authorId, initData) {
  try {
    const raw = await apiGet(`/authors/${authorId}`, initData);
    return normalizeAuthor(raw?.author ?? raw);
  } catch {
    return MOCK_AUTHORS.find((a) => String(a.id) === String(authorId)) ?? null;
  }
}

export async function fetchBanner(initData) {
  try {
    const raw = await apiGet('/home/banner', initData);
    const url = raw?.image_url ?? raw?.image ?? raw?.banner_url ?? null;
    if (url) return url;
  } catch {}
  return BANNER_SPECIAL_IMAGE;
}
