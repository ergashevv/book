import { Bot, webhookCallback } from 'grammy';

const token = process.env.BOT_TOKEN;
const webAppUrl = process.env.WEBAPP_URL || 'http://localhost:3000';

let bot = null;

if (token) {
  bot = new Bot(token);

  bot.command('start', (ctx) => {
    const isHttps = webAppUrl.startsWith('https://');
    const text = "Kitobxona – kitob o'qish ilovasiga xush kelibsiz. Quyidagi tugmani bosing va kitoblarni o'qing.";
    if (isHttps) {
      ctx.reply(text, {
        reply_markup: {
          inline_keyboard: [[
            { text: "Kitobxonga o'tish", web_app: { url: webAppUrl } }
          ]]
        }
      });
    } else {
      ctx.reply(text + "\n\n(Lokal test: " + webAppUrl + " oching. Tugma faqat HTTPS da ishlaydi.)");
    }
  });

  bot.on('message', (ctx) => {
    if (ctx.message?.text?.startsWith('/')) return;
    ctx.reply("Kitobxonga kirish uchun /start bosing yoki menyudagi tugmani ishlating.");
  });
}

// Named export for bot for manual operations
export { bot };

// Webhook handler specifically for Next.js App Router (POST)
// Note: webhookCallback returns an async function that handles (req, res)
export const botWebhookHandler = webhookCallback(bot, 'next-js');
