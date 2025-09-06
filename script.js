(() => {
  const qs  = (sel, root=document) => root.querySelector(sel);
  const qsa = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  // Elements
  const nav = qs('nav');
  const mobileNav = qs('[data-mobile-nav]');
  const menuBtn = qs('[data-menu-toggle]');
  const scrollBtns = qsa('[data-scroll-to]');
  const sectionsOrder = ['hero','about','skills','services','portfolio','testimonials','blog','contact'];
  const sections = sectionsOrder.map(id => document.getElementById(id)).filter(Boolean);

  // Classes to toggle (match your Tailwind classes)
  const ACTIVE_CLASSES = ['text-blue-600','dark:text-blue-400','font-medium'];
  const SCROLLED_CLASSES = ['bg-white/80','dark:bg-gray-900/80','backdrop-blur-lg','shadow-lg'];

  let currentActiveId = null;

  function setActiveNav(id) {
    if (!id || id === currentActiveId) return;
    currentActiveId = id;

    scrollBtns.forEach(btn => btn.classList.remove(...ACTIVE_CLASSES));
    qsa(`[data-scroll-to="${CSS.escape(id)}"]`).forEach(btn => {
      btn.classList.add(...ACTIVE_CLASSES);
    });
  }

  function closeMobileNav() {
    if (!mobileNav) return;
    mobileNav.classList.add('hidden');
    if (menuBtn) {
      menuBtn.setAttribute('aria-expanded', 'false');
      const openIcon = qs('[data-icon="open"]', menuBtn);
      const closeIcon = qs('[data-icon="close"]', menuBtn);
      if (openIcon && closeIcon) {
        openIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
      }
    }
  }

  function openMobileNav() {
    if (!mobileNav) return;
    mobileNav.classList.remove('hidden');
    if (menuBtn) {
      menuBtn.setAttribute('aria-expanded', 'true');
      const openIcon = qs('[data-icon="open"]', menuBtn);
      const closeIcon = qs('[data-icon="close"]', menuBtn);
      if (openIcon && closeIcon) {
        openIcon.classList.add('hidden');
        closeIcon.classList.remove('hidden');
      }
    }
  }

  function toggleMobileNav() {
    if (!mobileNav) return;
    mobileNav.classList.contains('hidden') ? openMobileNav() : closeMobileNav();
  }

  // Active section detection + sticky nav styles
  function handleScroll() {
    const y = window.scrollY || window.pageYOffset;

    if (nav) {
      if (y > 50) {
        nav.classList.add(...SCROLLED_CLASSES);
      } else {
        nav.classList.remove(...SCROLLED_CLASSES);
      }
    }

    let activeId = sections[0]?.id || null;
    for (const el of sections) {
      const rect = el.getBoundingClientRect();
      const topThreshold = 100; // px from viewport top
      if (rect.top <= topThreshold && rect.bottom >= topThreshold) {
        activeId = el.id;
        break;
      }
    }
    setActiveNav(activeId);
  }

  // Smooth scroll with offset for fixed nav
  function scrollToSection(id) {
    const target = document.getElementById(id);
    if (!target) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const offset = (nav && getComputedStyle(nav).position === 'fixed') ? (nav.offsetHeight || 0) : 0;
    const top = target.getBoundingClientRect().top + window.pageYOffset - offset;

    if (!prefersReduced) {
      window.scrollTo({ top, behavior: 'smooth' });
    } else {
      window.scrollTo(0, top);
    }
  }

  // Wire up click handlers for all nav/CTA buttons
  scrollBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const id = btn.getAttribute('data-scroll-to');
      if (!id) return;
      scrollToSection(id);

      // Close mobile menu if open
      if (mobileNav && !mobileNav.classList.contains('hidden')) {
        closeMobileNav();
      }
    });
  });

  // Mobile menu toggle
  if (menuBtn) {
    menuBtn.addEventListener('click', e => {
      e.preventDefault();
      toggleMobileNav();
    });
  }

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!mobileNav || mobileNav.classList.contains('hidden')) return;
    const withinMenu = mobileNav.contains(e.target);
    const clickedToggle = menuBtn && menuBtn.contains(e.target);
    if (!withinMenu && !clickedToggle) closeMobileNav();
  });

  // Escape closes mobile menu
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileNav();
  });

  // Init
  handleScroll();
  // Use rAF-throttled scroll for performance
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
  window.addEventListener('resize', handleScroll, { passive: true });
})();
