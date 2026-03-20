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
  const rows = await db`SELECT page_number FROM reading_progress WHERE user_id = ${user.id} AND book_id = ${id}`;
  const row = rows[0];
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

  // PostgreSQL syntax for UPSERT
  await db`
    INSERT INTO reading_progress (user_id, book_id, page_number) VALUES (${user.id}, ${id}, ${page_number})
    ON CONFLICT (user_id, book_id) DO UPDATE SET page_number = ${page_number}, updated_at = CURRENT_TIMESTAMP
  `;
  
  return NextResponse.json({ ok: true, page_number });
}
