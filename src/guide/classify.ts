import {
  classifyIntentWithPolicy,
  hasBuyingIntentWithPolicy,
  recommendSkuWithPolicy,
} from './classify-core'
import { guidePolicy } from './config'
import { isSecurityProbe } from './security'
import type { GuideChatMessage, GuideIntent, RecommendedSku } from './types'

export function classifyIntent(messages: GuideChatMessage[]): GuideIntent {
  if (isSecurityProbe(messages)) return 'security'
  return classifyIntentWithPolicy(messages, guidePolicy)
}

export function recommendSku(messages: GuideChatMessage[]): RecommendedSku {
  return recommendSkuWithPolicy(messages, guidePolicy)
}

export function hasBuyingIntent(messages: GuideChatMessage[]): boolean {
  return hasBuyingIntentWithPolicy(messages, guidePolicy)
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
