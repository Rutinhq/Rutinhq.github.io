# Guide API hardening (`/api/guide`)

Defense in depth for the public concierge. This repo is public: names of env vars only — never commit secrets, site keys, tokens, or operator notes.

## What the code does

1. **Turnstile Siteverify** before any LLM call or lead webhook write (`TURNSTILE_SECRET_KEY`). Invalid or missing token → `403`.
2. **Widget** renders Turnstile when `VITE_TURNSTILE_SITE_KEY` is present at build time and sends `turnstileToken` on `POST /api/guide` and `POST /api/guide/lead`. No site key → no widget, requests go without a token.
3. **Per-IP rate limit** (`CF-Connecting-IP`, then `X-Forwarded-For`) using KV if bound, else the Cache API, else isolate memory. Over the window → `429` + `Retry-After`. Best-effort only; the zone WAF rule is the real cap.

## Fail-open choice (dev only)

If `TURNSTILE_SECRET_KEY` is **unset**:

- Local / `NODE_ENV=development` / `guide.local` → **fail-open**: current catalog/LLM behavior, plus a server warning. Lets `npm run dev` work without a widget.
- Production host without the secret → **fail-closed** (`403`). The widget already falls back to catalog copy when `/api/guide` is not OK.

Do not ship production Pages without both Turnstile env vars.

## Pasos manuales (STACK)

Dashboard only — this PR does not create widgets, env values, or WAF rules.

- [ ] Cloudflare Dashboard → Turnstile → create a widget for `www.rutinhq.com` (and preview host if used).
- [ ] Cloudflare Pages project → Settings → Environment variables (Production **and** Preview):
  - `TURNSTILE_SECRET_KEY` = widget secret (encrypt / secret)
  - `VITE_TURNSTILE_SITE_KEY` = widget site key (build-time; needed for `npm run build` on Pages)
- [ ] Redeploy after the build-time site key is set (Vite inlines `VITE_*`).
- [ ] Zone WAF / Rate limiting rule on `www.rutinhq.com/api/guide*` (POST). Suggested starting point: a tight per-IP window on those paths. **Do not** put the threshold or billing notes in git.
- [ ] Google AI Studio → daily request cap on the Guide key (operator step; no account or billing details here).

## Smoke (after env + deploy)

`POST /api/guide` with a catalog question and a fresh Turnstile token should not return `403`/`429` for a single human request. A forged token must `403`. Burst from one IP must `429` with `Retry-After`.
