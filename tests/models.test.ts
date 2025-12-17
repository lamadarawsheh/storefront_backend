import { UserStore, User } from '../src/models/User';
import { Product, IProduct } from '../src/models/Product';
import { OrderStore, Order } from '../src/models/Order';
import { OrderProduct, IOrderProduct } from '../src/models/OrderProducts';
import db from '../src/database';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

describe('Model Unit Tests', () => {
  // Store references for cleanup
  let testUserId: number;
  let testProductId: number;
  let testOrderId: number;

  // Initialize stores
  const userStore = new UserStore();
  const orderStore = new OrderStore();

  beforeAll(async () => {
    // Clean up any existing test data
    try {
      await db.query('DELETE FROM order_products');
      await db.query('DELETE FROM orders');
      await db.query('DELETE FROM products');
      await db.query('DELETE FROM users');
    } catch (error) {
      console.error('Error cleaning up test data:', error);
    }
  });

  afterAll(async () => {
    // Clean up test data
    try {
      await db.query('DELETE FROM order_products');
      await db.query('DELETE FROM orders');
      await db.query('DELETE FROM products');
      await db.query('DELETE FROM users');

      // Close database connection
      await db.end();
    } catch (error) {
      console.error('Error cleaning up test data:', error);
    }
  });

  // ==================== USER MODEL TESTS ====================
  describe('User Model', () => {
    const testUser: User = {
      firstname: 'John',
      lastname: 'Doe',
      email: 'john.doe@test.com',
      password: 'password123'
    };

    describe('create method', () => {
      it('should create a new user and return user data without password', async () => {
        const result = await userStore.create(testUser);

        testUserId = result.id as number;

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.firstname).toBe(testUser.firstname);
        expect(result.lastname).toBe(testUser.lastname);
        expect(result.email).toBe(testUser.email);
        // Password should not be returned in plain text
        expect(result.password).not.toBe(testUser.password);
      });

      it('should throw error for duplicate email', async () => {
        await expect(userStore.create(testUser)).rejects.toThrow();
      });
    });

    describe('index method', () => {
      it('should return a list of all users', async () => {
        const result = await userStore.index();

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);

        // Verify the test user is in the list
        const foundUser = result.find(u => u.email === testUser.email);
        expect(foundUser).toBeDefined();
        expect(foundUser?.firstname).toBe(testUser.firstname);
      });
    });

    describe('show method', () => {
      it('should return a specific user by id', async () => {
        const result = await userStore.show(testUserId);

        expect(result).toBeDefined();
        expect(result.id).toBe(testUserId);
        expect(result.firstname).toBe(testUser.firstname);
        expect(result.lastname).toBe(testUser.lastname);
        expect(result.email).toBe(testUser.email);
      });

      it('should return undefined for non-existent user', async () => {
        const result = await userStore.show(99999);
        expect(result).toBeUndefined();
      });
    });

    describe('authenticate method', () => {
      it('should authenticate user with valid credentials', async () => {
        const result = await userStore.authenticate(testUser.email, testUser.password);

        expect(result).toBeDefined();
        expect(result?.email).toBe(testUser.email);
        expect(result?.firstname).toBe(testUser.firstname);
        expect(result?.lastname).toBe(testUser.lastname);
      });

      it('should throw error with invalid password', async () => {
        await expect(
          userStore.authenticate(testUser.email, 'wrongpassword')
        ).rejects.toThrow('Invalid credentials');
      });

      it('should throw error with non-existent email', async () => {
        await expect(
          userStore.authenticate('nonexistent@test.com', 'password123')
        ).rejects.toThrow('Invalid credentials');
      });
    });
  });

  // ==================== PRODUCT MODEL TESTS ====================
  describe('Product Model', () => {
    const testProduct: IProduct = {
      name: 'Test Product',
      price: 29.99
    };

    describe('create method', () => {
      it('should create a new product', async () => {
        const result = await Product.create(testProduct);

        testProductId = result.id as number;

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.name).toBe(testProduct.name);
        expect(Number(result.price)).toBe(testProduct.price);
        expect(result.created_at).toBeDefined();
      });
    });

    describe('findAll method', () => {
      it('should return a list of all products', async () => {
        const result = await Product.findAll();

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);

        // Verify the test product is in the list
        const foundProduct = result.find(p => p.name === testProduct.name);
        expect(foundProduct).toBeDefined();
        expect(Number(foundProduct?.price)).toBe(testProduct.price);
      });
    });

    describe('findById method', () => {
      it('should return a specific product by id', async () => {
        const result = await Product.findById(testProductId);

        expect(result).toBeDefined();
        expect(result?.id).toBe(testProductId);
        expect(result?.name).toBe(testProduct.name);
        expect(Number(result?.price)).toBe(testProduct.price);
      });

      it('should return null for non-existent product', async () => {
        const result = await Product.findById(99999);
        expect(result).toBeNull();
      });
    });

    describe('update method', () => {
      it('should update product name', async () => {
        const updatedName = 'Updated Product Name';
        const result = await Product.update(testProductId, { name: updatedName });

        expect(result).toBeDefined();
        expect(result.id).toBe(testProductId);
        expect(result.name).toBe(updatedName);
        expect(Number(result.price)).toBe(testProduct.price);
      });

      it('should update product price', async () => {
        const updatedPrice = 39.99;
        const result = await Product.update(testProductId, { price: updatedPrice });

        expect(result).toBeDefined();
        expect(result.id).toBe(testProductId);
        expect(Number(result.price)).toBe(updatedPrice);
      });

      it('should throw error for non-existent product', async () => {
        await expect(
          Product.update(99999, { name: 'New Name' })
        ).rejects.toThrow();
      });
    });
  });

  // ==================== ORDER MODEL TESTS ====================
  describe('Order Model', () => {
    let testOrder: Order;

    describe('create method', () => {
      it('should create a new order', async () => {
        const orderData: Order = {
          status: 'active',
          user_id: testUserId,
          total: 99.99
        };

        const result = await orderStore.create(orderData);
        testOrderId = result.id as number;
        testOrder = result;

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.status).toBe(orderData.status);
        expect(result.user_id).toBe(testUserId);
        expect(Number(result.total)).toBe(orderData.total);
      });
    });

    describe('index method', () => {
      it('should return a list of all orders', async () => {
        const result = await orderStore.index();

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);

        // Verify the test order is in the list
        const foundOrder = result.find(o => o.id === testOrderId);
        expect(foundOrder).toBeDefined();
        expect(foundOrder?.status).toBe('active');
      });
    });

    describe('show method', () => {
      it('should return a specific order by id', async () => {
        const result = await orderStore.show(testOrderId);

        expect(result).toBeDefined();
        expect(result.id).toBe(testOrderId);
        expect(result.status).toBe('active');
        expect(result.user_id).toBe(testUserId);
      });

      it('should throw error for non-existent order', async () => {
        await expect(orderStore.show(99999)).rejects.toThrow();
      });
    });

    describe('update method', () => {
      it('should update order status', async () => {
        const updatedOrder: Order = {
          status: 'complete',
          user_id: testUserId,
          total: 150.00
        };

        const result = await orderStore.update(testOrderId, updatedOrder);

        expect(result).toBeDefined();
        expect(result.id).toBe(testOrderId);
        expect(result.status).toBe('complete');
        expect(Number(result.total)).toBe(150.00);
      });

      it('should throw error for non-existent order', async () => {
        const updatedOrder: Order = {
          status: 'complete',
          user_id: testUserId,
          total: 100.00
        };

        await expect(orderStore.update(99999, updatedOrder)).rejects.toThrow();
      });
    });
  });

  // ==================== ORDER PRODUCTS MODEL TESTS ====================
  describe('OrderProduct Model', () => {
    let secondOrderId: number;

    beforeAll(async () => {
      // Create a new active order for OrderProduct tests
      const order = await orderStore.create({
        status: 'active',
        user_id: testUserId,
        total: 0
      });
      secondOrderId = order.id as number;
    });

    describe('addProduct method', () => {
      it('should add a product to an order', async () => {
        const orderProductData: IOrderProduct = {
          order_id: secondOrderId,
          product_id: testProductId,
          quantity: 2
        };

        const result = await OrderProduct.addProduct(orderProductData);

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.order_id).toBe(secondOrderId);
        expect(result.product_id).toBe(testProductId);
        expect(result.quantity).toBe(2);
        expect(result.price).toBeDefined();
      });

      it('should update quantity when adding same product again', async () => {
        const orderProductData: IOrderProduct = {
          order_id: secondOrderId,
          product_id: testProductId,
          quantity: 3
        };

        const result = await OrderProduct.addProduct(orderProductData);

        expect(result).toBeDefined();
        expect(result.quantity).toBe(5); // 2 + 3 = 5
      });

      it('should throw error for non-existent order', async () => {
        const orderProductData: IOrderProduct = {
          order_id: 99999,
          product_id: testProductId,
          quantity: 1
        };

        await expect(OrderProduct.addProduct(orderProductData)).rejects.toThrow();
      });

      it('should throw error for non-existent product', async () => {
        const orderProductData: IOrderProduct = {
          order_id: secondOrderId,
          product_id: 99999,
          quantity: 1
        };

        await expect(OrderProduct.addProduct(orderProductData)).rejects.toThrow();
      });
    });

    describe('getOrderProducts method', () => {
      it('should return all products in an order', async () => {
        const result = await OrderProduct.getOrderProducts(secondOrderId);

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);

        const foundProduct = result.find(op => op.product_id === testProductId);
        expect(foundProduct).toBeDefined();
      });

      it('should return empty array for order with no products', async () => {
        // Create a new empty order
        const emptyOrder = await orderStore.create({
          status: 'active',
          user_id: testUserId,
          total: 0
        });

        const result = await OrderProduct.getOrderProducts(emptyOrder.id as number);

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(0);
      });
    });

    describe('getByOrderAndProduct method', () => {
      it('should return specific product in order', async () => {
        const result = await OrderProduct.getByOrderAndProduct(secondOrderId, testProductId);

        expect(result).toBeDefined();
        expect(result?.order_id).toBe(secondOrderId);
        expect(result?.product_id).toBe(testProductId);
      });

      it('should return null for non-existent combination', async () => {
        const result = await OrderProduct.getByOrderAndProduct(secondOrderId, 99999);
        expect(result).toBeNull();
      });
    });

    describe('updateQuantity method', () => {
      it('should update product quantity in order', async () => {
        const newQuantity = 10;
        const result = await OrderProduct.updateQuantity(secondOrderId, testProductId, newQuantity);

        expect(result).toBeDefined();
        expect(result.quantity).toBe(newQuantity);
      });

      it('should throw error for quantity <= 0', async () => {
        await expect(
          OrderProduct.updateQuantity(secondOrderId, testProductId, 0)
        ).rejects.toThrow('Quantity must be greater than 0');
      });

      it('should throw error for non-existent product in order', async () => {
        await expect(
          OrderProduct.updateQuantity(secondOrderId, 99999, 5)
        ).rejects.toThrow();
      });
    });

    describe('removeProduct method', () => {
      it('should remove product from order', async () => {
        const result = await OrderProduct.removeProduct(secondOrderId, testProductId);

        expect(result).toBeDefined();
        expect(result.order_id).toBe(secondOrderId);
        expect(result.product_id).toBe(testProductId);

        // Verify product is removed
        const checkResult = await OrderProduct.getByOrderAndProduct(secondOrderId, testProductId);
        expect(checkResult).toBeNull();
      });

      it('should throw error for non-existent product in order', async () => {
        await expect(
          OrderProduct.removeProduct(secondOrderId, testProductId)
        ).rejects.toThrow();
      });
    });
  });

  // ==================== USER DELETE TEST (run last) ====================
  describe('User Model - Delete', () => {
    it('should delete a user', async () => {
      // Create a user specifically for deletion test
      const deleteTestUser = await userStore.create({
        firstname: 'Delete',
        lastname: 'Test',
        email: 'delete.test@test.com',
        password: 'password123'
      });

      await userStore.delete(deleteTestUser.id as number);

      // Verify user is deleted
      const result = await userStore.show(deleteTestUser.id as number);
      expect(result).toBeUndefined();
    });
  });

  // ==================== PRODUCT DELETE TEST ====================
  describe('Product Model - Delete', () => {
    it('should delete a product', async () => {
      // Create a product specifically for deletion test
      const deleteTestProduct = await Product.create({
        name: 'Delete Test Product',
        price: 9.99
      });

      await Product.delete(deleteTestProduct.id as number);

      // Verify product is deleted
      const result = await Product.findById(deleteTestProduct.id as number);
      expect(result).toBeNull();
    });
  });

  // ==================== ORDER DELETE TEST ====================
  describe('Order Model - Delete', () => {
    it('should delete an order', async () => {
      // Create an order specifically for deletion test
      const deleteTestOrder = await orderStore.create({
        status: 'active',
        user_id: testUserId,
        total: 50.00
      });

      await orderStore.delete(deleteTestOrder.id as number);

      // Verify order is deleted
      await expect(orderStore.show(deleteTestOrder.id as number)).rejects.toThrow();
    });

    it('should throw error for non-existent order', async () => {
      await expect(orderStore.delete(99999)).rejects.toThrow();
    });
  });
});

