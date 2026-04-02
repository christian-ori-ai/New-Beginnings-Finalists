const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const siteHeader = document.querySelector(".site-header");
const navToggle = document.querySelector("[data-nav-toggle]");
const navMenu = document.querySelector("[data-nav-menu]");

const markLoaded = () => {
  document.body.classList.add("is-loaded");
};

const setMenuState = (isOpen) => {
  if (!navMenu || !navToggle) return;
  navMenu.classList.toggle("open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("nav-open", isOpen);
};

const closeMenu = () => setMenuState(false);

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = !navMenu.classList.contains("open");
    setMenuState(isOpen);
  });

  navMenu.querySelectorAll("a, button").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  document.addEventListener("click", (event) => {
    if (!navMenu.classList.contains("open")) return;
    if (event.target === navMenu) {
      closeMenu();
      return;
    }

    const clickedInsideMenu = navMenu.contains(event.target);
    const clickedToggle = navToggle.contains(event.target);
    if (!clickedInsideMenu && !clickedToggle) {
      closeMenu();
    }
  });
}

const runHomePreloader = () => {
  const preloader = document.querySelector("[data-home-preloader]");
  const valueNode = document.querySelector("[data-preloader-value]");

  if (!preloader) {
    markLoaded();
    return;
  }

  const removePreloader = () => {
    preloader.classList.add("is-complete");
    window.setTimeout(() => {
      preloader.remove();
    }, 760);
    markLoaded();
  };

  if (prefersReducedMotion || !valueNode) {
    valueNode && (valueNode.textContent = "100");
    removePreloader();
    return;
  }

  const duration = 1700;
  const startedAt = performance.now();

  const tick = (timestamp) => {
    const progress = Math.min((timestamp - startedAt) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(eased * 100);
    valueNode.textContent = String(value).padStart(2, "0");

    if (progress < 1) {
      requestAnimationFrame(tick);
      return;
    }

    window.setTimeout(removePreloader, 160);
  };

  requestAnimationFrame(tick);
};

if (document.readyState === "complete") {
  runHomePreloader();
} else {
  window.addEventListener("load", runHomePreloader, { once: true });
}

const updateHeaderState = () => {
  if (!siteHeader) return;
  siteHeader.classList.toggle("is-scrolled", window.scrollY > 14);
};

updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });

document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

const splitHeading = (element) => {
  const rawText = element.textContent.trim().replace(/\s+/g, " ");
  if (!rawText) return;

  const words = rawText.split(" ");
  const fragment = document.createDocumentFragment();
  element.textContent = "";
  element.classList.add("split-heading");

  words.forEach((word, index) => {
    const wordNode = document.createElement("span");
    wordNode.className = "word";
    wordNode.style.setProperty("--word-index", String(index));
    wordNode.textContent = word;
    fragment.appendChild(wordNode);

    if (index < words.length - 1) {
      const spacer = document.createElement("span");
      spacer.className = "space";
      spacer.setAttribute("aria-hidden", "true");
      fragment.appendChild(spacer);
    }
  });

  element.appendChild(fragment);
  requestAnimationFrame(() => {
    element.classList.add("is-animated");
  });
};

if (!prefersReducedMotion) {
  document.querySelectorAll(".hero h1, .page-hero h1").forEach((heading) => {
    if (heading.hasAttribute("data-no-split")) return;
    splitHeading(heading);
  });
}

const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
  );

  reveals.forEach((el) => observer.observe(el));
} else {
  reveals.forEach((el) => el.classList.add("is-visible"));
}

if (!prefersReducedMotion && window.innerWidth > 900) {
  const parallaxNodes = document.querySelectorAll(".hero-copy, .hero-panel, .hero-float, .hero-project-link");
  let rafId = 0;

  const updateParallax = () => {
    const viewportMid = window.innerHeight / 2;
    parallaxNodes.forEach((node) => {
      const rect = node.getBoundingClientRect();
      const nodeMid = rect.top + rect.height / 2;
      const offset = (viewportMid - nodeMid) * 0.03;
      node.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    });
    rafId = 0;
  };

  const requestParallax = () => {
    if (rafId) return;
    rafId = requestAnimationFrame(updateParallax);
  };

  updateParallax();
  window.addEventListener("scroll", requestParallax, { passive: true });
  window.addEventListener("resize", requestParallax);
}

const inquiryForm = document.getElementById("inquiry-form");
if (inquiryForm) {
  const status = inquiryForm.querySelector("[data-form-status]");

  inquiryForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!inquiryForm.checkValidity()) {
      if (status) {
        status.textContent = "Please complete the required fields before sending.";
        status.className = "form-status error";
      }
      return;
    }

    if (status) {
      status.textContent = "Thanks. Your request is ready to connect to your preferred email/CRM workflow.";
      status.className = "form-status success";
    }

    inquiryForm.reset();
  });
}
