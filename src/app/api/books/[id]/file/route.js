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
  const rows = await db`SELECT file_path, file_name FROM books WHERE id = ${id}`;
  if (!rows || rows.length === 0) return NextResponse.json({ error: 'Book not found' }, { status: 404 });
  const row = rows[0];
  
  const fullPath = path.join(fileRoot, row.file_path);
  if (!fs.existsSync(fullPath)) return NextResponse.json({ error: 'File not found' }, { status: 404 });

  const fileBuffer = fs.readFileSync(fullPath);
  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${row.file_name}"`,
    },
  });
}
