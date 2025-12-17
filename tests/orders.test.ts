import request from 'supertest';
import app from '../app';
import db from '../src/database';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import { UserStore } from '../src/models/User';
import { OrderStore } from '../src/models/Order';
import { config } from 'dotenv';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      JWT_SECRET: string;
      DB_HOST?: string;
      DB_PORT?: string;
      DB_NAME?: string;
      DB_USER?: string;
      DB_PASSWORD?: string;
    }
  }
}

// Helper function to decode JWT token
function decodeToken(token: string): any {
  return jwt.verify(token, process.env.JWT_SECRET);
}

// Load test environment variables
config({ path: '.env.test' });

// Helper function to create a test user and get token
async function createTestUser() {
  const testUser = {
    firstname: 'Order',
    lastname: 'Test',
    email: `order-test-${Date.now()}@test.com`,
    password: 'testpassword123'
  };

  // Register the user
  await request(app)
    .post('/users/register')
    .send(testUser);

  // Login to get token
  const loginRes = await request(app)
    .post('/users/login')
    .send({
      email: testUser.email,
      password: testUser.password
    });

  // Extract user ID from token
  const decoded = decodeToken(loginRes.body.token);

  return {
    token: loginRes.body.token,
    userId: decoded.user.id,
    email: testUser.email
  };
}

describe('Orders API', () => {
  let token: string;
  let userId: number;
  let testUserEmail: string;
  const userStore = new UserStore();
  const orderStore = new OrderStore();

  beforeAll(async () => {
    // Load test environment variables
    config({ path: '.env.test' });

    // Connect to the database is handled by the pool
    // console.log('Successfully connected to test database');

    // Clean up any existing test data
    await orderStore.deleteAll();
    await userStore.deleteAll();

    // Create a test user and get token
    const { token: userToken, userId: id, email } = await createTestUser();
    token = userToken;
    userId = id;
    testUserEmail = email;
  });
  afterAll(async () => {
    try {
      // Clean up test data
      if (testUserEmail) {
        try {
          // Use a new client for cleanup to avoid connection issues
          const cleanupClient = new Pool({
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: Number(process.env.DB_PORT) || 5432,
          });
          await cleanupClient.query('DELETE FROM orders WHERE user_id = $1', [userId]);
          await cleanupClient.query('DELETE FROM users WHERE email = $1', [testUserEmail]);
          await cleanupClient.end();

          // Close the app's database pool
          await db.end();
        } catch (e) {
          console.error('Error during cleanup:', e);
        }
      }
    } catch (error) {
      console.error('Error in afterAll:', error);
    }
  });
  describe('POST /orders', () => {
    it('should reject requests without token', async () => {
      const res = await request(app)
        .post('/orders')
        .send({
          status: 'active',
          total: 99.99,
          user_id: 1
        });
      expect(res.status).toBe(401);
    });

    it('should create a new order with valid token', async () => {
      const orderData = {
        status: 'active',
        total: '99.99'  // Ensure total is a string to match API expectations
      };

      try {
        const res = await request(app)
          .post('/orders')
          .set('Authorization', `Bearer ${token}`)
          .send(orderData);

        console.log('Order creation response:', {
          status: res.status,
          body: res.body,
          headers: res.headers
        });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.status).toBe(orderData.status);
        expect(res.body.total).toBe(orderData.total);

        // The user_id should be set from the token
        expect(res.body.user_id).toBe(userId);

        // Verify the order was actually created in the database
        const result = await db.query(
          'SELECT * FROM orders WHERE id = $1',
          [res.body.id]
        );
        const dbOrder = result.rows[0];
        expect(dbOrder).toBeDefined();
        expect(dbOrder.status).toBe(orderData.status);
        expect(Number(dbOrder.total)).toBe(Number(orderData.total));
        expect(dbOrder.user_id).toBe(userId);
      } catch (error) {
        console.error('Order creation failed:', error);
        throw error;
      }
    });
  });
});