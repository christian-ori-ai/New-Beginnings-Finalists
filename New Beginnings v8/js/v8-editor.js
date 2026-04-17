(function () {
  async function initEditor() {
    if (!window.V8CMS) return;

    const pageTabs = document.querySelector("[data-editor-page-tabs]");
    const fieldsHost = document.querySelector("[data-editor-fields]");
    const previewFrame = document.querySelector("[data-editor-preview]");
    const activePageLabel = document.querySelector("[data-editor-page-label]");
    const openPageLink = document.querySelector("[data-open-preview]");
    const saveButton = document.querySelector("[data-save-draft]");
    const copyButton = document.querySelector("[data-copy-json]");
    const downloadButton = document.querySelector("[data-download-json]");
    const clearButton = document.querySelector("[data-clear-draft]");
    const importInput = document.querySelector("[data-import-json]");
    const statusNode = document.querySelector("[data-editor-status]");
    const fieldSearch = document.querySelector("[data-editor-search]");

    const defaults = await window.V8CMS.buildDefaultContentMap();
    const published = await window.V8CMS.readPublishedOverrides();
    let draft = window.V8CMS.readDraftOverrides();
    let activePage = window.V8CMS.pageOrder[0];

    function setStatus(message, tone) {
      if (!statusNode) return;
      statusNode.textContent = message;
      statusNode.dataset.tone = tone || "neutral";
    }

    function getBaseValue(key) {
      if (Object.prototype.hasOwnProperty.call(published, key)) return published[key];
      return defaults[key] || "";
    }

    function getCurrentValue(key) {
      if (Object.prototype.hasOwnProperty.call(draft, key)) return draft[key];
      return getBaseValue(key);
    }

    function createExportObject() {
      const exported = {};
      window.V8CMS.schema.forEach(function (field) {
        const value = getCurrentValue(field.key);
        const defaultValue = defaults[field.key] || "";
        if (value !== defaultValue) {
          exported[field.key] = value;
        }
      });
      return exported;
    }

    function syncDraftForKey(key, value) {
      const baseValue = getBaseValue(key);
      if (value === baseValue) {
        delete draft[key];
        return;
      }
      draft[key] = value;
    }

    function refreshPreview() {
      if (!previewFrame) return;
      const url = activePage + "?cmsPreview=" + Date.now();
      previewFrame.src = url;
      if (openPageLink) {
        openPageLink.href = activePage;
      }
      if (activePageLabel) {
        activePageLabel.textContent = window.V8CMS.pageMap[activePage] || activePage;
      }
    }

    function refreshTabState() {
      pageTabs.querySelectorAll("button").forEach(function (button) {
        const isActive = button.dataset.page === activePage;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });
    }

    function filterFieldCards() {
      const query = (fieldSearch && fieldSearch.value.trim().toLowerCase()) || "";
      fieldsHost.querySelectorAll("[data-field-card]").forEach(function (card) {
        const matchesPage = card.dataset.page === activePage;
        const haystack = (card.dataset.search || "").toLowerCase();
        const matchesQuery = !query || haystack.indexOf(query) !== -1;
        card.hidden = !(matchesPage && matchesQuery);
      });
    }

    function renderPageTabs() {
      window.V8CMS.pageOrder.forEach(function (page) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "editor-page-tab";
        button.dataset.page = page;
        button.textContent = window.V8CMS.pageMap[page];
        button.addEventListener("click", function () {
          activePage = page;
          refreshTabState();
          filterFieldCards();
          refreshPreview();
        });
        pageTabs.appendChild(button);
      });
      refreshTabState();
    }

    function buildFieldCard(field) {
      const card = document.createElement("section");
      card.className = "editor-card";
      card.dataset.fieldCard = "true";
      card.dataset.page = field.page;
      card.dataset.search = window.V8CMS.pageMap[field.page] + " " + field.label;

      const header = document.createElement("div");
      header.className = "editor-card-head";

      const titleWrap = document.createElement("div");
      const title = document.createElement("h2");
      title.className = "editor-card-title";
      title.textContent = field.label;
      const meta = document.createElement("p");
      meta.className = "editor-card-meta";
      meta.textContent = window.V8CMS.pageMap[field.page];
      titleWrap.appendChild(title);
      titleWrap.appendChild(meta);

      const actions = document.createElement("div");
      actions.className = "editor-card-actions";

      const resetButton = document.createElement("button");
      resetButton.type = "button";
      resetButton.className = "editor-inline-button";
      resetButton.textContent = "Reset";
      resetButton.addEventListener("click", function () {
        const editorSurface = card.querySelector("[data-editor-surface]");
        editorSurface.innerHTML = getBaseValue(field.key);
        syncDraftForKey(field.key, editorSurface.innerHTML.trim());
        setStatus(field.label + " reset to the current published/default version.", "neutral");
      });

      actions.appendChild(resetButton);
      header.appendChild(titleWrap);
      header.appendChild(actions);

      const surface = document.createElement("div");
      surface.className = "editor-surface";
      surface.contentEditable = "true";
      surface.spellcheck = true;
      surface.dataset.editorSurface = field.key;
      surface.innerHTML = getCurrentValue(field.key);
      surface.addEventListener("input", function () {
        syncDraftForKey(field.key, surface.innerHTML.trim());
        setStatus("Unsaved edits in progress for " + window.V8CMS.pageMap[field.page] + ".", "warning");
      });

      card.appendChild(header);
      card.appendChild(surface);
      return card;
    }

    function renderFieldCards() {
      window.V8CMS.schema.forEach(function (field) {
        fieldsHost.appendChild(buildFieldCard(field));
      });
      filterFieldCards();
    }

    function persistDraft() {
      window.V8CMS.writeDraftOverrides(draft);
      refreshPreview();
      setStatus(
        "Draft saved in this browser. Use Copy JSON or Download JSON when you want to publish the changes site-wide.",
        "success"
      );
    }

    function copyPublishJson() {
      const payload = JSON.stringify(createExportObject(), null, 2);
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        setStatus("Clipboard access is not available here. Use Download JSON instead.", "warning");
        return;
      }

      navigator.clipboard
        .writeText(payload)
        .then(function () {
          setStatus("Publish-ready JSON copied to the clipboard.", "success");
        })
        .catch(function () {
          setStatus("Unable to copy JSON to the clipboard in this browser.", "error");
        });
    }

    function downloadPublishJson() {
      const payload = JSON.stringify(createExportObject(), null, 2);
      const blob = new Blob([payload], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "v8-cms-overrides.json";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href);
      setStatus("Downloaded a publish-ready JSON export for v8.", "success");
    }

    function clearDraft() {
      draft = {};
      window.V8CMS.clearDraftOverrides();
      fieldsHost.querySelectorAll("[data-editor-surface]").forEach(function (surface) {
        const key = surface.dataset.editorSurface;
        surface.innerHTML = getBaseValue(key);
      });
      refreshPreview();
      setStatus("Local draft cleared. Preview is back to the published/default content.", "neutral");
    }

    function importJsonFile(file) {
      const reader = new FileReader();
      reader.addEventListener("load", function () {
        try {
          const parsed = JSON.parse(String(reader.result || "{}"));
          const importedDraft = {};
          window.V8CMS.schema.forEach(function (field) {
            if (Object.prototype.hasOwnProperty.call(parsed, field.key)) {
              importedDraft[field.key] = String(parsed[field.key]);
            }
          });
          draft = importedDraft;
          window.V8CMS.writeDraftOverrides(draft);
          fieldsHost.querySelectorAll("[data-editor-surface]").forEach(function (surface) {
            const key = surface.dataset.editorSurface;
            surface.innerHTML = getCurrentValue(key);
          });
          refreshPreview();
          setStatus("Imported JSON into the local v8 draft editor.", "success");
        } catch (error) {
          setStatus("That JSON file could not be imported.", "error");
        }
      });
      reader.readAsText(file);
    }

    saveButton.addEventListener("click", persistDraft);
    copyButton.addEventListener("click", copyPublishJson);
    downloadButton.addEventListener("click", downloadPublishJson);
    clearButton.addEventListener("click", clearDraft);
    importInput.addEventListener("change", function () {
      const file = importInput.files && importInput.files[0];
      if (!file) return;
      importJsonFile(file);
      importInput.value = "";
    });

    if (fieldSearch) {
      fieldSearch.addEventListener("input", filterFieldCards);
    }

    renderPageTabs();
    renderFieldCards();
    refreshPreview();
    setStatus(
      "This editor saves drafts in this browser. Export JSON when you want those edits published for everyone.",
      "neutral"
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initEditor, { once: true });
  } else {
    initEditor();
  }
})();
