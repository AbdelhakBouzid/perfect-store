# Perfect Store

متجر إلكتروني بسيط ومتكامل (واجهة + API + لوحة تحكم) مبني بـ:
- **Frontend:** HTML/CSS/Vanilla JS
- **Backend:** Node.js + Express
- **Database:** SQLite

## Project Structure

- `client/` واجهة المتجر ولوحة الإدارة (نسخة التطوير)
- `server/` API + قاعدة البيانات + رفع الصور
- `server/public/` نسخة واجهة يتم تقديمها مباشرة من السيرفر (مناسبة لنشر Railway عندما Root Directory = `/server`)

## Quick Start (Local)

```bash
cd server
npm ci
npm run dev
```

ثم افتح:
- `http://localhost:5000/` المتجر
- `http://localhost:5000/auth` صفحة تسجيل الدخول (تصميم SupShare)
- `http://localhost:5000/auth/register` صفحة إنشاء الحساب
- `http://localhost:5000/admin` لوحة الإدارة
- `http://localhost:5000/api/health` فحص الخدمة

## Environment Variables

انسخ الملف:

```bash
cp server/.env.example server/.env
```

المتغيرات الأساسية:
- `PORT=5000`
- `ADMIN_TOKEN=change-this-to-strong-token`
- `CORS_ORIGIN=*` أو قائمة Origins مفصولة بفواصل
- `NODE_ENV=production`

## Production (Railway)

### إذا Root Directory = `/server` (كما في مشروعك)
- السيرفر سيعتمد إعدادات:
  - `server/railway.json`
  - `server/nixpacks.toml`
- إعادة النشر الموصى بها:
  1. Push آخر commit.
  2. Railway → Redeploy → Clear Build Cache.
  3. تأكد أن آخر Deployment يستخدم آخر Commit SHA.

## Security/Quality Improvements

- Input validation أفضل للـ payloads.
- Request logging middleware بسيط.
- Error handling مركزي.
- Health endpoint (`/api/health`).

## Scripts

داخل `server/package.json`:
- `npm run dev` تشغيل محلي.
- `npm run start` تشغيل إنتاج.
- `npm run check` فحص syntax.

## Frontend Migration Note (2026-02-21)

- Primary frontend is now the standalone Vite + React app in `client/`.
- `server/public/` is kept as legacy static assets and is no longer the primary deployment target.
- Vercel frontend settings:
  - Root Directory: `client`
  - Build Command: `npm run build`
  - Output Directory: `dist`
