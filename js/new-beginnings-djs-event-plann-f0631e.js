(function () {
  const header = document.querySelector('[data-site-header]');
  const toggle = document.querySelector('[data-nav-toggle]');
  const menu = document.querySelector('[data-site-menu]');
  const dropdowns = document.querySelectorAll('[data-nav-dropdown]');
  const mobileNavQuery = window.matchMedia('(max-width: 1040px)');

  function isMobileNav() {
    return mobileNavQuery.matches;
  }

  function closeDropdowns() {
    dropdowns.forEach(function (dropdown) {
      dropdown.classList.remove('is-open');
      const button = dropdown.querySelector('[data-nav-dropdown-toggle]');
      if (button) button.setAttribute('aria-expanded', 'false');
    });
  }

  function closeMenu() {
    if (menu) menu.classList.remove('is-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    closeDropdowns();
  }

  dropdowns.forEach(function (dropdown) {
    const button = dropdown.querySelector('[data-nav-dropdown-toggle]');
    if (!button) return;

    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      const willOpen = !dropdown.classList.contains('is-open');
      closeDropdowns();
      dropdown.classList.toggle('is-open', willOpen);
      button.setAttribute('aria-expanded', String(willOpen));
      if (isMobileNav()) {
        requestAnimationFrame(function () {
          button.blur();
        });
      }
    });
  });

  document.addEventListener('click', function (event) {
    if (!event.target.closest('[data-nav-dropdown]')) {
      closeDropdowns();
    }

    if (
      toggle &&
      menu &&
      isMobileNav() &&
      menu.classList.contains('is-open') &&
      !event.target.closest('[data-site-header]')
    ) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });

  if (toggle && menu) {
    toggle.addEventListener('click', function (event) {
      event.stopPropagation();
      const open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('menu-open', open);
      if (!open) {
        closeDropdowns();
      } else if (isMobileNav()) {
        requestAnimationFrame(function () {
          toggle.blur();
        });
      }
    });

    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        closeMenu();
      });
    });
  }

  function syncNavForViewport() {
    if (!isMobileNav()) {
      closeMenu();
    } else if (menu && !menu.classList.contains('is-open')) {
      document.body.classList.remove('menu-open');
    }
  }

  syncNavForViewport();
  if (typeof mobileNavQuery.addEventListener === 'function') {
    mobileNavQuery.addEventListener('change', syncNavForViewport);
  } else if (typeof mobileNavQuery.addListener === 'function') {
    mobileNavQuery.addListener(syncNavForViewport);
  }

  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  }

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const revealItems = document.querySelectorAll('.reveal');
  revealItems.forEach(function (item, index) {
    const delay = Math.min(index * 35, 220);
    item.style.transitionDelay = delay + 'ms';
  });
  if ('IntersectionObserver' in window && revealItems.length) {
    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );
    revealItems.forEach(function (item) {
      observer.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add('is-visible');
    });
  }

  function closeFaqItem(item) {
    item.classList.remove('is-open');
    const trigger = item.querySelector('[data-faq-trigger]');
    const answer = item.querySelector('.faq-answer');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    if (answer) answer.style.maxHeight = '0px';
  }

  function openFaqItem(item, trigger) {
    item.classList.add('is-open');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    const answer = item.querySelector('.faq-answer');
    if (answer) {
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  }

  document.querySelectorAll('[data-faq-trigger]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const item = btn.closest('.faq-item');
      if (!item) return;
      const wasOpen = item.classList.contains('is-open');

      document.querySelectorAll('.faq-item.is-open').forEach(function (openItem) {
        closeFaqItem(openItem);
      });

      if (!wasOpen) {
        openFaqItem(item, btn);
      }
    });
  });

  window.addEventListener('resize', function () {
    document.querySelectorAll('.faq-item.is-open .faq-answer').forEach(function (answer) {
      answer.style.maxHeight = answer.scrollHeight + 'px';
    });
  });
})();
