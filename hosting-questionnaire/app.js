(function () {
  var config = Object.assign(
    {
      submissionMode: "mailto",
      destinationEmail: "christian@ori-ai.dev",
      emailSubject: "NB Hosting Questionnaire Response",
      githubIssueUrl: "",
      externalWebhookUrl: "",
      mailtoFallback: true
    },
    window.NBHQ_CONFIG || {}
  );

  var form = document.getElementById("questionnaire-form");
  var statusBanner = document.getElementById("status-banner");
  var submitButton = form ? form.querySelector('button[type="submit"]') : null;
  var copyButton = document.getElementById("copy-summary");
  var downloadButton = document.getElementById("download-json");
  var modeNodes = document.querySelectorAll("[data-submission-mode]");
  var helpNode = document.querySelector("[data-submission-help]");
  var gateRoot = document.getElementById("access-gate");
  var gateForm = document.getElementById("access-gate-form");
  var gatePassword = document.getElementById("access-password");
  var gateStatus = document.getElementById("access-gate-status");
  var gateSubmitButton = document.getElementById("access-gate-submit");
  var appRoot = document.getElementById("questionnaire-app");
  var ACCESS_STORAGE_KEY = "nbhq-access-v1";
  var ACCESS_HASH = "1fbbc599268d71369c304a2746aec3e60af958af23630dd25c83eb325fc531be";
  var ACCESS_FALLBACK = "anVzdG1hcnJpZWRpbnNwb2thbmU=";

  function setGateStatus(message, tone) {
    if (!gateStatus) return;
    gateStatus.textContent = message;
    gateStatus.dataset.tone = tone || "neutral";
    gateStatus.classList.add("is-visible");
  }

  function setGateBusyState(isBusy) {
    if (!gateSubmitButton) return;
    gateSubmitButton.disabled = isBusy;
    gateSubmitButton.textContent = isBusy ? "Checking..." : "Enter Questionnaire";
  }

  function setAccessState(isUnlocked) {
    if (gateRoot) gateRoot.hidden = isUnlocked;
    if (appRoot) appRoot.hidden = !isUnlocked;
    document.body.classList.toggle("is-questionnaire-unlocked", isUnlocked);
    document.body.classList.toggle("is-questionnaire-locked", !isUnlocked);
  }

  function hasStoredAccess() {
    try {
      return sessionStorage.getItem(ACCESS_STORAGE_KEY) === ACCESS_HASH;
    } catch (error) {
      return false;
    }
  }

  function storeAccess() {
    try {
      sessionStorage.setItem(ACCESS_STORAGE_KEY, ACCESS_HASH);
    } catch (error) {
      return false;
    }

    return true;
  }

  function hashValue(value) {
    if (!window.crypto || !window.crypto.subtle || !window.TextEncoder) {
      return Promise.resolve(value === window.atob(ACCESS_FALLBACK) ? ACCESS_HASH : "");
    }

    return window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)).then(function (buffer) {
      return Array.prototype.map.call(new Uint8Array(buffer), function (byte) {
        return byte.toString(16).padStart(2, "0");
      }).join("");
    });
  }

  function unlockQuestionnaire() {
    storeAccess();
    setAccessState(true);
    if (gatePassword) gatePassword.value = "";
    if (form && form.elements.contactName) {
      form.elements.contactName.focus();
    }
  }

  function handleGateSubmit(event) {
    event.preventDefault();

    if (!gatePassword) return;

    var candidate = String(gatePassword.value || "").trim();
    if (!candidate) {
      setGateStatus("Enter the shared password to continue.", "warning");
      gatePassword.focus();
      return;
    }

    setGateBusyState(true);

    hashValue(candidate).then(function (hash) {
      if (hash === ACCESS_HASH) {
        unlockQuestionnaire();
        return;
      }

      setGateStatus("That password is not correct. Please try again.", "warning");
      gatePassword.select();
    }).catch(function (error) {
      setGateStatus(error.message || "This browser could not verify the password.", "warning");
    }).finally(function () {
      setGateBusyState(false);
    });
  }

  function setModeCopy() {
    var modeLabel = "Email draft";
    var helpText = "Submitting opens an email draft to christian@ori-ai.dev. This is the safest default on GitHub Pages.";

    if (config.submissionMode === "external-webhook") {
      modeLabel = "External endpoint";
      helpText = "Submitting will POST to the configured external endpoint. A mailto fallback can still be used if that endpoint fails.";
    } else if (config.submissionMode === "github-issue") {
      modeLabel = "Prefilled GitHub issue";
      helpText = "Submitting will open a prefilled GitHub issue in the configured repository. This is better for internal use than for clients.";
    }

    modeNodes.forEach(function (node) {
      node.textContent = modeLabel;
    });

    if (helpNode) helpNode.textContent = helpText;
  }

  function setStatus(message, tone) {
    if (!statusBanner) return;
    statusBanner.textContent = message;
    statusBanner.dataset.tone = tone || "neutral";
    statusBanner.classList.add("is-visible");
  }

  function getTrimmedValue(name) {
    var field = form.elements[name];
    return field ? String(field.value || "").trim() : "";
  }

  function getCheckedValues(name) {
    return Array.prototype.slice.call(form.querySelectorAll('[name="' + name + '"]:checked')).map(function (input) {
      return input.value;
    });
  }

  function createPayload() {
    var payload = {
      submittedAt: new Date().toISOString(),
      source: "NB Hosting Questionnaire",
      respondent: {
        name: getTrimmedValue("contactName"),
        role: getTrimmedValue("contactRole"),
        email: getTrimmedValue("contactEmail"),
        phone: getTrimmedValue("contactPhone"),
        followUpPreference: getCheckedValues("followUpPreference")[0] || ""
      },
      responses: {
        topPriorities: getCheckedValues("topPriorities"),
        attentionArea: getCheckedValues("attentionArea")[0] || "",
        hostingUrgency: getCheckedValues("hostingUrgency")[0] || "",
        launchApproach: getCheckedValues("launchApproach")[0] || "",
        hostingChangeComfort: getCheckedValues("hostingChangeComfort")[0] || "",
        gigbuilderPlan: getCheckedValues("gigbuilderPlan")[0] || "",
        phaseOneFeatures: getCheckedValues("phaseOneFeatures"),
        futureFeatures: getCheckedValues("futureFeatures"),
        successDefinition: getTrimmedValue("successDefinition"),
        topConcerns: getTrimmedValue("topConcerns"),
        additionalNotes: getTrimmedValue("additionalNotes")
      },
      context: {
        userAgent: navigator.userAgent,
        viewport: window.innerWidth + "x" + window.innerHeight,
        page: window.location.href
      }
    };

    payload.summary = buildSummary(payload);
    return payload;
  }

  function listOrFallback(values) {
    return values && values.length ? values.join(", ") : "Not specified";
  }

  function buildSummary(payload) {
    var lines = [
      "NB Hosting Questionnaire",
      "",
      "Submitted: " + payload.submittedAt,
      "Name: " + (payload.respondent.name || "Not provided"),
      "Role: " + (payload.respondent.role || "Not provided"),
      "Email: " + (payload.respondent.email || "Not provided"),
      "Phone: " + (payload.respondent.phone || "Not provided"),
      "Preferred follow-up: " + (payload.respondent.followUpPreference || "Not specified"),
      "",
      "Top priorities: " + listOrFallback(payload.responses.topPriorities),
      "Main attention area: " + (payload.responses.attentionArea || "Not specified"),
      "Hosting urgency: " + (payload.responses.hostingUrgency || "Not specified"),
      "Launch approach: " + (payload.responses.launchApproach || "Not specified"),
      "Comfort moving away from iPower: " + (payload.responses.hostingChangeComfort || "Not specified"),
      "Gigbuilder plan: " + (payload.responses.gigbuilderPlan || "Not specified"),
      "Phase 1 features: " + listOrFallback(payload.responses.phaseOneFeatures),
      "Future features: " + listOrFallback(payload.responses.futureFeatures),
      "",
      "What success looks like:",
      payload.responses.successDefinition || "Not provided",
      "",
      "Top concerns:",
      payload.responses.topConcerns || "Not provided",
      "",
      "Additional notes:",
      payload.responses.additionalNotes || "Not provided"
    ];

    return lines.join("\n");
  }

  function validatePayload(payload) {
    if (!payload.respondent.name || !payload.respondent.email) {
      setStatus("Please add at least a name and email before submitting.", "warning");
      return false;
    }

    return true;
  }

  function downloadJson(payload) {
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "nb-hosting-questionnaire-" + payload.submittedAt.replace(/[:.]/g, "-") + ".json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  }

  function copySummary(payload) {
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      setStatus("Clipboard access is not available in this browser.", "warning");
      return Promise.resolve(false);
    }

    return navigator.clipboard.writeText(payload.summary).then(function () {
      setStatus("Summary copied to the clipboard.", "success");
      return true;
    }).catch(function () {
      setStatus("Could not copy the summary to the clipboard.", "warning");
      return false;
    });
  }

  function openMailto(payload) {
    var subject = encodeURIComponent(config.emailSubject || "NB Hosting Questionnaire Response");
    var body = encodeURIComponent(payload.summary);
    var recipient = encodeURIComponent(config.destinationEmail || "christian@ori-ai.dev");
    window.location.href = "mailto:" + recipient + "?subject=" + subject + "&body=" + body;
  }

  function setBusyState(isBusy) {
    if (!submitButton) return;
    submitButton.disabled = isBusy;
    submitButton.textContent = isBusy ? "Submitting..." : "Submit Responses";
  }

  function postToWebhook(payload) {
    return fetch(config.externalWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }).then(function (response) {
      if (!response.ok) {
        return response.text().then(function (text) {
          throw new Error(text || "Submission failed.");
        });
      }

      return response.json().catch(function () {
        return { ok: true };
      });
    });
  }

  function openGithubIssue(payload) {
    var baseUrl = String(config.githubIssueUrl || "").trim();
    if (!baseUrl) {
      throw new Error("No GitHub issue URL is configured.");
    }

    var title = encodeURIComponent("NB Hosting Questionnaire - " + (payload.respondent.name || "New response"));
    var body = encodeURIComponent(payload.summary);
    var separator = baseUrl.indexOf("?") === -1 ? "?" : "&";
    window.open(baseUrl + separator + "title=" + title + "&body=" + body, "_blank", "noopener");
  }

  function handleSubmission(event) {
    event.preventDefault();

    var payload = createPayload();
    if (!validatePayload(payload)) return;

    setBusyState(true);

    if (config.submissionMode === "external-webhook") {
      postToWebhook(payload).then(function () {
        setStatus("Responses sent successfully. A local JSON copy has also been downloaded.", "success");
        downloadJson(payload);
        form.reset();
      }).catch(function (error) {
        if (config.mailtoFallback) {
          setStatus("The live endpoint was unavailable, so an email draft is being opened instead.", "warning");
          downloadJson(payload);
          openMailto(payload);
        } else {
          setStatus("The live submission failed: " + error.message, "warning");
        }
      }).finally(function () {
        setBusyState(false);
      });
      return;
    }

    if (config.submissionMode === "github-issue") {
      try {
        downloadJson(payload);
        copySummary(payload);
        openGithubIssue(payload);
        setStatus("A prefilled GitHub issue was opened and a JSON copy was downloaded locally.", "success");
      } catch (error) {
        if (config.mailtoFallback) {
          downloadJson(payload);
          openMailto(payload);
          setStatus("GitHub issue submission was not configured correctly, so an email draft was opened instead.", "warning");
        } else {
          setStatus(error.message, "warning");
        }
      }
      setBusyState(false);
      return;
    }

    downloadJson(payload);
    copySummary(payload).finally(function () {
      openMailto(payload);
      setStatus("An email draft has been opened and a JSON copy was downloaded locally.", "success");
      setBusyState(false);
    });
  }

  if (!form) return;

  if (gateForm) {
    gateForm.addEventListener("submit", handleGateSubmit);
    if (hasStoredAccess()) {
      unlockQuestionnaire();
    } else {
      setAccessState(false);
      setGateStatus("Enter the shared password to continue.", "neutral");
      if (gatePassword) gatePassword.focus();
    }
  }

  setModeCopy();
  setStatus("Ready for responses. Submit will use the configured delivery mode shown above.", "neutral");

  form.addEventListener("submit", handleSubmission);

  if (copyButton) {
    copyButton.addEventListener("click", function () {
      var payload = createPayload();
      if (!validatePayload(payload)) return;
      copySummary(payload);
    });
  }

  if (downloadButton) {
    downloadButton.addEventListener("click", function () {
      var payload = createPayload();
      if (!validatePayload(payload)) return;
      downloadJson(payload);
      setStatus("Downloaded a JSON copy of the current responses.", "success");
    });
  }
})();
