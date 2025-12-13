"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Product_1 = require("../models/Product");
const router = (0, express_1.Router)();
router.post('/', async (req, res) => {
    try {
        const productData = req.body;
        const product = await Product_1.Product.create(productData);
        res.status(201).json(product);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create product' });
    }
});
router.get('/', async (req, res) => {
    try {
        const products = await Product_1.Product.findAll(); // Implement findAll
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get products' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const product = await Product_1.Product.findById(Number(req.params.id));
        if (!product)
            return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get product' });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const updatedProduct = await Product_1.Product.update(Number(req.params.id), req.body);
        if (!updatedProduct)
            return res.status(404).json({ error: 'Product not found' });
        res.json(updatedProduct);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update product' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Product_1.Product.delete(Number(req.params.id));
        if (!deleted)
            return res.status(404).json({ error: 'Product not found' });
        res.json({ message: 'Product deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
});
exports.default = router;
//# sourceMappingURL=products.js.map