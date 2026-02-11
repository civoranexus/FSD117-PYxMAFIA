# Backend (Node.js + Express + MongoDB)

This folder contains the REST API for **PyxMAFIA**.

## What this backend does

- Authentication using JWT stored in an **httpOnly cookie** (`token`).
- Product CRUD for vendors + QR generation.
- Audit logging for QR scans.
- Admin APIs for dashboard review (suspicious products, vendors, audit logs).
- Contact Us submissions storage + admin inspection (Contact Queries in Admin Dashboard).

## Requirements

- Node.js 18+
- MongoDB connection string
- (Optional) Cloudinary credentials (used for QR image uploads)

## Environment variables

Create a `.env` file in this folder based on `.env.example`.

Key variables:

- `PORT` — server port (default `3000`)
- `MONGO_URI` — MongoDB connection string
- `jwt_secret` — secret used to sign/verify JWT
- `CORS_ORIGIN` — frontend origin for CORS + cookies (example: `http://localhost:5173`)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — optional

## Install

```bash
npm install
```

## Run (dev)

```bash
npm run dev
```

Server starts on:
- `http://localhost:3000`

Health check:
- `GET http://localhost:3000/`

## Main routes (high-level)

Base prefix: `/api`

- Auth: `/api/auth`
- Products: `/api/products`
- Audit logs: `/api/audit`
- Admin: `/api/admin` (admin-only, requires auth cookie)
- Warmup: `/api/warmup`
- Contact form submit: `/api/contact` (public `POST`)

## Admin: Contact Queries APIs

These endpoints power the “Contact Queries” tab in the Admin Dashboard.

- `GET /api/admin/contact-messages`
  - Query params:
    - `page` (default `1`)
    - `limit` (default `50`)
    - `status` one of: `new`, `read`, `replied`
    - `search` matches `name`, `email`, `subject`, `message`

- `GET /api/admin/contact-messages/:id`
  - Returns full details (includes `message`, `ipAddress`, `userAgent`, timestamps)

- `PATCH /api/admin/contact-messages/:id/status`
  - Body: `{ "status": "read" }` (or `new` / `replied`)

## Scripts

Create an admin user:

```bash
node src/scripts/createAdmin.js
```

## Notes / Troubleshooting

- If login works but admin APIs return `401`, ensure cookies are being sent:
  - Frontend uses Axios `withCredentials: true`.
  - Backend CORS must set `credentials: true` and `CORS_ORIGIN` must match the frontend origin.

- If you’re on Windows PowerShell and `npm` is blocked by script execution policy, use `npm.cmd`:
  - `npm.cmd run dev`
