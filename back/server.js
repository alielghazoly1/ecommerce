import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import 'dotenv/config.js';
import userRouter from './routes/userRoutes.js';
import orderRouter from './routes/orderRoutes.js';
import productRouter from './routes/productRoutes.js';
import cartRouter from './routes/cartRoutes.js';
import adminRouter from './routes/adminRoutes.js';

const app = express();

const PORT = 4000;

app.use(express.json());

// const allowedOrigins = ['http://localhost:5174'];

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error('Not allowed by CORS'));
//       }
//     },
//     credentials: true,
//   })
// );

app.use(cors());


app.use('/images', express.static('uploads'));
app.use('/api/user', userRouter);
app.use('/api/order', orderRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/admin', adminRouter);

app.get('/', (req, res) => {
  res.send('API working');
});

app.listen(PORT, async () => {
  connectDB();
  console.log(`Server is running ${PORT}`);
});
