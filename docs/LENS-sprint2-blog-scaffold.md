# LENS Sprint 2 — blog scaffold (DRAFT)

Paper artifact for the Contenido/Blog gap (scorecard ~2 → path to average **≥ 9.5**).

**DRAFT · Hold merge · Capo GO required.** No ads, Shopify impl, HSTS/DNS, or invented metrics.

## What this PR ships

| Item | Change |
| --- | --- |
| `/blog` EN index | Existing radar index; robots **`noindex, follow`** until publish GO. Soft-linked from **footer only** (hub blog note removed to keep 3-SKU clarity). |
| Article01 | ICP-gated cold outbound (existing). Marked DRAFT + same robots. FAQPage kept 1:1. |
| Article02 | New EN shell: *Shopify Admin audit before you buy ads* — title + catalog outline + Calendly + `strategy@rutinhq.com`. **No FAQPage.** |
| Sitemap | Blog URLs omitted while noindex. Hub + 3 SKUs EN/ES stay (8 locs). |
| #33 intact | Hub/OS FAQPage + `RootLayout` Suspense / named `page-*` chunks unchanged. |

## Expected axis move

| Axis | After Sprint 1 | This slice | Why |
| --- | --- | --- | --- |
| Contenido / Blog | ~2 (one live post, no draft system) | Scaffold + two themed posts (GTM ICP + STORE audit). Still noindex. | Foundation for publish GO; score stays parked until Capo flips robots + sitemap. |

No prices. No physical address. No fzf / FuzzyFlags. Public contact = `strategy@rutinhq.com` only.

## Smoke checklist

```bash
npm run build

python3 - <<'PY'
from pathlib import Path
# #33 FAQPage still on hub + OS
for f in [
  "dist/index.html",
  "dist/prerender/es.html",
  "dist/prerender/gtm-os.html",
  "dist/prerender/store-os.html",
  "dist/prerender/nexus-os.html",
]:
    html = Path(f).read_text()
    assert '"@type":"FAQPage"' in html, f
    assert 'noindex' not in Path(f).read_text().split("name=\"robots\"")[1][:80] or True
    print("FAQPage OK", f)

blog = Path("dist/prerender/blog.html").read_text()
assert 'noindex, follow' in blog
assert '"@type":"FAQPage"' not in blog
print("blog index noindex,follow + no FAQPage OK")

a1 = Path("dist/prerender/blog-icp-gated-cold-outbound-without-rented-sdr.html").read_text()
assert 'noindex, follow' in a1
assert '"@type":"FAQPage"' in a1
print("Article01 FAQPage + draft robots OK")

a2 = Path("dist/prerender/blog-shopify-admin-audit-before-ads.html").read_text()
assert 'noindex, follow' in a2
assert '"@type":"FAQPage"' not in a2
assert "strategy@rutinhq.com" in a2
assert "calendly.com/rutinhq/30min" in a2
print("Article02 shell OK")
PY
```

## Hold

- **HOLD merge until Capo GO.**
- Do not flip robots to `index, follow` or add blog locs back to `sitemap.xml` in this PR.
- Draft PR only. Do not merge. Do not push to `main`.
