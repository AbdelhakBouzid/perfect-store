# Perfect Store Frontend (React + Vite)

## Local setup

```bash
cd client
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Environment variables

Create `.env` from `.env.example`:

```bash
VITE_API_URL=https://your-backend-domain.com
```

## Vercel deployment

- Framework Preset: `Vite`
- Root Directory: `client`
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variable: `VITE_API_URL` (point to your backend URL)

The backend remains in `server/` and should be deployed separately.
