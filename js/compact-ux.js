/**
 * IEEE Blockchain Pune Section - Compact UI/UX Interactions
 * Tabs (a11y + hash deep-link), Live Filtering, Progressive Disclosure
 */

document.addEventListener('DOMContentLoaded', () => {
  initCompactTabs();
  initExpandables();
  initFilterToolbar();
  activateFromHash();
  window.addEventListener('hashchange', activateFromHash);
});

/* 1. Tab Switching Controller (keyboard + aria) */
function initCompactTabs() {
  const tabContainers = document.querySelectorAll('.ux-tabs-wrapper');

  tabContainers.forEach(container => {
    const tabButtons = Array.from(container.querySelectorAll('.ux-tab-btn'));
    const tabPanes = container.querySelectorAll('.ux-tab-pane');

    tabButtons.forEach((btn, index) => {
      const targetId = btn.getAttribute('data-tab');
      if (targetId) {
        btn.setAttribute('aria-controls', targetId);
        btn.id = btn.id || `tab-btn-${targetId}`;
        const pane = container.querySelector(`#${CSS.escape(targetId)}, [data-pane="${CSS.escape(targetId)}"]`);
        if (pane) {
          pane.setAttribute('role', 'tabpanel');
          pane.setAttribute('aria-labelledby', btn.id);
        }
      }

      const isActive = btn.classList.contains('active');
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      btn.setAttribute('tabindex', isActive ? '0' : '-1');

      btn.addEventListener('click', () => {
        activateTab(container, tabButtons, tabPanes, btn, true);
      });

      btn.addEventListener('keydown', (e) => {
        let nextIndex = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          nextIndex = (index + 1) % tabButtons.length;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          nextIndex = (index - 1 + tabButtons.length) % tabButtons.length;
        } else if (e.key === 'Home') {
          nextIndex = 0;
        } else if (e.key === 'End') {
          nextIndex = tabButtons.length - 1;
        }

        if (nextIndex !== null) {
          e.preventDefault();
          tabButtons[nextIndex].focus();
          activateTab(container, tabButtons, tabPanes, tabButtons[nextIndex], true);
        }
      });
    });

    // Sync hidden state for initially inactive panes
    tabPanes.forEach(pane => {
      if (!pane.classList.contains('active')) {
        pane.setAttribute('hidden', '');
      } else {
        pane.removeAttribute('hidden');
      }
    });
  });
}

function activateTab(container, tabButtons, tabPanes, btn, pushHash) {
  const targetId = btn.getAttribute('data-tab');

  tabButtons.forEach(b => {
    const isActive = b === btn;
    b.classList.toggle('active', isActive);
    b.setAttribute('aria-selected', isActive ? 'true' : 'false');
    b.setAttribute('tabindex', isActive ? '0' : '-1');
  });

  tabPanes.forEach(pane => {
    const match = pane.id === targetId || pane.getAttribute('data-pane') === targetId;
    pane.classList.toggle('active', match);
    if (match) {
      pane.removeAttribute('hidden');
    } else {
      pane.setAttribute('hidden', '');
    }
  });

  if (pushHash && targetId && history.replaceState) {
    history.replaceState(null, '', `#${targetId}`);
  }
}

