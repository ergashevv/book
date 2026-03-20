import path from 'path';
import fs from 'fs';

const projectRoot = process.cwd();

/** Vercel provides a read-only filesystem except for /tmp */
const DATA_DIR = process.env.DATA_DIR || null;

export const dataDir = DATA_DIR || path.join(projectRoot, 'data');
export const uploadsDir = DATA_DIR ? path.join(DATA_DIR, 'uploads') : path.join(projectRoot, 'uploads');
export const coversDir = path.join(uploadsDir, 'covers');
export const fileRoot = DATA_DIR || projectRoot;

// Ensure directories exist (may not work in some serverless environments if not /tmp)
if (!fs.existsSync(dataDir)) try { fs.mkdirSync(dataDir, { recursive: true }); } catch(e){}
if (!fs.existsSync(uploadsDir)) try { fs.mkdirSync(uploadsDir, { recursive: true }); } catch(e){}
if (!fs.existsSync(coversDir)) try { fs.mkdirSync(coversDir, { recursive: true }); } catch(e){}
