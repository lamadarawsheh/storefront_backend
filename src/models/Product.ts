import client from '../database';

export interface IProduct {
  id?: number;
  name: string;
  price: number;
  created_at?: Date;
  // Remove category since it doesn't exist in the table
}

export class Product {
// In src/models/Product.ts
static async create(product: IProduct): Promise<IProduct> {
  const { name, price } = product; // Remove category from destructuring
    
  try {
    const sql = `
      INSERT INTO products (name, price)
      VALUES ($1, $2)
      RETURNING id, name, price, created_at
    `;
    const result = await client.query(sql, [name, price]);
    return result.rows[0];
  } catch (err) {
    throw new Error(`Could not create product ${name}. Error: ${err}`);
  }
}

  static async findById(id: number): Promise<IProduct | null> {
  try {
    const sql = 'SELECT id, name, price, created_at FROM products WHERE id = $1';
    const result = await client.query(sql, [id]);
    return result.rows[0] || null;
  } catch (err) {
    throw new Error(`Could not find product ${id}. Error: ${err}`);
  }
}

static async findAll(): Promise<IProduct[]> {
  try {
    const sql = 'SELECT id, name, price, created_at FROM products';
    const result = await client.query(sql);
    return result.rows;
  } catch (err) {
    throw new Error(`Could not get products. Error: ${err}`);
  }
}

  // In src/models/Product.ts
static async update(id: number, updates: Partial<IProduct>): Promise<IProduct> {
  const { name, price } = updates;
  
  try {
    const sql = `
      UPDATE products 
      SET name = COALESCE($1, name),
          price = COALESCE($2, price)
      WHERE id = $3
      RETURNING id, name, price, created_at
    `;
    const result = await client.query(sql, [name, price, id]);
    
    if (!result.rows[0]) {
      throw new Error(`Product with id ${id} not found`);
    }
    
    return result.rows[0];
  } catch (err) {
    throw new Error(`Could not update product ${id}. Error: ${err}`);
  }
}

  static async delete(id: number): Promise<void> {
    try {
      const sql = 'DELETE FROM products WHERE id = $1';
      await client.query(sql, [id]);
    } catch (err) {
      throw new Error(`Could not delete product ${id}. Error: ${err}`);
    }
  }
}
