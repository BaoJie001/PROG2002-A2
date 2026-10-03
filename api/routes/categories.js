/**
 * routes/categories.js
 * ---------------------------------------------------------------------------
 * GET /api/categories
 *
 * Returns every event category. The search page calls this on load and uses
 * the result to fill its "category" drop-down, so the filter list always
 * matches whatever is actually in the database.
 * ---------------------------------------------------------------------------
 */

const express = require('express');
const { query } = require('../event_db');

const router = express.Router();

/**
 * GET /api/categories
 * Response: 200
 *   [ { category_id, name, description, icon }, ... ]
 */
router.get('/', async (req, res) => {
  try {
    const rows = await query(
      `SELECT c.category_id,
              c.name,
              c.description,
              c.icon,
              c.image_url,
              COUNT(e.event_id) AS event_count
         FROM categories c
         LEFT JOIN events e
                ON e.category_id = c.category_id
               AND e.status = 'active'
               AND e.event_date >= CURDATE()
        GROUP BY c.category_id, c.name, c.description, c.icon, c.image_url
        ORDER BY c.name ASC`
    );

    res.status(200).json(rows);
  } catch (err) {
    // Log the real error server-side, but only send a generic message back.
    console.error('GET /api/categories failed:', err.message);
    res.status(500).json({ error: true, message: 'Could not load categories.' });
  }
});

module.exports = router;
