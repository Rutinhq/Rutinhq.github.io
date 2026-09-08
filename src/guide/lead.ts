import { guidePolicy } from './config'
import {
  detectObjections,
  extractEmail,
  recommendSku,
  userQuestions,
} from './classify'
import type { GuideChatMessage, GuideLocale, LeadBrief } from './types'

function excerpt(messages: GuideChatMessage[]): string {
  return messages
    .slice(-8)
    .map((m) => `${m.role === 'user' ? 'Visitor' : 'Guide'}: ${m.content.trim()}`)
    .join('\n')
    .slice(0, 900)
}

function topicFromSku(sku: LeadBrief['recommendedSku'], locale: GuideLocale): string {
  if (sku === 'gtm-os') return locale === 'es' ? 'Fit GTM OS' : 'GTM OS fit'
  if (sku === 'store-os') return locale === 'es' ? 'Fit STORE OS' : 'STORE OS fit'
  if (sku === 'nexus-os') return locale === 'es' ? 'Fit NEXUS OS' : 'NEXUS OS fit'
  return locale === 'es' ? 'Fit RutinHQ (SKU por confirmar)' : 'RutinHQ fit (SKU TBD)'
}

export function buildLeadBrief(
  messages: GuideChatMessage[],
  page: string,
  locale: GuideLocale,
): LeadBrief {
  const recommendedSku = recommendSku(messages)
  return {
    topic: topicFromSku(recommendedSku, locale),
    questionsAsked: userQuestions(messages),
    objections: detectObjections(messages),
    recommendedSku,
    nextStep: `Book 30-min fit call — ${guidePolicy.calendlyUrl}`,
    transcriptExcerpt: excerpt(messages),
    email: extractEmail(messages),
    page,
    locale,
  }
}

export function formatLeadMarkdown(brief: LeadBrief): string {
  const questions = brief.questionsAsked.map((q) => `- ${q}`).join('\n') || '- (none captured)'
  const objections = brief.objections.map((o) => `- ${o}`).join('\n') || '- (none captured)'
  return [
    `# Lead brief — ${brief.topic}`,
    '',
    `- **Recommended SKU:** ${brief.recommendedSku}`,
    `- **Page:** ${brief.page}`,
    `- **Locale:** ${brief.locale}`,
    brief.email ? `- **Email:** ${brief.email}` : '- **Email:** (not shared)',
    `- **Next step:** ${brief.nextStep}`,
    '',
    '## Questions asked',
    questions,
    '',
    '## Objections',
    objections,
    '',
    '## Transcript excerpt',
    brief.transcriptExcerpt,
  ].join('\n')
}

export function leadMailtoHref(brief: LeadBrief): string {
  const subject = `Lead brief — ${brief.topic}`
  const body = formatLeadMarkdown(brief).slice(0, 1600)
  return `mailto:${guidePolicy.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export function leadJson(brief: LeadBrief): string {
  return JSON.stringify(brief, null, 2)
}
