# LENS Sprint 1 residual scorecard

Paper artifact for the residual SEO/AEO close toward scorecard average **≥ 9.5**.

**DRAFT · Hold merge · Capo GO required.** HSTS remains parked (Cloudflare Soft P1 / DNS — out of scope).

## What shipped in this PR

| Item | Change |
| --- | --- |
| S1-F FAQPage JSON-LD | Visible FAQ (4 Qs) on hub (`/`, `/es`) and OS landings (`/gtm-os`, `/store-os`, `/nexus-os` + ES). FAQPage in `@graph` via Helmet + prerender. Copy is existing catalog language only — no prices, no invented testimonials. |
| Route-level lazy | `#30` already lazy-imported pages. This PR finishes the split: `Suspense` wraps `<Outlet />` in `RootLayout` (header/footer stay mounted); Rolldown names `page-hub`, `page-gtm-os`, `page-store-os`, `page-nexus-os`, `page-blog`, article, and 404 chunks. SSR `allReady` + prerender `#root` + HTTP 404 unchanged. |
| Scorecard paper | This file. |

Already live on `main` (do not redo): #29 SSR + soft-404, #30 initial code-split, #28 lastmod / Service JSON-LD / fonts / cache / twitter:card, #31 Content-Signal, #32 OG PNG pack.

## Expected axis moves (toward ≥ 9.5)

| Axis | Before residual | After this PR (expected) | Why |
| --- | --- | --- | --- |
| Structured Data | Service + Org + Article FAQ only. Hub/OS FAQPage was correctly **absent** (no FAQ UI). | Hub + 3 OS (EN/ES) emit FAQPage that matches visible Q/A 1:1. Article01 FAQPage kept. Blog index still has **no** FAQPage. | Google FAQPage: markup only where a real FAQ is on the page. |
| AEO | Answer engines could cite Service/Org and Article01 FAQ; hub/OS had no Q/A block. | Hub/OS now expose extractable Q/A from existing copy (what / who / how / not). | Visible FAQ + matching JSON-LD is the AEO signal; no new claims. |
| Perf | Vendor + some route chunks; layout Suspense wrapped all `Routes` (header dropped while a page chunk loaded). Hub chunk named like `index-*`. | Named per-route chunks; layout stays up; hub still the default shell. | Smaller first-route JS; no monolith regression (`< 400KB` per chunk). |

HSTS / apex-www / Cloudflare zone rules: **no score change in this PR** (still park).

## Smoke checklist

Run after `npm run build` (or against a preview). Do **not** treat this as a merge GO.

```bash
# Build green
npm run build

# FAQ ld+json present on hub + OS (EN + ES)
python3 - <<'PY'
from pathlib import Path
files = [
  "dist/index.html",
  "dist/prerender/es.html",
  "dist/prerender/gtm-os.html",
  "dist/prerender/store-os.html",
  "dist/prerender/nexus-os.html",
  "dist/prerender/es-gtm-os.html",
  "dist/prerender/es-store-os.html",
  "dist/prerender/es-nexus-os.html",
]
for f in files:
    html = Path(f).read_text()
    assert '"@type":"FAQPage"' in html, f
    print("FAQPage OK", f)
html = Path("dist/prerender/blog.html").read_text()
assert '"@type":"FAQPage"' not in html
print("blog index has no FAQPage OK")
PY

# Named route chunks
ls dist/assets/page-hub*.js dist/assets/page-gtm-os*.js \
   dist/assets/page-store-os*.js dist/assets/page-nexus-os*.js \
   dist/assets/page-blog*.js

# Optional live curl after preview/deploy (not production merge)
# curl -s https://<preview>/ | grep -o '"@type":"FAQPage"'
# curl -s https://<preview>/gtm-os | grep -o '"@type":"FAQPage"'
```

`scripts/assert-spa-200.mjs` (part of `npm run build`) already checks:

- FAQPage on hub + OS shells
- Visible FAQ text matches JSON-LD 1:1
- Blog index has no FAQPage
- Article01 FAQPage kept
- Named `page-*` chunks + `GuideWidget`
- `RootLayout` Suspense around `<Outlet />`
- No invented Service `offers` / `"price"`

## Hold

- **HOLD merge until Capo GO.**
- **HSTS still park.** Do not enable HSTS, touch Cloudflare Soft P1, or change GitHub Pages / DNS in this PR.
- Draft PR only. Do not merge. Do not push to `main`.
