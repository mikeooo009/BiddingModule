const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST, // Database host
  user: process.env.DB_USER, // Database username
  password: process.env.DB_PASS, // Database password
  database: process.env.DB_NAME, // Database name
  waitForConnections: true,
  connectionLimit: 10, // Limit for simultaneous connections
  queueLimit: 0, // Unlimited queue size
});

pool.getConnection()
  .then(() => console.log('Connected to MySQL database!'))
  .catch((err) => console.error('MySQL connection failed:', err.message));

module.exports = pool;
