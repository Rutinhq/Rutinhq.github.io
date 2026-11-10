import type { GuideChatMessage, GuideIntent, GuideLocale, RecommendedSku } from './types.ts'

export type ClassifyPolicy = {
  intentHints: Record<string, string[]>
  offTopicHints: string[]
  pricingHints: string[]
  bookingHints?: string[]
  leadsHints?: string[]
  buyingIntentHints?: string[]
  securityHints?: string[]
}

/** cita/agenda/fit must beat pricingHints even if the thread mentioned price. */
export const DEFAULT_BOOKING_HINTS = [
  'cita',
  'agenda',
  'agendar',
  'schedule',
  'calendly',
  'fit',
  'gtm-fit',
  'gtm fit',
  'llamada',
  'book',
  'booking',
  'qué más',
  'que mas',
  'what else',
  'tell me more',
] as const

/** outbound / ICP-filtered cold leads → GTM OS (not a generic fit-only CTA). */
export const DEFAULT_LEADS_HINTS = [
  'leads',
  'lead',
  'outbound',
  'prospecting',
  'prospectos',
  'prospeccion',
  'prospección',
  'cold email',
  'cold outbound',
  'correo frio',
  'correo frío',
  'lead gen',
  'generacion de leads',
  'generación de leads',
] as const

export function escapeRe(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function hintMatches(hay: string, hint: string): boolean {
  const text = hay.toLowerCase()
  const h = hint.toLowerCase()
  if (!h) return false
  if (h.includes(' ')) return text.includes(h)
  return new RegExp(`(?:^|[^a-z0-9_])${escapeRe(h)}(?:[^a-z0-9_]|$)`).test(text)
}

export function scoreHints(text: string, hints: string[] | undefined): number {
  const hay = text.toLowerCase()
  return (hints || []).reduce((n, hint) => (hintMatches(hay, hint) ? n + 1 : n), 0)
}

export function lastUserText(messages: GuideChatMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user') return messages[i].content
  }
  return ''
}

export function userHaystack(messages: GuideChatMessage[]): string {
  return messages
    .filter((message) => message.role === 'user')
    .map((message) => message.content)
    .join('\n')
}

function catalogHints(policy: ClassifyPolicy): string[] {
  return [
    ...(policy.intentHints['gtm-os'] || []),
    ...(policy.intentHints['store-os'] || []),
    ...(policy.intentHints['nexus-os'] || []),
    ...(policy.intentHints.catalog || []),
  ]
}

export function bookingHintsOf(policy: ClassifyPolicy): string[] {
  return policy.bookingHints?.length ? policy.bookingHints : [...DEFAULT_BOOKING_HINTS]
}

export function leadsHintsOf(policy: ClassifyPolicy): string[] {
  return policy.leadsHints?.length ? policy.leadsHints : [...DEFAULT_LEADS_HINTS]
}

export function isLeadsTurn(messages: GuideChatMessage[], policy: ClassifyPolicy): boolean {
  return scoreHints(lastUserText(messages), leadsHintsOf(policy)) >= 1
}

export function isBookingTurn(messages: GuideChatMessage[], policy: ClassifyPolicy): boolean {
  return scoreHints(lastUserText(messages), bookingHintsOf(policy)) >= 1
}

/** Catalog STORE audit fields (source how-step 2: variants, price, weight, shipping). */
export const STORE_AUDIT_FIELD_HINTS = [
  'variante',
  'variant',
  'peso',
  'weight',
  'envío',
  'envio',
  'shipping',
  'auditoría',
  'auditoria',
  'audit',
  'scorecard',
  'ficha de diagnóstico',
  'ficha de diagnostico',
] as const

/** Weak: product-price field in the Shopify audit, not a SKU rate card. */
const WEAK_PRICE_FIELD_HINTS = ['price', 'precio'] as const

function strongPricingHints(policy: ClassifyPolicy): string[] {
  const weak: Set<string> = new Set(WEAK_PRICE_FIELD_HINTS)
  return (policy.pricingHints || []).filter((hint) => !weak.has(hint.toLowerCase()))
}

