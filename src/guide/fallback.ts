import { classifyIntent, recommendSku } from './classify'
import {
  ensureCalendlyCta,
  isSchedulingTurn,
  isSkuComparisonTurn,
  isStoreShopifyFitTurn,
  lastUserText,
  namedGuideSkus,
  resolveFallbackKey,
  schedulingGuideReply,
  skuComparisonGuideReply,
  storeShopifyFitGuideReply,
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
  if (isStoreShopifyFitTurn(messages)) {
    return storeShopifyFitGuideReply(locale, guidePolicy.calendlyUrl)
  }
  if (isSkuComparisonTurn(messages)) {
    return skuComparisonGuideReply(
      locale,
      guidePolicy.calendlyUrl,
      namedGuideSkus(lastUserText(messages)),
    )
  }
  const key = resolveFallbackKey(classifyIntent(messages), recommendSku(messages))
  return ensureCalendlyCta(fallbackReply(key, locale), locale, guidePolicy.calendlyUrl)
}
