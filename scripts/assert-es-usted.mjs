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
  { id: 'founders', re: /\bfounders?\b/i },
  { id: 'how-to', re: /\bhow-to\b/i },
  { id: 'Dual desk', re: /\bdual\s+desk\b/i },
  { id: 'pipeline', re: /\bpipelines?\b/i },
  { id: 'ops', re: /\bops\b/i },
  { id: 'buyer', re: /\bbuyers?\b/i },
  { id: 'install', re: /\binstall(?:ed|s)?\b/i },
  { id: 'RFP', re: /\bRFP\b/ },
  { id: 'Admin', re: /\bAdmin\b/ },
  { id: 'DRAFT', re: /\bdraft\b/i },
  { id: 'playbook', re: /\bplaybook\b/i },
  { id: 'scorecard', re: /\bscorecard\b/i },
  { id: 'checklist', re: /\bchecklist\b/i },
  { id: 'KPI', re: /\bKPIs?\b/ },
  { id: 'pitch', re: /\bpitch\b/i },
  { id: 'Soft-park', re: /\bsoft-park\b/i },
  { id: 'GO leftover', re: /\bGO\b/ },
  { id: 'Fit leftover', re: /\bFit\b/ },
  { id: 'framework leftover', re: /\bframework\b/i },
  { id: 'handoff leftover', re: /\bhandoff\b/i },
  { id: 'CEO leftover', re: /\bCEO\b/ },
  { id: 'discovery leftover', re: /\bdiscovery\b/i },
  { id: 'Cold email', re: /\bcold email\b/i },
  { id: 'replies leftover', re: /\breplies\b/i },
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
    .replace(/\b(?:href|src|to|class|id)=["'][^"']*["']/gi, ' ')
    .replace(/\/(?:es\/)?blog\/[a-z0-9-]+/gi, ' ')
}

/** Visible leftover English on the /es/blog index only — not URL slugs. */
const bannedOnEsBlogIndex = [
  { id: 'discovery', re: /\bdiscovery\b/i },
  { id: 'educate-forever', re: /educate-forever/i },
  { id: 'comparison', re: /\bcomparison\b/i },
  { id: 'framework', re: /\bframework\b/i },
  { id: 'Fit', re: /\bFit\b/ },
  { id: 'outline', re: /\boutline\b/i },
  { id: 'Sprint', re: /\bSprint\b/ },
  { id: 'Article01/02', re: /\bArticle0[12]\b/ },
  { id: 'handoff', re: /\bhandoff\b/i },
  { id: 'Seniority', re: /\bSeniority\b/ },
]

const requiredOnEsBlogIndex = [
  { id: 'llamada de encaje', re: /llamada de encaje/i },
  { id: 'ciclo de contenido', re: /ciclo de (?:contenido|artículos) sin fin/i },
  { id: 'Encaje de perfil', re: /Encaje de perfil de cliente ideal \(ICP\)/ },
  { id: 'comparación', re: /comparación/i },
  { id: 'esquema en inglés', re: /esquema en inglés/i },
  { id: 'Esquema EN marker', re: /Esquema EN/ },
  { id: 'borrador en inglés', re: /borrador/i },
]

const leftoverJargon = [
  { id: 'al molde', re: /al molde/i },
  { id: 'primera corrida', re: /primera corrida/i },
  { id: 'Mesa doble', re: /mesa doble/i },
  { id: 'educar para siempre', re: /educar para siempre/i },
  { id: 'CTA leftover', re: /\bCTA\b/ },
  { id: 'escritorios', re: /escritorios/i },
  { id: 'Señal de pase', re: /señal de pase/i },
  { id: 'firmográfico', re: /firmogr[aá]fico/i },
  { id: 'gemelo ES', re: /gemelo ES/i },
  { id: 'puertas de ICP', re: /puertas de ICP/i },
  { id: 'página OS', re: /p[aá]gina OS/i },
  { id: 'Linkset leftover', re: /Linkset de/ },
  { id: 'Inbox humano', re: /inbox humano/i },
  { id: 'Access home', re: /access home/i },
  { id: 'endpoints leftover', re: /\bendpoints\b/i },
  { id: 'SDR que muere', re: /muere cuando termina/i },
  { id: 'N juntas', re: /\bN juntas\b/i },
  { id: 'banco creativo en cero', re: /banco creativo en cero/i },
  { id: 'un problema, un objeto', re: /un problema, un objeto/i },
  { id: 'órdenes de compra leftover', re: /[oó]rdenes de compra/i },
]

const requiredOnEsStore = [
  { id: 'ficha de diagnóstico', re: /ficha de diagnóstico/i },
  { id: 'fuera de alcance', re: /fuera de alcance/i },
  { id: 'viven en NEXUS OS', re: /viven en NEXUS OS/ },
  { id: 'No incluye anuncios ni creatividades', re: /No incluye anuncios ni creatividades/ },
]

const hits = []
for (const file of files) {
  const html = fs.readFileSync(file, 'utf8')
  const masked = maskCopy(html)
  const rules = [...bannedEnglish, ...bannedTu, ...leftoverJargon]
  if (path.basename(file) === 'es-blog.html') {
    rules.push(...bannedOnEsBlogIndex)
    for (const rule of requiredOnEsBlogIndex) {
      if (!rule.re.test(masked)) {
        hits.push(`${file}: missing ${rule.id}`)
      }
    }
  }
  if (path.basename(file) === 'es-store-os.html') {
    for (const rule of requiredOnEsStore) {
      if (!rule.re.test(masked)) {
        hits.push(`${file}: missing ${rule.id}`)
      }
    }
  }
  for (const rule of rules) {
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
