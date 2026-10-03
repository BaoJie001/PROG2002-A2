# PROG2002 – Web Development II
## Assessment 2: Charity Events Website – Project Report

**Student:** Bao Jie
**Unit:** PROG2002 Web Development II
**Assessment:** Assessment 2 – Case Study (Dynamic website)
**Database:** `charityevents_db` (MySQL 8.0)
**Stack:** Node.js 22 + Express 4 (server) · HTML5 + CSS3 + vanilla JavaScript (client)

---

## A. Case study analysis

### A.1 What the case study asks for

The brief describes a platform that sits between a charitable organisation and
members of the public. The charity publishes fundraising events; the public
browses them, searches for the ones that suit them, reads the full detail of an
event, and registers (which, for a charity, means buying a ticket as a
donation).

Reading the brief closely, three different *things* have to be managed, and
that observation is what drove the whole data model:

| Thing | Why it needs its own table |
| --- | --- |
| **Charitable organisation** | Several charities share one website ("Giving Coast"). Repeating the charity's contact details on every event row would mean updating 5 rows every time a phone number changes. |
| **Event category** | The search page must offer a category filter. If categories were typed free-hand into the events table, the drop-down would fill up with "fun run", "Fun Run", "funrun". |
| **Event** | The central entity. Each event belongs to one organisation and one category. |

The two most interesting rules in the brief are not about storing data at all –
they are about *deciding what to show*:

1. **Upcoming vs past.** The site must work this out by comparing the event
   date with today's date, not from a flag someone has to maintain.
2. **Suspension.** An event that breaks the organisation's policy must stay in
   the database but never appear on the website.

Both are handled in the query layer (section C), because a rule that lives in
SQL cannot be forgotten by a page that forgets to check it.

### A.2 Functional requirements

| # | Requirement | Where it is met |
| --- | --- | --- |
| F1 | Home page shows organisation information | `index.html` hero + "Who we are" cards (static content) |
| F2 | Home page lists current/upcoming events from the API | `GET /api/events`, rendered by `js/home.js` |
| F3 | Events are labelled past or upcoming from their date | `event_date >= CURDATE()` in SQL; `is_past` flag returned by the API |
| F4 | Suspended events are never shown | `status = 'active'` in every query; `GET /api/events/:id` returns 404 for a suspended event |
| F5 | Search page filters by date, location and category | `GET /api/events?date=&location=&category=` |
| F6 | Any one criterion, or several at once | Each filter is applied independently and combined with `AND` |
| F7 | Categories come from the database | `GET /api/categories` fills the drop-down on page load |
| F8 | "Clear Filters" resets the form | `js/search.js`, DOM only, no page reload |
| F9 | Search results link to the detail page | Each card is an `<a>` to `event.html?id=…` |
| F10 | Error messages shown to the user | `showMessage()` writes into the page |
| F11 | Detail page shows the selected event only | id read from the query string |
| F12 | Full description, time, place, purpose | `event.html` "About this event" + "Event details" |
| F13 | Ticket price, including free events | `formatPrice()` prints "Free" when the price is 0 |
| F14 | Goal vs progress | Progress bar + figures on cards and on the detail page |
| F15 | Register button → "under construction" | Modal with the required wording |
| F16 | Navigation on every page | Same `<header>` markup on all three pages |

### A.3 Non-functional requirements

* **Technology constraint.** Express may be used for the server; no CSS or
  JavaScript framework, and no templating engine, may be used anywhere. Every
  page is a real `.html` file. See section D.5.
* **Usability.** Cards, a clear filter panel, empty states and loading
  placeholders rather than blank space.
* **Robustness.** Every request is wrapped; a failure produces a readable
  message instead of a blank page or a raw stack trace.
* **Security.** Parameterised SQL, server-side validation, no write endpoints.
* **Maintainability.** Database access in one module (`event_db.js`); HTTP
  routes in their own modules; front-end helpers shared in `js/api.js`.

---

## B. Database design (Part 1)

### B.1 Schema

