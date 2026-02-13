import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import db from '../db.js';
import { validateTelegramWebAppData } from '../auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

function authMiddleware(req, res, next) {
  const initData = req.headers['x-telegram-init-data'] || req.query.initData || '';
  const user = validateTelegramWebAppData(initData);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' });
  }
  req.telegramUser = user;
  next();
}

// Categories
router.get('/categories', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM categories ORDER BY name_uz').all();
  res.json(rows);
});

// Books (all yoki category bo'yicha)
router.get('/books', authMiddleware, (req, res) => {
  const { category_id } = req.query;
  let sql = 'SELECT b.*, c.name_uz as category_name FROM books b JOIN categories c ON b.category_id = c.id ORDER BY b.created_at DESC';
  const params = [];
  if (category_id) {
    sql = 'SELECT b.*, c.name_uz as category_name FROM books b JOIN categories c ON b.category_id = c.id WHERE b.category_id = ? ORDER BY b.created_at DESC';
    params.push(category_id);
  }
  const rows = db.prepare(sql).all(...params);
  res.json(rows);
});

// Bitta kitob
router.get('/books/:id', authMiddleware, (req, res) => {
  const row = db.prepare(`
    SELECT b.*, c.name_uz as category_name FROM books b
    JOIN categories c ON b.category_id = c.id WHERE b.id = ?
  `).get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Book not found' });
  res.json(row);
});

// Kitob PDF faylini URL (Mini App uchun to'g'ridan-to'g'ri link)
router.get('/books/:id/file', authMiddleware, (req, res) => {
  const row = db.prepare('SELECT file_path, file_name FROM books WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Book not found' });
  const root = path.join(__dirname, '..', '..');
  const fullPath = path.join(root, row.file_path);
  if (!fs.existsSync(fullPath)) return res.status(404).json({ error: 'File not found' });
  res.sendFile(fullPath, { headers: { 'Content-Type': 'application/pdf' } });
});

// Reading progress
router.get('/books/:id/progress', authMiddleware, (req, res) => {
  const userId = req.telegramUser.id;
  const row = db.prepare('SELECT page_number FROM reading_progress WHERE user_id = ? AND book_id = ?')
    .get(userId, req.params.id);
  res.json({ page_number: row ? row.page_number : 1 });
});

router.post('/books/:id/progress', authMiddleware, (req, res) => {
  const userId = req.telegramUser.id;
  const { page_number } = req.body;
  if (typeof page_number !== 'number' || page_number < 1) {
    return res.status(400).json({ error: 'Invalid page_number' });
  }
  db.prepare(`
    INSERT INTO reading_progress (user_id, book_id, page_number) VALUES (?, ?, ?)
    ON CONFLICT(user_id, book_id) DO UPDATE SET page_number = ?, updated_at = datetime('now')
  `).run(userId, req.params.id, page_number, page_number);
  res.json({ ok: true, page_number });
});

export default router;
