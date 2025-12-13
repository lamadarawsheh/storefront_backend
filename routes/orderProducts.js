"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const OrderProduct_1 = require("../models/OrderProduct");
const router = (0, express_1.Router)();
router.post('/', async (req, res) => {
    try {
        const orderProductData = req.body;
        const orderProduct = await OrderProduct_1.OrderProduct.create(orderProductData);
        res.status(201).json(orderProduct);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create order product' });
    }
});
router.get('/', async (req, res) => {
    try {
        const orderProducts = await OrderProduct_1.OrderProduct.findAll(); // Implement findAll
        res.json(orderProducts);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get order products' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const orderProduct = await OrderProduct_1.OrderProduct.findById(Number(req.params.id));
        if (!orderProduct)
            return res.status(404).json({ error: 'Order product not found' });
        res.json(orderProduct);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get order product' });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const updatedOrderProduct = await OrderProduct_1.OrderProduct.update(Number(req.params.id), req.body);
        if (!updatedOrderProduct)
            return res.status(404).json({ error: 'Order product not found' });
        res.json(updatedOrderProduct);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update order product' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await OrderProduct_1.OrderProduct.delete(Number(req.params.id));
        if (!deleted)
            return res.status(404).json({ error: 'Order product not found' });
        res.json({ message: 'Order product deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete order product' });
    }
});
exports.default = router;
//# sourceMappingURL=orderProducts.js.map