```
organisations                     categories
-----------------                 -----------------
organisation_id  PK  ──┐          category_id   PK  ──┐
name                   │          name  UNIQUE        │
mission                │          description         │
description            │          icon                │
contact_email          │          image_url           │
contact_phone          │                              │
website                │                              │
logo_icon              │                              │
                       │                              │
                       └─── events.organisation_id FK │
                                                      │
                               events.category_id  FK ┘

events
------
event_id         PK
organisation_id  FK -> organisations.organisation_id  (ON DELETE CASCADE)
category_id      FK -> categories.category_id         (ON DELETE RESTRICT)
name, summary, description
event_date, start_time, end_time
venue, suburb, city, state
ticket_price   DECIMAL(10,2)
goal_amount    DECIMAL(12,2)
raised_amount  DECIMAL(12,2)
status         ENUM('active','suspended')
created_at
```

### B.2 Why it is shaped this way

* **One-to-many, twice.** An organisation runs many events; a category groups
  many events. Both are modelled by putting the parent's primary key into
  `events` as a foreign key, which is the standard way to express a 1:N
  relationship in a relational database.
* **`ON DELETE CASCADE` on organisation.** If a charity is removed, its events
  are meaningless and are removed with it.
* **`ON DELETE RESTRICT` on category.** Deleting a category that still has
  events would silently orphan those rows, so the database refuses. This is a
  deliberate *guard rail*: the referential integrity is enforced by MySQL, not
  by hoping the application code remembers.
* **`DECIMAL` for money, not `FLOAT`.** `FLOAT` cannot represent 0.01 exactly
  and rounding errors would accumulate on a fundraising total.
* **CHECK constraints** (`ticket_price >= 0`, `goal_amount >= 0`,
  `raised_amount >= 0`) stop impossible values at the door.
* **Indexes** on `event_date`, `category_id` and `city`, because those are
  exactly the three columns the search page filters on.
* **`status` as ENUM.** Only two values are meaningful, so the column cannot
  drift into "Active", "active " or "suspendd".

The schema is in third normal form: no repeating groups, no partial
dependencies, and no transitive dependencies – organisation contact details
depend on the organisation, not on the event.

### B.3 Sample data

4 organisations, 6 categories and 13 events. The event dates are deliberately
spread across both sides of today's date:

| Group | Count | Purpose |
| --- | --- | --- |
| Upcoming | 8 | proves the home page and the search results |
| Past | 4 | proves the automatic past/upcoming labelling |
| Suspended | 1 | proves a policy-breaking event is stored but hidden |

Ticket prices include two free events (0.00) to exercise the "Free" display,
and the goal/raised figures vary from 0% to over 100% of goal so the progress
bar can be seen in different states.

---

## C. RESTful API design (Part 2)

### C.1 Resources and URLs

| Resource | URL | Meaning |
| --- | --- | --- |
| collection of events | `/api/events` | the events, optionally filtered |
| one event | `/api/events/:id` | a single event |
| finished events | `/api/events/past` | a filtered view of the collection |
| categories | `/api/categories` | the category lookup list |

Design decisions:

* **Nouns, not verbs.** No `/api/getEvents` or `/api/findByCategory`.
* **Filtering with query parameters.** `GET /api/events?location=Southport`
  is still "the events collection, narrowed". Inventing one URL per filter
  combination would be unmanageable; query parameters keep the resource
  identity stable and are cache-friendly.
* **`/api/events/past` is declared before `/api/events/:id`** in
  `routes/events.js`. Express matches routes in order, so if `/:id` came first
  the literal word "past" would be captured as an id.
* **Plural collection names** and consistent lower-case, so the URL space is
  predictable.

### C.2 Methods and status codes

Only `GET` is implemented – the brief defers POST/PUT/DELETE to Assessment 3.
The server therefore cannot change data, which is itself a safety property.

| Situation | Status | Body |
| --- | --- | --- |
| success | 200 | the resource, or `{ count, events }` for a collection |
| malformed query/input | 400 | `{ error: true, message: "…" }` |
| id not found, or event suspended | 404 | `{ error: true, message: "Event not found." }` |
| database or server fault | 500 | generic message; the real error is logged |

### C.3 Security

1. **SQL injection.** Every value that reaches the database is bound with a `?`
   placeholder through `pool.query(sql, params)`. No user input is ever
   concatenated into an SQL string.
2. **Server-side validation** of every query parameter before it is used:
   `date` must match `YYYY-MM-DD` *and* be a real date; `category` must be a
   positive integer; `location` is trimmed and length-limited.
