"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Order_1 = require("../models/Order");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const orderData = req.body;
        const order = await Order_1.Order.create(orderData);
        res.status(201).json(order);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create order' });
    }
});
router.get('/', async (req, res) => {
    try {
        const orders = await Order_1.Order.findAll(); // Implement findAll
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get orders' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const order = await Order_1.Order.findById(Number(req.params.id));
        if (!order)
            return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get order' });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const updatedOrder = await Order_1.Order.update(Number(req.params.id), req.body);
        if (!updatedOrder)
            return res.status(404).json({ error: 'Order not found' });
        res.json(updatedOrder);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update order' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Order_1.Order.delete(Number(req.params.id));
        if (!deleted)
            return res.status(404).json({ error: 'Order not found' });
        res.json({ message: 'Order deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete order' });
    }
});
exports.default = router;
//# sourceMappingURL=orders.js.map