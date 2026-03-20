/**
 * Tashqi kitob API'lari: barcha manbalar yoki faqat bepul.
 * Kutubxona (lokal) Search.jsx da alohida.
 */

import { searchGoogleBooks } from './googleBooks';
import { searchOpenLibrary } from './openLibrary';
import { searchItBookstore } from './itBookstore';
import { searchIsbndb, isbndbHasKey } from './isbndb';
import { searchHardcover, hardcoverHasKey } from './hardcover';
import { searchGutendex } from './gutendex';

const emptyFree = { google: [], openLibrary: [], gutendex: [] };

/**
 * Faqat bepul manbalardan qidiruv (barcha natijalar ilova ichida ochiladi).
 * Google (free-ebooks), Open Library, Gutendex.
 */
export async function searchFreeSources(q) {
  const term = String(q || '').trim();
  if (!term) return emptyFree;

  const [googleRes, openLibraryRes, gutendexRes] = await Promise.allSettled([
    searchGoogleBooks(term, { maxResults: 15, filter: 'free-ebooks' }),
    searchOpenLibrary(term, { limit: 15 }),
    searchGutendex(term, { page: 1 }),
  ]);

  return {
    google: googleRes.status === 'fulfilled' ? (googleRes.value?.items || []) : [],
    openLibrary: openLibraryRes.status === 'fulfilled' ? (openLibraryRes.value?.items || []) : [],
    gutendex: gutendexRes.status === 'fulfilled' ? (gutendexRes.value?.items || []) : [],
  };
}

/**
 * Barcha manbalardan qidiruv (pullik manbalar ham).
 */
export async function searchAllSources(q) {
  const term = String(q || '').trim();
  const empty = {
    google: [],
    openLibrary: [],
    itBookstore: [],
    isbndb: [],
    hardcover: [],
    gutendex: [],
    isbndbHasKey: isbndbHasKey(),
    hardcoverHasKey: hardcoverHasKey(),
  };
  if (!term) return empty;

  const [
    googleRes,
    openLibraryRes,
    itBookstoreRes,
    isbndbRes,
    hardcoverRes,
    gutendexRes,
  ] = await Promise.allSettled([
    searchGoogleBooks(term, { maxResults: 12 }),
    searchOpenLibrary(term, { limit: 12 }),
    searchItBookstore(term, { page: 1 }),
    isbndbHasKey() ? searchIsbndb(term) : Promise.resolve({ items: [] }),
    hardcoverHasKey() ? searchHardcover(term, { perPage: 10 }) : Promise.resolve({ items: [] }),
    searchGutendex(term, { page: 1 }),
  ]);

  return {
    google: googleRes.status === 'fulfilled' ? (googleRes.value?.items || []) : [],
    openLibrary: openLibraryRes.status === 'fulfilled' ? (openLibraryRes.value?.items || []) : [],
    itBookstore: itBookstoreRes.status === 'fulfilled' ? (itBookstoreRes.value?.items || []) : [],
    isbndb: isbndbRes.status === 'fulfilled' ? (isbndbRes.value?.items || []) : [],
    hardcover: hardcoverRes.status === 'fulfilled' ? (hardcoverRes.value?.items || []) : [],
    gutendex: gutendexRes.status === 'fulfilled' ? (gutendexRes.value?.items || []) : [],
    isbndbHasKey: isbndbHasKey(),
    hardcoverHasKey: hardcoverHasKey(),
  };
}

export { isbndbHasKey, hardcoverHasKey };