function activateFromHash() {
  const hash = (location.hash || '').replace(/^#/, '');
  if (!hash) return;

  // Prefer matching a tab button by data-tab
  let btn = document.querySelector(`.ux-tab-btn[data-tab="${CSS.escape(hash)}"]`);

  // Or a pane id that has a corresponding tab
  if (!btn) {
    const pane = document.getElementById(hash);
    if (pane && pane.classList.contains('ux-tab-pane')) {
      const wrapper = pane.closest('.ux-tabs-wrapper');
      if (wrapper) {
        btn = wrapper.querySelector(`.ux-tab-btn[data-tab="${CSS.escape(pane.id)}"], .ux-tab-btn[data-tab="${CSS.escape(pane.getAttribute('data-pane') || '')}"]`);
      }
    }
  }

  // Or an element inside a tab pane (e.g. events.html#icbds)
  if (!btn) {
    const target = document.getElementById(hash);
    if (target) {
      const pane = target.closest('.ux-tab-pane');
      if (pane) {
        const wrapper = pane.closest('.ux-tabs-wrapper');
        const paneId = pane.id || pane.getAttribute('data-pane');
        if (wrapper && paneId) {
          btn = wrapper.querySelector(`.ux-tab-btn[data-tab="${CSS.escape(paneId)}"]`);
        }
      }
    }
  }

  if (btn) {
    const container = btn.closest('.ux-tabs-wrapper');
    if (container) {
      const tabButtons = Array.from(container.querySelectorAll('.ux-tab-btn'));
      const tabPanes = container.querySelectorAll('.ux-tab-pane');
      activateTab(container, tabButtons, tabPanes, btn, false);
    }
  }

  // Filter pill deep-link (e.g. standards.html#developing)
  const pill = document.querySelector(`.ux-filter-pill#${CSS.escape(hash)}, .ux-filter-pill[data-category="${CSS.escape(hash)}"]`);
  if (pill) {
    pill.click();
  }

  // Scroll to the hash target after the pane/filter is shown
  requestAnimationFrame(() => {
    const el = document.getElementById(hash);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

/* 2. Progressive Disclosure (Expandable content toggles) */
function initExpandables() {
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.ux-expand-trigger');
    if (!trigger) return;

    e.preventDefault();
    const content = trigger.parentElement.querySelector('.ux-expand-content');
    if (content) {
      const isOpen = content.classList.contains('open');
      if (isOpen) {
        content.classList.remove('open');
        trigger.classList.remove('expanded');
        trigger.setAttribute('aria-expanded', 'false');
      } else {
        content.classList.add('open');
        trigger.classList.add('expanded');
        trigger.setAttribute('aria-expanded', 'true');
      }
    }
  });
}

/* 3. Live Client-Side Card Filter Toolbar */
function initFilterToolbar() {
  const toolbars = document.querySelectorAll('.ux-filter-toolbar');

  toolbars.forEach(toolbar => {
    const targetSelector = toolbar.getAttribute('data-filter-target') || '.ux-filterable-card';
    const cards = document.querySelectorAll(targetSelector);
    const pills = toolbar.querySelectorAll('.ux-filter-pill');
    const searchInput = toolbar.querySelector('.ux-search-box input');

    // Ensure empty-state + count UI exist
    let countEl = toolbar.querySelector('.ux-filter-count');
    if (!countEl) {
      countEl = document.createElement('span');
      countEl.className = 'ux-filter-count';
      countEl.setAttribute('aria-live', 'polite');
      toolbar.appendChild(countEl);
    }

    let emptyEl = null;
    const gridHost = resolveFilterHost(targetSelector, cards);
    if (gridHost) {
      emptyEl = gridHost.parentElement.querySelector('.ux-filter-empty');
      if (!emptyEl) {
        emptyEl = document.createElement('div');
        emptyEl.className = 'ux-filter-empty';
        emptyEl.textContent = 'No matches. Try another filter or clear the search.';
        emptyEl.setAttribute('role', 'status');
        gridHost.insertAdjacentElement('afterend', emptyEl);
      }
    }

    let currentCategory = 'all';
    let currentSearch = '';

    function filterCards() {
      let visible = 0;
      cards.forEach(card => {
        const category = card.getAttribute('data-category') || '';
        const textContent = card.innerText.toLowerCase();

        const matchesCat = (currentCategory === 'all' || category.includes(currentCategory));
        const matchesSearch = (!currentSearch || textContent.includes(currentSearch));

        if (matchesCat && matchesSearch) {
          card.style.display = '';
          visible += 1;
        } else {
          card.style.display = 'none';
        }
      });

      countEl.textContent = `${visible} of ${cards.length}`;
      if (emptyEl) {
        emptyEl.classList.toggle('visible', visible === 0);
      }
    }

    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentCategory = pill.getAttribute('data-category') || 'all';
        filterCards();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.trim().toLowerCase();
        filterCards();
      });
    }

    filterCards();
  });
}

function resolveFilterHost(selector, cards) {
  if (!cards.length) return null;
  // Prefer an explicit grid id from the selector (#id .card)
  const idMatch = selector.match(/#([A-Za-z][\w-]*)/);
  if (idMatch) {
    return document.getElementById(idMatch[1]);
  }
  return cards[0].parentElement;
}
