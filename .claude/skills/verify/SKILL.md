---
name: verify
description: Build, launch, and drive the Kontabilist i Brendshëm assessment app to verify changes at the browser surface.
---

# Verify: Kontabilist i Brendshëm assessment app

Single-page Vite + React + TS app. Surface is the browser — drive it with
playwright-core against the installed Chrome (`channel: 'chrome'`), no browser download needed.

## Build & launch

```bash
npm install
npm run build                       # tsc + vite build (typecheck gate)
VITE_SUBMIT_URL=http://127.0.0.1:8787/hook npm run dev -- --port 5199 --strictPort
```

Vite binds localhost as IPv6 — use `http://localhost:5199` in the driver, not `127.0.0.1`.

To exercise the webhook path, run a local receiver on 8787 that answers CORS
preflight (OPTIONS with `Access-Control-Allow-Origin/Headers/Methods`) — plain 200
on POST is not enough, the browser preflights the JSON POST. Leave `VITE_SUBMIT_URL`
unset (or kill the receiver) to exercise the JSON-download fallback
(`browserContext` needs `acceptDownloads: true`).

## Flows worth driving

- Full wizard: intro → 9 questions → Dërgo testin → completion; assert receiver got one POST.
- Required validation: empty and whitespace-only answers block with "Kjo pyetje është e detyrueshme".
- Phone (Q2): country select defaults to XK; letters stripped; digit-count validated per
  country (`src/countries.ts`); leading trunk 0 normalized; payload phone is `+383 …`.
- Name (Q1): digits stripped as you type (`inputFilter: 'lettersOnly'`).
- References on long questions: "+ Shto referencë" URL list, invalid link blocks Vazhdo,
  values land in payload `answers[].references`.
- Personalization: after Q1, long-question titles start with the first name ("Leona, …");
  payload titles stay canonical; completion greets "Faleminderit, {emri}!".
- Feedback card on completion: difficulty buttons + comment → second POST
  (`type: 'feedback'`) or `vleresimi-*.json` download fallback.
- Refresh mid-test: step + answers restored, timer keeps counting (start timestamp in
  localStorage key `kontabilist-test.startedAt`).
- Timer states: set `kontabilist-test.startedAt` back in time and reload —
  amber ≤10min, red+pulse ≤5min, expiry auto-submits.
- Timeout: set startedAt so ~4s remain, wait — auto-submit, inputs lock, completion note.

## Gotchas

- Answers autosave is debounced 500ms; a synchronous flush runs in `beforeunload`.
  Register a Playwright dialog handler (`page.on('dialog', d => d.accept())`) so
  reloads don't hang on the beforeunload prompt.
- Enter in a textarea appends `\n` — account for it when asserting restored values.
- A working driver script covering all of the above: see the session that created
  this skill (`drive.mjs`: scenarios A happy-flow / B timer / C timeout / D responsive).
