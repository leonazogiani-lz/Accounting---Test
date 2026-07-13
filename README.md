# Accounting---Test
This app will be used to screen the applicants for accounting roles - OneUp

## Kontabilist i Brendshëm — timed assessment

Single-page React + Vite + TypeScript + Tailwind app. 45-minute timed wizard
(Albanian UI), answers autosaved to localStorage, submitted as JSON on finish.

### Run

```bash
npm install
npm run dev        # local dev server
npm run build      # typecheck + production build (output in dist/)
```

### Configure submission

Set `VITE_SUBMIT_URL` (see `.env.example`) to the webhook / Apps Script URL that
should receive the `POST` with the results JSON. If it is unset or the request
fails, the app downloads the JSON file locally and asks the candidate to send it
to the responsible person.

### Add questions

Append entries to the array in [src/questions.ts](src/questions.ts) — the wizard,
progress bar, and payload adapt automatically.
