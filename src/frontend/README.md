# Frontend (React + Vite + Tailwind)

This folder contains the React frontend for **PyxMAFIA**.

## Requirements

- Node.js 18+

## Install

```bash
npm install
```

## Environment variables

Copy `.env.example` to `.env` and adjust if needed.

- `VITE_API_BASE_URL`
	- Default (local): `http://localhost:3000/api`
	- If you deploy backend separately, set this to your backend URL.

## Run (dev)

```bash
npm run dev
```

Frontend runs on:
- `http://localhost:5173`

## How API calls work in development

- The frontend Axios client defaults to `/api`.
- Vite dev server proxies `/api/*` → `http://localhost:3000` (see `vite.config.js`).

This means:

- In local dev, you can call `/api/...` without CORS headaches.
- In production, you typically set `VITE_API_BASE_URL` to your backend URL (or serve both behind one domain).

## Troubleshooting

- If you can login but requests don’t stay authenticated:
	- Backend must enable `credentials: true` in CORS.
	- Backend `CORS_ORIGIN` must match your frontend origin.
	- Your browser must accept cookies for the site.

- Windows PowerShell execution policy blocks `npm.ps1` on some machines.
	- Workaround: use `npm.cmd` (example: `npm.cmd run dev`).

## Related docs

- Backend details: `../backend/README.md`
- Project overview: `../../README.md`
