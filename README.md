# RutinHQ — hub + 3 SKUs

Catálogo público (`/`) y tres landings de un SKU cada una:

| Ruta | SKU |
| --- | --- |
| `/` | Hub — 3 cards |
| `/gtm-os` | GTM OS (Pack §2) |
| `/store-os` | Store OS |
| `/nexus-os` | NEXUS OS |
| `/blog` | Filter/radar index (EN primary; canonical `https://www.rutinhq.com/blog`) |
| `/blog/icp-gated-cold-outbound-without-rented-sdr` | Article01 EN — ICP-gated cold outbound |
| `/es/blog` | Radar/filtro ES·MX (tuteo; hreflang ↔ `/blog`) |
| `/es/blog/outbound-frio-con-icp-sin-sdr-rentado` | Article01 ES — outbound frío con ICP |

Stack: Vite + React + Tailwind + i18next. Default **EN** (commercial copy). Toggle ES keeps chrome; SKU pages stay EN. Tema oscuro `#0a0a0a` / `#2ecc8f` / radius 0.

## Cloudflare Pages

- **Proyecto:** `rutinhq-web`
- **Build:** `npm run build`
- **Output:** `dist`
- **SPA fallback:** `public/_redirects` → `/* /index.html 200`
- **Do not ship `404.html`.** Cloudflare Pages would serve valid SPA routes (`/gtm-os`, `/store-os`, `/nexus-os`) with HTTP 404 even when the body is the Vite shell.
- **Do not emit `dist/<sku>/index.html` or exact `/{sku} /index.html 200` rewrites.** Both make Pages/wrangler html-handling 308 `/gtm-os` → `/` instead of 200.
- **Pretty URLs:** live SKU routes have **no trailing slash** (`/gtm-os`, not `/gtm-os/`). Do not add `_redirects` slash-normalization — folder `index.html` + html-handling already 308'd `/gtm-os` away from the pretty URL.
- **Canonical host:** `https://www.rutinhq.com`. `sitemap.xml` + `robots.txt` are www-only.
- **Apex → www 301:** **not possible in `public/_redirects`.** Cloudflare Pages marks domain-level (host) redirects as unsupported. A path-only `/* https://www.rutinhq.com/:splat 301` would also 301 www onto itself. Capo applies a **zone Single Redirect** (or Bulk Redirect) — see PR / steps below. Confirm `@` is Proxied. Do **not** enable Include subdomains (would catch `docs.rutinhq.com`).
  1. Dashboard → zone `rutinhq.com` → **Rules → Redirect Rules → Create rule**
  2. Wildcard: Request URL `https://rutinhq.com/*` → Target `https://www.rutinhq.com/${1}` → **301** → Preserve query string **On**
  3. Enable **Always Use HTTPS** (or a second wildcard for `http://rutinhq.com/*`)
  4. Verify: `curl -sI https://rutinhq.com/gtm-os` → `301` + `location: https://www.rutinhq.com/gtm-os`
- **Blog:** EN `/blog` (canonical `https://www.rutinhq.com/blog`) + Article01 and ES `/es/blog` + Article01 are **indexable**. Sitemap lists hub + 3 SKUs + 4 blog locs (8 www URLs). `hreflang` EN↔ES on both indexes and Article01. Soft-park Store/NEXUS. `/es/blog/*` is SPA 200 via the catch-all — do not emit folder `index.html`.
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
  - Store: `Store OS — fit call`
  - NEXUS: `NEXUS OS — fit call`
- Opcional: **Read the system** → `https://docs.rutinhq.com/catalog/{sku}/`
- Hub `/` = índice de 3 SKUs. Un SKU por landing. Sin tabulador de precios.
- Fuera: FuzzyFlags / fzf.dev, nombres de clientes, mailbox inventado, GROK BOT OS como 4ª card
