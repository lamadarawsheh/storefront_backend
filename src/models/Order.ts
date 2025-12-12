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
    const sql = 'SELECT * FROM orders';
    const result = await conn.query(sql);
    conn.release();
    return result.rows;
  }

  async show(id: number): Promise<Order> {
    const conn = await db.connect();
    const sql = 'SELECT * FROM orders WHERE id=($1)';
    const result = await conn.query(sql, [id]);
    conn.release();
    return result.rows[0];
  }

  async create(order: Order): Promise<Order> {
    const conn = await db.connect();
    const sql = 'INSERT INTO orders (status, user_id, total) VALUES($1, $2, $3) RETURNING *';
    const result = await conn.query(sql, [order.status, order.user_id, order.total]);
    conn.release();
    return result.rows[0];
  }

  async update(id: number, order: Order): Promise<Order> {
    const conn = await db.connect();
    const sql = 'UPDATE orders SET status=$1, user_id=$2, total=$3 WHERE id=$4 RETURNING *';
    const result = await conn.query(sql, [order.status, order.user_id, order.total, id]);
    conn.release();
    return result.rows[0];
  }

  async delete(id: number): Promise<void> {
    const conn = await db.connect();
    const sql = 'DELETE FROM orders WHERE id=($1)';
    await conn.query(sql, [id]);
    conn.release();
  }

  async deleteAll(): Promise<void> {
    const conn = await db.connect();
    await conn.query('DELETE FROM orders');
    conn.release();
  }
}
