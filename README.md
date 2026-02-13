# Kitobxona – Telegram bot va Web App

Telegram bot ichida ishlaydigan kitob o‘qish ilovasi. Admin panel orqali PDF kitoblar yuklanadi, foydalanuvchilar bot orqali web-ilovada sahifa-sahifa o‘qiydi (progress saqlanadi).

## Xususiyatlar

- **Auth**: Telegram Web App orqali (Mini App ochilganda Telegram foydalanuvchi ma’lumoti avtomatik).
- **Admin**: Web panel – kategoriyalar, PDF yuklash.
- **O‘qish**: PDF.js bilan sahifa-sahifa, kitob ko‘rinishida, progress saqlanadi.

## Ishga tushirish

### 1. O‘rnatish

```bash
cd /Users/edevzi/Desktop/hasan
npm install
cd webapp && npm install
cd ../admin && npm install
cd ..
```

### 2. Test kitobni qo‘shish (ixtiyoriy)

Loyiha ildizida `Nick Bostrom - Superintelligence paths dangers strategies.pdf` bo‘lsa:

```bash
npm run seed
```

Aks holda admin panel orqali PDF yuklang.

### 3. Sozlamalar

`.env` yarating (yoki `.env.example` dan nusxalab tahrirlang):

```
BOT_TOKEN=...          # @BotFather dan
WEBAPP_URL=https://... # HTTPS manzil (ngrok yoki hosting)
ADMIN_PASSWORD=admin123
```

### 4. Build va ishga tushirish

```bash
npm run build
npm start
```

- **Web App**: http://localhost:3000/
- **Admin**: http://localhost:3000/admin/ (parol: `admin123`)

### Lokal test (Telegram siz)

- Serverni ishga tushiring: `npm start`
- Webapp ni alohida: `cd webapp && npm run dev` → http://localhost:5173
- Dev rejimda auth bypass: foydalanuvchi “Dev User” sifatida ko‘rinadi, API ishlaydi.

### Telegram da test

1. [@BotFather](https://t.me/BotFather) da bot yarating, token oling.
2. HTTPS da host qiling (masalan ngrok: `ngrok http 3000`).
3. `.env` da `BOT_TOKEN` va `WEBAPP_URL=https://your-ngrok-url` qo‘ying.
4. BotFather da: Bot → Menu Button yoki /setmenubutton – Web App URL ni kiriting.
5. Botga /start bosing va “Kitobxonga o‘tish” tugmasini bosing.

## Auth (@VerificationCodes)

Hozircha kirish faqat **Telegram Web App initData** orqali (Mini App bot orqali ochilganda). Kelajakda @VerificationCodes bot orqali telefon tasdiqlash qo‘shish mumkin – backend da `VERIFICATION_CODES_BOT_TOKEN` va tegishli endpoint lar qo‘shiladi.

## Loyiha tuzilishi

- `server/` – Express, Telegram bot (grammY), API, admin API, SQLite
- `webapp/` – Telegram Mini App (React): profil, kategoriyalar, kitoblar, reader (PDF.js)
- `admin/` – React: login, kategoriya qo‘shish, PDF yuklash, kitoblar ro‘yxati
- `uploads/` – yuklangan PDF lar
- `data/` – books.db (SQLite)
