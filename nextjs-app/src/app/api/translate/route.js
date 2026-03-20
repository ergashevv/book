import { NextResponse } from 'next/server';
import { translate } from 'google-translate-api-x';
import { validateTelegramWebAppData } from '@/lib/auth';

export async function POST(req) {
  const initData = req.headers.get('x-telegram-init-data') || '';
  const user = validateTelegramWebAppData(initData);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { text, target_lang, source_lang } = await req.json();
  if (!text || !target_lang) {
    return NextResponse.json({ error: 'Text and target_lang required' }, { status: 400 });
  }

  try {
    const result = await translate(text, {
      to: target_lang,
      from: source_lang || 'auto',
      forceBatch: false
    });
    return NextResponse.json({ translated: result.text, from: result.from.language.iso });
  } catch (error) {
    console.error('Translation error:', error.message);
    return NextResponse.json({ error: 'Translation failed', message: error.message }, { status: 500 });
  }
}
