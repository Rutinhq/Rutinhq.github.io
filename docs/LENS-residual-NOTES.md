# LENS residual SEO/AEO — what is already covered

Paper for the leftover technical slice toward scorecard average **≥ 9.5**. No Capo content-strategy decisions. **DRAFT · Hold merge.**

## Already on `main` (do not redo)

| PR | What it closed |
| --- | --- |
| #5 | Real `sitemap.xml` + `robots.txt` (not SPA HTML) |
| #10 / #11 | Prerender `/blog` + Article01; EN/ES hreflang; no `/blog` 308 loop |
| #25 | `robots` Allow + Content-Signal after CF managed robots |
| #27 | RFC 8288 `Link` to sitemap + `llms.txt` |
| #28 | `twitter:card=summary_large_image`, Service JSON-LD (no prices), self-hosted fonts, HTML/asset cache, sitemap `lastmod` |
| #29 | SSR `#root` bodies + HTTP 404 (`dist/404.html`) |
| #30 / #33 | Route-level JS split + named `page-*` chunks + layout `Suspense` |
| #31 | `Content-Signal: search=yes, ai-train=no, use=reference` HTTP header |
| #32 | OG PNG pack 1200×630 wired to `og:image` / `twitter:image` |
| #33 | Visible FAQ + matching FAQPage on hub + OS (EN/ES). Blog index has no FAQPage. |

Open drafts (do not merge from this PR):

- **#34** — HQ green square + arrow favicon pack for Google SERP. Do not invent letter-R icons.
- **#35** — Sprint 2 blog scaffold, `noindex` until Capo publish GO. Do not force-publish.

Parked (out of this repo / out of this PR): HSTS, apex→www zone redirect, Cloudflare Soft P1 / DNS.

## What this PR still had room to harden

- Organization `logo` as a raster `ImageObject` (`apple-touch-icon.png` 180×180 HQ mark) + `ContactPoint` (`strategy@rutinhq.com`)
- Article01 EN/ES crawl shells: full `BlogPosting` + `BreadcrumbList` + `article:published_time` (ES was a stub)
- `og:image:width/height/type/alt` + `twitter:image:alt` on hub + OS + blog shells
- Sitemap `xhtml:link` hreflang pairs; hub/OS `lastmod` 2026-09-13
- `noindex` / `Disallow` on internal `/prerender/` shells and `/guide-kb.json` (pretty URLs stay indexable)
- Low-risk headers: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` (no HSTS)
- Skip-to-content link (`#main-content`)

## Three Capo-gated next items

1. **Blog publish GO (#35)** — flip `/blog` + articles to `index` + sitemap, or keep draft `noindex`. Content volume and Article02 outline are strategy, not a technical leftover.
2. **HSTS / apex→www / Cloudflare zone rules** — Soft P1 still parked. Not a Pages `_headers` change.
3. **New public proof** — case studies, extra posts, SKU pricing, or invented testimonials. Scorecard Contenido/Blog will not move without Capo copy.

Public contact stays `strategy@rutinhq.com`. No fzf / FuzzyFlags. No spend.
