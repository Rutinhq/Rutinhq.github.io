# RutinHQ — GTM OS

Landing de un scroll (Pack GTM §2): sistema de outbound B2B que queda del cliente.

Stack: Vite + React + Tailwind + i18next. Default **ES**, toggle **EN**.

## Cloudflare Pages

- **Proyecto:** `rutinhq-web`
- **Build:** `npm run build`
- **Output:** `dist`
- **DNS www:** pendiente Capo / CORTEX. CNAME de `www.rutinhq.com` al hostname `*.pages.dev` del proyecto. Apex (`rutinhq.com`) al mismo target cuando Capo lo autorice.
- **No tocar** `docs.rutinhq.com`.

Deploy (con auth Wrangler):

```bash
npm run build
npx wrangler pages deploy dist --project-name rutinhq-web
```

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

- Primario: [Calendly 30 min](https://calendly.com/rutinhq/30min)
- Secundario: `mailto:rutinhqsolutions@gmail.com?subject=GTM%20OS` (WhatsApp en park)
- Precios piloto canónicos: Radar $1,000–1,500 · Blueprint $1,500–2,000 · OS $3,500–4,500 · Pulse $1,000–1,500/mo
- WhatsApp, Store / NEXUS, foto, métricas inventadas y badge Apollo: fuera de v0
