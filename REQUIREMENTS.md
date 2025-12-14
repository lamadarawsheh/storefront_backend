# Store API Requirements

## API Routes

### Authentication
- `POST /users/register`
  - **Description**: Register a new user
  - **Request Body**:
    ```json
    {
      "firstname": "John",
      "lastname": "Doe",
      "email": "john.doe@example.com",
      "password": "password123"
    }
    ```
  - **Response**:
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```

- `POST /users/login`
  - **Description**: Authenticate a user and get a token
  - **Request Body**:
    ```json
    {
      "email": "john.doe@example.com",
      "password": "password123"
    }
    ```
  - **Response**: 
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```
    - **Error Response (401)**:
    ```json
    {
      "error": "Invalid credentials"
    }
    ```

### Products
- `GET /products` - Get all products (requires authentication)
  - **Headers**: `Authorization: Bearer <token>`
  - **Success Response (200)**:
    ```json
    [
      {
        "id": 1,
        "name": "Test Product",
        "description": "Test Description",
        "price": "9.99",
        "created_at": "2025-12-13T20:18:42.323Z"
      }
    ]
    ```

- `POST /products` - Create a new product (requires authentication)
  - **Headers**: 
    - `Authorization: Bearer <token>`
    - `Content-Type: application/json`
  - **Request Body**:
    ```json
    {
      "name": "Laptop",
      "price": 999.99,
      "description": "High performance laptop"
    }
    ```
  - **Success Response (201)**:
    ```json
    {
      "id": 1,
      "name": "Laptop",
      "price": "999.99",
      "description": "High performance laptop",
      "created_at": "2025-12-13T20:18:42.323Z"
    }
    ```

### Orders
- `POST /orders` - Create a new order (requires authentication)
  - **Headers**: 
    - `Authorization: Bearer <token>`
    - `Content-Type: application/json`
  - **Request Body**:
    ```json
    {
      "status": "active",
      "total": 99.99
    }
    ```
  - **Success Response (201)**:
    ```json
    {
      "id": 26,
      "user_id": 125,
      "order_date": "2025-12-13T18:45:22.733Z",
      "status": "active",
      "total": "99.99"
    }
    ```

### Order Products
- `POST /order-products` - Add a product to an order (requires authentication)
  - **Headers**: 
    - `Authorization: Bearer <token>`
    - `Content-Type: application/json`
  - **Request Body**:
    ```json
    {
      "order_id": 26,
      "product_id": 1,
      "quantity": 2
    }
    ```
  - **Success Response (201)**:
    ```json
    {
      "id": 4,
      "order_id": 26,
      "product_id": 1,
      "quantity": 2,
      "price": "9.99",
      "created_at": "2025-12-13T20:21:25.914Z"
    }
    ```

- `GET /order-products/order/:orderId` - Get all products in an order (requires authentication)
  - **Headers**: `Authorization: Bearer <token>`
  - **Success Response (200)**:
    ```json
    [
      {
        "id": 4,
        "order_id": 26,
        "product_id": 1,
        "quantity": 2,
        "price": "9.99",
        "created_at": "2025-12-13T20:21:25.914Z",
        "product_name": "Test Product"
      }
    ]
    ```

- `PUT /order-products/order/:orderId/product/:productId` - Update product quantity in an order (requires authentication)
  - **Headers**: 
    - `Authorization: Bearer <token>`
    - `Content-Type: application/json`
  - **Request Body**:
    ```json
    {
      "quantity": 3
    }
    ```
  - **Success Response (200)**:
    ```json
    {
      "id": 4,
      "order_id": 26,
      "product_id": 1,
      "quantity": 3,
      "price": "9.99",
      "created_at": "2025-12-13T20:21:25.914Z"
    }
    ```

- `DELETE /order-products/order/:orderId/product/:productId` - Remove a product from an order (requires authentication)
  - **Headers**: `Authorization: Bearer <token>`
  - **Success Response (204)**: No content

