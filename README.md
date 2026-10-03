# PROG2002 – Assessment 2: Charity Events website

A dynamic website for managing charity events in a city. Server side is Node.js +
Express; the pages are plain HTML, CSS and JavaScript (no frameworks, no
templating engine), and all data comes from MySQL through a small REST API.

## Folders

```
PROG2002-A2/
├── database/
│   └── charityevents-db.sql      # whole database: schema + sample data
├── api/                          # -> usernameA2-api.zip
│   ├── server.js                 # Express entry point
│   ├── event_db.js               # MySQL connection pool
│   ├── routes/
│   │   ├── events.js
│   │   └── categories.js
│   ├── .env                      # connection settings
│   └── package.json
└── clientside/                   # -> usernameA2-clientside.zip
    ├── index.html                # home
    ├── search.html               # search events
    ├── event.html                # event details
    ├── css/style.css
    └── js/
        ├── api.js                # shared fetch + formatting + DOM helpers
        ├── home.js
        ├── search.js
        └── event.js
```

## Running it – easiest way

Double-click **`start-everything.bat`**. It starts MySQL, waits for it, starts
the API and opens <http://localhost:3000/> in your browser.

Step by step instead:

1. **Start MySQL** – double-click `start-mysql.bat` and leave the window open.
2. **Start the API**

   ```bat
   cd api
   npm install
   npm run dev
   ```

3. **Open the site** – <http://localhost:3000/>

   Express serves `clientside/` as static files, so the pages can also be opened
   directly from disk (they fall back to `http://localhost:3000/api`).

Connection settings live in `api/.env`:

```
DB_HOST=127.0.0.1   DB_PORT=3306   DB_USER=root   DB_PASSWORD=   DB_NAME=charityevents_db
```

## Loading the database

```bat
mysql -u root --default-character-set=utf8mb4 < database\charityevents-db.sql
```

The script drops and recreates `charityevents_db`, so it is safe to re-run.
It creates 4 organisations, 6 categories and 13 events (8 upcoming, 4 already
finished, 1 suspended).

**Tables**

| table | holds |
| --- | --- |
| `organisations` | the charities running the events |
| `categories` | fun run, gala dinner, silent auction, concert, walk, food festival |
| `events` | one row per event – date, venue, ticket price, goal/raised, status |

`events.organisation_id → organisations.organisation_id` and
`events.category_id → categories.category_id`. An event with `status = 'suspended'`
is stored but never returned by any endpoint, so it cannot appear on the site.

## API

| method | endpoint | used by |
| --- | --- | --- |
| GET | `/api/events` | home page – active events that have not finished yet |
| GET | `/api/events?date=&location=&category=` | search page – any combination of the three |
| GET | `/api/events/past` | home page "Past events" section |
| GET | `/api/events/:id` | event detail page |
| GET | `/api/categories` | fills the category drop-down on the search page |
| GET | `/api/health` | checks the API and the database are up |

Notes

* Filtering is done with query parameters on the collection resource
  (`/api/events`) rather than one URL per filter.
* Only `GET` is implemented – POST/PUT/DELETE are Assessment 3.
* Every user value goes through a `?` placeholder, so SQL injection is not
  possible. Malformed input returns `400`, a missing or suspended event `404`.
* Errors come back as `{ "error": true, "message": "..." }`.

## Website

* **Home** – static organisation info (welcome, mission, contact) plus two
  lists loaded from the API: upcoming events and past events. The past/upcoming
  split is decided by comparing `event_date` with today.
* **Search** – date + location + category filter, "Clear Filters" button,
  result count, and error/empty messages written into the page with DOM calls.
* **Event detail** – the id arrives in the query string (`event.html?id=7`);
  shows full description, ticket price, goal vs progress bar, organiser, and a
  Register button that opens a modal saying the feature is under construction.

## Rules compliance

* Express is used **only** for the server-side API.
* No templating engine – no EJS/Pug/Handlebars anywhere, pages are real HTML.
* Client side has **no** framework: no Bootstrap/Tailwind, no React/Vue/Angular,
  no jQuery. One hand-written stylesheet and vanilla JavaScript with `fetch`,
  Promises and `document.createElement`.

## What to submit

| Deliverable | Location |
| --- | --- |
| `usernameA2-api.zip` | `submission/PROG2002-A2-api.zip` (rename to your SCU username) |
| `usernameA2-clientside.zip` | `submission/PROG2002-A2-clientside.zip` (rename likewise) |
| Database SQL file | `database/charityevents-db.sql` (a copy is inside the api zip) |
| Project report | `docs/project-report.md` – paste into the unit's report template |
| GitHub link | `git init` is done; create the repo with `gh auth login` then `gh repo create PROG2002-A2 --private --source=. --push` |
| Demo video | not started yet – see the outline at the end of `docs/project-report.md` |
