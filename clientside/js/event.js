/**
 * js/event.js
 * ---------------------------------------------------------------------------
 * Event detail page logic.
 *
 * Data flow:
 *   1. read the event id out of the URL query string  (.../event.html?id=7)
 *   2. GET /api/events/7
 *   3. write the returned values into the page with textContent / DOM nodes
 *   4. the Register button opens a modal - ticket purchasing is Assessment 3
 * ---------------------------------------------------------------------------
 */

document.addEventListener('DOMContentLoaded', function () {
  const modal = document.getElementById('register-modal');
  const modalClose = document.getElementById('modal-close');
  const registerButton = document.getElementById('register-button');
  const content = document.getElementById('event-content');
  const messageBox = document.getElementById('event-message');

  /* ---------- 1. which event was clicked? -------------------------------- */

  /**
   * Reads a single parameter from the query string.
   * The home and search pages link here as event.html?id=<event_id>.
   */
  function getEventId() {
    const params = new URLSearchParams(location.search);
    return params.get('id');
  }

  /* ---------- 2. paint the page ------------------------------------------ */

  function renderEvent(event) {
    document.title = event.name + ' - Giving Coast Charity Events';

    document.getElementById('event-category').textContent =
      (event.category.icon ? event.category.icon + '  ' : '') + event.category.name;
    document.getElementById('event-name').textContent = event.name;
    document.getElementById('event-summary').textContent = event.summary || '';

    document.getElementById('event-description').textContent = event.description;
    document.getElementById('event-purpose').textContent =
      'All proceeds go to ' + event.organisation.name + ' - ' +
      event.organisation.mission;

    // Category banner behind the heading.
    const heroImage = document.getElementById('event-image');
    if (event.category.image_url) {
      heroImage.src = event.category.image_url;
      heroImage.alt = '';
      heroImage.style.display = 'block';
    } else {
      heroImage.removeAttribute('src');
      heroImage.style.display = 'none';
    }

    document.getElementById('fact-date').textContent = formatDate(event.event_date);
    document.getElementById('fact-time').textContent =
      formatTime(event.start_time) + (event.end_time ? ' - ' + formatTime(event.end_time) : '');
    document.getElementById('fact-venue').textContent = event.venue;
    document.getElementById('fact-location').textContent =
      [event.suburb, event.city, event.state].filter(Boolean).join(', ');
    document.getElementById('fact-category').textContent = event.category.name;
    document.getElementById('fact-organiser').textContent = event.organisation.name;

    // Ticket price
    const priceNode = document.getElementById('ticket-price');
    priceNode.textContent = formatPrice(event.ticket_price);
    if (Number(event.ticket_price) === 0) {
      priceNode.classList.add('is-free');
    }

    // Goal vs progress
    document.getElementById('raised-amount').textContent = formatMoneyShort(event.raised_amount);
    document.getElementById('goal-amount').textContent = formatMoneyShort(event.goal_amount);
    document.getElementById('goal-fill').style.width =
      Math.min(100, event.progress_percentage || 0) + '%';
    document.getElementById('goal-percentage').textContent =
      event.progress_percentage + '% of the goal reached' +
      (event.is_past ? ' (this event has finished).' : ' so far.');

    // Registration form: show what one ticket costs. The fields stay disabled
    // until Assessment 3 adds the endpoint that saves a registration.
    document.getElementById('register-total').textContent =
      Number(event.ticket_price) === 0
        ? 'This event is free - donations are welcome on the day.'
        : '1 ticket x ' + formatPrice(event.ticket_price) + ' = ' + formatPrice(event.ticket_price);

    // Organiser
    document.getElementById('org-icon').textContent = event.organisation.icon || '🏢';
    document.getElementById('org-name').textContent = event.organisation.name;
    document.getElementById('org-mission').textContent = event.organisation.mission;
    document.getElementById('org-contact').textContent =
      event.organisation.contact_email + ' | ' + event.organisation.contact_phone;

    // Everything is filled in - reveal the page.
    content.hidden = false;
  }

  /* ---------- 3. fetch it ------------------------------------------------- */

  function loadEvent(id) {
    return fetchJSON(API_BASE + '/events/' + encodeURIComponent(id))
      .then(function (event) {
        clearMessage(messageBox);
        renderEvent(event);
      })
      .catch(function (error) {
        content.hidden = true;
        showMessage(messageBox, 'Could not load this event: ' + error.message, 'error');
        document.getElementById('event-name').textContent = 'Event unavailable';
        document.getElementById('event-summary').textContent =
          'Go back to the home page and choose another event.';
      });
  }

  /* ---------- 4. Register modal ------------------------------------------ */

  function openModal() {
    modal.classList.add('is-open');
  }

  function closeModal() {
    modal.classList.remove('is-open');
  }

  registerButton.addEventListener('click', openModal);
  modalClose.addEventListener('click', closeModal);

  // Clicking the dark area outside the modal also closes it.
  modal.addEventListener('click', function (event) {
    if (event.target === modal) closeModal();
  });

  // Escape closes it too.
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeModal();
  });

  /* ---------- 5. start ---------------------------------------------------- */

  const id = getEventId();

  if (!id || !/^\d+$/.test(id)) {
    content.hidden = true;
    showMessage(
      messageBox,
      'No event was selected. Please open an event from the home or search page.',
      'warning'
    );
    document.getElementById('event-name').textContent = 'No event selected';
    return;
  }

  loadEvent(id);
});
