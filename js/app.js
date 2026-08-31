/**
 * IEEE Blockchain Pune Section - Core Application Controller
 * Handles Navigation, Header Dynamics, Search Bar, and UI Interactions
 * Enhanced with scroll lock, resize handler, and mobile optimizations
 */

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initMobileNavigation();
  initSearch();
  initSmoothScroll();
});

/* Sticky Header Scroll Effect */
function initStickyHeader() {
  const header = document.querySelector('.main-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* Mobile Responsive Navigation Drawer & Accordion */
function initMobileNavigation() {
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.querySelector('.main-nav-menu');
  const navItemsWithChildren = document.querySelectorAll('.nav-item.has-children');

  // Store scroll position for scroll lock
  let scrollPosition = 0;

  function openNav() {
    if (!navMenu || !toggleBtn) return;
    scrollPosition = window.pageYOffset;
    navMenu.classList.add('open');
    document.body.classList.add('nav-open');
    document.body.style.top = `-${scrollPosition}px`;
    toggleBtn.classList.add('is-open');
    toggleBtn.setAttribute('aria-expanded', 'true');
  }

  function closeNav() {
    if (!navMenu || !toggleBtn) return;
    navMenu.classList.remove('open');
    document.body.classList.remove('nav-open');
    document.body.style.top = '';
    window.scrollTo(0, scrollPosition);
    toggleBtn.classList.remove('is-open');
    toggleBtn.setAttribute('aria-expanded', 'false');

    // Close all accordion sub-menus
    navItemsWithChildren.forEach(item => item.classList.remove('active-mobile'));
  }

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = navMenu.classList.contains('open');
      if (isOpen) {
        closeNav();
      } else {
        openNav();
      }
    });
  }

  // Mobile Accordion Dropdowns
  navItemsWithChildren.forEach(item => {
    const link = item.querySelector('.nav-link');
    if (link) {
      link.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          // Close other open items
          navItemsWithChildren.forEach(other => {
            if (other !== item) other.classList.remove('active-mobile');
          });
          item.classList.toggle('active-mobile');
        }
      });
    }
  });

  // Close mobile nav when resizing back to desktop
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (window.innerWidth > 768 && navMenu && navMenu.classList.contains('open')) {
        closeNav();
      }
    }, 100);
  });

  // Close mobile nav when clicking outside (on the overlay background)
  if (navMenu) {
    navMenu.addEventListener('click', (e) => {
      if (e.target === navMenu) {
        closeNav();
      }
    });
  }

  // Close mobile nav on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu && navMenu.classList.contains('open')) {
      closeNav();
    }
  });
}

/* Interactive Search Bar */
function initSearch() {
  const searchInput = document.querySelector('.header-search input');
  const searchBtn = document.querySelector('.header-search-btn');

  function handleSearch() {
    const query = searchInput ? searchInput.value.trim() : '';
    if (query) {
      alert(`Searching IEEE Blockchain Pune Section archives for: "${query}"...`);
    }
  }

  if (searchBtn) {
    searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleSearch();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSearch();
      }
    });
  }
}

/* Smooth Scroll for Anchor Links (offset by sticky nav on mobile) */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '#content') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const navBar = document.querySelector('.main-navigation-bar');
        const offset = (window.innerWidth <= 768 && navBar)
          ? navBar.offsetHeight + 8
          : 0;
        const top = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}
