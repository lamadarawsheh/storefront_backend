// src/models/OrderProducts.ts
import client from '../database';

export interface IOrderProduct {
  id?: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price?: number;
  created_at?: Date;
}

export class OrderProduct {
  static async addProduct(orderProduct: IOrderProduct): Promise<IOrderProduct> {
    const { order_id, product_id, quantity } = orderProduct;
    
    try {
      // Verify order exists and is active
      const orderCheck = await client.query(
        'SELECT status, user_id FROM orders WHERE id = $1',
        [order_id]
      );
      
      if (orderCheck.rows.length === 0) {
        throw new Error(`Order ${order_id} not found`);
      }

      if (orderCheck.rows[0].status !== 'active') {
        throw new Error(`Order ${order_id} is not active`);
      }

      // Get product details including price
      const productCheck = await client.query(
        'SELECT id, price FROM products WHERE id = $1',
        [product_id]
      );
      
      if (productCheck.rows.length === 0) {
        throw new Error(`Product ${product_id} not found`);
      }

      // Always use the product's current price
      const productPrice = parseFloat(productCheck.rows[0].price);
      const total_price = productPrice * quantity;

      // Check if product is already in the order
      const checkSql = `
        SELECT op.id, op.order_id, op.product_id, op.quantity, op.price, op.created_at
        FROM order_products op
        WHERE op.order_id = $1 AND op.product_id = $2
      `;
      const checkResult = await client.query(checkSql, [order_id, product_id]);
      
      if (checkResult.rows.length > 0) {
        // Update quantity and price if product already exists in order
        const updateSql = `
          UPDATE order_products 
          SET quantity = quantity + $1,
              price = $2
          WHERE order_id = $3 AND product_id = $4
          RETURNING id, order_id, product_id, quantity, price, created_at
        `;
        const updateResult = await client.query(updateSql, 
          [quantity, total_price, order_id, product_id]
        );
        return updateResult.rows[0];
      } else {
        // Add new product to order
        const insertSql = `
          INSERT INTO order_products (order_id, product_id, quantity, price)
          VALUES ($1, $2, $3, $4)
          RETURNING id, order_id, product_id, quantity, price, created_at
        `;
        const insertResult = await client.query(insertSql, 
          [order_id, product_id, quantity, total_price]
        );
        return insertResult.rows[0];
      }
    } catch (err) {
      console.error('Error in OrderProduct.addProduct:', {
        error: err,
        order_id,
        product_id,
        quantity
      });
      throw err;
    }
  }

  static async getOrderProducts(orderId: number): Promise<IOrderProduct[]> {
    try {
      const sql = `
        SELECT 
          op.id, 
          op.order_id, 
          op.product_id, 
          op.quantity, 
          op.price,
          op.created_at,
          p.name as product_name
        FROM order_products op
        JOIN products p ON op.product_id = p.id
        WHERE op.order_id = $1
      `;
      const result = await client.query(sql, [orderId]);
      return result.rows;
    } catch (err) {
      console.error(`Error getting products for order ${orderId}:`, err);
      throw new Error(`Could not get products for order ${orderId}`);
    }
  }

  static async getByOrderAndProduct(orderId: number, productId: number): Promise<IOrderProduct | null> {
    try {
      const sql = `
        SELECT 
          op.id, op.order_id, op.product_id, op.quantity, op.price, op.created_at,
          p.name as product_name, p.price as product_price
        FROM order_products op
        JOIN products p ON op.product_id = p.id
        WHERE op.order_id = $1 AND op.product_id = $2
      `;
      const result = await client.query(sql, [orderId, productId]);
      return result.rows[0] || null;
    } catch (err) {
      console.error(`Error getting product ${productId} from order ${orderId}:`, err);
      throw new Error(`Could not get product ${productId} from order ${orderId}`);
    }
  }

  static async updateQuantity(
    orderId: number, 
    productId: number, 
    quantity: number
  ): Promise<IOrderProduct> {
    try {
      if (quantity <= 0) {
        throw new Error('Quantity must be greater than 0');
      }

      // Get the current product price
      const productResult = await client.query(
        'SELECT price FROM products WHERE id = $1',
        [productId]
      );
      
      if (productResult.rows.length === 0) {
        throw new Error(`Product ${productId} not found`);
      }

      const productPrice = parseFloat(productResult.rows[0].price);
      const total_price = productPrice * quantity;

      const sql = `
        UPDATE order_products 
        SET quantity = $1,
            price = $2
        WHERE order_id = $3 AND product_id = $4
        RETURNING id, order_id, product_id, quantity, price, created_at
      `;
      const result = await client.query(sql, 
        [quantity, total_price, orderId, productId]
      );
      
      if (!result.rows[0]) {
        throw new Error(`Product ${productId} not found in order ${orderId}`);
      }
      
      return result.rows[0];
    } catch (err) {
      console.error(`Error updating quantity for product ${productId} in order ${orderId}:`, err);
      throw err;
    }
  }

  static async removeProduct(orderId: number, productId: number): Promise<IOrderProduct> {
    try {
      const result = await client.query(
        `DELETE FROM order_products 
         WHERE order_id = $1 AND product_id = $2 
         RETURNING id, order_id, product_id, quantity, price, created_at`,
        [orderId, productId]
      );
      
      if (result.rows.length === 0) {
        throw new Error(`Product ${productId} not found in order ${orderId}`);
      }
      
      return result.rows[0];
    } catch (err) {
      console.error(`Error removing product ${productId} from order ${orderId}:`, err);
      throw err;
    }
  }
}