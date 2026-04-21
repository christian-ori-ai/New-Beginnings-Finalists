(function () {
  const STORAGE_KEY = "nb-v8-cms-draft-v1";
  const PUBLISHED_OVERRIDES_PATH = "data/v8-cms-overrides.json";
  const pageMap = {
    "index.html": "Home",
    "about-us.html": "About",
    "services.html": "Wedding Planner",
    "weddings.html": "Wedding DJ Services",
    "events.html": "Company & Private Event DJ Services",
    "pricing.html": "Pricing",
    "gallery.html": "Gallery",
    "contact.html": "Contact"
  };

  const schema = [
    { key: "home.hero.eyebrow", page: "index.html", label: "Hero Eyebrow" },
    { key: "home.hero.title", page: "index.html", label: "Hero Title" },
    { key: "home.intro", page: "index.html", label: "Intro Section" },
    { key: "home.quote", page: "index.html", label: "Featured Quote" },
    { key: "home.coordinator", page: "index.html", label: "Coordinator Feature" },
    { key: "home.services", page: "index.html", label: "Services Grid" },
    { key: "home.cta.title", page: "index.html", label: "Availability Heading" },
    { key: "home.cta.copy", page: "index.html", label: "Availability Copy" },

    { key: "about.intro", page: "about-us.html", label: "Intro Copy" },
    { key: "about.coordination", page: "about-us.html", label: "Coordination Card" },
    { key: "about.expectations", page: "about-us.html", label: "Expectations Section" },
    { key: "about.quote", page: "about-us.html", label: "Quote Band" },
    { key: "about.cta.kicker", page: "about-us.html", label: "CTA Kicker" },
    { key: "about.cta.title", page: "about-us.html", label: "CTA Heading" },
    { key: "about.cta.copy", page: "about-us.html", label: "CTA Copy" },

    { key: "services.intro", page: "services.html", label: "Intro Section" },
    { key: "services.offerings", page: "services.html", label: "Services Grid" },
    { key: "services.area", page: "services.html", label: "Service Area Feature" },
    { key: "services.standards", page: "services.html", label: "Standards Section" },
    { key: "services.cta.kicker", page: "services.html", label: "CTA Kicker" },
    { key: "services.cta.title", page: "services.html", label: "CTA Heading" },
    { key: "services.cta.copy", page: "services.html", label: "CTA Copy" },

    { key: "weddings.intro", page: "weddings.html", label: "Intro Section" },
    { key: "weddings.packages", page: "weddings.html", label: "Packages Grid" },
    { key: "weddings.details", page: "weddings.html", label: "Planning + Policy Section" },
    { key: "weddings.cta.kicker", page: "weddings.html", label: "CTA Kicker" },
    { key: "weddings.cta.title", page: "weddings.html", label: "CTA Heading" },
    { key: "weddings.cta.copy", page: "weddings.html", label: "CTA Copy" },

    { key: "events.intro", page: "events.html", label: "Intro Section" },
    { key: "events.packages", page: "events.html", label: "Packages Grid" },
    { key: "events.details", page: "events.html", label: "Included + Policy Section" },
    { key: "events.cta.kicker", page: "events.html", label: "CTA Kicker" },
    { key: "events.cta.title", page: "events.html", label: "CTA Heading" },
    { key: "events.cta.copy", page: "events.html", label: "CTA Copy" },

    { key: "pricing.intro", page: "pricing.html", label: "Intro Section" },
    { key: "pricing.weddings", page: "pricing.html", label: "Wedding Pricing Section" },
    { key: "pricing.events", page: "pricing.html", label: "Company + Private Event Pricing Section" },
    { key: "pricing.guidance", page: "pricing.html", label: "Policy + Guidance Section" },

    { key: "gallery.intro", page: "gallery.html", label: "Intro Section" },
    { key: "gallery.flow", page: "gallery.html", label: "Gallery Grid" },
    { key: "gallery.review", page: "gallery.html", label: "Review Feature" },
    { key: "gallery.types", page: "gallery.html", label: "Event Types Section" },
    { key: "gallery.cta.kicker", page: "gallery.html", label: "CTA Kicker" },
    { key: "gallery.cta.title", page: "gallery.html", label: "CTA Heading" },
    { key: "gallery.cta.copy", page: "gallery.html", label: "CTA Copy" },

    { key: "contact.intro", page: "contact.html", label: "Intro Section" },
    { key: "contact.inquiry.copy", page: "contact.html", label: "Inquiry Panel Intro" },
    { key: "contact.direct", page: "contact.html", label: "Direct Contact Details" },
    { key: "contact.quicklinks", page: "contact.html", label: "Quick Links" },
    { key: "contact.help", page: "contact.html", label: "Helpful Details Section" },
    { key: "contact.quote", page: "contact.html", label: "Quote Band" },
    { key: "contact.cta.kicker", page: "contact.html", label: "CTA Kicker" },
    { key: "contact.cta.title", page: "contact.html", label: "CTA Heading" },
    { key: "contact.cta.copy", page: "contact.html", label: "CTA Copy" }
  ];

  const pageOrder = Object.keys(pageMap);
  const docCache = new Map();

  function cloneObject(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function safeParse(json) {
    try {
      const parsed = JSON.parse(json);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (error) {
      return {};
    }
  }

  function readDraftOverrides() {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? safeParse(raw) : {};
  }

  function writeDraftOverrides(overrides) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides, null, 2));
  }

  function clearDraftOverrides() {
    window.localStorage.removeItem(STORAGE_KEY);
  }

  async function readPublishedOverrides() {
    if (window.location.protocol === "file:") return {};

    try {
      const response = await fetch(PUBLISHED_OVERRIDES_PATH, { cache: "no-store" });
      if (!response.ok) return {};
      const parsed = await response.json();
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (error) {
      return {};
    }
  }

  async function loadPageDocument(page) {
    if (docCache.has(page)) {
      return docCache.get(page);
    }

    const response = await fetch(page, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Unable to load " + page);
    }

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    docCache.set(page, doc);
    return doc;
  }

  async function buildDefaultContentMap() {
    const defaults = {};
    const pages = [...new Set(schema.map(function (field) {
      return field.page;
    }))];

    await Promise.all(
      pages.map(async function (page) {
        const doc = await loadPageDocument(page);
        schema
          .filter(function (field) {
            return field.page === page;
          })
          .forEach(function (field) {
            const node = doc.querySelector('[data-v8-cms="' + field.key + '"]');
            defaults[field.key] = node ? node.innerHTML.trim() : "";
          });
      })
    );

    return defaults;
  }

  function applyOverrides(root, overrides) {
    root.querySelectorAll("[data-v8-cms]").forEach(function (node) {
      const key = node.getAttribute("data-v8-cms");
      if (!Object.prototype.hasOwnProperty.call(overrides, key)) return;
      node.innerHTML = overrides[key];
    });
  }

  async function applySiteOverrides() {
    if (document.body && document.body.hasAttribute("data-v8-editor")) return;

    const published = await readPublishedOverrides();
    const draft = readDraftOverrides();
    applyOverrides(document, Object.assign({}, published, draft));
    document.dispatchEvent(
      new CustomEvent("v8cms:applied", {
        detail: { published: cloneObject(published), draft: cloneObject(draft) }
      })
    );
  }

  window.V8CMS = {
    STORAGE_KEY: STORAGE_KEY,
    PUBLISHED_OVERRIDES_PATH: PUBLISHED_OVERRIDES_PATH,
    pageMap: cloneObject(pageMap),
    pageOrder: pageOrder.slice(),
    schema: schema.slice(),
    buildDefaultContentMap: buildDefaultContentMap,
    readDraftOverrides: readDraftOverrides,
    writeDraftOverrides: writeDraftOverrides,
    clearDraftOverrides: clearDraftOverrides,
    readPublishedOverrides: readPublishedOverrides,
    applyOverrides: applyOverrides
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applySiteOverrides, { once: true });
  } else {
    applySiteOverrides();
  }
})();
