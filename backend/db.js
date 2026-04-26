require('dotenv').config();
const { Pool } = require('pg');

// DEBUGGING: This will tell us if the variable is actually loading
console.log('🔍 Checking Environment Variables...');
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL is missing from your .env file!');
  console.log('Current directory:', __dirname);
} else {
  console.log('✅ DATABASE_URL detected.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to Supabase PostgreSQL!');
    client.release();
  } catch (err) {
    console.error('❌ Database connection error details:');
    console.error('- Code:', err.code);
    console.error('- Message:', err.message);
    throw err;
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  connectDB
};