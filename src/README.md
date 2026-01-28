# FSD117-PYxMAFIA (Full Stack)

Full-stack app with:
- **Backend**: Node.js + Express + MongoDB (Mongoose)
- **Frontend**: React + Vite + Tailwind + Axios

A small **warmup endpoint** is included to reduce “cold start” downtime in production hosting. The frontend calls it on initial load and shows a `react-hot-toast` “loading” message until the API responds.

## Folder Structure

```
backend/
  server.js
  package.json
  src/
    app.js
    config/
      cloudinary.js
    controllers/
      admin.controllers.js
      auditLog.controllers.js
      auth.controllers.js
      product.controllers.js
      warmup.controllers.js
    db/
      db.js
    middlewares/
      auth.middleware.js
    models/
      auditLog.model.js
      product.model.js
      user.model.js
    routes/
      admin.routes.js
      auditLog.routes.js
      auth.routes.js
      product.routes.js
      warmup.routes.js
    scripts/
      createAdmin.js
    utils/
      generateQR.js
uploads/
  qrcodes/

frontend/
  package.json
  vite.config.js
  index.html
  src/
    main.jsx
    App.jsx
    api/
      axios.js
    components/
      GlobalLoader.jsx
      NavigationBar.jsx
      QRScanner.jsx
    pages/
      AboutPage.jsx
      AdminDashboardPage.jsx
      HomePage.jsx
      LoginPage.jsx
      ProductPage.jsx
      RegisterPage.jsx
      VendorPage.jsx
      VendorProductFormPage.jsx
    routes/
      AppRouter.jsx
    utils/
      loadingStore.js
```

## Requirements

- Node.js 18+ (recommended)
- MongoDB connection string
- A Cloudinary account (for QR uploads)

## Setup

### 1) Backend env

Create `backend/.env`:

```bash
PORT=3000
MONGO_URI=mongodb+srv://...
jwt_secret=your_super_secret

# Frontend origin (for cookies/CORS). In production set this to your real domain.
CORS_ORIGIN=http://localhost:5173

# Cloudinary (QR images are uploaded here)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### 2) Install deps

Backend:
```bash
cd backend
npm install
```

Frontend:
```bash
cd ../frontend
npm install
```

## Run Locally

Terminal 1 (backend):
```bash
cd backend
npm run dev
```

Terminal 2 (frontend):
```bash
cd frontend
npm run dev
```

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`

### Dev proxy (recommended)

The frontend is configured with a Vite proxy so you can call the backend using `/api/...` without CORS pain during development.

## Warmup / Cold Start Handling

### Backend

- `GET /api/warmup` responds quickly with a small JSON payload.

### Frontend

On first load, the app calls the warmup endpoint and shows a toast until it completes.
- Code: `frontend/src/App.jsx`

## API Overview (Backend)

Base prefix: `/api`

- **Auth** (`/api/auth`)
  - `POST /register`
  - `POST /login`
  - `POST /logout`

- **Products** (`/api/products`)
  - `POST /create` (auth)
  - `GET /` (auth)
  - `GET /vendor/name` (auth)
  - `GET /:id` (public, QR lookup)
  - `POST /activate/:id` (auth)
  - `POST /block/:id` (auth)
  - `POST /update/:id` (auth)
  - `POST /delete/:id` (auth; vendor owner or admin)

- **Audit Logs** (`/api/audit`)
  - `GET /all` (admin)
  - `GET /qr/:qrCode` (admin)
  - `GET /vendor` (vendor)
  - `GET /product/:productId` (auth)
  - `GET /public/product/:productId` (public)

- **Admin** (`/api/admin`) (admin-only)
  - `GET /dashboard/stats`
  - `GET /users`, `GET /users/:id`, `PUT /users/:id/role`, `DELETE /users/:id`
  - `GET /vendors`
  - `GET /products`, `PATCH /products/:id/review`
  - `GET /audit-logs`

## Production Notes

- **CORS**: set `CORS_ORIGIN` to your deployed frontend domain.
- **Cookies**: auth uses an `httpOnly` cookie called `token`. In production, cookies are set with `secure: true` and `sameSite: none`.
- **Frontend API base**: by default the frontend uses `/api`. If you need a different backend URL, set:
  - `VITE_API_BASE_URL=https://your-backend-domain.com/api`

## Troubleshooting

- If login/register works locally but not in production: verify `CORS_ORIGIN`, HTTPS, and cookie settings.
- If QR generation fails: verify Cloudinary env vars are set and the Cloudinary account is active.
