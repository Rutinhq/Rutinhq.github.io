import { normalizePathname } from '@/lib/i18n/paths'
import policyJson from './policy.json'
import type { GuideLocale, GuidePolicy } from './types'

/** Single control file for CORTEX: prompt, allowlist, limits, CTAs. */
export const guidePolicy = policyJson as GuidePolicy

export const GUIDE_UI_NAME = guidePolicy.uiName
export const GUIDE_CALENDLY_URL = guidePolicy.calendlyUrl
export const GUIDE_EMAIL = guidePolicy.email
export const GUIDE_LIMITS = guidePolicy.limits
export const GUIDE_SYSTEM_PROMPT = guidePolicy.systemPrompt
export const GUIDE_ALLOWLIST_URLS = guidePolicy.allowlistUrls
export const GUIDE_WIDGET_PATHS = guidePolicy.widgetPaths

export function isGuideWidgetPath(pathname: string): boolean {
  return guidePolicy.widgetPaths.includes(normalizePathname(pathname))
}

export function fallbackReply(
  key: string,
  locale: GuideLocale,
): string {
  const pack = guidePolicy.fallbackReplies[key] ?? guidePolicy.fallbackReplies.unsure
  return (locale === 'es' ? pack?.es : pack?.en) ?? guidePolicy.fallbackReplies.unsure?.[locale === 'es' ? 'es' : 'en'] ?? guidePolicy.fallbackReplies.unsure.en
}

export function knowledgeBlock(documents: { title: string; url: string; text: string }[]) {
  return documents
    .map((doc) => `### ${doc.title}\nSource: ${doc.url}\n${doc.text}`)
    .join('\n\n')
    .slice(0, 14_000)
}
