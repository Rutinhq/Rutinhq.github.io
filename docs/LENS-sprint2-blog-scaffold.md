# LENS Sprint 2 — blog publish GO (23 Sep)

Paper artifact for the Contenido/Blog gap after Capo publish GO.

**DRAFT PR · Do not merge from this note. Do not deploy Pages from the agent.**

## What this PR ships

| Item | Change |
| --- | --- |
| `/blog` EN + `/es/blog` | Robots **`index, follow`**. Visible FAQ + matching FAQPage (3–5 Qs, catalog language). Soft-linked from footer only. |
| Article01 EN/ES | Same robots. FAQPage kept 1:1. |
| Article02 | EN outline stays visually DRAFT; robots flip to index. **No FAQPage.** |
| Sitemap | Blog locs added (17 www URLs). Article02 is EN + x-default only. |
| Hub JSON-LD | `#os-landings` ItemList stays **absent** (`HUB_JSON_LD` / PR #43). |

## Smoke checklist

```bash
npm run build
```

`scripts/assert-spa-200.mjs` now requires published blog robots, FAQPage on the blog hub, and blog locs in `sitemap.xml`.