### Users
- `GET /users` - Get all users (requires authentication)
  - **Headers**: `Authorization: Bearer <token>`
  - **Success Response (200)**:
    ```json
    [
      {
        "id": 125,
        "firstname": "Test",
        "lastname": "User",
        "email": "test@example.com"
      }
    ]
    ```

- `GET /users/me` - Get current user profile (requires authentication)
  - **Headers**: `Authorization: Bearer <token>`
  - **Success Response (200)**:
    ```json
    {
      "id": 125,
      "firstname": "Test",
      "lastname": "User",
      "email": "test@example.com"
    }
    ```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  firstname VARCHAR(100) NOT NULL,
  lastname VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Products Table
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Orders Table
```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  total NUMERIC(10, 2) NOT NULL,
  CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Order Products Table
```sql
CREATE TABLE order_products (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_product FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

## API Endpoints

### Authentication

#### Register a New User
- `POST /users/register`
  - **Description**: Register a new user
  - **Request Body**:
    ```json
    {
      "firstname": "John",
      "lastname": "Doe",
      "email": "john@example.com",
      "password": "password123"
    }
    ```
  - **Response (201)**:
    ```json
    {
      "id": 1,
      "firstname": "John",
      "lastname": "Doe",
      "email": "john@example.com"
    }
    ```

#### User Login
- `POST /users/login`
  - **Description**: Authenticate user and get JWT token
  - **Request Body**:
    ```json
    {
      "email": "john@example.com",
      "password": "password123"
    }
    ```
  - **Response (200)**:
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```

### Users

#### Get All Users
- `GET /users`
  - **Description**: Get all users (Admin only)
  - **Headers**:
    - `Authorization: Bearer <token>`
  - **Response (200)**:
    ```json
    [
      {
        "id": 1,
        "firstname": "John",
        "lastname": "Doe",
        "email": "john@example.com"
      }
    ]
    ```

#### Get User by ID
- `GET /users/:id`
  - **Description**: Get user by ID
  - **Headers**:
    - `Authorization: Bearer <token>`
  - **Response (200)**:
    ```json
    {
      "id": 1,
      "firstname": "John",
      "lastname": "Doe",
      "email": "john@example.com"
    }
    ```

### Products

#### Get All Products
- `GET /products`
  - **Description**: Get all available products
  - **Response (200)**:
    ```json
    [
      {
        "id": 1,
        "name": "Product 1",
        "description": "Description 1",
        "price": 19.99
      }
    ]
    ```

#### Create Product
- `POST /products`
  - **Description**: Create a new product (Admin only)
  - **Headers**:
    - `Authorization: Bearer <token>`
    - `Content-Type: application/json`
  - **Request Body**:
    ```json
    {
      "name": "New Product",
      "description": "Product description",
      "price": 29.99
    }
    ```
  - **Response (201)**:
    ```json
    {
      "id": 2,
      "name": "New Product",
      "description": "Product description",
      "price": 29.99
    }
    ```

### Orders

#### Create Order
- `POST /orders`
  - **Description**: Create a new order
  - **Headers**:
    - `Authorization: Bearer <token>`
    - `Content-Type: application/json`
  - **Request Body**:
    ```json
    {
      "status": "active",
      "products": [
        {"product_id": 1, "quantity": 2},
        {"product_id": 2, "quantity": 1}
      ]
    }
    ```
  - **Response (201)**:
    ```json
    {
      "id": 1,
      "user_id": 1,
      "status": "active",
      "total": 69.97,
      "products": [
        {"product_id": 1, "quantity": 2, "price": 39.98},
        {"product_id": 2, "quantity": 1, "price": 29.99}
      ]
    }
    ```

#### Get User Orders
- `GET /users/:id/orders`
  - **Description**: Get all orders for a user
  - **Headers**:
    - `Authorization: Bearer <token>`
  - **Response (200)**:
    ```json
    [
      {
        "id": 1,
        "user_id": 1,
        "status": "complete",
        "total": 69.97,
        "order_date": "2025-12-13T12:00:00.000Z"
      }
    ]
    ```

### Order Products

#### Add Product to Order
- `POST /order-products`
  - **Description**: Add a product to an order
  - **Headers**:
    - `Authorization: Bearer <token>`
    - `Content-Type: application/json`
  - **Request Body**:
    ```json
    {
      "order_id": 1,
      "product_id": 3,
      "quantity": 2
    }
    ```
  - **Response (201)**:
    ```json
    {
      "id": 3,
      "order_id": 1,
      "product_id": 3,
      "quantity": 2,
      "price": 49.98,
      "created_at": "2025-12-13T12:00:00.000Z"
    }
    ```

#### Update Order Product Quantity
- `PUT /order-products/order/:orderId/product/:productId`
  - **Description**: Update product quantity in an order
  - **Headers**:
    - `Authorization: Bearer <token>`
    - `Content-Type: application/json`
  - **Request Body**:
    ```json
    {
      "quantity": 3
    }
    ```
  - **Response (200)**:
    ```json
    {
      "id": 3,
      "order_id": 1,
      "product_id": 3,
      "quantity": 3,
      "price": 74.97
    }
    ```

#### Remove Product from Order
- `DELETE /order-products/order/:orderId/product/:productId`
  - **Description**: Remove a product from an order
  - **Headers**:
    - `Authorization: Bearer <token>`
  - **Response (200)**:
    ```json
    {
      "message": "Product 3 removed from order 1"
    }
    ```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request data"
}
```

### 401 Unauthorized
```json
{
  "error": "Access denied, token required"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied, insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```
      "price": 99.99,
      "category": "Category Name"
    }
    ```
- `PUT /products/:id` - Update a product (requires authentication)
- `DELETE /products/:id` - Delete a product (requires authentication)

## Orders
- `GET /orders` - Get all orders (requires authentication)
  - Response: Array of order objects with order items
- `GET /orders/:id` - Get order by ID (requires authentication)
  - Response: Order object with order items
- `POST /orders` - Create a new order (requires authentication)
  - Request Body:
    ```json
    {
      "status": "active",
      "total": 99.99,
      "items": [
        {
          "product_id": 1,
          "quantity": 2
        }
      ]
    }
    ```
- `POST /orders/:id/products` - Add product to order (requires authentication)
  - Request Body:
    ```json
    {
      "product_id": 1,
      "quantity": 1
    }
    ```
- `GET /orders/current/:userId` - Get current order by user (requires authentication)
- `GET /orders/complete/:userId` - Get completed orders by user (requires authentication)

## Database Schema

### Users
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  firstname VARCHAR(100) NOT NULL,
  lastname VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Products
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100)
);
```