export function isRateCardTurn(messages: GuideChatMessage[], policy: ClassifyPolicy): boolean {
  return scoreHints(lastUserText(messages), strongPricingHints(policy)) >= 1
}

function haystackIsStoreThread(messages: GuideChatMessage[], policy: ClassifyPolicy): boolean {
  const users = userHaystack(messages)
  return (
    scoreHints(users, policy.intentHints['store-os']) >= 1 ||
    /\bstore\s*-?\s*os\b/i.test(users) ||
    /\bshopify\b/i.test(users)
  )
}

/** Last turn is the catalog audit field (precio/peso/variantes), not "cuánto cuesta". */
export function isStoreAuditFieldTurn(
  messages: GuideChatMessage[],
  policy: ClassifyPolicy,
): boolean {
  if (isRateCardTurn(messages, policy)) return false
  const last = lastUserText(messages)
  const priceField = scoreHints(last, [...WEAK_PRICE_FIELD_HINTS]) >= 1
  const otherField = scoreHints(last, [...STORE_AUDIT_FIELD_HINTS]) >= 1
  if (priceField && otherField) return true
  if (!priceField && !otherField) return false
  if (haystackIsStoreThread(messages, policy)) return true
  return otherField && !priceField
}

/** Narrower than booking: only schedule-a-call phrasing, not "fit" / "qué más". */
export const DEFAULT_SCHEDULING_HINTS = [
  'agendar',
  'agende',
  'agendo',
  'agender',
  'llamada',
  'cita',
  'calendly',
] as const

export function isSchedulingTurn(messages: GuideChatMessage[]): boolean {
  return scoreHints(lastUserText(messages), [...DEFAULT_SCHEDULING_HINTS]) >= 1
}

export function schedulingGuideReply(
  locale: GuideLocale,
  url = 'https://calendly.com/rutinhq/30min',
): string {
  return locale === 'es'
    ? `Puede agendar una llamada de 30 minutos aquí: ${url}.`
    : `You can book a 30-minute call here: ${url}.`
}

/** Fit questions about a store / Shopify / ecommerce — skip the LLM. */
export function isStoreShopifyFitTurn(messages: GuideChatMessage[]): boolean {
  const t = lastUserText(messages).toLowerCase()
  const object =
    /\bshopify\b/.test(t) ||
    /\btienda(s)?\b/.test(t) ||
    /\be-?commerce\b/.test(t) ||
    /comercio electr[oó]nico/.test(t)
  const verb = /\bsirve\b/.test(t) || /\bfunciona\b/.test(t) || /\bme ayuda\b/.test(t)
  return object && verb
}

export function storeShopifyFitGuideReply(
  locale: GuideLocale,
  url = 'https://calendly.com/rutinhq/30min',
): string {
  return locale === 'es'
    ? `Sí. STORE OS audita y configura el panel de Shopify para que su tienda convierta antes de gastar en anuncios. Si encaja, agende 30 min: ${url}.`
    : `Yes. STORE OS audits and configures the Shopify admin so the store converts before you spend on ads. If it fits, book 30 min: ${url}.`
}

export type ComparedSku = 'gtm-os' | 'store-os' | 'nexus-os'

const SKU_NAME_RE: Record<ComparedSku, RegExp> = {
  'gtm-os': /\bgtm(\s*-?\s*os)?\b/i,
  'store-os': /\bstore(\s*-?\s*os)?\b/i,
  'nexus-os': /\bnexus(\s*-?\s*os)?\b/i,
}

const COMPARISON_CUE =
  /diferenc|distingu|versus|\bvs\.?\b|comparar|\bcompare\b|compared|difference|frente a|en qu[eé] se/i

const SKU_ONE_LINER: Record<ComparedSku, { en: string; es: string }> = {
  'gtm-os': {
    es: 'GTM OS es prospección en frío B2B que se queda con su equipo',
    en: 'GTM OS is B2B cold outbound the team keeps',
  },
  'store-os': {
    es: 'STORE OS audita y configura el panel de Shopify para que la tienda convierta antes de gastar en anuncios',
    en: 'STORE OS audits and configures the Shopify admin so the store converts before ads',
  },
  'nexus-os': {
    es: 'NEXUS OS es un sistema de marketing agéntico: Estrategia → Social → Ads; nada se publica ni se gasta sin aprobación explícita',
    en: 'NEXUS OS is agentic marketing: Strategy → Social → Ads; nothing publishes or spends without an explicit GO',
  },
}

