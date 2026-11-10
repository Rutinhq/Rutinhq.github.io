import { classifyIntent, recommendSku } from './classify'
import {
  ensureCalendlyCta,
  isSchedulingTurn,
  resolveFallbackKey,
  schedulingGuideReply,
} from './classify-core'
import { fallbackReply, guidePolicy } from './config'
import type { GuideChatMessage, GuideLocale } from './types'

export function localGuideReply(
  messages: GuideChatMessage[],
  locale: GuideLocale,
): string {
  if (isSchedulingTurn(messages)) {
    return schedulingGuideReply(locale, guidePolicy.calendlyUrl)
  }
  const key = resolveFallbackKey(classifyIntent(messages), recommendSku(messages))
  return ensureCalendlyCta(fallbackReply(key, locale), locale, guidePolicy.calendlyUrl)
}
