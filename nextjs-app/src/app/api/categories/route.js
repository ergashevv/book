import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateTelegramWebAppData } from '@/lib/auth';

function authMiddleware(req) {
  const initData = req.headers.get('x-telegram-init-data') || '';
  const user = validateTelegramWebAppData(initData);
  if (!user) {
    return null;
  }
  return user;
}

export async function GET(req) {
  const user = authMiddleware(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = db.prepare('SELECT * FROM categories ORDER BY name_uz').all();
  return NextResponse.json(rows);
}
