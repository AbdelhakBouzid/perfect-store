# PERFECT-STORE

Modern storefront built with:
- `client/` Vite + React + Tailwind CSS
- `server/` Express + SQLite (kept as-is, including legacy `server/public/*`)
- `api/` Vercel Serverless Functions for checkout/contact

## What Is Deployed

- Frontend: `client/` (React SPA)
- Serverless endpoints (same Vercel project):
  - `POST /api/create-payment-intent`
  - `POST /api/contact`

`server/public/*` remains in the repo for legacy compatibility but is not used by the React frontend.

## Local Development

### 1) Start backend API (products/auth/admin)

```bash
cd server
npm install
npm run dev
```

Default backend URL: `http://localhost:5000`

### 2) Start frontend

```bash
cd client
npm install
npm run dev
```

### 3) Build frontend

```bash
cd client
npm run build
```

## Vercel Deployment (Single Project)

This repo is configured for a single Vercel project with:
- frontend build from `client/`
- serverless functions from `/api`

`vercel.json` is included at repo root.

### Recommended Vercel settings

- Framework: `Vite`
- Root: repository root
- Build command: `cd client && npm install && npm run build`
- Output directory: `client/dist`

## Required Environment Variables

### Frontend (`client`, build-time)

- `VITE_API_URL`  
  Backend base URL for products/auth/admin (example: `https://your-backend.example.com`)
- `VITE_STRIPE_PUBLISHABLE_KEY`  
  Stripe publishable key (test or live)
- `VITE_STRIPE_CURRENCY` (optional, default: `usd`)  
  Currency used when creating PaymentIntents

### Vercel Serverless (`/api`, runtime)

- `STRIPE_SECRET_KEY`  
  Stripe secret key used by `/api/create-payment-intent`

## API Endpoints Added

- `POST /api/create-payment-intent`
  - body: `{ amount, currency, metadata? }`
  - returns: `{ clientSecret }`
- `POST /api/contact`
  - body: `{ email, message }`
  - returns: `{ ok: true, id }`

## Notes

- Checkout uses Stripe Payment Element (no fake bank/card form).
- UI supports EN/FR/AR with RTL for Arabic.
- Theme toggle (🌙 / ☀️) is persisted in localStorage.
