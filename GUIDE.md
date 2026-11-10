# RutinHQ Guide (internal)

Public UI name is **RutinHQ Guide**. Do not nickname operators in widget copy.

Controllable surface: [`src/guide/config.ts`](src/guide/config.ts) + [`src/guide/policy.json`](src/guide/policy.json). Tighten the system prompt, allowlist, rate limits, intent hints, and fallback replies there — no widget redesign.

## What it is

Site concierge on the hub and SKU LPs (`/`, `/gtm-os`, `/store-os`, `/nexus-os` and `/es` twins). Not mounted on blog posts.

Answers like a briefed commercial lead, grounded in allowlisted SoT only:

- `https://www.rutinhq.com/` + the three OS landings (EN/ES)
- `https://docs.rutinhq.com/catalog/` and linked public fichas
- Local mirrors in `src/guide/mirrors/` plus site locale copy

It must not invent pricing, legal guarantees, or private ops. Off-topic is refused. Unsure → Calendly `https://calendly.com/rutinhq/30min` or `strategy@rutinhq.com`.

Security layer (degraded and llm): credential / password / API key / bank / FAA / Banorte / internal-nickname / Notion probes are pre-filtered. They return a fixed locale refuse + Calendly — never a SKU pitch. Pricing questions refuse specifics and point to the fit call. **Classify on the latest user turn only** — assistant catalog copy (e.g. STORE OS “precio”) must not trip `pricingHints`, and a STORE reply must not sticky-pitch after the visitor changes topic. `leads` / outbound / prospecting → **GTM OS** (cold, ICP-filtered) + Calendly, never a generic fit-only CTA. cita / agenda / schedule without a last-turn SKU → fit + Calendly. `scripts/assert-guide.mjs` and `scripts/assert-guide-llm.ts` encode those probes.

Primary CTA in chat: book Calendly.

## How the KB is built

```bash
node scripts/build-guide-kb.mjs
```

Runs in `npm run build`. Writes `public/guide-kb.json`:

1. Markdown mirrors (`src/guide/mirrors/*.md`)
2. EN locale SKU copy (commercial SoT on this repo)
3. Optional crawl of `policy.allowlistUrls` (8s timeout, failures are recorded and ignored)

Skip the network crawl: `GUIDE_KB_SKIP_CRAWL=1`.

`scripts/assert-guide.mjs` refuses a KB/UI that mentions Capo, FZF, or FuzzyFlags, and checks the Calendly URL + widget paths.

## Backend

1. **Pages Function** — `functions/api/guide.ts` → `POST /api/guide`. Cloudflare matches Functions before `_redirects`.
2. **Local** — Vite middleware in `vite.config.ts` loads `src/guide/api.ts` (`npm run dev`). Preview without the SSR loader degrades from the KB.
3. **Companion Worker** — `workers/guide-companion/` if Functions stay off this static project.

If the Workers AI binding is missing, the optional OpenAI-compat key is absent, or the provider fails, both Function and client return catalog-grounded fallback copy plus the Calendly CTA (`mode: degraded`). A successful completion returns `mode: llm`. The widget still builds a lead-brief template.

The model is not a bare chat: `functions/api/guide.ts` always prefixes the public **GEMINI ENGINE** mandate (catalog-only GTM OS / STORE OS / NEXUS OS, no prices/legal/credentials, ≤80 words / 2–4 short sentences, Calendly + `strategy@rutinhq.com`, locale EN/ES) plus `policy.systemPrompt` and the allowlisted KB. A **LANGUAGE LOCK** line is last so `locale: es` (the `/es` widget) replies in Spanish.

Default provider is **Workers AI** (`GUIDE_LLM_PROVIDER=workers-ai`, Pages `[ai] binding = "AI"`). Gemini's free tier 403s this project; do not send Guide traffic there unless billing is enabled and `GUIDE_LLM_PROVIDER=openai-compat`. On **429/503** the client retries the **primary** model once (~600ms) then degrades — it does not walk fallbacks and **never** falls through to thinking Gemini models (`gemini-2.5-flash` / `gemini-2.5-flash-lite` / `gemini-3.6-flash`; they burn `max_tokens` on thoughts and return `finish_reason=length`). Timeouts do **not** retry. Workers AI model-missing (404) may try `@cf/meta/llama-3.1-8b-instruct`; openai-compat 404 may try official `gemini-3-flash-preview` — never zero-quota `gemini-2.0-*`. Empty completions still degrade. Mid-sentence cuts (`finish_reason=length` or no terminal punctuation) trim back to the last complete sentence instead of shipping a fragment. Overall LLM budget is 20s (first attempt ~17s so a fast 429 still has room for one retry). The widget aborts `/api/guide` at 28s — above the LLM budget — so a slow Workers AI call can finish and still appear in Pages real-time logs. Aborting earlier cancelled the Function and the widget fell back locally with no `/api/guide` event. Preview hosts (`*.rutinhq-web.pages.dev`, not `rutinhq-web.pages.dev` / `rutinhq.com`) may show `degradedReason` under the paused banner. Provider failures log one `guide_llm_failed` JSON line (provider, model, status, redacted errorSnippet, elapsedMs, modelsTried) — never the API key or headers.

