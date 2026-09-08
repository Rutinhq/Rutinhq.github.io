# RutinHQ — hub + 3 SKUs

Catálogo público (`/`) y tres landings de un SKU cada una:

| Ruta | SKU |
| --- | --- |
| `/` | Hub — 3 cards |
| `/gtm-os` | GTM OS (Pack §2) |
| `/store-os` | Store OS |
| `/nexus-os` | NEXUS OS |
| `/blog` | Notes index |
| `/blog/choose-a-system` | Sample note (demo) |

Stack: Vite + React + Tailwind + i18next. Default **EN** (commercial copy). Toggle ES keeps chrome; SKU pages stay EN. Tema oscuro `#0a0a0a` / `#2ecc8f` / radius 0.

## Cloudflare Pages

- **Proyecto:** `rutinhq-web`
- **Build:** `npm run build`
- **Output:** `dist`
- **SPA fallback:** `public/_redirects` → `/* /index.html 200`
- **Do not ship `404.html`.** Cloudflare Pages would serve valid SPA routes (`/gtm-os`, `/store-os`, `/nexus-os`, `/blog`) with HTTP 404 even when the body is the Vite shell.
- **Do not emit `dist/<sku>/index.html` or exact `/{sku} /index.html 200` rewrites.** Both make Pages/wrangler html-handling 308 `/gtm-os` → `/` instead of 200.
- **DNS www:** pendiente Capo / CORTEX. CNAME de `www.rutinhq.com` al hostname `*.pages.dev` del proyecto. Apex (`rutinhq.com`) al mismo target cuando Capo lo autorice.
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

Blog routes (SPA): `http://127.0.0.1:4321/blog` and `http://127.0.0.1:4321/blog/choose-a-system`. Sitemap locs: `public/sitemap.xml` lists `https://www.rutinhq.com/blog` and `https://www.rutinhq.com/blog/choose-a-system` (www only).

## Copy y CTAs

- Comercial público en **EN**. CTA: **Talk to RutinHQ** → `mailto:strategy@rutinhq.com`
  - Hub: `RutinHQ`
  - GTM: `GTM OS — fit call`
  - Store: `Store OS — fit call`
  - NEXUS: `NEXUS OS — fit call`
- Opcional: **Read the system** → `https://docs.rutinhq.com/catalog/{sku}/`
- Hub `/` = índice de 3 SKUs. Un SKU por landing. Sin tabulador de precios.
- Fuera: FuzzyFlags / fzf.dev, nombres de clientes, mailbox inventado, GROK BOT OS como 4ª card
