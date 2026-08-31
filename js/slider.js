/**
 * IEEE Pune Section - High-Performance Slider Engine
 * Manages Hero Banner Carousel and Life at Pune Section Gallery Stream
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeroSlider();
  initGallerySlider();
});

function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.slider-dot');
  const prevBtn = document.querySelector('.slider-arrow.prev');
  const nextBtn = document.querySelector('.slider-arrow.next');
  
  if (!slides.length) return;

  let currentIndex = 0;
  let slideInterval = null;
  const autoPlayDelay = 6000;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
    currentIndex = index;
  }

  function nextSlide() {
    let nextIndex = (currentIndex + 1) % slides.length;
    showSlide(nextIndex);
  }

  function prevSlide() {
    let prevIndex = (currentIndex - 1 + slides.length) % slides.length;
    showSlide(prevIndex);
  }

  function startAutoPlay() {
    stopAutoPlay();
    slideInterval = setInterval(nextSlide, autoPlayDelay);
  }

  function stopAutoPlay() {
    if (slideInterval) {
      clearInterval(slideInterval);
      slideInterval = null;
    }
  }

  // Event Listeners
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      startAutoPlay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      startAutoPlay();
    });
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      showSlide(i);
      startAutoPlay();
    });
  });

  const heroSection = document.querySelector('.hero-slider-section');
  if (heroSection) {
    heroSection.addEventListener('mouseenter', stopAutoPlay);
    heroSection.addEventListener('mouseleave', startAutoPlay);
  }

  // Touch Swipe Support
  let touchStartX = 0;
  let touchEndX = 0;

  if (heroSection) {
    heroSection.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    heroSection.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
  }

  function handleSwipe() {
    const threshold = 50;
    if (touchEndX < touchStartX - threshold) {
      nextSlide();
    } else if (touchEndX > touchStartX + threshold) {
      prevSlide();
    }
  }

  startAutoPlay();
}

function initGallerySlider() {
  const track = document.querySelector('.gallery-track');
  const items = document.querySelectorAll('.gallery-item');
  if (!track || !items.length) return;

  let currentIndex = 0;
  const totalItems = items.length;
  
  function getVisibleCount() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  function updateGallery() {
    const visibleCount = getVisibleCount();
    const maxIndex = Math.max(0, totalItems - visibleCount);
    currentIndex = (currentIndex > maxIndex) ? 0 : currentIndex;
    const itemWidth = items[0].getBoundingClientRect().width;
    const gap = 24; // 1.5rem
    const offset = currentIndex * (itemWidth + gap);
    track.style.transform = `translateX(-${offset}px)`;
  }

  // Auto-scroll gallery periodically
  setInterval(() => {
    const visibleCount = getVisibleCount();
    const maxIndex = Math.max(0, totalItems - visibleCount);
    currentIndex = (currentIndex >= maxIndex) ? 0 : currentIndex + 1;
    updateGallery();
  }, 4500);

  window.addEventListener('resize', updateGallery);
}
