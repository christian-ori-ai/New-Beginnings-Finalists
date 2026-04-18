# NB Hosting Questionnaire

This folder contains a responsive questionnaire app that can be opened on desktop or mobile.

## What It Does

- Asks structured questions about hosting priorities, timing, feature scope, and future roadmap.
- Supports text input, radio choices, and checkbox selections.
- Is currently configured to submit through `mailto:` to `christian@ori-ai.dev`.
- Is safe to host on GitHub Pages because the frontend is plain static HTML, CSS, and JavaScript.

## Files

- `index.html`: questionnaire markup
- `styles.css`: responsive UI
- `config.js`: local submission mode settings
- `app.js`: form logic, validation, summary generation, and submission flow

## Immediate Use

1. Open `index.html` in a browser.
2. Fill out the questionnaire from mobile or desktop.
3. Click `Submit Responses`.

By default, the form will:

- create a local JSON download of the response
- copy the summary to the clipboard when possible
- open an email draft to `christian@ori-ai.dev`

This is the lowest-friction mode while the delivery backend is not configured yet.

For the current project decision, this questionnaire should stay on `mailto` mode so respondents
can simply send their answers to `christian@ori-ai.dev`.

## GitHub Pages Reality Check

GitHub Pages is a static hosting service. It can host the questionnaire UI, but it does not run
server-side code for automatic email delivery or direct GitHub API writes from a secure backend.

That means you have three practical submission patterns on GitHub Pages:

- `mailto`: easiest, zero backend, opens an email draft
- `github-issue`: opens a prefilled GitHub issue page
- `external-webhook`: sends to an outside endpoint or form service you control

## Config Options

Edit `config.js` and change:

```js
window.NBHQ_CONFIG = {
  submissionMode: "mailto",
  destinationEmail: "christian@ori-ai.dev",
  emailSubject: "NB Hosting Questionnaire Response",
  githubIssueUrl: "",
  externalWebhookUrl: "",
  mailtoFallback: true
};
```

Use one of these modes:

- `submissionMode: "mailto"`
- `submissionMode: "github-issue"`
- `submissionMode: "external-webhook"`

### Mailto mode

```js
window.NBHQ_CONFIG = {
  submissionMode: "mailto",
  destinationEmail: "christian@ori-ai.dev",
  emailSubject: "NB Hosting Questionnaire Response",
  githubIssueUrl: "",
  externalWebhookUrl: "",
  mailtoFallback: true
};
```

### GitHub issue mode

Use a GitHub issue creation URL such as:

```text
https://github.com/OWNER/REPO/issues/new
```

Then:

```js
window.NBHQ_CONFIG = {
  submissionMode: "github-issue",
  destinationEmail: "christian@ori-ai.dev",
  emailSubject: "NB Hosting Questionnaire Response",
  githubIssueUrl: "https://github.com/OWNER/REPO/issues/new",
  externalWebhookUrl: "",
  mailtoFallback: true
};
```

### External webhook mode

If you later add an external endpoint, use:

```js
window.NBHQ_CONFIG = {
  submissionMode: "external-webhook",
  destinationEmail: "christian@ori-ai.dev",
  emailSubject: "NB Hosting Questionnaire Response",
  githubIssueUrl: "",
  externalWebhookUrl: "https://your-endpoint.example.com/submit",
  mailtoFallback: true
};
```

If the endpoint fails and `mailtoFallback` is `true`, the app will still open the email draft.

## Important Notes

- The browser alone cannot securely send email or write to GitHub on behalf of a repo without either:
  - user interaction
  - an external service
- That is why the app defaults to an email draft and treats automation as an optional later integration.
- If you want, this can be expanded next into a richer intake system with saved drafts, branded confirmation screens, and admin review pages.
