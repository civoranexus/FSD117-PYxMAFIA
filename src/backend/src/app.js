//create backend server/app
import express from 'express';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes.js';
import productRouter from './routes/product.routes.js';
import auditRouter from './routes/auditLog.routes.js';

const app = express();
app.use(cookieParser());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/auth', authRouter);
app.use('/products', productRouter);
app.use("/audit", auditRouter);


export default app;