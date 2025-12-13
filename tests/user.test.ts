import request from 'supertest';
import app from '../app';
import { UserStore } from '../src/models/User';
import { Client } from 'pg';
import { config } from 'dotenv';
import jwt from 'jsonwebtoken';
const { v4: uuidv4 } = require('uuid');

// Load test environment variables
config({ path: '.env.test' });

// Helper to decode JWT token
const decodeToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET as string) as { user: any };
};

describe('User API', () => {
  let token: string;
  let userId: number;
  const userStore = new UserStore();
  let dbClient: Client;

  beforeAll(async () => {
    console.log('Test database connection details:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER
    });

    // Set up database client
    dbClient = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'store_test',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    });

    await dbClient.connect();
    console.log('Successfully connected to test database');

    // Clean up any existing test data
    await userStore.deleteAll();

    // Create a test user
    const userData = {
      firstname: 'Test',
      lastname: 'User',
      email: 'test@example.com',
      password: 'testpassword'
    };

    const user = await userStore.create(userData);
    userId = user.id as number;

    // Login to get token
    const loginRes = await request(app)
      .post('/users/login')
      .send({
        email: 'test@example.com',
        password: 'testpassword'
      });

    token = loginRes.body.token;
  });

  afterAll(async () => {
    // Clean up test data
    console.log('Cleaning up test data...');
    await userStore.deleteAll();
    
    // Close the database connection
    if (dbClient) {
      await dbClient.end();
      console.log('Database connection closed');
    }
  });

  describe('POST /users/register', () => {
    it('should register a new user', async () => {
      const userData = {
        firstname: 'New',
        lastname: 'User',
        email: 'newuser@example.com',
        password: 'newpassword'
      };

      const res = await request(app)
        .post('/users/register')
        .send(userData);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      
      // Decode the token to verify user data
      const decoded = decodeToken(res.body.token);
      expect(decoded.user).toHaveProperty('id');
      expect(decoded.user.email).toBe(userData.email);
      expect(decoded.user.firstname).toBe(userData.firstname);
      expect(decoded.user.lastname).toBe(userData.lastname);
    });

    it('should not register a user with duplicate email', async () => {
      // Create a unique email for this test
      const uniqueEmail = `test-${uuidv4()}@example.com`;
      
      // First, create a user with this email
      const userData = {
        firstname: 'Test',
        lastname: 'User',
        email: uniqueEmail,
        password: 'testpassword'
      };

      // First registration should succeed
      await request(app)
        .post('/users/register')
        .send(userData);

      // Second registration with same email should fail
      const res = await request(app)
        .post('/users/register')
        .send(userData);

      // Check if the response indicates an error (4xx or 5xx)
      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /users/login', () => {
    it('should login user with valid credentials', async () => {
      // Create a new test user with known credentials
      const testUser = {
        firstname: 'Login',
        lastname: 'Test',
        email: `login-${Date.now()}@test.com`,
        password: 'testpassword123'
      };
      
      // Register the user first
      await request(app)
        .post('/users/register')
        .send(testUser);

      // Now try to login
      const res = await request(app)
        .post('/users/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      console.log('Login response:', {
        status: res.status,
        body: res.body,
        error: res.body.error
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      
      // Verify the token contains user data
      const decoded = decodeToken(res.body.token);
      expect(decoded.user).toHaveProperty('id');
      expect(decoded.user.email).toBe(testUser.email);
    });

    it('should not login with invalid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const res = await request(app)
        .post('/users/login')
        .send(credentials);

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid credentials');
    });
  });

  describe('GET /users', () => {
    it('should require authentication', async () => {
      const res = await request(app)
        .get('/users');

      expect(res.status).toBe(401);
    });

    it('should return all users with valid token', async () => {
      // Create a new unique test user for this test
      const uniqueEmail = `test-${uuidv4()}@example.com`;
      const testUserData = {
        firstname: 'Test',
        lastname: 'User',
        email: uniqueEmail,
        password: 'testpassword'
      };

      // Register the new user
      await request(app)
        .post('/users/register')
        .send(testUserData);

      // Now get all users
      const res = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      
      // Verify our test user is in the list
      const testUser = res.body.find((u: any) => u.email === uniqueEmail);
      expect(testUser).toBeDefined();
      
      // Verify the user object structure
      expect(testUser).toHaveProperty('id');
      expect(testUser).toHaveProperty('firstname', 'Test');
      expect(testUser).toHaveProperty('lastname', 'User');
      expect(testUser).toHaveProperty('email', uniqueEmail);
      // Should not include password in the response
      expect(testUser).not.toHaveProperty('password');
    });
  });

  describe('GET /users/:id', () => {
    it('should return user by ID', async () => {
      // Create a new unique test user
      const uniqueEmail = `test-${uuidv4()}@example.com`;
      const testUserData = {
        firstname: 'Test',
        lastname: 'User',
        email: uniqueEmail,
        password: 'testpassword'
      };

      // Register the new user
      const registerRes = await request(app)
        .post('/users/register')
        .send(testUserData);

      // Get the user ID from the registration response
      const token = registerRes.body.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { user: any };
      const testUserId = decoded.user.id;
      
      // Now try to get the user by ID
      const res = await request(app)
        .get(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
      expect(res.body).toHaveProperty('id', testUserId);
      expect(res.body).toHaveProperty('email', uniqueEmail);
      expect(res.body).toHaveProperty('firstname', 'Test');
      expect(res.body).toHaveProperty('lastname', 'User');
    });

    it('should return empty response for non-existent user', async () => {
      const res = await request(app)
        .get('/users/999999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toBeFalsy();
    });
  });
});