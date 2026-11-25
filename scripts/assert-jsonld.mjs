import fs from 'node:fs'

const SITE = 'https://www.rutinhq.com'
const EMAIL = 'strategy@rutinhq.com'
const CALENDLY_URL = 'https://calendly.com/rutinhq/30min'
const LINKEDIN_URL = 'https://www.linkedin.com/company/rutinhq'
const LOGO_PNG = `${SITE}/apple-touch-icon.png`
const OG_HUB = `${SITE}/og/og-hub.png`

const AREA_SERVED_CITIES = [
  'Tijuana',
  'Playas de Rosarito',
  'Tecate',
  'Mexicali',
  'Ensenada',
  'San Diego',
  'Ciudad de México',
  'Guadalajara',
  'Monterrey',
  'Querétaro',
  'Puebla',
  'León',
  'Mérida',
  'Chihuahua',
  'Hermosillo',
  'Culiacán',
]

const OFFER_CATALOG_NAMES = [
  'Diagnóstico STORE OS',
  'Instalación STORE OS',
  'Sprint GTM OS',
  'Operación mensual',
]

/** schema.org types this site is allowed to emit (structural allowlist). */
const SCHEMA_ORG_TYPES = new Set([
  'Answer',
  'Blog',
  'BlogPosting',
  'BreadcrumbList',
  'City',
  'CollectionPage',
  'ContactPoint',
  'Country',
  'EntryPoint',
  'FAQPage',
  'ImageObject',
  'ListItem',
  'Offer',
  'OfferCatalog',
  'OpeningHoursSpecification',
  'Organization',
  'PostalAddress',
  'ProfessionalService',
  'Question',
  'ReserveAction',
  'Service',
  'WebPage',
  'WebSite',
])

const BANNED_KEYS = new Set([
  'telephone',
  'streetAddress',
  'price',
  'priceCurrency',
  'priceRange',
  'priceSpecification',
])

const JSON_LD_RE =
  /<script\b[^>]*\btype=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi

