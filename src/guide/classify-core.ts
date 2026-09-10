import type { GuideChatMessage, GuideIntent, GuideLocale, RecommendedSku } from './types'

export type ClassifyPolicy = {
  intentHints: Record<string, string[]>
  offTopicHints: string[]
  pricingHints: string[]
  bookingHints?: string[]
  buyingIntentHints?: string[]
  securityHints?: string[]
}

/** cita/agenda/fit/leads must beat pricingHints even if the thread mentioned price. */
export const DEFAULT_BOOKING_HINTS = [
  'cita',
  'agenda',
  'agendar',
  'schedule',
  'calendly',
  'fit',
  'gtm-fit',
  'gtm fit',
  'leads',
  'llamada',
  'book',
  'booking',
  'qué más',
  'que mas',
  'what else',
  'tell me more',
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

export function isBookingTurn(messages: GuideChatMessage[], policy: ClassifyPolicy): boolean {
  return scoreHints(lastUserText(messages), bookingHintsOf(policy)) >= 1
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
  const prior = isBookingTurn(messages, policy) ? messages.slice(0, -1) : messages
  const hay = userHaystack(prior).trim() ? userHaystack(prior) : userHaystack(messages)
  const ranked = rankKeys(hay, policy, ['gtm-os', 'store-os', 'nexus-os'] as const)
  const top = ranked[0]
  if (!top || top.n === 0) return 'unclear'
  if (ranked[1] && top.n === ranked[1].n) return 'unclear'
  return top.key
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
  if (isBookingTurn(messages, policy)) {
    const sku = recommendSkuWithPolicy(messages, policy)
    return sku === 'unclear' ? 'fit' : sku
  }
  if (scoreHints(last, policy.pricingHints) >= 1) return 'pricing'
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
  return isBookingTurn(messages, policy) || scoreHints(last, policy.buyingIntentHints) >= 1
}

/** Degraded reply key: booking/unsure keep the conversation SKU instead of a price/catalog loop. */
export function resolveFallbackKey(intent: GuideIntent, recommended: RecommendedSku): string {
  if (intent === 'pricing' || intent === 'offTopic' || intent === 'security') return intent
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
