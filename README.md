# RutinHQ — hub + 3 SKUs

Catálogo público (`/`) y tres landings de un SKU cada una:

| Ruta | SKU |
| --- | --- |
| `/` | Hub — 3 cards |
| `/gtm-os` | GTM OS (Pack §2) |
| `/store-os` | Store OS |
| `/nexus-os` | NEXUS OS |

Stack: Vite + React + Tailwind + i18next. Default **ES**, toggle **EN**. Tema oscuro `#0a0a0a` / `#2ecc8f` / radius 0.

## Cloudflare Pages

- **Proyecto:** `rutinhq-web`
- **Build:** `npm run build`
- **Output:** `dist`
- **SPA fallback:** `public/_redirects` → `/* /index.html 200`
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

- Primario: [Calendly 30 min](https://calendly.com/rutinhq/30min) en hub y las tres landings
- Secundario: `mailto:rutinhqsolutions@gmail.com?subject=…` (WhatsApp en park)
  - Hub: `RutinHQ`
  - GTM: `GTM%20OS`
  - Store: `Store%20OS`
  - NEXUS: `NEXUS%20OS`
- GTM precios piloto: Radar $1,000–1,500 · Blueprint $1,500–2,000 · OS $3,500–4,500 · Pulse $1,000–1,500/mo · OS 40/40/20
- Store / NEXUS: precio TBD en discovery. No inventar tabulador ni % de spend
- Un SKU por landing. Sin cross-sell en el cuerpo. Hub / footer OK
- Fuera: foto, garantía de N meetings, métricas inventadas, WhatsApp
