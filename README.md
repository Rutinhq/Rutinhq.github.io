# RutinHQ — hub + 3 SKUs

Catálogo público (`/`) y tres landings de un SKU cada una:

| Ruta | SKU |
| --- | --- |
| `/` | Hub — 3 cards |
| `/gtm-os` | GTM OS (Pack §2) |
| `/store-os` | Store OS |
| `/nexus-os` | NEXUS OS |

Stack: Vite + React + Tailwind + i18next. Default **EN** (commercial copy). Toggle ES keeps chrome; SKU pages stay EN. Tema oscuro `#0a0a0a` / `#2ecc8f` / radius 0.

## Cloudflare Pages

- **Proyecto:** `rutinhq-web`
- **Build:** `npm run build`
- **Output:** `dist`
- **SPA fallback:** `public/_redirects` → explicit SKU rewrites + `/* /index.html 200`
- **Do not ship `404.html`.** Cloudflare Pages would serve valid SPA routes (`/gtm-os`, `/store-os`, `/nexus-os`) with HTTP 404 even when the body is the Vite shell.
- Build also copies `index.html` → `dist/{gtm-os,store-os,nexus-os}/index.html` so those three paths are real assets.
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

## Copy y CTAs

- Comercial público en **EN**. CTA: **Talk to RutinHQ** → `mailto:strategy@rutinhq.com`
  - Hub: `RutinHQ`
  - GTM: `GTM OS — fit call`
  - Store: `Store OS — fit call`
  - NEXUS: `NEXUS OS — fit call`
- Opcional: **Read the system** → `https://docs.rutinhq.com/catalog/{sku}/`
- Hub `/` = índice de 3 SKUs. Un SKU por landing. Sin tabulador de precios.
- Fuera: FuzzyFlags / fzf.dev, nombres de clientes, mailbox inventado, GROK BOT OS como 4ª card
