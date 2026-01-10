//create backend server/app
import express from 'express';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes.js';
import productRouter from './routes/product.routes.js';
import auditRouter from './routes/auditLog.routes.js';
import cors from 'cors';

const app = express();
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use("/api/audit", auditRouter);


export default app;