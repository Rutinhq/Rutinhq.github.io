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

Security layer (degraded and live): credential / password / API key / bank / FAA / Banorte / internal-nickname / Notion probes are pre-filtered. They return a fixed locale refuse + Calendly — never a SKU pitch. Pricing questions refuse specifics and point to the fit call. `scripts/assert-guide.mjs` encodes those probes.

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

If the LLM key is absent, both Function and client return catalog-grounded fallback copy plus the Calendly CTA. The widget still builds a lead-brief template.

## Env vars (Pages → Settings → Environment variables)

| Name | Required | Purpose |
| --- | --- | --- |
| `GUIDE_LLM_API_KEY` | for live answers | OpenAI-compatible bearer token |
| `GUIDE_LLM_BASE_URL` | no | Default `https://api.openai.com/v1` |
| `GUIDE_LLM_MODEL` | no | Default `gpt-4o-mini` |
| `GUIDE_LEAD_WEBHOOK_URL` | no | `POST { type: "lead_brief", leadBrief }` |

Local: copy `.env.example` → `.env` (Vite + the guide middleware read `process.env`).

## Lead briefs

Trigger: visitor shares an email **or** buying-intent language (see `buyingIntentHints` in `policy.json`).

Payload: topic, questions asked, objections, recommended SKU, next step, transcript excerpt, optional email, page, locale.

v1 delivery:

- Widget: `mailto:strategy@rutinhq.com?subject=Lead%20brief%20…` with markdown body (user clicks).
- Optional: Function/Worker POST to `GUIDE_LEAD_WEBHOOK_URL`.

To wire a webhook later: create any HTTPS listener, set the secret on `rutinhq-web`, redeploy. No widget change.

## Criteria to tighten (CORTEX)

Edit `src/guide/policy.json` (re-exported by `src/guide/config.ts`):

- `systemPrompt` — voice and hard refusals
- `allowlistUrls` / `allowlistHosts` — SoT only
- `widgetPaths` — where the launcher appears
- `limits` — turns, tokens, IP window
- `intentHints` / `buyingIntentHints` / `fallbackReplies`

Rebuild so `public/guide-kb.json` picks up policy (the Function reads policy from that blob).
