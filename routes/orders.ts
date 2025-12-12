import express, { Request, Response } from 'express';
import { OrderStore } from '../src/models/Order';
import { authenticateToken } from '../src/middleware/auth';

const router = express.Router();
const orderStore = new OrderStore();

// Create a new order (protected route)
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const order = {
      status: req.body.status,
      user_id: req.user?.id, // Get user ID from the token
      total: req.body.total
    };
    const newOrder = await orderStore.create(order);
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// Get all orders (protected route)
router.get('/', authenticateToken, async (_req: Request, res: Response) => {
  try {
    const orders = await orderStore.index();
    res.json(orders);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

export default router;
