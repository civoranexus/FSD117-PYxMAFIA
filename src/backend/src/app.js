//create backend server/app
import express from 'express';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes.js';
import productRouter from './routes/product.routes.js';
import auditRouter from './routes/auditLog.routes.js';
import adminRouter from './routes/admin.routes.js';
import warmupRouter from './routes/warmup.routes.js';
import cors from 'cors';

const app = express();
app.use(cookieParser());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use("/api/audit", auditRouter);
app.use('/api/admin', adminRouter);
app.use('/api/warmup', warmupRouter);

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