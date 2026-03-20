import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateTelegramWebAppData } from '@/lib/auth';

function authMiddleware(req) {
  const initData = req.headers.get('x-telegram-init-data') || '';
  return validateTelegramWebAppData(initData);
}

export async function GET(req, { params }) {
  const user = authMiddleware(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = params;
  const rows = await db`
    SELECT b.*, c.name_uz as category_name FROM books b
    JOIN categories c ON b.category_id = c.id WHERE b.id = ${id}
  `;
  if (!rows || rows.length === 0) return NextResponse.json({ error: 'Book not found' }, { status: 404 });
  return NextResponse.json(rows[0]);
}
