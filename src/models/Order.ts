import db from '../database';

export type Order = {
  id?: number;
  status: string;
  user_id: number;
  total: number;
};

export class OrderStore {
  async index(): Promise<Order[]> {
    const conn = await db.connect();
    try {
      const sql = 'SELECT * FROM orders';
      const result = await conn.query(sql);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching orders: ${error}`);
    } finally {
      conn.release();
    }
  }

  async show(id: number): Promise<Order> {
    const conn = await db.connect();
    try {
      const sql = 'SELECT * FROM orders WHERE id=($1)';
      const result = await conn.query(sql, [id]);
      if (result.rows.length === 0) {
        throw new Error(`Order with id ${id} not found`);
      }
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching order ${id}: ${error}`);
    } finally {
      conn.release();
    }
  }

  async create(order: Order): Promise<Order> {
    const conn = await db.connect();
    try {
      const sql = 'INSERT INTO orders (status, user_id, total) VALUES($1, $2, $3) RETURNING *';
      const result = await conn.query(sql, [order.status, order.user_id, order.total]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating order: ${error}`);
    } finally {
      conn.release();
    }
  }

  async update(id: number, order: Order): Promise<Order> {
    const conn = await db.connect();
    try {
      const sql = 'UPDATE orders SET status=$1, user_id=$2, total=$3 WHERE id=$4 RETURNING *';
      const result = await conn.query(sql, [order.status, order.user_id, order.total, id]);
      if (result.rows.length === 0) {
        throw new Error(`Order with id ${id} not found`);
      }
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating order ${id}: ${error}`);
    } finally {
      conn.release();
    }
  }

  async delete(id: number): Promise<void> {
    const conn = await db.connect();
    try {
      const sql = 'DELETE FROM orders WHERE id=($1)';
      const result = await conn.query(sql, [id]);
      if (result.rowCount === 0) {
        throw new Error(`Order with id ${id} not found`);
      }
    } catch (error) {
      throw new Error(`Error deleting order ${id}: ${error}`);
    } finally {
      conn.release();
    }
  }

  async deleteAll(): Promise<void> {
    const conn = await db.connect();
    try {
      await conn.query('DELETE FROM orders');
    } catch (error) {
      throw new Error(`Error deleting all orders: ${error}`);
    } finally {
      conn.release();
    }
  }
}
