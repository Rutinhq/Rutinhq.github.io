import fs from 'node:fs'
import path from 'node:path'

const prerenderDir = 'dist/prerender'
if (!fs.existsSync(prerenderDir)) {
  console.error(`${prerenderDir} missing — run prerender before assert-es-usted.`)
  process.exit(1)
}

const files = fs
  .readdirSync(prerenderDir)
  .filter((name) => name === 'es.html' || name.startsWith('es-'))
  .map((name) => path.join(prerenderDir, name))
  .sort()

if (files.length < 8) {
  console.error(
    `expected ES prerender shells (es.html + es-*), found ${files.length}: ${files.join(', ')}`,
  )
  process.exit(1)
}

const LOCKED_ADS = 'Estrategia → Social → Ads'

const bannedEnglish = [
  { id: 'retainer', re: /\bretainers?\b/i },
  { id: 'outbound', re: /\boutbound\b/i },
  { id: 'milestone', re: /\bmilestones?\b/i },
  { id: 'SKU', re: /\bSKUs?\b/ },
  { id: 'curriculum', re: /\bcurriculum\b/i },
  { id: 'ads', re: /\bads\b/i },
  { id: 'config del Admin', re: /config del Admin/i },
]

const bannedTu = [
  { id: 'tú', re: /\btú\b/i },
  { id: 'tu', re: /\btu\b/ },
  { id: 'tus', re: /\btus\b/ },
  { id: 'tu equipo', re: /\btu equipo\b/i },
  { id: 'contigo', re: /\bcontigo\b/i },
  { id: 'posees', re: /\bposees\b/i },
  { id: 'Elige', re: /\b[Ee]lige\b/ },
  { id: 'escríbenos', re: /\bescríbenos\b/i },
  { id: 'quieres', re: /\bquieres\b/i },
  { id: 'Haz', re: /\bHaz\b/ },
  { id: 'Mantén', re: /\bMantén\b/ },
  { id: 'Cambia idioma', re: /\bCambia idioma\b/ },
  { id: 'vendes', re: /\bvendes\b/ },
  { id: 'Empieza', re: /\bEmpieza\b/ },
  { id: 'Mira', re: /\bMira\b/ },
  { id: 'sondes', re: /\bsondes\b/ },
]

function maskCopy(html) {
  return html
    .replaceAll(LOCKED_ADS, 'ESTRATEGIA_SOCIAL_ADS')
    .replace(/https?:\/\/[^\s"'<>]+/gi, ' ')
    .replace(/\b(?:href|src)=["'][^"']*["']/gi, ' ')
    .replace(/\/(?:es\/)?blog\/[a-z0-9-]+/gi, ' ')
}

const hits = []
for (const file of files) {
  const masked = maskCopy(fs.readFileSync(file, 'utf8'))
  for (const rule of [...bannedEnglish, ...bannedTu]) {
    const match = masked.match(rule.re)
    if (match) {
      hits.push(`${file}: ${rule.id} → ${match[0]}`)
    }
  }
}

if (hits.length) {
  console.error('ES prerender copy still has banned English or tú forms:')
  for (const hit of hits) console.error(`  ${hit}`)
  process.exit(1)
}

console.log(
  `ES usted + glossary: ${files.length} prerender shells clean (locked phrase preserved).`,
)
