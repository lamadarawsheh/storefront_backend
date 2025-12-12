import request from 'supertest';
import app from '../app';
import { UserStore } from '../src/models/User';

describe('User API', () => {
  let token: string;
  const userStore = new UserStore();

  beforeAll(async () => {
    // Clean up any existing test users
    await userStore.deleteAll();
    
    // Create a test user
    await userStore.create({
      firstname: 'Test',
      lastname: 'User',
      email: 'test@example.com',
      password: 'testpassword'
    });
  });

  afterAll(async () => {
    // Clean up after tests
    await userStore.deleteAll();
  });

  describe('POST /users/login', () => {
    it('should login user and return JWT token', async () => {
      const response = await request(app)
        .post('/users/login')
        .send({ email: 'test@example.com', password: 'testpassword' });
      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      token = response.body.token;
    });

    it('should fail with invalid credentials', async () => {
      const response = await request(app)
        .post('/users/login')
        .send({ email: 'wrong@example.com', password: 'wrongpassword' });
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });
  });

  describe('GET /users', () => {
    it('should require authentication', async () => {
      const response = await request(app).get('/users');
      expect(response.status).toBe(401);
    });

    it('should return users with valid token', async () => {
      const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
