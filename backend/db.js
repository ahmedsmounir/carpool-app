require('dotenv').config();
const { Pool } = require('pg');

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
    console.error('❌ Database connection error:', err.stack);
    throw err;
  }
};

// This exports the functions index.js is looking for
module.exports = {
  query: (text, params) => pool.query(text, params),
  connectDB,
  getDB: () => pool // This is the "missing link" causing your error!
};