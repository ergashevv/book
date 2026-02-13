import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import db from './db.js';
import apiRoutes from './routes/api.js';
import adminRoutes from './routes/admin.js';
import { bot, botWebhookHandler, setupBot, useWebhook } from './bot.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Telegram: webhook (Render/Vercel) yoki polling (localhost). Yo‘l bot.js dagi useWebhook bilan bir xil.
if (process.env.BOT_TOKEN && useWebhook) {
  app.use('/telegram-webhook', botWebhookHandler);
}

app.use('/api', apiRoutes);
app.use('/api/admin', adminRoutes);

// Static: webapp (Telegram Mini App) – SPA fallback
const webappPath = path.join(__dirname, '..', 'webapp', 'dist');
app.use(express.static(webappPath));
app.get(['/', '/books', '/books/*'], (req, res) => res.sendFile(path.join(webappPath, 'index.html')));

// Static: admin SPA
const adminPath = path.join(__dirname, '..', 'admin', 'dist');
app.use('/admin', express.static(adminPath));
app.get('/admin/*', (req, res) => res.sendFile(path.join(adminPath, 'index.html')));

// Default categories (bitta marta)
try {
  const count = db.prepare('SELECT COUNT(*) as c FROM categories').get();
  if (count.c === 0) {
    db.prepare("INSERT INTO categories (name_uz, slug) VALUES ('Boshqa', 'boshqa')").run();
  }
} catch (e) {}

app.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT}`);
  console.log(`Web App: http://localhost:${PORT}/`);
  console.log(`Admin:   http://localhost:${PORT}/admin/`);
  if (process.env.BOT_TOKEN) {
    setupBot();
  }
});
