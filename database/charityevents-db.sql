-- ===========================================================================
--  PROG2002 - Web Development II
--  Assessment 2 - Charity Events Website
--  Database: charityevents_db
--
--  This file creates the whole database from scratch and fills it with sample
--  data. Run it in MySQL Workbench (File > Open SQL Script > Execute) or from
--  a terminal:
--      mysql -u root < charityevents-db.sql
--
--  Schema overview
--  -----------------------------------------------------------------------
--  organisations  - the charitable bodies that host the events
--  categories     - the type of event (fun run, gala dinner, auction, ...)
--  events         - one row per charity event
--
--  Relationships
--      events.organisation_id  ->  organisations.organisation_id   (N:1)
--      events.category_id      ->  categories.category_id           (N:1)
--  An event belongs to exactly one organisation and one category.
-- ===========================================================================

-- Drop the database first so the script can be re-run safely.
DROP DATABASE IF EXISTS charityevents_db;
CREATE DATABASE charityevents_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE charityevents_db;

-- ---------------------------------------------------------------------------
-- organisations
-- Holds the details of each charity that runs fundraising events.
-- ---------------------------------------------------------------------------
CREATE TABLE organisations (
    organisation_id INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    mission         TEXT         NOT NULL,
    description     TEXT,
    contact_email   VARCHAR(150),
    contact_phone   VARCHAR(50),
    website         VARCHAR(255),
    logo_icon       VARCHAR(10)      -- emoji shown in place of a logo image
);

-- ---------------------------------------------------------------------------
-- categories
-- Lookup table used by the search page filter.
-- ---------------------------------------------------------------------------
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(80)  NOT NULL UNIQUE,
    description VARCHAR(255),
    icon        VARCHAR(10),         -- emoji shown next to the category name
    image_url   VARCHAR(255)         -- banner image used on the event cards
);

