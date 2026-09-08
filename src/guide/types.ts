export type GuideLocale = 'en' | 'es'
export type GuideSku = 'gtm-os' | 'store-os' | 'nexus-os'
export type RecommendedSku = GuideSku | 'unclear'
export type GuideIntent =
  | GuideSku
  | 'catalog'
  | 'pricing'
  | 'security'
  | 'offTopic'
  | 'unsure'

export type GuideRole = 'user' | 'assistant'

export type GuideChatMessage = {
  role: GuideRole
  content: string
}

export type LeadBrief = {
  topic: string
  questionsAsked: string[]
  objections: string[]
  recommendedSku: RecommendedSku
  nextStep: string
  transcriptExcerpt: string
  email?: string
  page: string
  locale: GuideLocale
}

export type GuideKbDocument = {
  id: string
  url: string
  title: string
  text: string
  source: 'mirror' | 'locale' | 'crawl'
}

export type GuideKb = {
  builtAt: string
  documents: GuideKbDocument[]
  sources: { url: string; ok: boolean; source: GuideKbDocument['source'] }[]
  policy: GuidePolicy
}

export type GuidePolicy = {
  uiName: string
  calendlyUrl: string
  email: string
  widgetPaths: string[]
  allowlistUrls: string[]
  allowlistHosts: string[]
  limits: {
    maxMessagesPerSession: number
    maxInputChars: number
    maxReplyTokens: number
    maxBodyBytes: number
    rateLimitWindowMs: number
    rateLimitMax: number
  }
  skus: GuideSku[]
  intentHints: Record<string, string[]>
  buyingIntentHints: string[]
  offTopicHints: string[]
  pricingHints: string[]
  securityHints: string[]
  systemPrompt: string
  fallbackReplies: Record<string, { en: string; es: string }>
}

export type GuideApiRequest = {
  messages: GuideChatMessage[]
  locale: GuideLocale
  page: string
}

export type GuideApiResponse = {
  reply: string
  mode: 'live' | 'degraded'
  leadBrief?: LeadBrief
  calendlyUrl: string
}

export type GuideEnv = {
  GUIDE_LLM_API_KEY?: string
  GUIDE_LLM_BASE_URL?: string
  GUIDE_LLM_MODEL?: string
  GUIDE_LEAD_WEBHOOK_URL?: string
}
