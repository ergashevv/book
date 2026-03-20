import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateTelegramWebAppData } from '@/lib/auth';
import path from 'path';
import fs from 'fs';
import { fileRoot } from '@/lib/paths';

export async function GET(req, { params }) {
  const { searchParams } = new URL(req.url);
  const initData = req.headers.get('x-telegram-init-data') || searchParams.get('initData') || '';
  const user = validateTelegramWebAppData(initData);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = params;
  const rows = await db`SELECT cover_url FROM books WHERE id = ${id}`;
  if (!rows || rows.length === 0 || !rows[0].cover_url) return new NextResponse(null, { status: 404 });
  const row = rows[0];
  
  const url = row.cover_url.trim();
  if (url.startsWith('http')) {
    return NextResponse.redirect(url, 302);
  }

  const fullPath = path.join(fileRoot, url);
  if (!fs.existsSync(fullPath)) return new NextResponse(null, { status: 404 });

  const ext = path.extname(url).toLowerCase();
  const contentType = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' }[ext] || 'image/jpeg';
  const fileBuffer = fs.readFileSync(fullPath);
  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