3. **Least information.** Internal error text goes to the console, never to the
   browser, so the API does not leak schema details.
4. **Suspension enforced server-side.** Hiding an event in the page would be
   useless – a hand-typed URL would still reach it. The `status = 'active'`
   condition is part of the query, so a suspended event returns 404 even when
   requested directly.
5. **CORS** is enabled deliberately: the client-side is a separate deliverable
   and may be opened from a different origin.

### C.4 Verification (Postman)

| Request | Expected | Actual |
| --- | --- | --- |
| `GET /api/events` | 200, upcoming + active only | 200, 8 events |
| `GET /api/events/past` | 200, finished events | 200, 4 events |
| `GET /api/events?location=Southport` | 200, location matches | 200, 1 event |
| `GET /api/events?category=2` | 200, Gala Dinner only | 200, 1 event |
| `GET /api/events?date=2026-11-07` | 200, events on that day | 200, 1 event (Coastal Food Festival) |
| `GET /api/events?date=2027-01-01` | 200, empty is valid | 200, 0 events |
| `GET /api/events?date=2026-11-21&location=Gold Coast&category=4` | 200, all three applied | 200, 1 event (Voices for Kids) |
| `GET /api/events/5` | 200, full detail joined | 200, with organisation + category |
| `GET /api/events/999` | 404 | 404 `Event not found.` |
| `GET /api/events/13` (suspended) | 404 | 404 `Event not found.` |
| `GET /api/events/abc` | 400 | 400 `Event id must be a positive number.` |
| `GET /api/events?date=notadate` | 400 | 400 `Date must be a real date…` |
| `GET /api/categories` | 200 | 200, 6 categories with upcoming counts |

A date typed into the search form means **on that day**, not *from that day onwards*. The
first version used `event_date >= ?`, which meant asking for a single date returned every
later event as well — correct SQL, but useless to someone looking for something to do on a
particular weekend. It now uses `event_date = ?`, and only falls back to the
`>= CURDATE()` rule when no date is supplied.

---

## D. Client-side development (Part 3)

### D.1 Pages

| Page | Static content | Data loaded from the API |
| --- | --- | --- |
| `index.html` | welcome, mission statement, what we fund, contact details, footer | upcoming events, past events |
| `search.html` | heading, filter form, footer | categories (on load), matching events (on submit) |
| `event.html` | layout, registration modal | the selected event |

### D.2 Data flow

```
page loads
   │
   ├─► fetch('/api/events')            ──► Promise
   │        │
   │        ├─ HTTP error?  ─► throw Error(server message)
   │        └─ network down? ─► throw TypeError ─► friendly "cannot reach API"
   │
   ├─► response.json()                 ──► Promise
   │
   ├─► data.events.forEach(...)
   │        └─► document.createElement(...) builds one card
   │
   └─► grid.appendChild(card)          ──► visible on the page
```

The three stages the brief asks about map directly onto the code:

1. **Sending the request** – `fetchJSON()` in `js/api.js`.
2. **Receiving the response** – `fetch()` resolves, the HTTP status is checked
   by hand (because `fetch` only rejects on network failure), and the body is
   parsed with `response.json()`.
3. **Rendering** – `createEventCard()` builds the card out of real DOM nodes
   and `renderEventGrid()` attaches them.

`js/home.js` fires both of its requests at once and joins them with
`Promise.all`, so the past-events list does not wait for the upcoming list.

### D.3 DOM manipulation

Cards are built with `createElement` / `appendChild` rather than by
concatenating HTML strings, which means:

* text is inserted with `textContent`, so event names containing quotes or
  angle brackets cannot break the markup or inject script;
* nodes can be removed and re-created cleanly when the results change
  (`grid.textContent = ''` before each render).

Other DOM work: the category drop-down is populated from the API on load, the
"Clear Filters" button resets each control, message boxes are created and
removed, and the modal is opened/closed by toggling a class.

### D.4 Validation and error handling

* **Search page** – the location must be at least 2 characters; the date must
  be well formed; and a date in the past is rejected, because the searchable
  list only contains events that have not happened yet. Failures show a red
  message box instead of sending a useless request.
* **Every fetch is caught.** A rejected Promise writes a readable message into
  the page: "Cannot reach the API. Make sure the server is running…".