### Orders
```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Order Products
```sql
CREATE TABLE order_products (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    password_digest VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Products
```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Orders
```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Order Products (Join Table)
```sql
CREATE TABLE order_products (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(order_id, product_id)
);
```

## Data Shapes

### User
```typescript
type User = {
    id?: number;
    username: string;
    firstname: string;
    lastname: string;
    password_digest?: string;
    password?: string;
}
```

### Product
```typescript
type Product = {
    id?: number;
    name: string;
    price: number;
    category?: string;
}
```

### Order
```typescript
type Order = {
    id?: number;
    user_id: number;
    status: 'active' | 'complete';
    products?: OrderProduct[];
}
```

### OrderProduct
```typescript
type OrderProduct = {
    id?: number;
    order_id: number;
    product_id: number;
    quantity: number;
}
```

## Authentication

### Register New User
**Endpoint**: `POST /users`

**Request Body**:
```json
{
    "username": "testuser",
    "firstname": "Test",
    "lastname": "User",
    "password": "password123"
}
```

**Response**:
```json
{
    "id": 1,
    "username": "testuser",
    "firstname": "Test",
    "lastname": "User"
}
```

### Authenticate User
**Endpoint**: `POST /users/authenticate`

**Request Body**:
```json
{
    "username": "testuser",
    "password": "password123"
}
```

**Response**:
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Error Responses

### 400 Bad Request
```json
{
    "error": "Invalid input"
}
```

### 401 Unauthorized
```json
{
    "error": "Authentication required"
}
```

### 404 Not Found
```json
{
    "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
    "error": "Internal server error"
}
```
