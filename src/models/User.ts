import db from '../database';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();
const pepper = process.env.BCRYPT_PASSWORD;
const saltRounds = process.env.SALT_ROUNDS as string;

export type User = {
  id?: number;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
};

export class UserStore {
  async index(): Promise<User[]> {
    const conn = await db.connect();
    const sql = 'SELECT id, firstname, lastname, email FROM users';
    const result = await conn.query(sql);
    conn.release();
    return result.rows;
  }

  async show(id: number): Promise<User> {
    const conn = await db.connect();
    const sql = 'SELECT id, firstname, lastname, email FROM users WHERE id=($1)';
    const result = await conn.query(sql, [id]);
    conn.release();
    return result.rows[0];
  }

  async create(user: User): Promise<User> {
    const conn = await db.connect();
    const sql = 'INSERT INTO users (firstname, lastname, email, password) VALUES($1, $2, $3, $4) RETURNING id, firstname, lastname, email';
    const hash = bcrypt.hashSync(
      user.password + pepper,
      parseInt(saltRounds)
    );
    const result = await conn.query(sql, [
      user.firstname,
      user.lastname,
      user.email,
      hash
    ]);
    conn.release();
    return result.rows[0];
  }

  async authenticate(email: string, password: string): Promise<User | null> {
    const conn = await db.connect();
    const sql = 'SELECT * FROM users WHERE email=($1)';
    const result = await conn.query(sql, [email]);
    conn.release();

    if (result.rows.length) {
      const user = result.rows[0];
      if (bcrypt.compareSync(password + pepper, user.password)) {
        return {
          id: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          password: '' // Don't return the password hash
        };
      }
    }
    throw new Error('Invalid credentials');
  }

  async delete(id: number): Promise<void> {
    const conn = await db.connect();
    const sql = 'DELETE FROM users WHERE id=($1)';
    await conn.query(sql, [id]);
    conn.release();
  }

  async deleteAll(): Promise<void> {
    const conn = await db.connect();
    await conn.query('DELETE FROM users');
    conn.release();
  }
}
