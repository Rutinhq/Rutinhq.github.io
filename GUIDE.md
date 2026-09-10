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

Security layer (degraded and llm): credential / password / API key / bank / FAA / Banorte / internal-nickname / Notion probes are pre-filtered. They return a fixed locale refuse + Calendly — never a SKU pitch. Pricing questions refuse specifics and point to the fit call. `scripts/assert-guide.mjs` encodes those probes.

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

If the LLM key is absent or the provider fails, both Function and client return catalog-grounded fallback copy plus the Calendly CTA (`mode: degraded`). A successful Gemini/OpenAI completion returns `mode: llm`. The widget still builds a lead-brief template.

Gemini is not a bare model: `functions/api/guide.ts` always prefixes the **GEMINI ENGINE** public mandate (catalog-only GTM OS / STORE OS / NEXUS OS, no prices/legal/credentials, 4–8 short sentences, Calendly + `strategy@rutinhq.com`, locale EN/ES) plus `policy.systemPrompt` and the allowlisted KB.

On **429/503** the client retries the **primary** model once (~600ms) then degrades — it does not walk fallbacks and **never** falls through to thinking models (`gemini-2.5-flash` / `gemini-3.6-flash`; they burn `max_tokens` on thoughts and return `finish_reason=length`). Timeouts do **not** retry (they would burn quota on a hung call). Model-missing (404) may try at most two **2.0-family** aliases. Empty, under ~80 char, or mid-cut completions are treated as failure (`mode: degraded`). Overall LLM budget is ~9s: first attempt ~6.8s so a fast 429 still has room for the one retry; the widget aborts `/api/guide` at ~12s and shows catalog fallback plus a paused note.

## Env vars (Pages → Settings → Environment variables)

Recommended path: **Gemini OpenAI-compatible** (`GUIDE_LLM_BASE_URL` + Gemini key/model). The Function normalizes trailing slashes, Gemini `/openai` vs `/openai/v1`, `models/` prefixes, Bearer + `x-goog-api-key`, and parses both string and parts-array content. `GUIDE_LLM_MODEL` is the single primary (Pages `[vars]` pin `gemini-2.0-flash` — do not pin 2.5/3.6 unless thinking is disabled). Rate-limits retry that primary once; 404-only fallbacks stay on the 2.0 family. OpenAI remains a drop-in alternative (code default if `BASE_URL` / `MODEL` are unset).

| Name | Required | Purpose |
| --- | --- | --- |
| `GUIDE_LLM_API_KEY` | for `mode: llm` | Gemini API key (recommended) or other OpenAI-compatible bearer token |
| `GUIDE_LLM_BASE_URL` | no | Recommended Gemini: `https://generativelanguage.googleapis.com/v1beta/openai`. Alternative OpenAI: `https://api.openai.com/v1` (code default) |
| `GUIDE_LLM_MODEL` | no | Recommended Gemini: `gemini-2.0-flash` (404 fallback: `gemini-2.0-flash-001` / `gemini-flash-latest`). Alternative OpenAI: `gpt-4o-mini` (code default) |
| `GUIDE_LEAD_WEBHOOK_URL` | no | `POST { type: "lead_brief", leadBrief }`. Capo sets this Pages secret; do not invent a local webhook URL. Unset is valid (`delivered: false`). |

Local: copy `.env.example` → `.env` (Vite + the guide middleware read `process.env`).

### Gemini (Google AI Studio)

1. Create a key at [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey) (Google account = `rutinhqsolutions@gmail.com` lane preferred).
2. Cloudflare Pages project `rutinhq-web` → Settings → Environment variables (Production **and** Preview):
   - `GUIDE_LLM_API_KEY` = Gemini API key (Encrypt / secret)
   - `GUIDE_LLM_BASE_URL` = `https://generativelanguage.googleapis.com/v1beta/openai`
   - `GUIDE_LLM_MODEL` = `gemini-2.0-flash`
3. `GUIDE_LLM_API_KEY` = Pages **secret**. `GUIDE_LLM_BASE_URL` + `GUIDE_LLM_MODEL` live in `wrangler.toml` `[vars]` (Direct Upload wipes dashboard plaintext; `secret put` for those names did not attach to production `deployment_configs`). Do not secret-put the same names as `[vars]` (binding already in use). Then fresh `wrangler pages deploy` — Direct Upload cannot Retry. The Function also routes Google-shaped keys (legacy `AIza…` or current AI Studio `AQ.…`) to the Gemini OpenAI-compat base so a wiped plaintext var cannot send the key to `api.openai.com`.
4. Smoke: `POST https://www.rutinhq.com/api/guide` with locale `es` and a catalog question → response `mode` should be `llm` (not `degraded`).
5. Security probes still refuse credentials and pricing (same as `scripts/assert-guide.mjs`).

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
