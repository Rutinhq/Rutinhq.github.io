# Guide API hardening (`/api/guide`)

Defense in depth for the public concierge. This repo is public: never commit secrets or tokens. The Turnstile **site** key is public by design and lives in git (`wrangler.toml` + `.env.production`).

## What the code does

1. **Turnstile Siteverify** before any LLM call or lead webhook write (`TURNSTILE_SECRET_KEY`). Invalid or missing token → `403`.
2. **Widget** renders Turnstile when the chat opens (host div mount / callback ref), not on page load. `VITE_TURNSTILE_SITE_KEY` must be present at build time. The widget sends `turnstileToken` on `POST /api/guide` and `POST /api/guide/lead`, then `turnstile.reset` so the next question gets a fresh single-use token. No site key → no widget, requests go without a token.
3. **Per-IP rate limit** (`CF-Connecting-IP`, then `X-Forwarded-For`) using KV if bound, else a named Cache API (`caches.open('guide-rate-limit')`) keyed off the static `/guide-rate-limit.json` asset (Function routes are `no-store`), else isolate memory. Over the window → `429` + `Retry-After`. Best-effort only; the zone WAF rule is the real cap.
4. **LLM failure log** — one `console.error` JSON line (`guide_llm_failed`: provider, model, status, redacted errorSnippet ≤200 chars, elapsedMs, modelsTried). Never log the API key or request headers. Use Pages real-time logs to read it. Default provider is Workers AI (`[ai] binding = "AI"`); Gemini OpenAI-compat is opt-in.

## Fail-open choice (dev only)

If `TURNSTILE_SECRET_KEY` is **unset**:

- Local / `NODE_ENV=development` / `guide.local` → **fail-open**: current catalog/LLM behavior, plus a server warning. Lets `npm run dev` work without a widget.
- Production host without the secret → **fail-closed** (`403`). The widget already falls back to catalog copy when `/api/guide` is not OK.

Do not ship production Pages without `TURNSTILE_SECRET_KEY` as a Pages Secret. The public site key is committed (see below).

## Pasos manuales (STACK)

Dashboard only for the **secret** and the WAF rule. The public site key is in git.

- [ ] Cloudflare Dashboard → Turnstile → create a widget for `www.rutinhq.com` (and preview host if used).
- [ ] Pages Secret `TURNSTILE_SECRET_KEY` (Production **and** Preview). Dashboard plaintext vars are blocked on this project — do not try to put `VITE_TURNSTILE_SITE_KEY` there.
- [ ] Public site key: `wrangler.toml` `[vars]` **and** `.env.production` (Vite does not read wrangler.toml during `npm run build`).
- [ ] Zone WAF / Rate limiting rule on `www.rutinhq.com/api/guide*` (POST). Suggested starting point: a tight per-IP window on those paths. **Do not** put the threshold or billing notes in git.
- [ ] Workers AI is bound from `wrangler.toml` (`[ai] binding = "AI"`). No dashboard AI step unless the binding failed to attach on preview/production. Stay inside the Workers Free 10k neurons/day; do not pin 70B.
- [ ] Gemini OpenAI-compat is optional only (`GUIDE_LLM_PROVIDER=openai-compat` + Pages secret). Skip unless billing is enabled — the free Gemini tier 403s this project.

## Smoke (after env + deploy)

`POST /api/guide` with a catalog question and a fresh Turnstile token should not return `403`/`429` for a single human request. A forged token must `403`. Burst from one IP must `429` with `Retry-After`.
