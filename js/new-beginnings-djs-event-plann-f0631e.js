(function () {
  const header = document.querySelector('[data-site-header]');
  const toggle = document.querySelector('[data-nav-toggle]');
  const menu = document.querySelector('[data-site-menu]');
  const dropdowns = document.querySelectorAll('[data-nav-dropdown]');

  function closeDropdowns() {
    dropdowns.forEach(function (dropdown) {
      dropdown.classList.remove('is-open');
      const button = dropdown.querySelector('[data-nav-dropdown-toggle]');
      if (button) button.setAttribute('aria-expanded', 'false');
    });
  }

  dropdowns.forEach(function (dropdown) {
    const button = dropdown.querySelector('[data-nav-dropdown-toggle]');
    if (!button) return;

    button.addEventListener('click', function (event) {
      event.preventDefault();
      const willOpen = !dropdown.classList.contains('is-open');
      closeDropdowns();
      dropdown.classList.toggle('is-open', willOpen);
      button.setAttribute('aria-expanded', String(willOpen));
    });
  });

  document.addEventListener('click', function (event) {
    if (!event.target.closest('[data-nav-dropdown]')) {
      closeDropdowns();
    }
  });

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      const open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('menu-open', open);
      if (!open) closeDropdowns();
    });

    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
        closeDropdowns();
      });
    });
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

  document.querySelectorAll('[data-faq-trigger]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const item = btn.closest('.faq-item');
      if (!item) return;
      const wasOpen = item.classList.contains('is-open');

      document.querySelectorAll('.faq-item.is-open').forEach(function (openItem) {
        openItem.classList.remove('is-open');
        const trigger = openItem.querySelector('[data-faq-trigger]');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      });

      if (!wasOpen) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();
