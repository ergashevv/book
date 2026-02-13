import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

/** Render da Persistent Disk ulanganda DATA_DIR ni o‘rnating (masalan /opt/render/project/data). */
const DATA_DIR = process.env.DATA_DIR || null;

export const dataDir = DATA_DIR || path.join(projectRoot, 'data');
export const uploadsDir = DATA_DIR ? path.join(DATA_DIR, 'uploads') : path.join(projectRoot, 'uploads');
/** file_path (DB da "uploads/...") ni to‘liq yo‘lga aylantirish uchun */
export const fileRoot = DATA_DIR || projectRoot;

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