export function namedGuideSkus(text: string): ComparedSku[] {
  const found: ComparedSku[] = []
  for (const key of ['gtm-os', 'store-os', 'nexus-os'] as const) {
    if (SKU_NAME_RE[key].test(text)) found.push(key)
  }
  return found
}

/** Two named SKUs plus a compare cue — skip the LLM so both sides survive the 80-word cap. */
export function isSkuComparisonTurn(messages: GuideChatMessage[]): boolean {
  const t = lastUserText(messages)
  return namedGuideSkus(t).length >= 2 && COMPARISON_CUE.test(t)
}

function comparisonPair(
  keys: ComparedSku[],
): 'gtm-nexus' | 'gtm-store' | 'store-nexus' | 'all' {
  const set = new Set(keys)
  if (set.size >= 3) return 'all'
  if (set.has('gtm-os') && set.has('nexus-os')) return 'gtm-nexus'
  if (set.has('gtm-os') && set.has('store-os')) return 'gtm-store'
  if (set.has('store-os') && set.has('nexus-os')) return 'store-nexus'
  return 'all'
}

function skuContrast(locale: GuideLocale, keys: ComparedSku[]): string {
  const pair = comparisonPair(keys)
  switch (pair) {
    case 'gtm-nexus':
      return locale === 'es'
        ? 'No son el mismo sistema: GTM OS cubre prospección en frío; NEXUS OS cubre demanda en redes.'
        : 'Different bottlenecks: cold outbound versus social demand.'
    case 'gtm-store':
      return locale === 'es'
        ? 'No son el mismo sistema: GTM OS cubre prospección en frío B2B; STORE OS cubre conversión en Shopify.'
        : 'Different bottlenecks: B2B cold outbound versus Shopify conversion.'
    case 'store-nexus':
      return locale === 'es'
        ? 'No son el mismo sistema: STORE OS cubre conversión en Shopify; NEXUS OS cubre demanda en redes.'
        : 'Different bottlenecks: Shopify conversion versus social demand.'
    case 'all':
      return locale === 'es'
        ? 'Cada sistema atiende un cuello distinto. Elija el que corresponde a su operación.'
        : 'One bottleneck, one system: pick the one that matches the operation.'
    default: {
      const _never: never = pair
      return _never
    }
  }
}

export function skuComparisonGuideReply(
  locale: GuideLocale,
  url = 'https://calendly.com/rutinhq/30min',
  skus?: ComparedSku[],
): string {
  const keys: ComparedSku[] = skus && skus.length >= 2 ? skus : ['gtm-os', 'nexus-os']
  const facts = keys.map((key) => SKU_ONE_LINER[key][locale]).join('. ')
  return ensureCalendlyCta(`${facts}. ${skuContrast(locale, keys)}`, locale, url)
}

function uniqueSku(
  ranked: { key: 'gtm-os' | 'store-os' | 'nexus-os'; n: number }[],
): RecommendedSku {
  const top = ranked[0]
  if (!top || top.n === 0) return 'unclear'
  if (ranked[1] && top.n === ranked[1].n) return 'unclear'
  return top.key
}

function rankKeys<K extends string>(
  text: string,
  policy: ClassifyPolicy,
  keys: readonly K[],
): { key: K; n: number }[] {
  return keys
    .map((key) => ({ key, n: scoreHints(text, policy.intentHints[key] || []) }))
    .sort((a, b) => b.n - a.n)
}

