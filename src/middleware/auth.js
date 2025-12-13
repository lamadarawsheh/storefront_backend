"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']; // Format: 'Bearer TOKEN'
    const token = authHeader && authHeader.split(' ')[1];
    if (!token)
        return res.status(401).json({ message: 'Access token missing' });
    jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err)
            return res.status(403).json({ message: 'Invalid token' });
        req.user = user; // attach user info to request
        next();
    });
}
//# sourceMappingURL=auth.js.map