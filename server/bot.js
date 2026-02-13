import { Bot, webhookCallback } from 'grammy';

const token = process.env.BOT_TOKEN;
const webAppUrl = process.env.WEBAPP_URL || 'http://localhost:3000';
const useWebhook = process.env.WEBHOOK_URL && !process.env.WEBHOOK_URL.includes('localhost');

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

export { bot, botWebhookHandler, startPolling };
