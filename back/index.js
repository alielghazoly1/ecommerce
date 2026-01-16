import express from 'express';
import serverless from 'serverless-http';
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

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(cors());

// Routes
app.use('/images', express.static('uploads')); // لو Local فقط، أو استخدم external storage على Vercel
app.use('/api/user', userRouter);
app.use('/api/order', orderRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/admin', adminRouter);

// Root & test routes
app.get('/', (req, res) => res.send('API working'));
app.get('/test', (req, res) => res.send('API working'));

// Connect to MongoDB
connectDB()
  .then(() => console.log('DB connected'))
  .catch((err) => console.error('DB connection failed', err));

// Export for Vercel
export const handler = serverless(app);

// Local dev
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`Server running locally on port ${PORT}`));
}