export function recommendSkuWithPolicy(
  messages: GuideChatMessage[],
  policy: ClassifyPolicy,
): RecommendedSku {
  if (isLeadsTurn(messages, policy)) return 'gtm-os'
  const lastSku = uniqueSku(rankKeys(lastUserText(messages), policy, ['gtm-os', 'store-os', 'nexus-os']))
  if (lastSku !== 'unclear') return lastSku
  // cita/agenda without a last-turn SKU: fit+Calendly — do not inherit STORE from earlier turns.
  if (isBookingTurn(messages, policy)) return 'unclear'
  return uniqueSku(rankKeys(userHaystack(messages), policy, ['gtm-os', 'store-os', 'nexus-os']))
}

export function classifyIntentWithPolicy(
  messages: GuideChatMessage[],
  policy: ClassifyPolicy,
): GuideIntent {
  const last = lastUserText(messages)
  const users = userHaystack(messages)
  if (scoreHints(last, policy.securityHints) >= 1) return 'security'
  if (scoreHints(last, policy.offTopicHints) >= 1 && scoreHints(last, catalogHints(policy)) === 0) {
    return 'offTopic'
  }
  // Last user turn wins: leads/outbound/prospecting is GTM OS, not a generic fit CTA.
  if (isLeadsTurn(messages, policy)) return 'gtm-os'
  if (isBookingTurn(messages, policy)) {
    const sku = uniqueSku(rankKeys(last, policy, ['gtm-os', 'store-os', 'nexus-os']))
    return sku === 'unclear' ? 'fit' : sku
  }
  if (isRateCardTurn(messages, policy)) return 'pricing'
  if (isStoreAuditFieldTurn(messages, policy)) return 'store-os'
  if (scoreHints(last, policy.pricingHints) >= 1) return 'pricing'
  const lastRanked = rankKeys(last, policy, ['gtm-os', 'store-os', 'nexus-os', 'catalog'] as const)
  if (lastRanked[0] && lastRanked[0].n > 0) {
    if (lastRanked[1] && lastRanked[0].n === lastRanked[1].n && lastRanked[0].n < 2) return 'unsure'
    return lastRanked[0].key
  }
  const ranked = rankKeys(users, policy, ['gtm-os', 'store-os', 'nexus-os', 'catalog'] as const)
  const top = ranked[0]
  if (!top || top.n === 0) return 'unsure'
  if (ranked[1] && top.n === ranked[1].n && top.n < 2) return 'unsure'
  return top.key
}

export function hasBuyingIntentWithPolicy(
  messages: GuideChatMessage[],
  policy: ClassifyPolicy,
): boolean {
  const last = lastUserText(messages)
  return (
    isLeadsTurn(messages, policy) ||
    isBookingTurn(messages, policy) ||
    scoreHints(last, policy.buyingIntentHints) >= 1
  )
}

/** Degraded reply key: last-turn intent wins. fit/unsure stay generic unless last turn named a SKU. */
export function resolveFallbackKey(intent: GuideIntent, recommended: RecommendedSku): string {
  if (intent === 'pricing' || intent === 'offTopic' || intent === 'security') return intent
  if (intent === 'gtm-os' || intent === 'store-os' || intent === 'nexus-os' || intent === 'catalog') {
    return intent
  }
  if (intent === 'fit' || intent === 'unsure') {
    return recommended === 'unclear' ? intent : recommended
  }
  return intent
}

export function ensureCalendlyCta(
  reply: string,
  locale: GuideLocale,
  url = 'https://calendly.com/rutinhq/30min',
): string {
  if (/calendly\.com\/rutinhq\/30min/i.test(reply)) return reply
  const cta =
    locale === 'es' ? `Si encaja, agende 30 min: ${url}.` : `If it fits, book 30 min: ${url}.`
  return `${reply.trim()} ${cta}`
}

export function skuTopic(sku: RecommendedSku, locale: GuideLocale): string {
  if (sku === 'gtm-os') return locale === 'es' ? 'Fit GTM OS' : 'GTM OS fit'
  if (sku === 'store-os') return locale === 'es' ? 'Fit STORE OS' : 'STORE OS fit'
  if (sku === 'nexus-os') return locale === 'es' ? 'Fit NEXUS OS' : 'NEXUS OS fit'
  return locale === 'es' ? 'Fit RutinHQ (SKU por confirmar)' : 'RutinHQ fit (SKU TBD)'
}
