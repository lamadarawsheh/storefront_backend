# Store API

This is a RESTful API for an e-commerce store built with Node.js, Express, TypeScript, and PostgreSQL.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [License](#license)

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- PostgreSQL (v12 or higher)
- TypeScript (v4 or higher)

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd store-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment files**
   ```bash
   # Copy example files
   cp .env.example .env
   cp .env.test.example .env.test
   ```
   
   - Update both `.env` and `.env.test` with your actual configuration.
   - **Important**: Never commit these files to version control (they are in .gitignore).

4. **Environment Variables**

   - `.env` - Development environment
   - `.env.test` - Test environment (used when NODE_ENV=test)
   - `.env.example` - Template for development
   - `.env.test.example` - Template for testing

   Required variables for both environments:
   ```
   # Server
   NODE_ENV=development  # or 'test' for test environment
   PORT=3000
   
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=your_db_username
   DB_PASSWORD=your_db_password
   
   # For development
   DB_NAME=store_database
   
   # For testing (in .env.test)
   # DB_NAME=store_test_db
   
   # JWT
   TOKEN_SECRET=your_jwt_secret_key
   
   # Bcrypt
   BCRYPT_PASSWORD=your_bcrypt_pepper
   SALT_ROUNDS=10  # Use 1 for testing, 10 for production
   ```

4. **Database Setup**
   - Start PostgreSQL server
   - Create development and test databases (use the same names as in your .env files):
     ```sql
     -- Development database
     CREATE DATABASE store_database;
     
     -- Test database
     CREATE DATABASE store_test_db;
     ```

5. **Run migrations**
   ```bash
   # For development
   npm run migrate up
   
   # For testing (runs automatically with npm test)
   NODE_ENV=test npm run migrate up
   ```

6. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Or for production build
   npm run build
   npm start
   ```
   The API will be available at `http://localhost:3000`

## Running Tests

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration
```

## API Documentation

See `REQUIREMENTS.md` for detailed API endpoint documentation.

## Environment Variables

- `NODE_ENV` - Application environment (development, test, production)
- `PORT` - Port the server will listen on
- `POSTGRES_HOST` - PostgreSQL host
- `POSTGRES_DB` - PostgreSQL database name for development
- `POSTGRES_TEST_DB` - PostgreSQL database name for testing
- `POSTGRES_USER` - PostgreSQL username
- `POSTGRES_PASSWORD` - PostgreSQL password
- `BCRYPT_PASSWORD` - Secret for password hashing
- `SALT_ROUNDS` - Number of salt rounds for bcrypt
- `TOKEN_SECRET` - Secret for JWT token signing

## Project Structure

```
├── src/
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── middleware/     # Express middleware
│   └── database.ts     # Database connection
├── migrations/         # Database migrations
├── tests/              # Test files
├── .env                # Environment variables
├── package.json
└── tsconfig.json
```
