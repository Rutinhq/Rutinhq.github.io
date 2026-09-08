import { classifyIntent } from './classify'
import { fallbackReply } from './config'
import type { GuideChatMessage, GuideLocale } from './types'

export function localGuideReply(
  messages: GuideChatMessage[],
  locale: GuideLocale,
): string {
  return fallbackReply(classifyIntent(messages), locale)
}
