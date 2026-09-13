// Main client script for Wedding Essential Demo

const VALID_STYLES = ['editorial', 'romantic', 'modern', 'dramatic', 'playful'];
const STORAGE_KEY = 'dscg_demo_style';

function getInitialStyle() {
  // Check URL query parameter first (e.g. ?style=romantic)
  const urlParams = new URLSearchParams(window.location.search);
  const styleParam = urlParams.get('style');
  if (styleParam && VALID_STYLES.includes(styleParam.toLowerCase())) {
    return styleParam.toLowerCase();
  }

  // Check localStorage
  const storedStyle = localStorage.getItem(STORAGE_KEY);
  if (storedStyle && VALID_STYLES.includes(storedStyle)) {
    return storedStyle;
  }

  // Default to editorial
  return 'editorial';
}

function applyStyle(styleName) {
  if (!VALID_STYLES.includes(styleName)) return;

  // Set data-style on <html>
  document.documentElement.setAttribute('data-style', styleName);
  localStorage.setItem(STORAGE_KEY, styleName);

  // Update button active states
  const buttons = document.querySelectorAll('.style-btn');
  buttons.forEach((btn) => {
    const isTarget = btn.getAttribute('data-style-target') === styleName;
    btn.classList.toggle('active', isTarget);
    btn.setAttribute('aria-pressed', isTarget ? 'true' : 'false');
  });

  // Update mobile dropdown
  const mobileSelect = document.querySelector('.style-select-mobile');
  if (mobileSelect && mobileSelect.value !== styleName) {
    mobileSelect.value = styleName;
  }
}

function initStyleSwitcher() {
  const currentStyle = getInitialStyle();
  applyStyle(currentStyle);

  // Desktop buttons
  const buttons = document.querySelectorAll('.style-btn');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetStyle = btn.getAttribute('data-style-target');
      applyStyle(targetStyle);
    });
  });

  // Mobile select
  const mobileSelect = document.querySelector('.style-select-mobile');
  if (mobileSelect) {
    mobileSelect.addEventListener('change', (e) => {
      applyStyle(e.target.value);
    });
  }
}

// Smooth scroll offset adjustment with prefers-reduced-motion check
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const navHeight = 90; // Top demo bar + sticky nav height
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - navHeight;

        // Respect prefers-reduced-motion media query
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        window.scrollTo({
          top: offsetPosition,
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
        });

        // Update URL hash without jump
        history.pushState(null, null, targetId);
      }
    });
  });
}

// Accessible Demo Notice Dialog Controller
function initDemoModal() {
  const dialog = document.getElementById('demo-modal');
  const titleEl = document.getElementById('demo-modal-title');
  const descEl = document.getElementById('demo-modal-desc');
  const closeBtn = document.getElementById('demo-modal-close');
  const dismissBtn = document.getElementById('demo-modal-dismiss');

  if (!dialog) return;

  function openModal(title, message) {
    if (titleEl) titleEl.textContent = title;
    if (descEl) descEl.textContent = message;

    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
  }

  function closeModal() {
    if (typeof dialog.close === 'function') {
      dialog.close();
    } else {
      dialog.removeAttribute('open');
    }
  }

  // Map directions button
  const mapBtn = document.getElementById('demo-map-btn');
  if (mapBtn) {
    mapBtn.addEventListener('click', () => {
      openModal(
        'Venue Directions',
        'Interactive venue directions are included on live client sites. This location is fictional for the DSCG demonstration.'
      );
    });
  }

  // Contact wedding coordinator button
  const contactBtn = document.getElementById('demo-contact-btn');
  if (contactBtn) {
    contactBtn.addEventListener('click', () => {
      openModal(
        'Coordinator Contact',
        'Contact functionality is disabled in this fictional demonstration.'
      );
    });
  }

  // Close buttons
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (dismissBtn) dismissBtn.addEventListener('click', closeModal);

  // Close on clicking backdrop outside container
  dialog.addEventListener('click', (e) => {
    const container = dialog.querySelector('.demo-dialog-container');
    if (container && !container.contains(e.target)) {
      closeModal();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initStyleSwitcher();
  initSmoothScroll();
  initDemoModal();
});
