# Store API Requirements

## API Endpoints

### Users
- `POST /users` - Create a new user
- `GET /users` - Get all users (requires authentication)
- `GET /users/:id` - Get user by ID (requires authentication)
- `POST /users/authenticate` - Authenticate user and get JWT token

# API Endpoints

## Authentication
- `POST /users/register` - Register a new user
  - Request Body:
    ```json
    {
      "firstname": "John",
      "lastname": "Doe",
      "email": "john@example.com",
      "password": "password123"
    }
    ```
  - Response: JWT token

- `POST /users/login` - Authenticate a user
  - Request Body:
    ```json
    {
      "email": "john@example.com",
      "password": "password123"
    }
    ```
  - Response: JWT token

## Users
- `GET /users` - Get all users (requires authentication)
- `GET /users/:id` - Get user by ID (requires authentication)
- `DELETE /users/:id` - Delete a user (requires authentication)

## Products
- `GET /products` - Get all products
  - Response: Array of product objects
- `GET /products/:id` - Get product by ID
  - Response: Product object
- `POST /products` - Create a new product (requires authentication)
  - Request Body:
    ```json
    {
      "name": "Product Name",
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
