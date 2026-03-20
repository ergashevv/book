import 'dotenv/config';
import db from '../lib/db.js';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const publicDir = path.join(process.cwd(), 'public');

async function init() {
  // Ensure tables exist
  console.log("Ensuring Supabase tables exist...");
  await db`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name_uz TEXT NOT NULL,
      name_ru TEXT,
      slug TEXT UNIQUE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await db`
    CREATE TABLE IF NOT EXISTS books (
      id SERIAL PRIMARY KEY,
      category_id INTEGER NOT NULL REFERENCES categories(id),
      title TEXT NOT NULL,
      author TEXT,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      page_count INTEGER DEFAULT 0,
      cover_url TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await db`
    CREATE TABLE IF NOT EXISTS reading_progress (
      user_id BIGINT NOT NULL,
      book_id INTEGER NOT NULL REFERENCES books(id),
      page_number INTEGER NOT NULL DEFAULT 1,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, book_id)
    );
  `;

  // Seed default category if empty
  const cats = await db`SELECT count(*) FROM categories`;
  if (parseInt(cats[0].count) === 0) {
    await db`INSERT INTO categories (name_uz, slug) VALUES ('Boshqa', 'boshqa')`;
    console.log("Inserted 'Boshqa' category.");
  }
}

async function registerBooks() {
  await init();

  const files = fs.readdirSync(publicDir);
  const pdfFiles = files.filter(f => f.endsWith('.pdf'));

  console.log(`Found ${pdfFiles.length} PDF files in public/`);

  for (const file of pdfFiles) {
    const filePath = path.join(publicDir, file);
    const dataBuffer = fs.readFileSync(filePath);

    let pageCount = 0;
    try {
      const data = await pdf(dataBuffer);
      pageCount = data.numpages || 0;
    } catch (e) {
      console.error(`Error parsing ${file}:`, e.message);
    }

    const title = file.replace('.pdf', '').replace(/_/g, ' ').replace(/-/g, ' ').replace('.com', '');
    const relativePath = `/public/${file}`;
    
    // Check if book already exists in DB
    const existing = await db`SELECT id FROM books WHERE file_name = ${file}`;
    if (existing && existing.length > 0) {
      console.log(`Book "${file}" already registered.`);
      continue;
    }

    try {
      await db`
        INSERT INTO books (category_id, title, author, file_name, file_path, page_count)
        VALUES (1, ${title}, 'Unknown Author', ${file}, ${relativePath}, ${pageCount})
      `;
      console.log(`Registered: ${title} (${pageCount} pages)`);
    } catch (e) {
      console.error(`Error inserting ${file}:`, e.message);
    }
  }
  process.exit(0);
}

registerBooks();
