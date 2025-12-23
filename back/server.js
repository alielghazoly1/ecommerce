import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import 'dotenv/config.js';
import userRouter from './routes/userRoutes.js';
import orderRouter from './routes/orderRoutes.js';
import productRouter from './routes/productRoutes.js';
const app = express();

const PORT = 4000;

app.use(express.json());

app.use(cors());
app.use('/api/user', userRouter);
app.use('/api/order', orderRouter);
app.use('/api/product', productRouter);

app.get('/', (req, res) => {
  res.send('API working');
});

app.listen(PORT, async () => {
  connectDB();
  console.log(`Server is running ${PORT}`);
});
