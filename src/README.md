# Project Workspace (src)

This `src/` folder contains the two main applications:

- `backend/` — Node.js + Express + MongoDB (Mongoose)
- `frontend/` — React + Vite + Tailwind + Axios

For detailed setup (including env vars), see:

- `backend/README.md`
- `frontend/README.md`

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

## Folder Structure

```
backend/
  server.js
  package.json
  .env.example
  src/
    app.js
    controllers/
    routes/
    models/
    ...
frontend/
  package.json
  vite.config.js
  .env.example
  src/
    pages/
    components/
    ...
```