-- ---------------------------------------------------------------------------
-- events
-- The central table. status = 'suspended' hides an event from the website
-- (used when an event breaks the organisation's policy).
-- event_date is compared with CURDATE() to decide 'upcoming' or 'past'.
-- ---------------------------------------------------------------------------
CREATE TABLE events (
    event_id        INT AUTO_INCREMENT PRIMARY KEY,
    organisation_id INT            NOT NULL,
    category_id     INT            NOT NULL,
    name            VARCHAR(150)   NOT NULL,
    summary         VARCHAR(255),
    description     TEXT           NOT NULL,
    event_date      DATE           NOT NULL,
    start_time      TIME           NOT NULL,
    end_time        TIME,
    venue           VARCHAR(150)   NOT NULL,
    suburb          VARCHAR(80),
    city            VARCHAR(80)    NOT NULL,
    state           VARCHAR(20)    NOT NULL DEFAULT 'QLD',
    ticket_price    DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
    goal_amount     DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
    raised_amount   DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
    status          ENUM('active','suspended') NOT NULL DEFAULT 'active',
    created_at      TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_event_organisation
        FOREIGN KEY (organisation_id) REFERENCES organisations (organisation_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_event_category
        FOREIGN KEY (category_id) REFERENCES categories (category_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    -- stop nonsense data entering the database
    CONSTRAINT chk_price_not_negative  CHECK (ticket_price  >= 0),
    CONSTRAINT chk_goal_not_negative   CHECK (goal_amount   >= 0),
    CONSTRAINT chk_raised_not_negative CHECK (raised_amount >= 0)
);

-- Speeds up the two things the website does most: filtering by date and
-- filtering by category.
CREATE INDEX idx_event_date     ON events (event_date);
CREATE INDEX idx_event_category ON events (category_id);
CREATE INDEX idx_event_city     ON events (city);

-- ===========================================================================
--  Sample data
-- ===========================================================================

INSERT INTO organisations (name, mission, description, contact_email, contact_phone, website, logo_icon) VALUES
('Hope Together Foundation',
 'To give every family in our city a safe place to call home.',
 'Founded in 2009, Hope Together Foundation funds emergency housing, meals and counselling for families experiencing hardship across the Gold Coast region.',
 'hello@hopetogether.org.au', '(07) 5500 1200', 'www.hopetogether.org.au', '🏠'),

('Bright Futures Children''s Trust',
 'Every child deserves a fair start in life.',
 'Bright Futures provides school supplies, tutoring and health checks to children from low income households, so that no student is left behind because of money.',
 'info@brightfutures.org.au', '(07) 5500 3480', 'www.brightfutures.org.au', '🎒'),

('Green Coast Conservation',
 'Protecting the coastline we all share.',
 'A volunteer driven charity running dune restoration, turtle monitoring and clean-up programs along 40 kilometres of coastline.',
 'contact@greencoast.org.au', '(07) 5500 7720', 'www.greencoast.org.au', '🌿'),

('Harbour Care Alliance',
 'Health care close to home for everyone.',
 'Harbour Care Alliance raises money for mobile health clinics and medical equipment serving regional and coastal communities.',
 'admin@harbourcare.org.au', '(07) 5500 9040', 'www.harbourcare.org.au', '⚕️');

INSERT INTO categories (name, description, icon, image_url) VALUES
('Fun Run',          'Running and jogging events where participants collect sponsorship per lap.',        '🏃', 'img/fun-run.svg'),
('Gala Dinner',      'Formal evening events with dinner, speakers and a fundraising auction.',            '🥂', 'img/gala-dinner.svg'),
('Silent Auction',   'Donated goods are displayed and bid on in writing throughout the event.',           '🔨', 'img/silent-auction.svg'),
('Charity Concert',  'Live music performances where all proceeds support the cause.',                     '🎵', 'img/charity-concert.svg'),
('Community Walk',   'Family friendly walks that raise awareness as well as funds.',                      '🚶', 'img/community-walk.svg'),
('Food Festival',    'Food stalls and cooking demonstrations donating their takings to charity.',         '🍜', 'img/food-festival.svg');

-- ---------------------------------------------------------------------------
-- Events. Dates are deliberately spread so that some are already past and
-- some are still upcoming - that is what the home page uses to label them.
-- One upcoming event is 'suspended' to show that policy-breaking events are
-- hidden from the website.
-- ---------------------------------------------------------------------------
INSERT INTO events
(organisation_id, category_id, name, summary, description, event_date, start_time, end_time, venue, suburb, city, state, ticket_price, goal_amount, raised_amount, status) VALUES

-- ---- already finished (these appear under "Past events") ----
(1, 1, 'Sunrise Fun Run for Housing',
 'A 5 km run along the beachfront raising money for emergency accommodation.',
 'Join hundreds of runners at first light for a 5 km beachfront fun run. Every dollar raised goes directly into the Foundation''s emergency accommodation fund, which keeps families off the street while they get back on their feet. Walkers, joggers and prams are all welcome - the course is flat and fully sealed.',
 '2026-06-20', '06:30:00', '10:00:00', 'Kurrawa Parklands', 'Broadbeach', 'Gold Coast', 'QLD',
 25.00, 60000.00, 68420.00, 'active'),

(3, 5, 'Dune to Dune Community Walk',
 'An 8 km guided walk through the restored dune system.',
 'A gentle 8 km walk from Miami to Burleigh led by our conservation volunteers. Along the way you will hear how the dune system was rebuilt after the 2024 storms and see the nesting sites now being monitored. Suitable for all ages; the last 2 km are wheelchair accessible.',
 '2026-07-18', '08:00:00', '12:00:00', 'Miami Shoreline', 'Miami', 'Gold Coast', 'QLD',
 15.00, 25000.00, 27180.00, 'active'),

(2, 2, 'Midwinter Gala Dinner',
 'Black-tie dinner and auction supporting school supplies for 1,200 children.',
 'Our flagship winter event. A three-course dinner, a keynote from a former scholarship student, and a live auction featuring holidays, artwork and a signed jersey. Funds raised in 2026 equipped 1,200 children with the full year''s stationery and textbooks.',
 '2026-08-15', '18:30:00', '22:30:00', 'Southport Community Hall', 'Southport', 'Gold Coast', 'QLD',
 120.00, 150000.00, 163450.00, 'active'),

(4, 3, 'Harbour Care Silent Auction',
 'A silent auction of donated art, wine and experiences for the mobile clinic.',
 'More than sixty lots donated by local businesses and artists, displayed in the gallery for two weeks with written bidding throughout. Proceeds purchased a portable ultrasound machine for the mobile health clinic that visits eight coastal towns each month.',
 '2026-09-12', '17:00:00', '21:00:00', 'Harbour Gallery', 'Main Beach', 'Gold Coast', 'QLD',
 0.00, 45000.00, 41890.00, 'active'),

-- ---- still to come (these appear under "Upcoming events") ----
(1, 1, 'Twilight 10K for Families',
 'A 10 km twilight run finishing with a community BBQ.',
 'Our biggest running event of the year. The 10 km course starts at the Spit and finishes back at the park for a free community BBQ and live music. Chip timing, medals for every finisher, and a dedicated 2 km kids dash at 5 pm before the main race.',
 '2026-10-24', '17:00:00', '21:00:00', 'The Spit', 'Main Beach', 'Gold Coast', 'QLD',
 35.00, 90000.00, 31500.00, 'active'),

(3, 6, 'Coastal Food Festival',
 'Thirty stalls, cooking demos and all takings donated to dune restoration.',
 'Two days of food from thirty coastal kitchens, with cooking demonstrations from three local chefs and a kids'' tasting tent. Every stall donates its takings, and last year''s festival funded 4,000 new dune plants.',
 '2026-11-07', '10:00:00', '18:00:00', 'Broadwater Parklands', 'Southport', 'Gold Coast', 'QLD',
 10.00, 55000.00, 8200.00, 'active'),

(2, 4, 'Voices for Kids Charity Concert',
 'An evening of live music with all proceeds funding tutoring programs.',
 'Four local acts, one stage, one cause. The concert funds our after-school tutoring program, which pairs volunteer teachers with students who have fallen behind. Bring a picnic rug; gates open an hour before the first act.',
 '2026-11-21', '19:00:00', '22:00:00', 'Robina Community Stage', 'Robina', 'Gold Coast', 'QLD',
 45.00, 40000.00, 12600.00, 'active'),

(4, 2, 'White Coat Ball',
 'Formal ball raising funds for two new mobile health clinics.',
 'Now in its sixth year, the White Coat Ball brings together clinicians, donors and community leaders for an evening of dinner, dancing and a raffle. This year''s target will fund two additional mobile clinics for the northern beaches.',
 '2026-12-05', '18:00:00', '23:00:00', 'Surfers Paradise Ballroom', 'Surfers Paradise', 'Gold Coast', 'QLD',
 150.00, 200000.00, 47300.00, 'active'),

(1, 5, 'Christmas Eve Community Walk',
 'A free, family friendly walk on Christmas Eve with carols.',
 'A free one-hour walk through the parklands ending with carols and a shared supper. No registration fee - donations are welcome on the night and go towards our Christmas hamper program, which delivered 900 hampers last December.',
 '2026-12-19', '18:30:00', '20:30:00', 'Cascade Gardens', 'Broadbeach', 'Gold Coast', 'QLD',
 0.00, 20000.00, 2450.00, 'active'),

(3, 1, 'New Year Turtle Run',
 'Start the year with a 5 km run that protects nesting sites.',
 'Start 2027 on the sand. This 5 km run follows the beach north from the life saving club and finishes with coffee vans and a volunteer briefing on the summer turtle monitoring season. Early bird entries close 20 December.',
 '2027-01-16', '07:00:00', '10:30:00', 'Burleigh Heads SLSC', 'Burleigh Heads', 'Gold Coast', 'QLD',
 30.00, 50000.00, 0.00, 'active'),

(2, 3, 'Back to School Auction',
 'Silent auction of school essentials and local experiences.',
 'Held the week before term starts, this auction features laptops, bikes, tutoring packages and weekend getaways. Every lot funds a specific, costed item in our back-to-school catalogue, so bidders can see exactly what they are paying for.',
 '2027-02-20', '18:00:00', '21:00:00', 'Robina Community Centre', 'Robina', 'Gold Coast', 'QLD',
 0.00, 35000.00, 0.00, 'active'),

(4, 4, 'Sounds of the Harbour',
 'A free outdoor concert supporting the mental health program.',
 'A free afternoon concert on the lawn with three acts and a youth showcase. Donations collected on the day support our mental health outreach program, which now runs four evenings a week.',
 '2027-03-13', '15:00:00', '20:00:00', 'Harbour Foreshore Lawn', 'Main Beach', 'Gold Coast', 'QLD',
 0.00, 30000.00, 0.00, 'active'),

-- ---- suspended: breaks the organisation's policy, so it must stay hidden ----
(1, 6, 'Late Night Street Food Night',
 'Suspended - the proposed venue does not meet our safety policy.',
 'This event was proposed by an external promoter and has been suspended pending a venue safety review. It is stored in the database but is deliberately not shown anywhere on the website.',
 '2026-11-28', '21:00:00', '01:00:00', 'Proposed: Surfers Paradise Mall', 'Surfers Paradise', 'Gold Coast', 'QLD',
 20.00, 15000.00, 0.00, 'suspended');
