/**
 * js/search.js
 * ---------------------------------------------------------------------------
 * Search page logic.
 *
 * Data flow:
 *   1. on load, GET /api/categories fills the category drop-down
 *   2. the user picks any combination of date / location / category
 *   3. on submit the values are validated, then turned into a query string
 *   4. GET /api/events?date=...&location=...&category=... returns the matches
 *   5. the matches are rendered as cards; problems are shown as messages
 * ---------------------------------------------------------------------------
 */

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('search-form');
  const dateInput = document.getElementById('filter-date');
  const locationInput = document.getElementById('filter-location');
  const categorySelect = document.getElementById('filter-category');
  const clearButton = document.getElementById('clear-button');

  const formMessage = document.getElementById('form-message');
  const resultMessage = document.getElementById('result-message');
  const resultGrid = document.getElementById('result-grid');
  const resultCount = document.getElementById('result-count');

  /* ---------- 1. load the categories into the drop-down ------------------ */

  function loadCategories() {
    return fetchJSON(API_BASE + '/categories')
      .then(function (categories) {
        categorySelect.textContent = '';

        const anyOption = el('option', null, 'Any category');
        anyOption.value = '';
        categorySelect.appendChild(anyOption);

        categories.forEach(function (category) {
          const option = el(
            'option',
            null,
            (category.icon ? category.icon + '  ' : '') + category.name
          );
          option.value = category.category_id;
          categorySelect.appendChild(option);
        });
      })
      .catch(function (error) {
        categorySelect.textContent = '';
        const fallback = el('option', null, 'Any category');
        fallback.value = '';
        categorySelect.appendChild(fallback);
        showMessage(
          formMessage,
          'Categories could not be loaded: ' + error.message,
          'warning'
        );
      });
  }

  /* ---------- 2. validate what the user typed ---------------------------- */

  /**
   * Today as YYYY-MM-DD, built from the local calendar rather than UTC.
   * Using toISOString() here would report yesterday for most of the
   * afternoon in UTC+8 and reject a perfectly valid "today" search.
   */
  function todayISO() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return now.getFullYear() + '-' + month + '-' + day;
  }

  /**
   * @returns {{ valid: boolean, message: string, criteria: object }}
   */
  function readForm() {
    const criteria = {
      date: dateInput.value.trim(),
      location: locationInput.value.trim(),
      category: categorySelect.value.trim(),
    };

    if (criteria.date && !/^\d{4}-\d{2}-\d{2}$/.test(criteria.date)) {
      return { valid: false, message: 'Please enter a valid date.', criteria: criteria };
    }

    // The list only contains events that have not happened yet, so a date in
    // the past could never match anything. Rejecting it here saves a pointless
    // request and explains why, instead of showing an empty grid.
    if (criteria.date && criteria.date < todayISO()) {
      return {
        valid: false,
        message:
          'Please choose today or a future date. Events that have already '
          + 'finished are listed on the home page.',
        criteria: criteria,
      };
    }

    if (criteria.location && criteria.location.length < 2) {
      return {
        valid: false,
        message: 'Location must be at least 2 characters long.',
        criteria: criteria,
      };
    }

    return { valid: true, message: '', criteria: criteria };
  }

  /* ---------- 3. run the search ------------------------------------------ */

  function runSearch(criteria) {
    resultGrid.textContent = '';
    clearMessage(resultMessage);
    resultCount.textContent = 'Searching...';

    const url = API_BASE + '/events' + buildQuery(criteria);

    return fetchJSON(url)
      .then(function (data) {
        renderEventGrid(
          resultGrid,
          data.events,
          'No events match your filters. Try widening the date or clearing the location.',
          false
        );

        resultCount.textContent = data.count === 1
          ? '1 event found.'
          : data.count + ' events found.';
      })
      .catch(function (error) {
        resultGrid.textContent = '';
        resultCount.textContent = 'Search failed.';
        showMessage(resultMessage, 'Search failed: ' + error.message, 'error');
      });
  }

  /* ---------- 4. events --------------------------------------------------- */

  form.addEventListener('submit', function (event) {
    // Stop the browser from reloading the page - we handle it in JS.
    event.preventDefault();

    clearMessage(formMessage);

    const check = readForm();
    if (!check.valid) {
      showMessage(formMessage, check.message, 'error');
      return;
    }

    runSearch(check.criteria);
  });

  /**
   * "Clear Filters" resets every control and empties the results -
   * plain DOM manipulation, no page reload.
   */
  clearButton.addEventListener('click', function () {
    form.reset();

    if (categorySelect.options.length > 0) {
      categorySelect.selectedIndex = 0;
    }

    clearMessage(formMessage);
    clearMessage(resultMessage);
    resultGrid.textContent = '';
    resultCount.textContent = 'Filters cleared. Choose your criteria and press "Search events".';
  });

  // Kick off the category request as soon as the page is ready.
  loadCategories();
});
