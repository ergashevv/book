import Database from 'better-sqlite3';
import path from 'path';
import { dataDir } from './paths.js';

const dbPath = path.join(dataDir, 'books.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_uz TEXT NOT NULL,
    name_ru TEXT,
    slug TEXT UNIQUE NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    author TEXT,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    page_count INTEGER DEFAULT 0,
    cover_url TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS reading_progress (
    user_id INTEGER NOT NULL,
    book_id INTEGER NOT NULL,
    page_number INTEGER NOT NULL DEFAULT 1,
    updated_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, book_id),
    FOREIGN KEY (book_id) REFERENCES books(id)
  );

  CREATE TABLE IF NOT EXISTS verification_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    phone TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

export default db;
