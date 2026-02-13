/**
 * Test PDF ni uploads ga nusxalaydi va DB ga kitob qo'shadi.
 * Loyiha ildizidagi "Nick Bostrom - Superintelligence paths dangers strategies.pdf" dan.
 */
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const uploadsDir = path.join(root, 'uploads');
const sourcePdf = path.join(root, 'Nick Bostrom - Superintelligence paths dangers strategies.pdf');

if (!fs.existsSync(sourcePdf)) {
  console.log('Test PDF topilmadi:', sourcePdf);
  console.log('Admin panel orqali PDF yuklang yoki bu faylni loyiha ildiziga qo‘ying.');
  process.exit(0);
}

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const fileName = Date.now() + '-Superintelligence_paths_dangers_strategies.pdf';
const destPath = path.join(uploadsDir, fileName);
fs.copyFileSync(sourcePdf, destPath);

// Kategoriya "Falsafa" yoki "Boshqa"
let cat = db.prepare("SELECT id FROM categories WHERE slug = 'falsafa'").get();
if (!cat) {
  db.prepare("INSERT INTO categories (name_uz, slug) VALUES ('Falsafa', 'falsafa')").run();
  cat = db.prepare("SELECT id FROM categories WHERE slug = 'falsafa'").get();
}
const categoryId = cat.id;

// pdf-parse bilan sahifalar soni (ixtiyoriy)
let pageCount = 0;
try {
  const pdfParse = (await import('pdf-parse')).default;
  const data = await pdfParse(fs.readFileSync(destPath));
  pageCount = data.numpages || 0;
} catch (e) {
  console.warn('Sahifalar soni olinmadi:', e.message);
}

const filePath = path.join('uploads', fileName);
db.prepare(`
  INSERT INTO books (category_id, title, author, file_name, file_path, page_count)
  VALUES (?, ?, ?, ?, ?, ?)
`).run(categoryId, 'Superintelligence: Paths, Dangers, Strategies', 'Nick Bostrom', fileName, filePath, pageCount);

console.log('Test kitob qo‘shildi. Sahifalar:', pageCount || '(noma’lum)');
console.log('Serverni ishga tushiring: npm start');
console.log('Web App: http://localhost:3000/');
console.log('Admin:   http://localhost:3000/admin/');
