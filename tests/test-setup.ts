import { Pool } from 'pg';
import { execSync } from 'child_process';

// Test database configuration
const testConfig = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_TEST_DB || 'store_test_db',
};

// Create a new test database connection
const testPool = new Pool(testConfig);

// Run migrations on the test database
const runMigrations = () => {
  try {
    execSync('npm run migrate', {
      env: {
        ...process.env,
        NODE_ENV: 'test',
        POSTGRES_DB: testConfig.database,
      },
      stdio: 'inherit',
    });
  } catch (error) {
    console.error('Failed to run migrations:', error);
    process.exit(1);
  }
};

// Drop and recreate the test database
const resetTestDatabase = async () => {
  const adminPool = new Pool({
    ...testConfig,
    database: 'postgres', // Connect to default database to drop/create test db
  });

  try {
    await adminPool.query(`DROP DATABASE IF EXISTS ${testConfig.database}`);
    await adminPool.query(`CREATE DATABASE ${testConfig.database}`);
  } catch (error) {
    console.error('Error resetting test database:', error);
    process.exit(1);
  } finally {
    await adminPool.end();
  }
};

// Global setup for tests
const globalSetup = async () => {
  try {
    // Set test environment variables
    process.env.NODE_ENV = 'test';
    process.env.POSTGRES_DB = testConfig.database;

    // Reset and migrate test database
    await resetTestDatabase();
    runMigrations();

    console.log('Test database setup complete');
  } catch (error) {
    console.error('Test setup failed:', error);
    process.exit(1);
  }
};

// Export for use in test files
export { testPool, globalSetup };
