import { Router } from 'express';
import { OrderProduct, IOrderProduct } from '../src/models/OrderProducts';

const router = Router();

// Add product to order
router.post('/', async (req, res) => {
  try {
    const orderProductData: IOrderProduct = req.body;
    const orderProduct = await OrderProduct.addProduct(orderProductData);
    res.status(201).json(orderProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add product to order' });
  }
});

// Get all products for an order
router.get('/order/:orderId', async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const orderProducts = await OrderProduct.getOrderProducts(orderId);
    res.json(orderProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get order products' });
  }
});

// Get a specific product in an order
router.get('/:orderId/products/:productId', async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const productId = parseInt(req.params.productId);
    
    const orderProduct = await OrderProduct.getByOrderAndProduct(orderId, productId);
    if (!orderProduct) {
      return res.status(404).json({ error: 'Order product not found' });
    }
    
    res.json(orderProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get order product' });
  }
});

// Update product quantity in an order
router.put('/:orderId/products/:productId', async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const productId = parseInt(req.params.productId);
    const { quantity } = req.body;
    
    if (typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }
    
    if (quantity === 0) {
      // If quantity is 0, remove the product from the order
      await OrderProduct.removeProduct(orderId, productId);
      return res.status(204).send();
    } else {
      // Update the product quantity
      const updated = await OrderProduct.updateQuantity(orderId, productId, quantity);
      return res.json(updated);
    }
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update order product' });
  }
});

// Remove product from order
router.delete('/:orderId/products/:productId', async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const productId = parseInt(req.params.productId);
    
    await OrderProduct.removeProduct(orderId, productId);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to remove product from order' });
  }
});

export default router;
