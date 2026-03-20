import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateTelegramWebAppData } from '@/lib/auth';

function authMiddleware(req) {
  const { searchParams } = new URL(req.url);
  const initData = req.headers.get('x-telegram-init-data') || searchParams.get('initData') || '';
  return validateTelegramWebAppData(initData);
}

export async function GET(req) {
  const user = authMiddleware(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await db`
    SELECT r.book_id, r.page_number, r.updated_at, b.title, b.author, b.page_count, b.cover_url, c.name_uz as category_name
    FROM reading_progress r
    JOIN books b ON b.id = r.book_id
    JOIN categories c ON c.id = b.category_id
    WHERE r.user_id = ${user.id} AND r.page_number > 0
    ORDER BY r.updated_at DESC
    LIMIT 10
  `;
  return NextResponse.json(rows);
}
