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
    try {
      const sql = 'SELECT id, firstname, lastname, email FROM users';
      const result = await conn.query(sql);
      return result.rows;
    } finally {
      conn.release();
    }
  }

  async show(id: number): Promise<User> {
    const conn = await db.connect();
    try {
      const sql = 'SELECT id, firstname, lastname, email FROM users WHERE id=($1)';
      const result = await conn.query(sql, [id]);
      return result.rows[0];
    } finally {
      conn.release();
    }
  }

  async create(user: User): Promise<User> {
    const conn = await db.connect();
    try {
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
      return result.rows[0];
    } catch (err: any) {
      if (err.code === '23505') { // 23505 is Postgres unique_violation error code
        throw new Error('User with this email already exists');
      }
      throw new Error(`Could not create user ${user.firstname}. Error: ${err}`);
    } finally {
      conn.release();
    }
  }

  async authenticate(email: string, password: string): Promise<User | null> {
    const conn = await db.connect();
    try {
      const sql = 'SELECT * FROM users WHERE email=($1)';
      const result = await conn.query(sql, [email]);

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
    } finally {
      conn.release();
    }
  }

  async delete(id: number): Promise<void> {
    const conn = await db.connect();
    try {
      const sql = 'DELETE FROM users WHERE id=($1)';
      await conn.query(sql, [id]);
    } finally {
      conn.release();
    }
  }

  async deleteAll(): Promise<void> {
    const conn = await db.connect();
    try {
      await conn.query('DELETE FROM users');
    } finally {
      conn.release();
    }
  }
}
