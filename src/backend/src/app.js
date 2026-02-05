//create backend server/app
import express from 'express';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes.js';
import productRouter from './routes/product.routes.js';
import auditRouter from './routes/auditLog.routes.js';
import adminRouter from './routes/admin.routes.js';
import warmupRouter from './routes/warmup.routes.js';
import contactRouter from './routes/contact.routes.js';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const app = express();
app.use(cookieParser());

const normalizeOrigin = (value) => {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  // origins never include a trailing slash; normalize to avoid mismatches
  return trimmed.replace(/\/+$/, '');
};

const rawAllowed = String(process.env.CORS_ORIGIN || 'http://localhost:5173');
const allowedOriginRules = rawAllowed
  .split(',')
  .map((v) => v.trim())
  .filter(Boolean)
  .map(normalizeOrigin);

const isAllowedByRule = (origin, rule) => {
  if (!origin || !rule) return false;
  if (origin === rule) return true;

  // Wildcard support: "*.vercel.app" matches any subdomain on that host.
  if (rule.startsWith('*.')) {
    try {
      const originUrl = new URL(origin);
      const domain = rule.slice(2).toLowerCase();
      return originUrl.hostname.toLowerCase().endsWith(`.${domain}`) || originUrl.hostname.toLowerCase() === domain;
    } catch {
      return false;
    }
  }

  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (no Origin header)
      if (!origin) return callback(null, true);

      const normalized = normalizeOrigin(origin);
      const allowed = allowedOriginRules.some((rule) => isAllowedByRule(normalized, rule));
      if (allowed) return callback(null, true);

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    optionsSuccessStatus: 204,
  })
);
app.use(express.json());

// Serve locally generated QR images (fallback when Cloudinary isn't configured)
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'backend' });
});

// Serve the frontend build in production (single-process deployment)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistDir = path.resolve(__dirname, '../../frontend/dist');
const shouldServeClient =
  String(process.env.SERVE_CLIENT || '').toLowerCase() === 'true' ||
  process.env.NODE_ENV === 'production';

if (shouldServeClient && fs.existsSync(clientDistDir)) {
  app.use(express.static(clientDistDir));

  // SPA fallback: serve index.html for non-API routes
  app.get(/^\/(?!api\/|uploads\/).*/, (req, res) => {
    res.sendFile(path.join(clientDistDir, 'index.html'));
  });
}

app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use("/api/audit", auditRouter);
app.use('/api/admin', adminRouter);
app.use('/api/warmup', warmupRouter);
app.use('/api/contact', contactRouter);

// Fallback error handler (for errors passed to next(err))
app.use((err, req, res, next) => {
  console.error('Unhandled error:', {
    method: req.method,
    path: req.originalUrl,
    message: err?.message,
    stack: err?.stack,
  });
  res.status(500).json({ message: 'Internal server error' });
});


export default app;