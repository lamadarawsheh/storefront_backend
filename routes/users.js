"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = require("../models/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
// LOGIN user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User_1.User.findByEmail(email);
        if (!user)
            return res.status(400).json({ error: 'Invalid credentials' });
        const validPassword = await bcrypt_1.default.compare(password, user.password);
        if (!validPassword)
            return res.status(400).json({ error: 'Invalid credentials' });
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// CREATE user
router.post('/', async (req, res) => {
    try {
        const userData = req.body;
        const user = await User_1.User.create(userData);
        res.status(201).json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create user' });
    }
});
// READ all users
router.get('/', async (req, res) => {
    try {
        const result = await User_1.User.findAll(); // You need to implement this in User model
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get users' });
    }
});
// READ user by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await User_1.User.findById(Number(req.params.id));
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get user' });
    }
});
// UPDATE user
router.put('/:id', async (req, res) => {
    try {
        const updatedUser = await User_1.User.update(Number(req.params.id), req.body);
        if (!updatedUser)
            return res.status(404).json({ error: 'User not found' });
        res.json(updatedUser);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update user' });
    }
});
// DELETE user
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await User_1.User.delete(Number(req.params.id));
        if (!deleted)
            return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map