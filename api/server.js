/**
 * server.js
 * ---------------------------------------------------------------------------
 * Entry point of the Charity Events API (PROG2002 - Assessment 2).
 *
 * Starts Express, mounts the two route modules, and serves the client-side
 * folder as plain static files.
 *
 * Note on the unit's rules: Express is used only to build the server-side
 * API. No templating engine (EJS/Pug/Handlebars) is installed or configured -
 * every page is delivered as real .html files with their own CSS and
 * JavaScript. The browser side uses no framework at all.
 * ---------------------------------------------------------------------------
 */

require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');

const { query } = require('./event_db');
const eventsRouter = require('./routes/events');
const categoriesRouter = require('./routes/categories');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Allows the pages to call the API even when they are opened from a
// different origin (for example straight from the file system).
app.use(cors());

// Parse JSON request bodies - the API is read-only for A2 but this keeps it
// ready for the POST endpoints added in Assessment 3.
app.use(express.json());

// ---- API routes -----------------------------------------------------------
app.use('/api/events', eventsRouter);
app.use('/api/categories', categoriesRouter);

/**
 * GET /api/health
 * Quick check that the API is up and can reach MySQL.
 */
app.get('/api/health', async (req, res) => {
  try {
    const rows = await query('SELECT 1 AS ok, NOW() AS serverTime');
    res.json({
      api: 'running',
      database: 'connected',
      dbName: process.env.DB_NAME || 'charityevents_db',
      serverTime: rows[0].serverTime,
    });
  } catch (err) {
    res.status(500).json({ api: 'running', database: 'error', message: err.message });
  }
});

// ---- static website -------------------------------------------------------
// The client-side lives in ../clientside and is served untouched, so the
// browser gets exactly the HTML/CSS/JS files that are submitted.
app.use(express.static(path.join(__dirname, '..', 'clientside')));

// ---- 404 / error handling -------------------------------------------------
// Anything under /api that did not match a route above.
app.use('/api', (req, res) => {
  res.status(404).json({ error: true, message: `Unknown endpoint: ${req.originalUrl}` });
});

// Global safety net so an unexpected throw still returns JSON, not HTML.
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: true, message: 'Unexpected server error.' });
});

app.listen(PORT, () => {
  console.log('----------------------------------------------------------');
  console.log(' Charity Events API');
  console.log(` API      http://localhost:${PORT}/api/events`);
  console.log(` Website  http://localhost:${PORT}/`);
  console.log('----------------------------------------------------------');
});
