"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const database_1 = __importDefault(require("../database"));
class Order {
    static async create(order) {
        const { user_id, status = 'active' } = order;
        try {
            const sql = `
        INSERT INTO orders (user_id, status)
        VALUES ($1, $2)
        RETURNING id, user_id, status, created_at
      `;
            const result = await database_1.default.query(sql, [user_id, status]);
            return result.rows[0];
        }
        catch (err) {
            throw new Error(`Could not create order. Error: ${err}`);
        }
    }
    static async findById(id) {
        try {
            const sql = 'SELECT id, user_id, status, created_at FROM orders WHERE id = $1';
            const result = await database_1.default.query(sql, [id]);
            return result.rows[0] || null;
        }
        catch (err) {
            throw new Error(`Could not find order ${id}. Error: ${err}`);
        }
    }
    static async findByUser(userId, status) {
        try {
            let sql = 'SELECT id, user_id, status, created_at FROM orders WHERE user_id = $1';
            const params = [userId];
            if (status) {
                sql += ' AND status = $2';
                params.push(status);
            }
            const result = await database_1.default.query(sql, params);
            return result.rows;
        }
        catch (err) {
            throw new Error(`Could not get orders for user ${userId}. Error: ${err}`);
        }
    }
    static async updateStatus(id, status) {
        try {
            const sql = `
        UPDATE orders 
        SET status = $1
        WHERE id = $2
        RETURNING id, user_id, status, created_at
      `;
            const result = await database_1.default.query(sql, [status, id]);
            if (!result.rows[0]) {
                throw new Error(`Order with id ${id} not found`);
            }
            return result.rows[0];
        }
        catch (err) {
            throw new Error(`Could not update order ${id}. Error: ${err}`);
        }
    }
    static async delete(id) {
        try {
            const sql = 'DELETE FROM orders WHERE id = $1';
            await database_1.default.query(sql, [id]);
        }
        catch (err) {
            throw new Error(`Could not delete order ${id}. Error: ${err}`);
        }
    }
}
exports.Order = Order;
//# sourceMappingURL=Order.js.map