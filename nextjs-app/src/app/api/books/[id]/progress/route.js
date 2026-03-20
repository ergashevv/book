import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateTelegramWebAppData } from '@/lib/auth';

function authMiddleware(req) {
  const { searchParams } = new URL(req.url);
  const initData = req.headers.get('x-telegram-init-data') || searchParams.get('initData') || '';
  return validateTelegramWebAppData(initData);
}

export async function GET(req, { params }) {
  const user = authMiddleware(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = params;
  const row = db.prepare('SELECT page_number FROM reading_progress WHERE user_id = ? AND book_id = ?')
    .get(user.id, id);
  return NextResponse.json({ page_number: row ? row.page_number : 1 });
}

export async function POST(req, { params }) {
  const user = authMiddleware(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = params;
  const { page_number } = await req.json();
  if (typeof page_number !== 'number' || page_number < 1) {
    return NextResponse.json({ error: 'Invalid page_number' }, { status: 400 });
  }

  db.prepare(`
    INSERT INTO reading_progress (user_id, book_id, page_number) VALUES (?, ?, ?)
    ON CONFLICT(user_id, book_id) DO UPDATE SET page_number = ?, updated_at = datetime('now')
  `).run(user.id, id, page_number, page_number);
  
  return NextResponse.json({ ok: true, page_number });
}