const GUIDE_PAGE_HREF =
  /href=["'](?:https:\/\/www\.rutinhq\.com)?\/guide(?:\/)?(?:["'?#])/i

function fail(message) {
  console.error(message)
  process.exit(1)
}

function decodeJsonLdInner(inner) {
  return inner
    .replaceAll('&quot;', '"')
    .replaceAll('&#x27;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&')
}

function jsonLdTypes(node) {
  const type = node?.['@type']
  if (Array.isArray(type)) return type
  return typeof type === 'string' ? [type] : []
}

function walk(value, visit) {
  if (Array.isArray(value)) {
    for (const item of value) walk(item, visit)
    return
  }
  if (value && typeof value === 'object') {
    visit(value)
    for (const nested of Object.values(value)) walk(nested, visit)
  }
}

function parseJsonLdBlocks(html, file) {
  const blocks = []
  const re = new RegExp(JSON_LD_RE.source, 'gi')
  for (const match of html.matchAll(re)) {
    const raw = decodeJsonLdInner(match[1] || '')
    let data
    try {
      data = JSON.parse(raw)
    } catch (error) {
      fail(`${file} JSON-LD must parse as JSON: ${error.message}`)
    }
    blocks.push(data)
  }
  if (blocks.length !== 1) {
    fail(`${file} must emit exactly one JSON-LD graph (found ${blocks.length}).`)
  }
  return blocks
}

function graphNodes(data) {
  if (Array.isArray(data)) return data.flatMap(graphNodes)
  if (Array.isArray(data?.['@graph'])) return data['@graph']
  if (data && typeof data === 'object') {
    const node = { ...data }
    delete node['@context']
    return [node]
  }
  return []
}

function assertStructural(file, data) {
  if (data?.['@context'] !== 'https://schema.org') {
    fail(`${file} JSON-LD @context must be https://schema.org.`)
  }
  walk(data, (node) => {
    for (const key of Object.keys(node)) {
      if (BANNED_KEYS.has(key)) {
        fail(`${file} JSON-LD must not emit ${key} (no phone, street, or prices).`)
      }
    }
    const types = jsonLdTypes(node)
    for (const type of types) {
      if (!SCHEMA_ORG_TYPES.has(type)) {
        fail(`${file} JSON-LD uses unknown schema.org @type "${type}".`)
      }
    }
    if (types.includes('PostalAddress')) {
      if (node.streetAddress || node.streetAddress === '') {
        fail(`${file} PostalAddress must omit streetAddress.`)
      }
    }
    if (types.includes('Offer')) {
      if (node.price != null || node.priceCurrency || node.priceSpecification) {
        fail(`${file} Offer must list a name only — no prices.`)
      }
    }
  })
}

function findEntity(nodes, file) {
  const matches = nodes.filter((node) => {
    const types = jsonLdTypes(node)
    return (
      types.includes('ProfessionalService') && types.includes('Organization')
    )
  })
  if (matches.length !== 1) {
    fail(
      `${file} must merge ProfessionalService + Organization into one entity (found ${matches.length}).`,
    )
  }
  return matches[0]
}

function assertEntity(file, entity) {
  if (entity.name !== 'RutinHQ') {
    fail(`${file} entity name must be exactly "RutinHQ".`)
  }
  if (entity.url !== `${SITE}/`) {
    fail(`${file} entity url must be ${SITE}/.`)
  }
  if (entity.email !== EMAIL) {
    fail(`${file} entity email must be ${EMAIL}.`)
  }
  if (entity.image !== OG_HUB) {
    fail(`${file} entity image must be ${OG_HUB}.`)
  }
  if (entity.logo?.['@type'] !== 'ImageObject' || entity.logo?.url !== LOGO_PNG) {
    fail(`${file} entity logo must be ImageObject ${LOGO_PNG}.`)
  }
  if (!Array.isArray(entity.sameAs) || !entity.sameAs.includes(LINKEDIN_URL)) {
    fail(`${file} entity sameAs must include ${LINKEDIN_URL}.`)
  }
  const address = entity.address
  if (
    address?.['@type'] !== 'PostalAddress' ||
    address.addressLocality !== 'Tijuana' ||
    address.addressRegion !== 'Baja California' ||
    address.addressCountry !== 'MX' ||
    'streetAddress' in address
  ) {
    fail(
      `${file} address must be PostalAddress Tijuana / Baja California / MX with no street.`,
    )
  }
  const cities = (entity.areaServed || [])
    .filter((item) => item?.['@type'] === 'City')
    .map((item) => item.name)
  const countries = (entity.areaServed || [])
    .filter((item) => item?.['@type'] === 'Country')
    .map((item) => item.name)
  if (cities.join('|') !== AREA_SERVED_CITIES.join('|')) {
    fail(`${file} areaServed City list must match the GBP service-area set.`)
  }
  if (!countries.includes('MX') || !countries.includes('US')) {
    fail(`${file} areaServed must include Country MX and US.`)
  }
  const hours = entity.openingHoursSpecification
  const days = hours?.dayOfWeek || []
  if (
    hours?.['@type'] !== 'OpeningHoursSpecification' ||
    hours.opens !== '09:00' ||
    hours.closes !== '18:00' ||
    days.join('|') !== 'Monday|Tuesday|Wednesday|Thursday|Friday'
  ) {
    fail(`${file} openingHoursSpecification must be Mon–Fri 09:00–18:00.`)
  }
  const contact = entity.contactPoint
  const languages = contact?.availableLanguage || []
  if (
    contact?.['@type'] !== 'ContactPoint' ||
    contact.email !== EMAIL ||
    contact.url !== CALENDLY_URL ||
    contact.contactType !== 'sales' ||
    !languages.includes('English') ||
    !languages.includes('Spanish')
  ) {
    fail(
      `${file} contactPoint must be sales + ${EMAIL} + Calendly with English/Spanish.`,
    )
  }
  const action = entity.potentialAction
  if (
    action?.['@type'] !== 'ReserveAction' ||
    action.target?.['@type'] !== 'EntryPoint' ||
    action.target?.url !== CALENDLY_URL
  ) {
    fail(`${file} potentialAction must be ReserveAction targeting Calendly.`)
  }
  const catalog = entity.hasOfferCatalog
  const offers = catalog?.itemListElement || []
  const offerNames = offers.map((offer) => offer?.itemOffered?.name)
  if (
    catalog?.['@type'] !== 'OfferCatalog' ||
    offers.some((offer) => offer?.['@type'] !== 'Offer') ||
    offers.some((offer) => offer?.itemOffered?.['@type'] !== 'Service') ||
    offerNames.join('|') !== OFFER_CATALOG_NAMES.join('|')
  ) {
    fail(
      `${file} hasOfferCatalog must list Diagnóstico STORE OS, Instalación STORE OS, Sprint GTM OS, Operación mensual — names only.`,
    )
  }
  for (const name of ['GTM OS', 'STORE OS', 'NEXUS OS']) {
    if (!JSON.stringify(entity).includes(name)) {
      fail(`${file} entity must name ${name} exactly.`)
    }
  }
}

function assertFooter(file, html) {
  const inner = (html.match(/<div id="root">([\s\S]*)<\/div>\s*<\/body>/i) ||
    [])[1] || ''
  for (const needle of [
    'RutinHQ',
    'Tijuana, Baja California, México',
    EMAIL,
    LINKEDIN_URL,
  ]) {
    if (!inner.includes(needle)) {
      fail(`${file} footer contact block must include ${needle}.`)
    }
  }
  if (/\btel:|\btelephone\b|\bstreetAddress\b/i.test(inner)) {
    fail(`${file} must not show a phone number or street address.`)
  }
}

function assertNoGuidePage() {
  const sitemap = fs.readFileSync('dist/sitemap.xml', 'utf8')
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  if (locs.some((url) => /\/guide(?:\/|$)/.test(url) && !url.includes('guide-kb'))) {
    fail('sitemap.xml must not list /guide (that path is a 404 widget, not a page).')
  }
  const shells = [
    'dist/index.html',
    'dist/llms.txt',
    'dist/llms-full.txt',
    ...fs
      .readdirSync('dist/prerender')
      .filter((name) => name.endsWith('.html'))
      .map((name) => `dist/prerender/${name}`),
  ]
  for (const file of shells) {
    if (!fs.existsSync(file)) continue
    const body = fs.readFileSync(file, 'utf8')
    if (GUIDE_PAGE_HREF.test(body)) {
      fail(`${file} must not link to /guide (widget-only; that URL 404s).`)
    }
  }
}

const hubs = [
  { file: 'dist/index.html', locale: 'en' },
  { file: 'dist/prerender/es.html', locale: 'es' },
]

for (const hub of hubs) {
  if (!fs.existsSync(hub.file)) fail(`${hub.file} missing — run prerender first.`)
  const html = fs.readFileSync(hub.file, 'utf8')
  const [data] = parseJsonLdBlocks(html, hub.file)
  assertStructural(hub.file, data)
  const entity = findEntity(graphNodes(data), hub.file)
  assertEntity(hub.file, entity)
  assertFooter(hub.file, html)
}

assertNoGuidePage()

console.log(
  'JSON-LD: hub EN/ES ProfessionalService+Organization parses and passes schema.org structural checks.',
)
