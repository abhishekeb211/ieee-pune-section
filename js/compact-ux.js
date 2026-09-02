/**
 * IEEE Blockchain Pune Section - Compact UI/UX Interactions
 * High-performance vanilla JavaScript for Tabs, Live Filtering, and Progressive Disclosure
 */

document.addEventListener('DOMContentLoaded', () => {
  initCompactTabs();
  initExpandables();
  initFilterToolbar();
});

/* 1. Tab Switching Controller */
function initCompactTabs() {
  const tabContainers = document.querySelectorAll('.ux-tabs-wrapper');

  tabContainers.forEach(container => {
    const tabButtons = container.querySelectorAll('.ux-tab-btn');
    const tabPanes = container.querySelectorAll('.ux-tab-pane');

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-tab');

        // Update active buttons
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update active pane
        tabPanes.forEach(pane => {
          if (pane.id === targetId || pane.getAttribute('data-pane') === targetId) {
            pane.classList.add('active');
          } else {
            pane.classList.remove('active');
          }
        });
      });
    });
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

    let currentCategory = 'all';
    let currentSearch = '';

    function filterCards() {
      cards.forEach(card => {
        const category = card.getAttribute('data-category') || '';
        const textContent = card.innerText.toLowerCase();

        const matchesCat = (currentCategory === 'all' || category.includes(currentCategory));
        const matchesSearch = (!currentSearch || textContent.includes(currentSearch));

        if (matchesCat && matchesSearch) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    }

    // Pill click handler
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentCategory = pill.getAttribute('data-category') || 'all';
        filterCards();
      });
    });

    // Search input handler
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.trim().toLowerCase();
        filterCards();
      });
    }
  });
}
