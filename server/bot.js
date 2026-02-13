import { Bot, webhookCallback } from 'grammy';

const token = process.env.BOT_TOKEN;
const webAppUrl = process.env.WEBAPP_URL || 'http://localhost:3000';
// Production: WEBHOOK_URL yoki WEBAPP_URL (HTTPS) bo‘lsa webhook ishlatamiz – 409 conflict bo‘lmasin
const webhookUrl = (process.env.WEBHOOK_URL || (process.env.WEBAPP_URL && process.env.WEBAPP_URL.startsWith('https') ? process.env.WEBAPP_URL : '')).trim().replace(/\/$/, '');
const useWebhook = !!webhookUrl && !webhookUrl.includes('localhost');

let bot = null;
let botWebhookHandler = (req, res) => res.status(501).send('Bot not configured');
let startPolling = () => {};

if (token) {
  bot = new Bot(token);

  bot.command('start', (ctx) => {
    const isHttps = webAppUrl.startsWith('https://');
    const text = "📚 Kitob o'qish ilovasiga xush kelibsiz! Quyidagi tugmani bosing va kitoblarni o'qing.";
    if (isHttps) {
      ctx.reply(text, {
        reply_markup: {
          inline_keyboard: [[
            { text: "📖 Kitobxonga o'tish", web_app: { url: webAppUrl } }
          ]]
        }
      });
    } else {
      ctx.reply(text + "\n\n(Lokal test: brauzerda " + webAppUrl + " oching. Tugma faqat HTTPS da ishlaydi.)");
    }
  });

  bot.on('message', (ctx) => {
    if (ctx.message?.text?.startsWith('/')) return;
    ctx.reply("Kitobxonga kirish uchun /start bosing yoki menyudagi tugmani ishlating.");
  });

  if (useWebhook) {
    botWebhookHandler = webhookCallback(bot, 'express');
  } else {
    startPolling = () => bot.start({ drop_pending_updates: true });
  }
} else {
  console.warn('BOT_TOKEN not set – Telegram bot disabled');
}

/** Production: webhook o‘rnatish. Local: webhook o‘chirib polling. */
async function setupBot() {
  if (!bot) return;
  try {
    if (useWebhook) {
      const url = (webhookUrl.replace(/\/$/, '') + '/telegram-webhook').trim();
      await bot.api.setWebhook(url);
      console.log('Bot: webhook o‘rnatildi –', url);
    } else {
      await bot.api.deleteWebhook({ drop_pending_updates: true });
      startPolling();
      console.log('Bot: long polling yoqildi – /start ni yuboring');
    }
  } catch (e) {
    console.error('Bot setup xatosi:', e.message);
  }
}

export { bot, botWebhookHandler, startPolling, setupBot };
