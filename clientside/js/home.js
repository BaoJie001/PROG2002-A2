/**
 * js/home.js
 * ---------------------------------------------------------------------------
 * Home page logic.
 *
 * Data flow:
 *   1. the page finishes loading
 *   2. two requests go out to the API (upcoming events, past events)
 *   3. each JSON response is turned into DOM nodes and dropped into the page
 *   4. if a request fails, a message is written into the page instead
 *
 * Both requests are Promises and are started at the same time, then joined with
 * Promise.all so neither has to wait for the other.
 * ---------------------------------------------------------------------------
 */

document.addEventListener('DOMContentLoaded', function () {
  const upcomingGrid = document.getElementById('upcoming-grid');
  const upcomingMessage = document.getElementById('upcoming-message');
  const pastGrid = document.getElementById('past-grid');
  const pastMessage = document.getElementById('past-message');

  /* ---------- 1. upcoming events ---------------------------------------- */

  function loadUpcoming() {
    return fetchJSON(API_BASE + '/events')
      .then(function (data) {
        clearMessage(upcomingMessage);
        renderEventGrid(
          upcomingGrid,
          data.events,
          'No upcoming events right now - please check back soon.',
          false
        );
      })
      .catch(function (error) {
        upcomingGrid.textContent = '';
        showMessage(upcomingMessage, 'Could not load events: ' + error.message, 'error');
      });
  }

  /* ---------- 2. past events -------------------------------------------- */

  function loadPast() {
    return fetchJSON(API_BASE + '/events/past')
      .then(function (data) {
        clearMessage(pastMessage);

        // Nothing to show: quietly hide the whole section rather than
        // printing an empty box.
        if (!data.events || data.events.length === 0) {
          pastGrid.textContent = '';
          return;
        }

        renderEventGrid(pastGrid, data.events, 'No past events yet.', true);
      })
      .catch(function (error) {
        pastGrid.textContent = '';
        showMessage(pastMessage, 'Could not load past events: ' + error.message, 'error');
      });
  }

  /* ---------- 3. run both ----------------------------------------------- */

  Promise.all([loadUpcoming(), loadPast()]);
});
