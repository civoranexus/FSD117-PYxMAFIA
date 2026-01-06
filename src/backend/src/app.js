//create backend server/app
import express from 'express';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes.js';
import productRouter from './routes/product.routes.js';

const app = express();
app.use(cookieParser());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/auth', authRouter);
app.use('/products', productRouter);


export default app;