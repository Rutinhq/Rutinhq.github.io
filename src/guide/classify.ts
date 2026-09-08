import { guidePolicy } from './config'
import type { GuideChatMessage, GuideIntent, GuideSku, RecommendedSku } from './types'

function haystack(messages: GuideChatMessage[]): string {
  return messages.map((m) => m.content).join('\n').toLowerCase()
}

function scoreHints(text: string, hints: string[]): number {
  return hints.reduce((score, hint) => {
    return text.includes(hint.toLowerCase()) ? score + 1 : score
  }, 0)
}

export function classifyIntent(messages: GuideChatMessage[]): GuideIntent {
  const text = haystack(messages)
  const onTopicHits =
    scoreHints(text, guidePolicy.intentHints['gtm-os'] ?? []) +
    scoreHints(text, guidePolicy.intentHints['store-os'] ?? []) +
    scoreHints(text, guidePolicy.intentHints['nexus-os'] ?? []) +
    scoreHints(text, guidePolicy.intentHints.catalog ?? [])
  if (scoreHints(text, guidePolicy.offTopicHints) >= 1 && onTopicHits === 0) {
    return 'offTopic'
  }
  if (scoreHints(text, guidePolicy.pricingHints) >= 1) return 'pricing'

  const ranked: { key: GuideSku | 'catalog'; score: number }[] = (
    ['gtm-os', 'store-os', 'nexus-os', 'catalog'] as const
  ).map((key) => ({
    key,
    score: scoreHints(text, guidePolicy.intentHints[key] ?? []),
  }))
  ranked.sort((a, b) => b.score - a.score)
  const top = ranked[0]
  if (!top || top.score === 0) return 'unsure'
  if (ranked[1] && top.score === ranked[1].score && top.score < 2) return 'unsure'
  return top.key
}

export function recommendSku(messages: GuideChatMessage[]): RecommendedSku {
  const intent = classifyIntent(messages)
  if (intent === 'gtm-os' || intent === 'store-os' || intent === 'nexus-os') return intent
  return 'unclear'
}

export function hasBuyingIntent(messages: GuideChatMessage[]): boolean {
  const text = haystack(messages)
  return scoreHints(text, guidePolicy.buyingIntentHints) >= 1
}

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i

export function extractEmail(messages: GuideChatMessage[]): string | undefined {
  for (const message of [...messages].reverse()) {
    const match = message.content.match(EMAIL_RE)
    if (match) return match[0]
  }
  return undefined
}

export function shouldCaptureLead(messages: GuideChatMessage[]): boolean {
  return Boolean(extractEmail(messages) || hasBuyingIntent(messages))
}

export function userQuestions(messages: GuideChatMessage[]): string[] {
  return messages
    .filter((m) => m.role === 'user')
    .map((m) => m.content.trim())
    .filter(Boolean)
    .slice(-6)
}

export function detectObjections(messages: GuideChatMessage[]): string[] {
  const cues = [
    'too expensive',
    'not sure',
    'already have',
    'later',
    'just looking',
    'caro',
    'no estoy seguro',
    'ya tenemos',
    'solo miro',
    'garantia',
    'guarantee',
  ]
  const found = new Set<string>()
  for (const message of messages) {
    if (message.role !== 'user') continue
    const lower = message.content.toLowerCase()
    for (const cue of cues) {
      if (lower.includes(cue)) found.add(message.content.trim().slice(0, 180))
    }
  }
  return [...found].slice(0, 5)
}
