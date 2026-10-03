/**
 * routes/events.js
 * ---------------------------------------------------------------------------
 * Endpoints
 *   GET /api/events           -> events for the home page / search results
 *   GET /api/events/past      -> events that have already finished
 *   GET /api/events/:id       -> full detail for one event
 *
 * Design notes (RESTful)
 *   * The collection resource is /api/events. Filtering that collection is done
 *     with query parameters (?date=&location=&category=) rather than by
 *     inventing a new URL for every kind of filter - that keeps the URLs
 *     predictable and cacheable.
 *   * Only GET is implemented. Assessment 3 adds POST/PUT/DELETE, so no route
 *     here can change data; the SQL is read-only by design.
 *
 * Security notes
 *   * Every user supplied value is bound with a ? placeholder (no string
 *     concatenation into SQL), so injection is not possible.
 *   * Input is validated before it reaches the database and a 400 is returned
 *     for anything malformed.
 *   * Internal error text is logged, never sent to the browser.
 * ---------------------------------------------------------------------------
 */

const express = require('express');
const { query } = require('../event_db');

const router = express.Router();

// --- validation helpers ----------------------------------------------------

/** YYYY-MM-DD and a date that really exists. */
function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00`);
  return !Number.isNaN(d.getTime());
}

/** A positive whole number, used for id and category. */
function isPositiveInt(value) {
  return /^\d+$/.test(value) && Number(value) > 0;
}

/** Trims a string and rejects anything too long to be genuine. */
function cleanText(value, maxLength) {
  const trimmed = String(value).trim();
  if (trimmed.length === 0 || trimmed.length > maxLength) return null;
  return trimmed;
}

/**
 * Reads the three search criteria out of req.query and validates them.
 * Returns either { criteria } or { badRequest: 'message' }.
 */
function readCriteria(req) {
  const criteria = { date: null, location: null, category: null };

  if (req.query.date !== undefined && req.query.date !== '') {
    const date = String(req.query.date).trim();
    if (!isValidDate(date)) {
      return { badRequest: 'Date must be a real date in YYYY-MM-DD format.' };
    }
    criteria.date = date;
  }

  if (req.query.location !== undefined && req.query.location !== '') {
    const location = cleanText(req.query.location, 80);
    if (location === null) {
      return { badRequest: 'Location must be between 1 and 80 characters.' };
    }
    criteria.location = location;
  }

  if (req.query.category !== undefined && req.query.category !== '') {
    const category = String(req.query.category).trim();
    if (!isPositiveInt(category)) {
      return { badRequest: 'Category must be a valid category id.' };
    }
    criteria.category = Number(category);
  }

  return { criteria };
}

// --- shared SQL ------------------------------------------------------------

/**
 * The columns every page needs. Organiser and category are joined in so the
 * client-side never has to make a second request just to show a name.
 */
const EVENT_SELECT = `
  SELECT e.event_id,
         e.name,
         e.summary,
         e.description,
         e.event_date,
         e.start_time,
         e.end_time,
         e.venue,
         e.suburb,
         e.city,
         e.state,
         e.ticket_price,
         e.goal_amount,
         e.raised_amount,
         e.status,
         c.category_id,
         c.name        AS category_name,
         c.icon        AS category_icon,
         c.image_url   AS category_image,
         o.organisation_id,
         o.name        AS organisation_name,
         o.logo_icon   AS organisation_icon,
         o.mission     AS organisation_mission,
         o.contact_email,
         o.contact_phone,
         o.website
    FROM events e
    JOIN categories c     ON c.category_id     = e.category_id
    JOIN organisations o  ON o.organisation_id = e.organisation_id
