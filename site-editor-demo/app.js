(function () {
  const STORAGE_KEY = "nb-homepage-editor-demo-v1";
  const PREVIEW_URL = "../index.html";
  const DEMO_STYLE_ID = "nb-homepage-editor-demo-styles";

  const FONT_OPTIONS = [
    { label: "Cormorant Garamond", value: '"Cormorant Garamond", Georgia, serif' },
    { label: "Nunito Sans", value: '"Nunito Sans", "Avenir Next", sans-serif' },
    { label: "Georgia", value: "Georgia, serif" },
    { label: "Avenir Next", value: '"Avenir Next", "Segoe UI", sans-serif' },
    { label: "Trebuchet", value: '"Trebuchet MS", "Segoe UI", sans-serif' }
  ];

  const DEFAULT_STYLE_STATE = {
    previewMode: "desktop",
    heroTitleFont: '"Cormorant Garamond", Georgia, serif',
    heroTitleSize: 96,
    heroTitleColor: "#2d2530",
    sectionTitleFont: '"Cormorant Garamond", Georgia, serif',
    sectionTitleSize: 68,
    sectionTitleColor: "#2d2530",
    bodyFont: '"Nunito Sans", "Avenir Next", sans-serif',
    bodyFontSize: 18,
    bodyColor: "#615768",
    eyebrowFont: '"Nunito Sans", "Avenir Next", sans-serif',
    eyebrowSize: 12,
    eyebrowColor: "#ffffff",
    tileColor: "#fff7f0",
    tileOpacity: 0.94,
    quotePanelColor: "#2f2430",
    quotePanelOpacity: 0.72
  };

  const CONTENT_FIELDS = [
    {
      id: "heroEyebrow",
      label: "Hero eyebrow",
      selector: ".v6-eyebrow",
      mode: "text",
      control: "input"
    },
    {
      id: "heroTitle",
      label: "Hero title",
      selector: '[data-v8-cms="home.hero.title"]',
      mode: "html",
      control: "textarea",
      rows: 3,
      note: "Simple HTML works here, like <em>Experience</em>."
    },
    {
      id: "heroPrimaryButton",
      label: "Hero primary button",
      selector: ".v6-hero .hero-actions .button-primary",
      mode: "text",
      control: "input"
    },
    {
      id: "heroSecondaryButton",
      label: "Hero secondary button",
      selector: ".v6-hero .hero-actions .button-secondary",
      mode: "text",
      control: "input"
    },
    {
      id: "introKicker",
      label: "Intro kicker",
      selector: '[data-v8-cms="home.intro"] .section-kicker',
      mode: "text",
      control: "input"
    },
    {
      id: "introTitle",
      label: "Intro heading",
      selector: '[data-v8-cms="home.intro"] .section-title',
      mode: "text",
      control: "textarea",
      rows: 3
    },
    {
      id: "introCopy",
      label: "Intro copy",
      selector: '[data-v8-cms="home.intro"] .section-lead',
      mode: "text",
      control: "textarea",
      rows: 5
    },
    {
      id: "quoteText",
      label: "Quote text",
      selector: '[data-v8-cms="home.quote"] p',
      mode: "text",
      control: "textarea",
      rows: 4
    },
    {
      id: "quoteCredit",
      label: "Quote credit",
      selector: '[data-v8-cms="home.quote"] small',
      mode: "text",
      control: "input"
    },
    {
      id: "coordinatorTitle",
      label: "Coordinator heading",
      selector: '[data-v8-cms="home.coordinator"] .section-title',
      mode: "text",
      control: "textarea",
      rows: 3
    },
    {
      id: "coordinatorKicker",
      label: "Coordinator kicker",
      selector: '[data-v8-cms="home.coordinator"] .section-kicker',
      mode: "text",
      control: "input"
    },
    {
      id: "coordinatorCopy",
      label: "Coordinator copy",
      selector: '[data-v8-cms="home.coordinator"] p:nth-of-type(2)',
      mode: "text",
      control: "textarea",
      rows: 5
    },
    {
      id: "coordinatorPrice",
      label: "Coordinator pricing line",
      selector: '[data-v8-cms="home.coordinator"] p:nth-of-type(3)',
      mode: "html",
      control: "textarea",
      rows: 4,
      note: "Simple HTML works here too, like <strong>$1995</strong>."
    },
    {
      id: "serviceOneTitle",
      label: "Service tile 1",
      selector: '.v6-feature-grid article:nth-child(1) h3',
      mode: "text",
      control: "input"
    },
    {
      id: "serviceTwoTitle",
      label: "Service tile 2",
      selector: '.v6-feature-grid article:nth-child(2) h3',
      mode: "text",
      control: "input"
    },
    {
      id: "serviceThreeTitle",
      label: "Service tile 3",
      selector: '.v6-feature-grid article:nth-child(3) h3',
      mode: "text",
      control: "input"
    },
    {
      id: "ctaTitle",
      label: "Final CTA heading",
      selector: '[data-v8-cms="home.cta.title"]',
      mode: "text",
      control: "textarea",
      rows: 3
    },
    {
      id: "ctaCopy",
      label: "Final CTA copy",
      selector: '[data-v8-cms="home.cta.copy"]',
      mode: "text",
      control: "textarea",
      rows: 4
    },
    {
      id: "finalPrimaryButton",
      label: "Final CTA primary button",
      selector: ".v6-final-cta .hero-actions .button-primary",
      mode: "text",
      control: "input"
    },
    {
      id: "finalSecondaryButton",
      label: "Final CTA secondary button",
      selector: ".v6-final-cta .hero-actions .button-secondary",
      mode: "text",
      control: "input"
    }
  ];

  const IMAGE_FIELDS = [
    { id: "heroImage", label: "Hero image", selector: ".v6-hero-media" },
    { id: "quoteImage", label: "Quote image", selector: ".v6-quote-media img" },
    { id: "coordinatorImage", label: ".I Do package image", selector: ".v6-split figure img" },
    { id: "serviceImageOne", label: "Service tile image 1", selector: ".v6-feature-grid article:nth-child(1) img" },
    { id: "serviceImageTwo", label: "Service tile image 2", selector: ".v6-feature-grid article:nth-child(2) img" },
    { id: "serviceImageThree", label: "Service tile image 3", selector: ".v6-feature-grid article:nth-child(3) img" }
  ];

  const TYPOGRAPHY_GROUPS = [
    {
      id: "hero",
      title: "Hero title",
      fontKey: "heroTitleFont",
      sizeKey: "heroTitleSize",
      colorKey: "heroTitleColor",
      min: 48,
      max: 132,
      step: 1
    },
    {
      id: "section",
      title: "Section titles",
      fontKey: "sectionTitleFont",
      sizeKey: "sectionTitleSize",
      colorKey: "sectionTitleColor",
      min: 30,
      max: 90,
      step: 1
    },
    {
      id: "body",
      title: "Body copy",
      fontKey: "bodyFont",
      sizeKey: "bodyFontSize",
      colorKey: "bodyColor",
      min: 14,
      max: 28,
      step: 1
    },
    {
      id: "eyebrow",
      title: "Eyebrows & labels",
      fontKey: "eyebrowFont",
      sizeKey: "eyebrowSize",
      colorKey: "eyebrowColor",
      min: 10,
      max: 24,
      step: 1
    }
  ];

  let state = readState();
  let baseline = null;
  let controlsBuilt = false;

  const contentHost = document.querySelector("[data-content-controls]");
  const typographyHost = document.querySelector("[data-typography-controls]");
  const tileHost = document.querySelector("[data-tile-controls]");
  const imageHost = document.querySelector("[data-image-controls]");
  const previewFrame = document.querySelector("[data-preview-frame]");
  const previewStage = document.querySelector("[data-preview-stage]");
  const statusNode = document.querySelector("[data-status-message]");
  const resetButton = document.querySelector("[data-reset-demo]");
  const openHomeButton = document.querySelector("[data-open-home]");
  const previewToggles = Array.from(document.querySelectorAll("[data-preview-size]"));

  function setStatus(message) {
    if (statusNode) statusNode.textContent = message;
  }

  function readState() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return Object.assign({}, DEFAULT_STYLE_STATE, raw ? JSON.parse(raw) : {});
    } catch (error) {
      return Object.assign({}, DEFAULT_STYLE_STATE);
    }
  }

  function saveState() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (error) {
      return false;
    }
  }

  function resetState() {
    window.localStorage.removeItem(STORAGE_KEY);
    state = Object.assign({}, DEFAULT_STYLE_STATE);
    if (baseline) {
      CONTENT_FIELDS.forEach(function (field) {
        state[field.id] = baseline.content[field.id];
      });
      IMAGE_FIELDS.forEach(function (field) {
        state[field.id] = baseline.images[field.id];
      });
    }
    renderControlValues();
    syncPreviewModeButtons();
    applyStateToPreview();
    saveState();
    setStatus("Demo reset to the homepage defaults.");
  }

  function resolveImagePath(value) {
    if (!value) return "";
    if (/^(https?:|data:|blob:|\/)/i.test(value)) return value;
    if (value.indexOf("../") === 0) return value;
    return "../" + String(value).replace(/^\.?\//, "");
  }

  function getDisplayImageValue(fieldId) {
    const value = state[fieldId] || "";
    return value.indexOf("data:image/") === 0 ? "" : value;
  }

  function createFieldShell(title) {
    const wrapper = document.createElement("section");
    wrapper.className = "field-group";

    const heading = document.createElement("h3");
    heading.textContent = title;
    wrapper.appendChild(heading);
    return wrapper;
  }

  function createLabeledRow(labelText, valueNode) {
    const row = document.createElement("div");
    row.className = "field-row";

    const label = document.createElement("label");
    label.className = "field-label";
    label.textContent = labelText;
    row.appendChild(label);
    row.appendChild(valueNode);
    return row;
  }

  function createContentControls() {
    CONTENT_FIELDS.forEach(function (field) {
      const shell = createFieldShell(field.label);
      const control = field.control === "textarea" ? document.createElement("textarea") : document.createElement("input");

      control.className = field.control === "textarea" ? "field-textarea" : "field-input";
      control.dataset.stateKey = field.id;
      control.value = state[field.id] || "";

      if (field.control === "textarea") {
        control.rows = field.rows || 4;
      } else {
        control.type = "text";
      }

      control.addEventListener("input", function () {
        state[field.id] = control.value;
        saveState();
        applyStateToPreview();
        setStatus("Homepage preview updated.");
      });

      shell.appendChild(control);

      if (field.note) {
        const note = document.createElement("p");
        note.className = "field-note";
        note.textContent = field.note;
        shell.appendChild(note);
      }

      contentHost.appendChild(shell);
    });
  }

  function createTypographyControls() {
    TYPOGRAPHY_GROUPS.forEach(function (group) {
      const shell = createFieldShell(group.title);

      const fontSelect = document.createElement("select");
      fontSelect.className = "field-select";
      fontSelect.dataset.stateKey = group.fontKey;
      FONT_OPTIONS.forEach(function (option) {
        const node = document.createElement("option");
        node.value = option.value;
        node.textContent = option.label;
        fontSelect.appendChild(node);
      });
      fontSelect.value = state[group.fontKey];
      fontSelect.addEventListener("change", function () {
        state[group.fontKey] = fontSelect.value;
        saveState();
        applyStateToPreview();
        setStatus("Typography updated.");
      });
      shell.appendChild(createLabeledRow("Font family", fontSelect));

      const rangeWrap = document.createElement("div");
      rangeWrap.className = "field-inline";
      const range = document.createElement("input");
      range.type = "range";
      range.className = "field-range";
      range.min = String(group.min);
      range.max = String(group.max);
      range.step = String(group.step);
      range.value = String(state[group.sizeKey]);
      range.dataset.stateKey = group.sizeKey;
      const rangeValue = document.createElement("span");
      rangeValue.className = "field-value";
      rangeValue.textContent = state[group.sizeKey] + "px";
      range.addEventListener("input", function () {
        state[group.sizeKey] = Number(range.value);
        rangeValue.textContent = range.value + "px";
        saveState();
        applyStateToPreview();
      });
      rangeWrap.appendChild(range);
      rangeWrap.appendChild(rangeValue);
      shell.appendChild(createLabeledRow("Font size", rangeWrap));

      const colorInput = document.createElement("input");
      colorInput.type = "color";
      colorInput.className = "field-color";
      colorInput.value = state[group.colorKey];
      colorInput.dataset.stateKey = group.colorKey;
      colorInput.addEventListener("input", function () {
        state[group.colorKey] = colorInput.value;
        saveState();
        applyStateToPreview();
        setStatus("Typography updated.");
      });
      shell.appendChild(createLabeledRow("Font color", colorInput));

      typographyHost.appendChild(shell);
    });
  }

  function createTileControls() {
    const tilesShell = createFieldShell("Content tiles");
    const tileColor = document.createElement("input");
    tileColor.type = "color";
    tileColor.className = "field-color";
    tileColor.value = state.tileColor;
    tileColor.addEventListener("input", function () {
      state.tileColor = tileColor.value;
      saveState();
      applyStateToPreview();
      setStatus("Tile styling updated.");
    });
    tilesShell.appendChild(createLabeledRow("Tile color", tileColor));

    const tileOpacityWrap = document.createElement("div");
    tileOpacityWrap.className = "field-inline";
    const tileOpacity = document.createElement("input");
    tileOpacity.type = "range";
    tileOpacity.className = "field-range";
    tileOpacity.min = "0.1";
    tileOpacity.max = "1";
    tileOpacity.step = "0.01";
    tileOpacity.value = String(state.tileOpacity);
    const tileOpacityValue = document.createElement("span");
    tileOpacityValue.className = "field-value";
    tileOpacityValue.textContent = Math.round(state.tileOpacity * 100) + "%";
    tileOpacity.addEventListener("input", function () {
      state.tileOpacity = Number(tileOpacity.value);
      tileOpacityValue.textContent = Math.round(state.tileOpacity * 100) + "%";
      saveState();
      applyStateToPreview();
      setStatus("Tile styling updated.");
    });
    tileOpacityWrap.appendChild(tileOpacity);
    tileOpacityWrap.appendChild(tileOpacityValue);
    tilesShell.appendChild(createLabeledRow("Tile opacity", tileOpacityWrap));
    tileHost.appendChild(tilesShell);

    const quoteShell = createFieldShell("Quote panel");
    const quoteColor = document.createElement("input");
    quoteColor.type = "color";
    quoteColor.className = "field-color";
    quoteColor.value = state.quotePanelColor;
    quoteColor.addEventListener("input", function () {
      state.quotePanelColor = quoteColor.value;
      saveState();
      applyStateToPreview();
      setStatus("Quote panel styling updated.");
    });
    quoteShell.appendChild(createLabeledRow("Panel color", quoteColor));

    const quoteOpacityWrap = document.createElement("div");
    quoteOpacityWrap.className = "field-inline";
    const quoteOpacity = document.createElement("input");
    quoteOpacity.type = "range";
    quoteOpacity.className = "field-range";
    quoteOpacity.min = "0.1";
    quoteOpacity.max = "1";
    quoteOpacity.step = "0.01";
    quoteOpacity.value = String(state.quotePanelOpacity);
    const quoteOpacityValue = document.createElement("span");
    quoteOpacityValue.className = "field-value";
    quoteOpacityValue.textContent = Math.round(state.quotePanelOpacity * 100) + "%";
    quoteOpacity.addEventListener("input", function () {
      state.quotePanelOpacity = Number(quoteOpacity.value);
      quoteOpacityValue.textContent = Math.round(state.quotePanelOpacity * 100) + "%";
      saveState();
      applyStateToPreview();
      setStatus("Quote panel styling updated.");
    });
    quoteOpacityWrap.appendChild(quoteOpacity);
    quoteOpacityWrap.appendChild(quoteOpacityValue);
    quoteShell.appendChild(createLabeledRow("Panel opacity", quoteOpacityWrap));
    tileHost.appendChild(quoteShell);
  }

  function createImageControls() {
    IMAGE_FIELDS.forEach(function (field) {
      const shell = createFieldShell(field.label);
      const input = document.createElement("input");
      input.type = "text";
      input.className = "field-input";
      input.dataset.stateKey = field.id;
      input.value = getDisplayImageValue(field.id);
      input.placeholder = "images/example.avif or https://...";
      input.addEventListener("input", function () {
        state[field.id] = input.value.trim();
        saveState();
        applyStateToPreview();
        setStatus("Image preview updated.");
      });
      shell.appendChild(input);

      const actions = document.createElement("div");
      actions.className = "image-field-actions";

      const upload = document.createElement("input");
      upload.type = "file";
      upload.accept = "image/*";
      upload.className = "field-upload";
      upload.addEventListener("change", function () {
        const file = upload.files && upload.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function () {
          state[field.id] = String(reader.result || "");
          input.value = "";
          const saved = saveState();
          applyStateToPreview();
          setStatus(saved
            ? "Uploaded image preview saved in this browser."
            : "Uploaded image preview applied, but the file was too large to store.");
        };
        reader.readAsDataURL(file);
      });

      const reset = document.createElement("button");
      reset.type = "button";
      reset.className = "editor-button editor-button-ghost";
      reset.textContent = "Use site default";
      reset.addEventListener("click", function () {
        state[field.id] = baseline ? baseline.images[field.id] : "";
        input.value = getDisplayImageValue(field.id);
        saveState();
        applyStateToPreview();
        setStatus("Image reset to the homepage default.");
      });

      actions.appendChild(upload);
      actions.appendChild(reset);
      shell.appendChild(actions);

      const note = document.createElement("p");
      note.className = "field-note";
      note.textContent = "Paste a site path or URL, or choose a local file just for this demo preview.";
      shell.appendChild(note);
      imageHost.appendChild(shell);
    });
  }

  function renderControls() {
    if (controlsBuilt) return;
    createContentControls();
    createTypographyControls();
    createTileControls();
    createImageControls();
    controlsBuilt = true;
  }

  function renderControlValues() {
    document.querySelectorAll("[data-state-key]").forEach(function (node) {
      const key = node.dataset.stateKey;
      if (!Object.prototype.hasOwnProperty.call(state, key)) return;
      if (node.type === "range") {
        node.value = String(state[key]);
        const valueNode = node.parentElement && node.parentElement.querySelector(".field-value");
        if (valueNode) {
          valueNode.textContent = key.indexOf("Opacity") !== -1
            ? Math.round(Number(state[key]) * 100) + "%"
            : state[key] + "px";
        }
        return;
      }
      node.value = IMAGE_FIELDS.some(function (field) { return field.id === key; })
        ? getDisplayImageValue(key)
        : state[key];
    });
  }

  function captureBaseline(doc) {
    const content = {};
    const images = {};

    CONTENT_FIELDS.forEach(function (field) {
      const node = doc.querySelector(field.selector);
      if (!node) {
        content[field.id] = "";
        return;
      }
      content[field.id] = field.mode === "html" ? node.innerHTML.trim() : node.textContent.trim();
    });

    IMAGE_FIELDS.forEach(function (field) {
      const node = doc.querySelector(field.selector);
      images[field.id] = node ? node.getAttribute("src") || "" : "";
    });

    return { content: content, images: images };
  }

  function hydrateStateFromBaseline() {
    CONTENT_FIELDS.forEach(function (field) {
      if (!Object.prototype.hasOwnProperty.call(state, field.id)) {
        state[field.id] = baseline.content[field.id] || "";
      }
    });

    IMAGE_FIELDS.forEach(function (field) {
      if (!Object.prototype.hasOwnProperty.call(state, field.id)) {
        state[field.id] = baseline.images[field.id] || "";
      }
    });

    saveState();
  }

  function hexToRgb(hex) {
    const normalized = String(hex || "").replace("#", "").trim();
    if (normalized.length !== 6) {
      return { r: 255, g: 255, b: 255 };
    }
    return {
      r: parseInt(normalized.slice(0, 2), 16),
      g: parseInt(normalized.slice(2, 4), 16),
      b: parseInt(normalized.slice(4, 6), 16)
    };
  }

  function rgba(hex, alpha) {
    const rgb = hexToRgb(hex);
    return "rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", " + Number(alpha).toFixed(2) + ")";
  }

  function buildPreviewStyleSheet() {
    return [
      ".v6-hero-overlay h1 {",
      "  font-family: " + state.heroTitleFont + " !important;",
      "  font-size: clamp(2.5rem, 8vw, " + state.heroTitleSize + "px) !important;",
      "  color: " + state.heroTitleColor + " !important;",
      "}",
      '[data-v8-cms="home.intro"] .section-title,',
      '[data-v8-cms="home.coordinator"] .section-title,',
      '[data-v8-cms="home.cta.title"] {',
      "  font-family: " + state.sectionTitleFont + " !important;",
      "  font-size: clamp(2rem, 5vw, " + state.sectionTitleSize + "px) !important;",
      "  color: " + state.sectionTitleColor + " !important;",
      "}",
      ".v6-eyebrow, .v6-home .section-kicker {",
      "  font-family: " + state.eyebrowFont + " !important;",
      "  font-size: " + state.eyebrowSize + "px !important;",
      "  color: " + state.eyebrowColor + " !important;",
      "}",
      '[data-v8-cms="home.intro"] .section-lead,',
      '[data-v8-cms="home.coordinator"] p:not(.section-kicker),',
      '[data-v8-cms="home.cta.copy"],',
      '[data-v8-cms="home.quote"] p,',
      '[data-v8-cms="home.quote"] small,',
      ".v6-feature-grid h3 {",
      "  font-family: " + state.bodyFont + " !important;",
      "  font-size: " + state.bodyFontSize + "px !important;",
      "  color: " + state.bodyColor + " !important;",
      "}",
      ".v6-split article, .v6-feature-grid article {",
      "  background: " + rgba(state.tileColor, state.tileOpacity) + " !important;",
      "  border-color: " + rgba(state.tileColor, Math.min(state.tileOpacity + 0.12, 1)) + " !important;",
      "}",
      ".v6-quote-panel {",
      "  background: " + rgba(state.quotePanelColor, state.quotePanelOpacity) + " !important;",
      "}",
      "@media (max-width: 640px) {",
      "  .v6-hero-overlay h1 {",
      "    font-size: clamp(2.2rem, 12vw, " + Math.max(42, Math.round(state.heroTitleSize * 0.62)) + "px) !important;",
      "  }",
      "  [data-v8-cms=\"home.intro\"] .section-title,",
      "  [data-v8-cms=\"home.coordinator\"] .section-title,",
      "  [data-v8-cms=\"home.cta.title\"] {",
      "    font-size: clamp(1.9rem, 10vw, " + Math.max(32, Math.round(state.sectionTitleSize * 0.68)) + "px) !important;",
      "  }",
      "}"
    ].join("\n");
  }

  function applyStateToPreview() {
    if (!previewFrame || !previewFrame.contentDocument || !baseline) return;

    const doc = previewFrame.contentDocument;

    CONTENT_FIELDS.forEach(function (field) {
      const node = doc.querySelector(field.selector);
      if (!node) return;
      const value = state[field.id];
      if (field.mode === "html") {
        node.innerHTML = value;
      } else {
        node.textContent = value;
      }
    });

    IMAGE_FIELDS.forEach(function (field) {
      const node = doc.querySelector(field.selector);
      if (!node) return;
      const chosen = (state[field.id] || "").trim();
      node.src = resolveImagePath(chosen || baseline.images[field.id]);
    });

    let styleNode = doc.getElementById(DEMO_STYLE_ID);
    if (!styleNode) {
      styleNode = doc.createElement("style");
      styleNode.id = DEMO_STYLE_ID;
      doc.head.appendChild(styleNode);
    }
    styleNode.textContent = buildPreviewStyleSheet();
  }

  function syncPreviewModeButtons() {
    if (!previewStage) return;
    previewStage.dataset.size = state.previewMode;
    previewToggles.forEach(function (button) {
      const active = button.dataset.previewSize === state.previewMode;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function initPreviewFrame() {
    if (!previewFrame) return;
    previewFrame.src = PREVIEW_URL + "?siteEditorDemo=" + Date.now();

    previewFrame.addEventListener("load", function () {
      const doc = previewFrame.contentDocument;
      if (!doc) return;

      baseline = captureBaseline(doc);
      hydrateStateFromBaseline();
      renderControls();
      renderControlValues();
      syncPreviewModeButtons();
      applyStateToPreview();
      setStatus("Homepage loaded. Changes save in this browser while you demo the editor.");
    });
  }

  previewToggles.forEach(function (button) {
    button.addEventListener("click", function () {
      state.previewMode = button.dataset.previewSize;
      saveState();
      syncPreviewModeButtons();
    });
  });

  if (resetButton) {
    resetButton.addEventListener("click", resetState);
  }

  if (openHomeButton) {
    openHomeButton.addEventListener("click", function () {
      window.open(PREVIEW_URL, "_blank", "noopener");
    });
  }

  initPreviewFrame();
})();
