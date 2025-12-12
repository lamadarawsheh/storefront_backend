import { Router } from 'express';
import { Product, IProduct } from '../src/models/Product';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const productData: IProduct = req.body;
    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll(); // Implement findAll
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get products' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(Number(req.params.id));
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get product' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.update(Number(req.params.id), req.body);
    if (!updatedProduct) return res.status(404).json({ error: 'Product not found' });
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Product.delete(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    console.error('Delete product error:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to delete product' 
    });
  }
});

export default router;
