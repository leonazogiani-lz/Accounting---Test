# Accounting---Test
This app will be used to screen the applicants for accounting roles - OneUp

## Kontabilist i Brendshëm — timed assessment

Single-page React + Vite + TypeScript + Tailwind app with
[shadcn/ui](https://ui.shadcn.com) components (`src/components/ui/`). 45-minute
timed wizard (Albanian UI), answers autosaved to localStorage, submitted as JSON
on finish.

### Run

```bash
npm install
npm run dev        # local dev server
npm run build      # typecheck + production build (output in dist/)
```

### Configure submission (EmailJS)

Answers (and the difficulty feedback) are emailed to **info@keqyr.com** via
[EmailJS](https://www.emailjs.com) — client-side, no backend.

1. **Email Service** — dashboard → *Email Services* → *Add New Service* (e.g.
   Gmail), connect the mailbox → copy the **Service ID**.
2. **Email Template** — dashboard → *Email Templates* → *Create New Template*:
   - **To Email:** `{{to_email}}` (the app always sends `info@keqyr.com`)
   - **Subject:** `{{subject}}`
   - **Content:** switch to the code editor and use `<pre>{{body}}</pre>` so the
     plain-text formatting (line breaks) is preserved
   - Template variables the app sends: `to_email`, `subject`, `body`,
     `candidate_name`
   - Copy the **Template ID**.
3. **Public Key** — dashboard → *Account* → *General* → copy the **Public Key**.
4. Put the three values in `.env` (see `.env.example`):
   `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`,
   `VITE_EMAILJS_PUBLIC_KEY` — then rebuild/redeploy.

Both the test submission and the feedback use the same template (different
subject/body). If a send fails it is retried once silently; if it fails again
the answers stay saved in the candidate's browser (localStorage), the error is
logged to the console, and the candidate still sees the thank-you screen.

### Add questions

Append entries to the array in [src/questions.ts](src/questions.ts) — the wizard,
progress bar, and payload adapt automatically.
