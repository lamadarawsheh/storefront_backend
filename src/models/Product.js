"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const database_1 = __importDefault(require("../database"));
class Product {
    static async create(product) {
        const { name, price, category } = product;
        try {
            const sql = `
        INSERT INTO products (name, price, category)
        VALUES ($1, $2, $3)
        RETURNING id, name, price, category, created_at
      `;
            const result = await database_1.default.query(sql, [name, price, category || null]);
            return result.rows[0];
        }
        catch (err) {
            throw new Error(`Could not create product ${name}. Error: ${err}`);
        }
    }
    static async findById(id) {
        try {
            const sql = 'SELECT id, name, price, category, created_at FROM products WHERE id = $1';
            const result = await database_1.default.query(sql, [id]);
            return result.rows[0] || null;
        }
        catch (err) {
            throw new Error(`Could not find product ${id}. Error: ${err}`);
        }
    }
    static async findAll() {
        try {
            const sql = 'SELECT id, name, price, category, created_at FROM products';
            const result = await database_1.default.query(sql);
            return result.rows;
        }
        catch (err) {
            throw new Error(`Could not get products. Error: ${err}`);
        }
    }
    static async update(id, updates) {
        const { name, price, category } = updates;
        try {
            const sql = `
        UPDATE products 
        SET name = COALESCE($1, name),
            price = COALESCE($2, price),
            category = COALESCE($3, category)
        WHERE id = $4
        RETURNING id, name, price, category, created_at
      `;
            const result = await database_1.default.query(sql, [name, price, category, id]);
            if (!result.rows[0]) {
                throw new Error(`Product with id ${id} not found`);
            }
            return result.rows[0];
        }
        catch (err) {
            throw new Error(`Could not update product ${id}. Error: ${err}`);
        }
    }
    static async delete(id) {
        try {
            const sql = 'DELETE FROM products WHERE id = $1';
            await database_1.default.query(sql, [id]);
        }
        catch (err) {
            throw new Error(`Could not delete product ${id}. Error: ${err}`);
        }
    }
}
exports.Product = Product;
//# sourceMappingURL=Product.js.map