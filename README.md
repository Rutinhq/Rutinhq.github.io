# RutinHQ — hub + 3 SKUs

Catálogo público (`/`) y tres landings de un SKU cada una:

| Ruta | SKU |
| --- | --- |
| `/` | Hub — 3 cards |
| `/gtm-os` | GTM OS (Pack §2) |
| `/store-os` | STORE OS |
| `/nexus-os` | NEXUS OS |
| `/es` | Hub ES (hreflang ↔ `/`) |
| `/es/gtm-os` `/es/store-os` `/es/nexus-os` | SKU landings ES |
| `/blog` | Filter/radar index — **DRAFT `noindex,follow`** until publish GO |
| `/blog/icp-gated-cold-outbound-without-rented-sdr` | Article01 — ICP-gated cold outbound (DRAFT `noindex,follow`) |
| `/blog/shopify-admin-audit-before-ads` | Article02 — STORE OS Admin audit outline (DRAFT EN shell) |
| `/es/blog` | Índice ES (hreflang ↔ EN; same draft robots) |
| `/es/blog/outbound-frio-con-icp-sin-sdr-rentado` | Article01 ES — Outbound frío con ICP (tuteo) |

Stack: Vite + React + Tailwind + i18next. Default **EN** (commercial copy). Toggle ES↔EN stays on the current page (`/` ↔ `/es`, `/gtm-os` ↔ `/es/gtm-os`, blog pairs). SKU bodies may still be EN when ES strings are incomplete. Tema oscuro `#0a0a0a` / `#2ecc8f` / radius 0.

## Cloudflare Pages

- **Proyecto:** `rutinhq-web`
- **Build:** `npm run build`
- **Output:** `dist`
- **Known routes:** `public/_redirects` exact `200` rewrites to `dist/prerender/*` shells (plus `dist/index.html` for `/`).
- **HTTP 404:** ship `dist/404.html` (prerendered Not Found). Cloudflare Pages serves it with status 404 for unknown paths. **Do not** add `/* /index.html 200` — that is the soft-404.
- **SSR body:** `scripts/prerender-blog.mjs` renders React via `src/entry-server.tsx` into `#root` (not an empty `<!--ssr-outlet-->`). Head SEO stays on the proven prerender injection.
- **Do not emit `dist/<sku>/index.html` or exact `/{sku} /index.html 200` rewrites.** Both make Pages/wrangler html-handling 308 `/gtm-os` → `/` instead of 200.
- **Pretty URLs:** live SKU routes have **no trailing slash** (`/gtm-os`, not `/gtm-os/`). Do not add `_redirects` slash-normalization — folder `index.html` + html-handling already 308'd `/gtm-os` away from the pretty URL.
- **Canonical host:** `https://www.rutinhq.com`. `sitemap.xml` + `robots.txt` + `llms.txt` + `llms-full.txt` are www-only static files (explicit `_redirects` 200s so they are never rewritten to HTML).
- **Apex → www 301:** **not possible in `public/_redirects`.** Cloudflare Pages marks domain-level (host) redirects as unsupported. A path-only `/* https://www.rutinhq.com/:splat 301` would also 301 www onto itself. Capo applies a **zone Single Redirect** (or Bulk Redirect) — see PR / steps below. Confirm `@` is Proxied. Do **not** enable Include subdomains (would catch `docs.rutinhq.com`).
  1. Dashboard → zone `rutinhq.com` → **Rules → Redirect Rules → Create rule**
  2. Wildcard: Request URL `https://rutinhq.com/*` → Target `https://www.rutinhq.com/${1}` → **301** → Preserve query string **On**
  3. Enable **Always Use HTTPS** (or a second wildcard for `http://rutinhq.com/*`)
  4. Verify: `curl -sI https://rutinhq.com/gtm-os` → `301` + `location: https://www.rutinhq.com/gtm-os`
- **Blog + SKUs:** Hub + 3 OS landings (EN+ES) stay **indexable** in `sitemap.xml` (8 www URLs). Blog index + articles are **DRAFT `noindex,follow`** and omitted from the sitemap until publish GO. Soft-link `/blog` from the footer only (not hub nav) so the hub stays one-SKU-clear. Build prerenders crawl shells under `dist/prerender/*.html` and `_redirects` 200-rewrites the pretty URLs to the **extensionless** `/prerender/…` path (that path is already a 200). Do **not** emit `dist/blog.html` / `dist/es/blog.html` / `dist/gtm-os.html` or rewrite those to `*.html` 200 — html-handling 308s `*.html` → pretty URL and that pair **self-loops**. Do **not** 301 `/es` onto `/es/blog`. Do **not** emit `dist/blog/index.html` or `dist/es/index.html`. hreflang EN ↔ ES; EN is `x-default`. Soft-park STORE/NEXUS on the blog footer only. No 3-SKU strip on `/blog`.
- **No tocar** `docs.rutinhq.com`. CORTEX redeploya `rutinhq-web`.

## Local

```bash
npm install
npm run dev
```

Abre `http://127.0.0.1:4321`.

```bash
npm run build
npm run preview
```

## Copy y CTAs

- Comercial público en **EN**. CTA: **Talk to RutinHQ** → `mailto:strategy@rutinhq.com`
  - Hub: `RutinHQ`
  - GTM: `GTM OS — fit call`
  - Store: `STORE OS — fit call`
  - NEXUS: `NEXUS OS — fit call`
- Opcional: **Read the system** → `https://docs.rutinhq.com/catalog/{sku}/`
- Hub `/` = índice de 3 SKUs. Un SKU por landing. Sin tabulador de precios.
- Fuera: FuzzyFlags / fzf.dev, nombres de clientes, mailbox inventado, GROK BOT OS como 4ª card

## RutinHQ Guide

Floating concierge on the hub + SKU LPs (not blog). Allowlisted SoT, Calendly CTA, lead-brief clipboard + short mailto. Internal runbook: [`GUIDE.md`](GUIDE.md).
