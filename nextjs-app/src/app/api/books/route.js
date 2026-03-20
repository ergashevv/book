import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateTelegramWebAppData } from '@/lib/auth';

function authMiddleware(req) {
  const initData = req.headers.get('x-telegram-init-data') || '';
  return validateTelegramWebAppData(initData);
}

export async function GET(req) {
  const user = authMiddleware(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const category_id = searchParams.get('category_id');

  let rows;
  if (category_id) {
    rows = await db`
      SELECT b.*, c.name_uz as category_name FROM books b
      JOIN categories c ON b.category_id = c.id
      WHERE b.category_id = ${category_id}
      ORDER BY b.created_at DESC
    `;
  } else {
    rows = await db`
      SELECT b.*, c.name_uz as category_name FROM books b
      JOIN categories c ON b.category_id = c.id
      ORDER BY b.created_at DESC
    `;
  }
  return NextResponse.json(rows);
}
