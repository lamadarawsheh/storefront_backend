"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderProduct = void 0;
const database_1 = __importDefault(require("../database"));
class OrderProduct {
    static async addProduct(orderProduct) {
        const { order_id, product_id, quantity } = orderProduct;
        try {
            // Check if product is already in the order
            const checkSql = 'SELECT * FROM order_products WHERE order_id = $1 AND product_id = $2';
            const checkResult = await database_1.default.query(checkSql, [order_id, product_id]);
            if (checkResult.rows.length > 0) {
                // Update quantity if product already exists in order
                const updateSql = `
          UPDATE order_products 
          SET quantity = quantity + $1
          WHERE order_id = $2 AND product_id = $3
          RETURNING id, order_id, product_id, quantity
        `;
                const updateResult = await database_1.default.query(updateSql, [quantity, order_id, product_id]);
                return updateResult.rows[0];
            }
            else {
                // Add new product to order
                const insertSql = `
          INSERT INTO order_products (order_id, product_id, quantity)
          VALUES ($1, $2, $3)
          RETURNING id, order_id, product_id, quantity
        `;
                const insertResult = await database_1.default.query(insertSql, [order_id, product_id, quantity]);
                return insertResult.rows[0];
            }
        }
        catch (err) {
            throw new Error(`Could not add product ${product_id} to order ${order_id}. Error: ${err}`);
        }
    }
    static async getOrderProducts(orderId) {
        try {
            const sql = `
        SELECT op.id, op.order_id, op.product_id, op.quantity, p.name, p.price, p.category
        FROM order_products op
        JOIN products p ON op.product_id = p.id
        WHERE op.order_id = $1
      `;
            const result = await database_1.default.query(sql, [orderId]);
            return result.rows;
        }
        catch (err) {
            throw new Error(`Could not get products for order ${orderId}. Error: ${err}`);
        }
    }
    static async updateQuantity(orderId, productId, quantity) {
        try {
            const sql = `
        UPDATE order_products 
        SET quantity = $1
        WHERE order_id = $2 AND product_id = $3
        RETURNING id, order_id, product_id, quantity
      `;
            const result = await database_1.default.query(sql, [quantity, orderId, productId]);
            if (!result.rows[0]) {
                throw new Error(`Product ${productId} not found in order ${orderId}`);
            }
            return result.rows[0];
        }
        catch (err) {
            throw new Error(`Could not update product ${productId} in order ${orderId}. Error: ${err}`);
        }
    }
    static async removeProduct(orderId, productId) {
        try {
            const sql = 'DELETE FROM order_products WHERE order_id = $1 AND product_id = $2';
            const result = await database_1.default.query(sql, [orderId, productId]);
            if (result.rowCount === 0) {
                throw new Error(`Product ${productId} not found in order ${orderId}`);
            }
        }
        catch (err) {
            throw new Error(`Could not remove product ${productId} from order ${orderId}. Error: ${err}`);
        }
    }
    static async getByOrderAndProduct(orderId, productId) {
        try {
            const sql = 'SELECT * FROM order_products WHERE order_id = $1 AND product_id = $2';
            const result = await database_1.default.query(sql, [orderId, productId]);
            return result.rows[0] || null;
        }
        catch (err) {
            throw new Error(`Could not find product ${productId} in order ${orderId}. Error: ${err}`);
        }
    }
}
exports.OrderProduct = OrderProduct;
//# sourceMappingURL=OrderProducts.js.map