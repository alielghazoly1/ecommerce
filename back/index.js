import express from 'express';
import cors from 'cors';
import compression from 'compression';
import connectDB from './config/db.js';
import 'dotenv/config.js';
import userRouter from './routes/userRoutes.js';
import orderRouter from './routes/orderRoutes.js';
import productRouter from './routes/productRoutes.js';
import cartRouter from './routes/cartRoutes.js';
import adminRouter from './routes/adminRoutes.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(cors());

// Routes
app.use('/images', express.static('uploads'));
app.use('/api/user', userRouter);
app.use('/api/order', orderRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/admin', adminRouter);

// Root route
app.get('/', (req, res) => res.send('API working'));

// Start server
app.listen(PORT, async () => {
  try {
    await connectDB();
    console.log(`Server is running on port ${PORT}`);
  } catch (err) {
    console.error('DB connection failed', err);
    process.exit(1);
  }
});
