# RutinHQ

Landing B2B de captura de leads para consultoría de Revenue Operations y GTM Engineering.

Sitio oscuro, tipografía técnica, cero border-radius. Home, servicios, casos y formulario de strategy call.

## Preview

El preview público vive en **GitHub Pages** (sin Vercel):

**https://rutinhq.github.io/**

Cada push a `main` publica el sitio. La primera vez, si Pages no arranca, abre el repo → Settings → Pages → Source: **GitHub Actions**.

## Local

```bash
npm install
npm run dev
```

Abre `http://127.0.0.1:4321`.

Producción local:

```bash
npm run build
npm start
```

## Alternativa: Cloudflare Pages

Cuenta gratuita, sin el tope de Vercel. En el dashboard de Cloudflare: Workers & Pages → Importar este repo → build `npm run build` → output `dist`. O:

```bash
npx wrangler pages deploy dist --project-name rutinhq
```

## Lead capture

El formulario hace `POST /api/contact/lead-capture`. En GitHub Pages (estático) el POST no tiene backend; en local y en Cloudflare/Express sí.

Sin credenciales de GoDaddy Inbox, el handler deja el lead en logs y responde 200.

```
GODADDY_INBOX_WEBHOOK_URL=
GODADDY_INBOX_API_KEY=
```

## Contenido

Copy de páginas en `src/content/pages/*.json` (`virtual:content`). UI en `src/locales/en.json` y `src/locales/es.json`.
