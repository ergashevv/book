/**
 * Bepul kitoblar uchun "Explore" – bosh sahifa va Books uchun.
 * Faqat bepul manbalar: Gutendex, Open Library, Google Books (free-ebooks).
 */

import { searchGoogleBooks } from './googleBooks';
import { searchOpenLibrary } from './openLibrary';
import { searchGutendex } from './gutendex';

const EXPLORE_QUERIES = {
  gutendex: ['classics', 'fiction', 'drama'],
  openLibrary: ['classics', 'free book'],
  google: ['free classics', 'public domain'],
};

/**
 * Bosh sahifa va Explore bo'limlari uchun bepul kitoblarni olish.
 * Har bir manbadan bir nechta so'rov (yoki bitta keng so'rov) – natijalar birlashtiriladi.
 */
export async function fetchExploreFree() {
  const [gutendexRes, openLibraryRes, googleRes] = await Promise.allSettled([
    searchGutendex(EXPLORE_QUERIES.gutendex[0], { page: 1 }).then((r) => r.items || []),
    searchOpenLibrary(EXPLORE_QUERIES.openLibrary[0], { limit: 12 }).then((r) => r.items || []),
    searchGoogleBooks(EXPLORE_QUERIES.google[0], { maxResults: 12, filter: 'free-ebooks' }).then((r) => r.items || []),
  ]);

  return {
    gutendex: gutendexRes.status === 'fulfilled' ? gutendexRes.value : [],
    openLibrary: openLibraryRes.status === 'fulfilled' ? openLibraryRes.value : [],
    google: googleRes.status === 'fulfilled' ? googleRes.value : [],
  };
}
