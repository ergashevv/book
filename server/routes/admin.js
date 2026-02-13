import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import db from '../db.js';
import { validateAdminPassword } from '../auth.js';
import { uploadsDir, coversDir, fileRoot } from '../paths.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = file.fieldname === 'cover' ? coversDir : uploadsDir;
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const raw = file.originalname || (file.fieldname === 'cover' ? 'cover' : 'book');
    const base = Date.now() + '-' + raw.replace(/[^a-zA-Z0-9.-]/g, '_');
    const ext = file.fieldname === 'cover' ? (path.extname(raw).toLowerCase() || '.jpg') : '';
    const name = file.fieldname === 'cover' ? base.replace(/\.[^.]+$/, '') + ext : base;
    cb(null, name);
  },
});
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } }); // 100MB

const router = Router();

function adminAuth(req, res, next) {
  const token = req.headers['authorization']?.replace('Bearer ', '') || req.body?.adminToken || req.query?.adminToken;
  if (!validateAdminPassword(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

router.post('/login', (req, res) => {
  const { password } = req.body || {};
  if (validateAdminPassword(password)) {
    return res.json({ ok: true, token: password });
  }
  res.status(401).json({ error: 'Invalid password' });
});

router.get('/categories', adminAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM categories ORDER BY name_uz').all();
  res.json(rows);
});

router.post('/categories', adminAuth, (req, res) => {
  const { name_uz, name_ru, slug } = req.body || {};
  if (!name_uz || !slug) return res.status(400).json({ error: 'name_uz and slug required' });
  try {
    const r = db.prepare('INSERT INTO categories (name_uz, name_ru, slug) VALUES (?, ?, ?)').run(name_uz, name_ru || name_uz, slug);
    res.json({ id: r.lastInsertRowid, name_uz, slug });
  } catch (e) {
    if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(400).json({ error: 'Slug already exists' });
    throw e;
  }
});

router.get('/books', adminAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT b.*, c.name_uz as category_name FROM books b
    JOIN categories c ON b.category_id = c.id ORDER BY b.created_at DESC
  `).all();
  res.json(rows);
});

router.post('/books', adminAuth, upload.fields([{ name: 'pdf', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), async (req, res) => {
  const files = req.files || {};
  const pdfFile = files.pdf?.[0];
  if (!pdfFile) return res.status(400).json({ error: 'PDF file required' });
  const { title, author, category_id, cover_url: coverUrlBody } = req.body || {};
  if (!title || !category_id) return res.status(400).json({ error: 'title and category_id required' });

  let pageCount = 0;
  try {
    const pdfPath = path.join(uploadsDir, pdfFile.filename);
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(fs.readFileSync(pdfPath));
    pageCount = data.numpages || 0;
  } catch (e) {
    console.warn('Could not get page count:', e.message);
  }

  const relativePath = path.join('uploads', pdfFile.filename).split(path.sep).join('/');
  let coverUrl = coverUrlBody && typeof coverUrlBody === 'string' ? coverUrlBody.trim() : null;
  if (files.cover?.[0]) {
    const coverFile = files.cover[0];
    coverUrl = 'uploads/covers/' + coverFile.filename;
  }

  const r = db.prepare(`
    INSERT INTO books (category_id, title, author, file_name, file_path, page_count, cover_url)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(category_id, title, author || null, pdfFile.originalname || pdfFile.filename, relativePath, pageCount, coverUrl);

  res.json({
    id: r.lastInsertRowid,
    title,
    author,
    category_id,
    file_path: relativePath,
    page_count: pageCount,
    cover_url: coverUrl,
  });
});

router.delete('/books/:id', adminAuth, (req, res) => {
  const row = db.prepare('SELECT file_path FROM books WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Book not found' });
  db.prepare('DELETE FROM books WHERE id = ?').run(req.params.id);
  db.prepare('DELETE FROM reading_progress WHERE book_id = ?').run(req.params.id);
  const fullPath = path.join(fileRoot, row.file_path);
  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  res.json({ ok: true });
});

export default router;
