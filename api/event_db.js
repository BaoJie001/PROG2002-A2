/**
 * event_db.js
 * ---------------------------------------------------------------------------
 * Database layer for the Charity Events website (PROG2002 - Assessment 2).
 *
 * Responsibility: own the MySQL connection pool and expose a small query
 * helper. The route modules call query() - they never touch the pool directly.
 * ---------------------------------------------------------------------------
 */

require('dotenv').config();

const mysql = require('mysql2/promise');

/**
 * A pool keeps a set of connections open and reuses them, which is much
 * cheaper than opening a new connection for every HTTP request.
 *
 * decimalNumbers: true -> DECIMAL columns (ticket_price, goal_amount, ...)
 * come back as JavaScript numbers instead of strings, so the client-side
 * does not have to convert them.
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'charityevents_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true,
});

/**
 * Run a parameterised query.
 *
 * Every value that comes from the outside world MUST be passed through
 * `params` - never concatenated into the SQL string. mysql2 escapes the
 * placeholders, which is what protects the API against SQL injection.
 *
 * @param {string} sql     SQL statement, placeholders written as ?
 * @param {Array}  params  values bound to those placeholders, in order
 * @returns {Promise<Array>} the rows the query returned
 */
async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

module.exports = { pool, query };
