import express, { Request, Response } from 'express';
import { OrderProduct } from '../src/models/OrderProducts';

const router = express.Router();

// Add product to order
router.post('/', async (req: Request, res: Response) => {
  try {
    const { order_id, product_id, quantity } = req.body;
    const orderProduct = await OrderProduct.addProduct({ order_id, product_id, quantity });
    res.status(201).json(orderProduct);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(400).json({ error: errorMessage });
  }
});

// Get all products for a specific order
router.get('/order/:orderId', async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.orderId);
    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID format' });
    }
    
    const orderProducts = await OrderProduct.getOrderProducts(orderId);
    res.json(orderProducts);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

// Get specific product in an order
router.get('/order/:orderId/product/:productId', async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const productId = parseInt(req.params.productId);
    
    if (isNaN(orderId) || isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    const orderProduct = await OrderProduct.getByOrderAndProduct(orderId, productId);
    if (!orderProduct) {
      return res.status(404).json({ error: 'Order product not found' });
    }
    
    res.json(orderProduct);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

// Update product quantity in an order
router.put('/order/:orderId/product/:productId', async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const productId = parseInt(req.params.productId);
    const { quantity } = req.body;
    
    if (isNaN(orderId) || isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    if (typeof quantity !== 'number' || quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be a positive number' });
    }
    
    const updatedOrderProduct = await OrderProduct.updateQuantity(orderId, productId, quantity);
    res.json(updatedOrderProduct);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(400).json({ error: errorMessage });
  }
});

// Remove product from order
router.delete('/order/:orderId/product/:productId', async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const productId = parseInt(req.params.productId);
    
    if (isNaN(orderId) || isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    await OrderProduct.removeProduct(orderId, productId);
    res.status(204).send();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(400).json({ error: errorMessage });
  }
});

export default router;