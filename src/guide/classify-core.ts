import type { GuideChatMessage, GuideIntent, GuideLocale, RecommendedSku } from './types'

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
    locale === 'es' ? `Siguiente paso: agenda 30 min — ${url}` : `Next step: book 30 min — ${url}`
  return `${reply.trim()} ${cta}`
}

export function skuTopic(sku: RecommendedSku, locale: GuideLocale): string {
  if (sku === 'gtm-os') return locale === 'es' ? 'Fit GTM OS' : 'GTM OS fit'
  if (sku === 'store-os') return locale === 'es' ? 'Fit STORE OS' : 'STORE OS fit'
  if (sku === 'nexus-os') return locale === 'es' ? 'Fit NEXUS OS' : 'NEXUS OS fit'
  return locale === 'es' ? 'Fit RutinHQ (SKU por confirmar)' : 'RutinHQ fit (SKU TBD)'
}