* **Empty results** get an explanatory message rather than a blank area.
* **Detail page** – a missing or non-numeric `?id=` shows a warning and never
  renders a half-empty page.
* **Loading state** – skeleton placeholders are shown until the API answers.

### D.5 Compliance with the technology rules

| Rule | How it is met |
| --- | --- |
| No CSS framework | one hand-written `css/style.css`; no Bootstrap or Tailwind |
| No JavaScript framework | vanilla JS only; no React, Vue, Angular or jQuery |
| No AngularJS | not used anywhere |
| No Express templating | no EJS/Pug/Handlebars installed; `express.static` serves plain `.html` files |
| Express only on the server | used solely for routing and static files |
| DOM and Promises | `createElement`/`appendChild` and `fetch().then()` throughout |

### D.6 Design

A single colour system (deep green brand, warm amber accent) is defined once as
CSS custom properties, so a change to one variable re-skins the whole site. The
grid uses `auto-fill` with `minmax`, so cards reflow from three columns to one
without a single media-query breakpoint for the layout itself. Past events are
desaturated. Every image has `alt` text, links have accessible names, and the
modal is a labelled `role="dialog"` that closes on Escape.

---

## E. Difficulties and how they were solved

1. **Dates arriving one day early.** `row.event_date.toISOString().slice(0,10)`
   converts to UTC first, so in UTC+10 every date shifted back a day (24
   October rendered as 23 October). Fixed by formatting the local calendar
   parts with `getFullYear()` / `getMonth()` / `getDate()`. The same care is
   taken in `js/api.js`, which parses `YYYY-MM-DD` into a local `Date` instead
   of relying on `new Date(string)`.
2. **Emoji rejected by MySQL.** Importing the script failed with
   *Incorrect string value* because the client was not told the file was UTF-8.
   Solved with `--default-character-set=utf8mb4` and a `utf8mb4` database.
3. **`DECIMAL` returned as a string.** mysql2 hands `DECIMAL` back as text,
   which would have made the front-end format money itself. Setting
   `decimalNumbers: true` on the pool returns real numbers.
4. **Route ordering.** `/api/events/:id` would swallow `/api/events/past`, so
   the literal path is registered first.

---

## F. What Assessment 3 will add

* `POST /api/events/:id/registrations` and a working registration form
  (the modal already contains the fields, disabled).
* An admin side for creating and suspending events (`POST`/`PUT`/`DELETE`).
* Optionally AngularJS, which the brief permits from Assessment 3 onwards.

---

## G. How to run this submission

1. Start MySQL (`start-mysql.bat`) or just run `start-everything.bat`.
2. `cd api` → `npm install` → `npm run dev`.
3. Import `database/charityevents-db.sql` if the database is empty.
4. Open <http://localhost:3000/>.

---

## H. Demo video outline (max 15 minutes)

The brief asks the video to cover three things. A workable script:

**1. Database and API architecture (≈5 min)**

* Open `charityevents-db.sql` in MySQL Workbench and walk through the three
  tables, the two foreign keys and the CHECK constraints.
* Show the EER diagram (Workbench: *Database > Reverse Engineer*).
* Open `api/routes/events.js` and explain the `WHERE` clauses: how
  `status = 'active'` hides suspended events and how `event_date >= CURDATE()`
  produces the upcoming list.
* In Postman, run `GET /api/events`, then `GET /api/events?category=2`, then
  `GET /api/events/13` (suspended → 404) and `?date=notadate` (→ 400).

**2. Data flow, API to website (≈4 min)**

* Show `js/api.js` → `fetchJSON()`: send, check status, parse JSON, catch.
* Show `js/home.js`: two requests started together, joined with `Promise.all`.
* Show `createEventCard()`: the response array becomes DOM nodes.
* In the browser, open DevTools → Network and reload the home page so the
  `/api/events` request and its JSON response are visible.

**3. Website functionality (≈5 min)**

* Home page: static organisation content, upcoming list, past list.
* Search page: fill in location only → results; add a category → fewer results;
  press **Clear Filters** to show the reset; type a 1-character location to
  show the validation message.
* Click a card → detail page; point at `event.html?id=…` in the address bar.
* Press **Register** → the modal with the required wording.
* Stop the API (Ctrl+C) and reload to show the "cannot reach the API" message.
