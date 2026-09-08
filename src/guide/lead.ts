import { guidePolicy } from './config'
import {
  detectObjections,
  extractEmail,
  recommendSku,
  userQuestions,
} from './classify'
import type { GuideChatMessage, GuideLocale, LeadBrief } from './types'

function excerpt(messages: GuideChatMessage[], locale: GuideLocale): string {
  const user = locale === 'es' ? 'Visitante' : 'Visitor'
  const guide = locale === 'es' ? 'Guide' : 'Guide'
  return messages
    .slice(-8)
    .map((m) => `${m.role === 'user' ? user : guide}: ${m.content.trim()}`)
    .join('\n')
    .slice(0, 900)
}

function topicFromSku(sku: LeadBrief['recommendedSku'], locale: GuideLocale): string {
  if (sku === 'gtm-os') return locale === 'es' ? 'Fit GTM OS' : 'GTM OS fit'
  if (sku === 'store-os') return locale === 'es' ? 'Fit STORE OS' : 'STORE OS fit'
  if (sku === 'nexus-os') return locale === 'es' ? 'Fit NEXUS OS' : 'NEXUS OS fit'
  return locale === 'es' ? 'Fit RutinHQ (SKU por confirmar)' : 'RutinHQ fit (SKU TBD)'
}

export function nextStepCopy(locale: GuideLocale, url = guidePolicy.calendlyUrl): string {
  return locale === 'es'
    ? `Agendar 30 min de fit — ${url}`
    : `Book 30-min fit call — ${url}`
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
    nextStep: nextStepCopy(locale),
    transcriptExcerpt: excerpt(messages, locale),
    email: extractEmail(messages),
    page,
    locale,
  }
}

export function formatLeadMarkdown(brief: LeadBrief): string {
  const es = brief.locale === 'es'
  const none = es ? '- (ninguna capturada)' : '- (none captured)'
  const questions = brief.questionsAsked.map((q) => `- ${q}`).join('\n') || none
  const objections = brief.objections.map((o) => `- ${o}`).join('\n') || none
  return [
    `# ${es ? 'Brief de lead' : 'Lead brief'} — ${brief.topic}`,
    '',
    `- **${es ? 'SKU recomendado' : 'Recommended SKU'}:** ${brief.recommendedSku}`,
    `- **${es ? 'Página' : 'Page'}:** ${brief.page}`,
    `- **${es ? 'Idioma' : 'Locale'}:** ${brief.locale}`,
    brief.email
      ? `- **Email:** ${brief.email}`
      : `- **Email:** ${es ? '(no compartido)' : '(not shared)'}`,
    `- **${es ? 'Siguiente paso' : 'Next step'}:** ${brief.nextStep}`,
    '',
    `## ${es ? 'Preguntas' : 'Questions asked'}`,
    questions,
    '',
    `## ${es ? 'Objeciones' : 'Objections'}`,
    objections,
    '',
    `## ${es ? 'Extracto' : 'Transcript excerpt'}`,
    brief.transcriptExcerpt,
  ].join('\n')
}

export function leadMailtoHref(brief: LeadBrief): string {
  const prefix = brief.locale === 'es' ? 'Brief de lead' : 'Lead brief'
  const subject = `${prefix} — ${brief.topic}`
  const body = formatLeadMarkdown(brief).slice(0, 1600)
  return `mailto:${guidePolicy.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export function strategyMailtoHref(locale: GuideLocale): string {
  const subject =
    locale === 'es' ? 'Consulta desde RutinHQ Guide' : 'Question from RutinHQ Guide'
  const body =
    locale === 'es'
      ? 'Hola — quiero hablar de un sistema RutinHQ (GTM OS, STORE OS o NEXUS OS).\n'
      : 'Hi — I want to talk about a RutinHQ system (GTM OS, STORE OS, or NEXUS OS).\n'
  return `mailto:${guidePolicy.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export function leadJson(brief: LeadBrief): string {
  return JSON.stringify(brief, null, 2)
}
