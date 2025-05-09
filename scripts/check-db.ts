import { pool, db } from '../db';
import * as schema from '../shared/schema';
import 'dotenv/config';

async function checkDatabase() {
  console.log('Checking database connection...');
  
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful!');

    // Check if tables exist (using the first table in our schema)
    const query = 'SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = $1)';
    const { rows } = await pool.query(query, ['users']);
    
    if (rows[0].exists) {
      console.log('✅ Tables exist in the database');
    } else {
      console.log('❌ Tables do not exist. Run migrations first.');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    // Close connection pool
    await pool.end();
  }
}

// Run the check
checkDatabase();