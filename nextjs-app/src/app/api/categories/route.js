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

  // postgres library returns a result array
  const rows = await db`SELECT * FROM categories ORDER BY name_uz`;
  return NextResponse.json(rows);
}
