# RutinHQ Guide — Worker companion

Use this **only** if Cloudflare Pages Functions on `rutinhq-web` are awkward (SPA `_redirects`, html-handling, or a static-only pipeline).

Preferred v1 path: `functions/api/guide.ts` on the Pages project (`POST /api/guide`). The widget already calls that URL and degrades if it 404s.

## Deploy later

```bash
cd workers/guide-companion
npx wrangler secret put GUIDE_LLM_API_KEY
# optional
npx wrangler secret put GUIDE_LEAD_WEBHOOK_URL
npx wrangler deploy
```

Then either:

1. Keep the widget on `/api/guide` (Pages Function), or
2. Point a route / Worker custom domain at this companion and change the fetch URL in `GuideWidget` (CORTEX).

`GUIDE_KB_URL` defaults to `https://www.rutinhq.com/guide-kb.json` (allowlisted SoT blob).

## Lead briefs

v1 delivery is `mailto:strategy@rutinhq.com?subject=Lead%20brief%20…` from the widget.

To POST JSON to Slack / a sheet / a queue later:

1. Stand up any HTTPS endpoint that accepts `POST { type: "lead_brief", leadBrief }`.
2. Set `GUIDE_LEAD_WEBHOOK_URL` on the Pages Function **or** this Worker.
3. No new paid SaaS required — a second Worker, a Zapier hook, or an inbox parser all work.
