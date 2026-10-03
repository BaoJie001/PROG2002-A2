/**
 * js/api.js
 * ---------------------------------------------------------------------------
 * Shared helpers used by every page: talking to the API and formatting the
 * values that come back. Plain JavaScript - no frameworks, no libraries.
 * ---------------------------------------------------------------------------
 */

/**
 * Base URL of the API.
 *
 * When the pages are served by the Express server they share its origin, so a
 * relative path is enough and the site keeps working on any port. When a page
 * is opened directly from disk (file://) there is no origin to be relative to,
 * so we fall back to the known development address.
 */
const API_BASE =
  location.protocol === 'file:' ? 'http://localhost:3000/api' : '/api';

/* ---------- HTTP ---------------------------------------------------------- */

/**
 * GETs a URL and returns the parsed JSON body.
 *
 * @param {string} url
 * @returns {Promise<object|Array>}
 * @throws  an Error carrying the message the server sent (or a network note)
 */
function fetchJSON(url) {
  return fetch(url)
    .then(function (response) {
      // fetch() only rejects on network failure - a 404 or 500 still resolves,
      // so the status has to be checked by hand.
      return response.json().then(
        function (body) {
          return { ok: response.ok, status: response.status, body: body };
        },
        function () {
          // Response was not JSON (e.g. an HTML error page).
          return {
            ok: response.ok,
            status: response.status,
            body: { message: 'Server returned an unreadable response.' },
          };
        }
      );
    })
    .then(function (result) {
      if (!result.ok) {
        const message =
          (result.body && result.body.message) ||
          'Request failed (HTTP ' + result.status + ').';
        throw new Error(message);
      }
      return result.body;
    })
    .catch(function (error) {
      // Network down, server not started, or CORS blocked.
      if (error instanceof TypeError) {
        throw new Error(
          'Cannot reach the API. Make sure the server is running (npm start in the api folder).'
        );
      }
      throw error;
    });
}

/**
 * Builds a URL with only the criteria the user actually filled in, so empty
 * inputs never produce `?location=&category=`.
 */
function buildQuery(params) {
  const parts = [];
  Object.keys(params).forEach(function (key) {
    const value = params[key];
    if (value !== null && value !== '' && value !== undefined) {
      parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
    }
  });
  return parts.length ? '?' + parts.join('&') : '';
}

/* ---------- formatting ---------------------------------------------------- */

/**
 * 'YYYY-MM-DD' -> a local Date object.
 * new Date('2026-10-24') would be parsed as UTC midnight, which can land on
 * the previous day once the local timezone is applied. Splitting the string
 * avoids that entirely.
 */
function parseLocalDate(dateString) {
  const parts = String(dateString).split('-');
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

/** '2026-10-24' -> 'Sat 24 Oct 2026' */
function formatDate(dateString) {
  if (!dateString) return '';
  return parseLocalDate(dateString).toLocaleDateString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** '18:30:00' -> '6:30 pm' */
function formatTime(timeString) {
  if (!timeString) return '';
  const parts = String(timeString).split(':');
  let hours = Number(parts[0]);
  const minutes = parts[1] || '00';
  const suffix = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return hours + ':' + minutes + ' ' + suffix;
}

/** 0 -> 'Free', 25 -> '$25.00' */
function formatPrice(amount) {
  const value = Number(amount);
  if (!value) return 'Free';
  return '$' + value.toFixed(2);
}

/** 68000 -> '$68,000' (no cents - easier to read on a progress bar) */
function formatMoneyShort(amount) {
  return '$' + Number(amount).toLocaleString('en-AU', { maximumFractionDigits: 0 });
}

/* ---------- DOM helpers --------------------------------------------------- */

/** Creates an element with an optional class and text in one call. */
function el(tagName, className, text) {
  const node = document.createElement(tagName);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

/** Shows a coloured message box inside `container`. */
function showMessage(container, message, type) {
  container.textContent = '';
  const box = el('div', 'message message-' + (type || 'info'), message);
  container.appendChild(box);
}

/** Removes any message box from `container`. */
function clearMessage(container) {
  container.textContent = '';
}

/**
 * Builds one event card.
 *
 * Everything is created with document.createElement - which is exactly the
 * DOM manipulation the assignment asks for - and the card is wrapped in a
 * link so the whole thing navigates to the detail page.
 *
 * @param {object}  event      one event object from the API
 * @param {boolean} isPast     styles the card as a finished event
 * @returns {HTMLElement}
 */
function createEventCard(event, isPast) {
  const link = el('a', 'event-card' + (isPast ? ' is-past' : ''));
  // Pass the chosen event id to the detail page through the query string.
  link.href = 'event.html?id=' + encodeURIComponent(event.event_id);
  link.setAttribute('aria-label', 'View details for ' + event.name);

  // --- banner: category image (falls back to the category emoji)
  const banner = el('div', 'event-banner');

  if (event.category.image_url) {
    const image = document.createElement('img');
    image.className = 'banner-image';
    image.src = event.category.image_url;
    image.alt = event.category.name + ' - ' + event.name;
    image.loading = 'lazy';
    banner.appendChild(image);
  } else {
    banner.appendChild(el('span', 'banner-icon', event.category.icon || '🎉'));
  }

  banner.appendChild(
    el('span', 'badge', isPast ? 'Past event' : event.category.name)
  );

  // --- body
  const body = el('div', 'event-body');
  body.appendChild(el('h3', 'event-title', event.name));

  const meta = el('ul', 'event-meta');
  const facts = [
    ['📅', formatDate(event.event_date)],
    ['🕒', formatTime(event.start_time)],
    ['📍', event.location],
    ['🏢', event.organisation.name],
  ];
  facts.forEach(function (fact) {
    const item = el('li');
    item.appendChild(el('span', 'meta-icon', fact[0]));
    item.appendChild(el('span', null, fact[1]));
    meta.appendChild(item);
  });
  body.appendChild(meta);

  if (event.summary) {
    body.appendChild(el('p', 'event-summary', event.summary));
  }

  // --- goal vs progress
  const progress = el('div', 'progress');
  const label = el('div', 'progress-label');
  label.appendChild(
    el('span', null, formatMoneyShort(event.raised_amount) + ' raised')
  );
  label.appendChild(
    el('span', null, 'of ' + formatMoneyShort(event.goal_amount))
  );
  progress.appendChild(label);

  const track = el('div', 'progress-track');
  const fill = el('div', 'progress-fill');
  fill.style.width = Math.min(100, event.progress_percentage || 0) + '%';
  track.appendChild(fill);
  progress.appendChild(track);
  body.appendChild(progress);

  // --- footer: price + call to action
  const foot = el('div', 'event-foot');
  foot.appendChild(
    el('span', 'price' + (Number(event.ticket_price) === 0 ? ' is-free' : ''),
      formatPrice(event.ticket_price))
  );
  foot.appendChild(el('span', 'btn btn-ghost', isPast ? 'View recap' : 'View event'));
  body.appendChild(foot);

  link.appendChild(banner);
  link.appendChild(body);
  return link;
}

/**
 * Renders a list of events into `grid`, or a friendly note when none matched.
 */
function renderEventGrid(grid, events, emptyText, isPast) {
  grid.textContent = '';

  if (!events || events.length === 0) {
    grid.appendChild(el('p', 'message message-info', emptyText));
    return;
  }

  events.forEach(function (event) {
    grid.appendChild(createEventCard(event, isPast));
  });
}
