import { classifyIntent } from './classify'
import { fallbackReply } from './config'
import type { GuideChatMessage, GuideLocale } from './types'

export function localGuideReply(
  messages: GuideChatMessage[],
  locale: GuideLocale,
  degraded = false,
): string {
  const intent = classifyIntent(messages)
  const prefix = degraded ? `${fallbackReply('degraded', locale)}\n\n` : ''
  return `${prefix}${fallbackReply(intent, locale)}`
}
