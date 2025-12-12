import express from 'express';

const app = express();
app.use(express.json());

// Import routes
import userRoutes from './routes/users';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import orderProductRoutes from './routes/orderProducts';

// Use routes
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/order-products', orderProductRoutes);

export default app;