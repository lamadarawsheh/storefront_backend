import { Pool, QueryConfig, QueryResult, QueryResultRow } from 'pg';
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

// Store the original query method
const originalQuery = client.query;

// Override the query method with proper typing
client.query = async function <T extends QueryResultRow = any, I extends any[] = any[]>(
  queryTextOrConfig: string | QueryConfig<I>,
  values?: I
): Promise<QueryResult<T>> {
  const queryText = typeof queryTextOrConfig === 'string' 
    ? queryTextOrConfig 
    : queryTextOrConfig.text || '';
  
  console.log('Executing query:', queryText, 'with values:', values || []);
  
  try {
    // Use the original query method with proper typing
    const result = await (originalQuery as any).call(
      client,
      queryTextOrConfig as any,
      values
    ) as QueryResult<T>;
    
    return result;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

export default client;