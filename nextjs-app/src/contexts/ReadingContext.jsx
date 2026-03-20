/**
 * Reading progress & library – Kindle-level tracking.
 * Persists recently read books, progress %, and last-opened for Continue Reading.
 */
import { createContext, useContext, useCallback, useState, useEffect } from 'react';

const STORAGE_KEY = 'sphere_reading_progress';
const MAX_RECENT = 20;

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

const ReadingContext = createContext(null);

export function ReadingProvider({ children }) {
  const [progress, setProgress] = useState(loadFromStorage);

  const updateProgress = useCallback((bookId, { page, totalPages, title, coverUrl }) => {
    if (!bookId) return;
    setProgress((prev) => {
      const next = { ...prev };
      next[String(bookId)] = {
        page: typeof page === 'number' ? page : prev[bookId]?.page ?? 1,
        totalPages: typeof totalPages === 'number' ? totalPages : prev[bookId]?.totalPages ?? 1,
        lastOpened: Date.now(),
        title: title ?? prev[bookId]?.title ?? '',
        coverUrl: coverUrl ?? prev[bookId]?.coverUrl ?? null,
      };
      const entries = Object.entries(next).sort((a, b) => (b[1].lastOpened ?? 0) - (a[1].lastOpened ?? 0));
      const trimmed = Object.fromEntries(entries.slice(0, MAX_RECENT));
      saveToStorage(trimmed);
      return trimmed;
    });
  }, []);

  const getRecentlyRead = useCallback(() => {
    return Object.entries(progress)
      .map(([id, v]) => ({ id, ...v, progressPct: v.totalPages > 0 ? (v.page / v.totalPages) * 100 : 0 }))
      .filter((r) => r.page > 0 && r.page < (r.totalPages || Infinity))
      .sort((a, b) => (b.lastOpened ?? 0) - (a.lastOpened ?? 0))
      .slice(0, 10);
  }, [progress]);

  const getProgress = useCallback((bookId) => {
    return progress[String(bookId)] ?? null;
  }, [progress]);

  useEffect(() => {
    saveToStorage(progress);
  }, [progress]);

  return (
    <ReadingContext.Provider value={{ updateProgress, getRecentlyRead, getProgress }}>
      {children}
    </ReadingContext.Provider>
  );
}

export function useReading() {
  const ctx = useContext(ReadingContext);
  return ctx || { updateProgress: () => {}, getRecentlyRead: () => [], getProgress: () => null };
}