`;

/**
 * Date -> 'YYYY-MM-DD' using the LOCAL calendar date.
 * toISOString() must not be used here: it converts to UTC first, which would
 * shift every date back by one day for anyone east of Greenwich.
 */
function toDateString(value) {
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return String(value).slice(0, 10);
}

/** Today's date in the same local 'YYYY-MM-DD' form. */
function todayString() {
  return toDateString(new Date());
}

/**
 * Shapes one row into the JSON object the website consumes.
 * Nesting category/organisation keeps the front-end code readable,
 * and percentages are worked out here so all pages agree on the maths.
 */
function shapeEvent(row) {
  if (!row) return null;

  const eventDate = toDateString(row.event_date);

  const goal = Number(row.goal_amount) || 0;
  const raised = Number(row.raised_amount) || 0;
  const progress = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;

  return {
    event_id: row.event_id,
    name: row.name,
    summary: row.summary,
    description: row.description,
    event_date: eventDate,
    start_time: row.start_time,
    end_time: row.end_time,
    venue: row.venue,
    suburb: row.suburb,
    city: row.city,
    state: row.state,
    location: [row.venue, row.suburb, row.city].filter(Boolean).join(', '),
    ticket_price: Number(row.ticket_price),
    goal_amount: goal,
    raised_amount: raised,
    progress_percentage: progress,
    status: row.status,
    is_past: eventDate < todayString(),
    category: {
      category_id: row.category_id,
      name: row.category_name,
      icon: row.category_icon,
      image_url: row.category_image,
    },
    organisation: {
      organisation_id: row.organisation_id,
      name: row.organisation_name,
      icon: row.organisation_icon,
      mission: row.organisation_mission,
      contact_email: row.contact_email,
      contact_phone: row.contact_phone,
      website: row.website,
    },
  };
}

// --- GET /api/events -------------------------------------------------------

/**
 * Home page  -> GET /api/events (no query string)
 *   all events that are active and have not finished yet.
 *
 * Search page -> GET /api/events?date=&location=&category=
 *   the same list narrowed by whichever criteria the user picked.
 *   Any combination is allowed, including all three at once.
 */
router.get('/', async (req, res) => {
  const { criteria, badRequest } = readCriteria(req);
  if (badRequest) {
    return res.status(400).json({ error: true, message: badRequest });
  }

  // WHERE fragments and their bound values are collected separately so that
  // the number of ? placeholders always matches the number of params.
  const where = [`e.status = 'active'`];
  const params = [];

  // Home page: only what is still coming up. When the user supplies a date we
  // honour it instead, so a search can look at any period.
  if (criteria.date) {
    where.push('e.event_date >= ?');
    params.push(criteria.date);
  } else {
    where.push('e.event_date >= CURDATE()');
  }

  if (criteria.location) {
    where.push('(e.city LIKE ? OR e.suburb LIKE ? OR e.venue LIKE ?)');
    const like = `%${criteria.location}%`;
    params.push(like, like, like);
  }

  if (criteria.category) {
    where.push('e.category_id = ?');
    params.push(criteria.category);
  }

  try {
    const rows = await query(
      `${EVENT_SELECT} WHERE ${where.join(' AND ')} ORDER BY e.event_date ASC, e.start_time ASC`,
      params
    );

    res.status(200).json({
      count: rows.length,
      events: rows.map(shapeEvent),
    });
  } catch (err) {
    console.error('GET /api/events failed:', err.message);
    res.status(500).json({ error: true, message: 'Could not load events.' });
  }
});

// --- GET /api/events/past --------------------------------------------------

/**
 * Events whose date has already gone by. Declared before /:id so that the
 * word "past" is not mistaken for an event id.
 */
router.get('/past', async (req, res) => {
  try {
    const rows = await query(
      `${EVENT_SELECT}
        WHERE e.status = 'active'
          AND e.event_date < CURDATE()
        ORDER BY e.event_date DESC`,
      []
    );

    res.status(200).json({
      count: rows.length,
      events: rows.map(shapeEvent),
    });
  } catch (err) {
    console.error('GET /api/events/past failed:', err.message);
    res.status(500).json({ error: true, message: 'Could not load past events.' });
  }
});

// --- GET /api/events/:id ---------------------------------------------------

/**
 * Everything about one event, for the event detail page.
 * 404 when the id does not exist, or when the event is suspended - a
 * suspended event must not be reachable even by typing its id directly.
 */
router.get('/:id', async (req, res) => {
  const id = req.params.id;

  if (!isPositiveInt(id)) {
    return res.status(400).json({ error: true, message: 'Event id must be a positive number.' });
  }

  try {
    const rows = await query(
      `${EVENT_SELECT} WHERE e.event_id = ? AND e.status = 'active'`,
      [Number(id)]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Event not found.' });
    }

    res.status(200).json(shapeEvent(rows[0]));
  } catch (err) {
    console.error(`GET /api/events/${id} failed:`, err.message);
    res.status(500).json({ error: true, message: 'Could not load this event.' });
  }
});

module.exports = router;