## Env vars (Pages → Settings → Environment variables)

Recommended path: **Workers AI** (`GUIDE_LLM_PROVIDER=workers-ai`). `[ai] binding = "AI"` in `wrangler.toml` (top-level — this file has no `[env.preview]` / `[env.production]`, so it applies to preview and production). `[vars]` pin `GUIDE_LLM_MODEL=@cf/meta/llama-3.1-8b-instruct-fp8-fast` (fast 8B; do not pin 70B). Completions cap at 450 tokens so the verbose 8B can finish a short reply. Optional path: `GUIDE_LLM_PROVIDER=openai-compat` + `GUIDE_LLM_API_KEY` (Gemini OpenAI-compat or OpenAI). Gemini currently 403s without billing.

| Name | Required | Purpose |
| --- | --- | --- |
| `GUIDE_LLM_PROVIDER` | no | `workers-ai` (default) or `openai-compat` |
| `GUIDE_LLM_MODEL` | no | Workers AI: `@cf/meta/llama-3.1-8b-instruct-fp8-fast`. openai-compat Gemini: `gemini-3.1-flash-lite` |
| `GUIDE_LLM_API_KEY` | openai-compat only | Gemini API key or other OpenAI-compatible bearer token |
| `GUIDE_LLM_BASE_URL` | openai-compat only | Gemini: `https://generativelanguage.googleapis.com/v1beta/openai`. Alternative OpenAI: `https://api.openai.com/v1` |
| `GUIDE_LEAD_WEBHOOK_URL` | no | `POST { type: "lead_brief", leadBrief }`. Capo sets this Pages secret; do not invent a local webhook URL. Unset is valid (`delivered: false`). |
| `TURNSTILE_SECRET_KEY` | production | Server Siteverify. Unset fail-opens **only** in local/dev (warning). Production without it returns `403` before LLM or lead write. |
| `VITE_TURNSTILE_SITE_KEY` | production | Public widget site key. Pinned in `wrangler.toml` `[vars]` (dashboard plaintext is blocked) **and** `.env.production` so `vite build` inlines `import.meta.env.VITE_TURNSTILE_SITE_KEY`. |

Local: copy `.env.example` → `.env` (Vite + the guide middleware read `process.env`). `npm run build` / Pages preview+production load `.env.production`.

Operator checklist (Turnstile widget, Pages env, WAF `/api/guide*`, AI Studio daily cap): [`docs/guide-api-hardening.md`](docs/guide-api-hardening.md). The WAF rule is a dashboard step — this repo does not create it.

### Workers AI (default, zero extra cost)

`wrangler.toml` `[ai] binding = "AI"` plus `[vars] GUIDE_LLM_PROVIDER=workers-ai`. No API key. Uses the Workers Free 10k neurons/day allocation. Redeploy Pages after the binding lands so preview and production both see `env.AI`.

### Gemini / OpenAI-compat (optional)

Only after Gemini billing is enabled. Set `GUIDE_LLM_PROVIDER=openai-compat` in `[vars]`, pin `GUIDE_LLM_MODEL=gemini-3.1-flash-lite`, and `wrangler pages secret put GUIDE_LLM_API_KEY`. `llm.ts` POSTs `/chat/completions` (not `generateContent`). Do not secret-put names that already exist as `[vars]`.

Smoke: `POST /api/guide` with locale `es` and a catalog question → `mode` should be `llm` and the reply in Spanish. Security probes still refuse credentials and pricing (`scripts/assert-guide.mjs`).

## Lead briefs

Trigger: visitor shares an email **or** buying-intent language (see `buyingIntentHints` in `policy.json`).

Payload: topic, questions asked, objections, recommended SKU, next step, transcript excerpt, optional email, page, locale.

v1 delivery:

- Widget button: copy full markdown brief → short `mailto:strategy@rutinhq.com` (paste the clipboard). If clipboard fails, a mailto capped at ~1200 href chars.
- Optional: `POST /api/guide/lead` → `GUIDE_LEAD_WEBHOOK_URL` when set (`{ ok: true, delivered }`). Unset webhook is not an error. Real “send to team” delivery needs Capo/CORTEX to set `GUIDE_LEAD_WEBHOOK_URL` on Pages (likely unset today).

To wire a webhook later: create any HTTPS listener, set the secret on `rutinhq-web`, redeploy.

## Criteria to tighten (CORTEX)

Edit `src/guide/policy.json` (re-exported by `src/guide/config.ts`):

- `systemPrompt` — voice and hard refusals
- `allowlistUrls` / `allowlistHosts` — SoT only
- `widgetPaths` — where the launcher appears
- `limits` — turns, tokens, IP window
- `intentHints` / `buyingIntentHints` / `fallbackReplies`

Rebuild so `public/guide-kb.json` picks up policy (the Function reads policy from that blob).
