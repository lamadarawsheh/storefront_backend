import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const client = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432,
});

// Add query logging
client.on('connect', () => {
  console.log('Connected to database');
});

client.on('error', (err: Error) => {
  console.error('Database error:', err);
});

// Log all queries
const originalQuery = client.query;
client.query = async function (config: any, values?: any) {
  console.log('Executing query:', config.text || config, 'with values:', values || []);
  try {
    const result = await originalQuery.call(this, config, values);
    return result;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

export default client;
