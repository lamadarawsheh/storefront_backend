import request from 'supertest';
import app from '../app';
import { UserStore } from '../src/models/User';
import { OrderStore } from '../src/models/Order';

describe('Orders API', () => {
  let token: string;
  let userId: number;
  const userStore = new UserStore();
  const orderStore = new OrderStore();

  beforeAll(async () => {
    // Clean up any existing test data
    await orderStore.deleteAll();
    await userStore.deleteAll();

    // Create a test user
    const user = await userStore.create({
      firstname: 'Order',
      lastname: 'Test',
      email: 'order@test.com',
      password: 'testpassword'
    });
    userId = user.id as number;

    // Login to get token
    const loginResponse = await request(app)
      .post('/users/login')
      .send({ email: 'order@test.com', password: 'testpassword' });
    token = loginResponse.body.token;
  });

  afterAll(async () => {
    // Clean up test data
    await orderStore.deleteAll();
    await userStore.deleteAll();
  });

  describe('POST /orders', () => {
    it('should reject requests without token', async () => {
      const res = await request(app)
        .post('/orders')
        .send({ status: 'active' });
      expect(res.status).toBe(401);
    });

    it('should create a new order with valid token', async () => {
      const orderData = {
        status: 'active',
        total: 99.99
      };
      
      const res = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send(orderData);
      
      if (res.status !== 201) {
        console.log('Error response:', res.body);
      }
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.status).toBe(orderData.status);
      expect(Number(res.body.total)).toBe(orderData.total);
      expect(res.body.user_id).toBe(userId);
    });
  });
});
