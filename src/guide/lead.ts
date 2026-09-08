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

/** Long markdown bodies blow past mobile mailto limits (~2k encoded). Cap the href. */
export const LEAD_MAILTO_HREF_MAX = 1200

function leadSubject(brief: LeadBrief): string {
  const prefix = brief.locale === 'es' ? 'Brief de lead' : 'Lead brief'
  return `${prefix} — ${brief.topic}`
}

export function capMailtoHref(href: string, max = LEAD_MAILTO_HREF_MAX): string {
  if (href.length <= max) return href
  const match = href.match(/^(mailto:[^?]+\?subject=[^&]+&body=)(.*)$/)
  if (!match) return href.slice(0, max)
  const header = match[1]
  const budget = max - header.length
  if (budget < 24) return href.slice(0, max)
  let body = ''
  try {
    body = decodeURIComponent(match[2])
  } catch {
    body = match[2]
  }
  while (encodeURIComponent(body).length > budget && body.length > 24) {
    body = `${body.slice(0, Math.max(24, body.length - 80))}\n…`
  }
  return `${header}${encodeURIComponent(body)}`
}

/** Short mailto after clipboard copy — subject + 2–3 lines, not the full brief. */
export function leadShortMailtoHref(brief: LeadBrief): string {
  const subject = leadSubject(brief)
  const body =
    brief.locale === 'es'
      ? `Hola — el brief completo está en el portapapeles. Pégalo debajo de esta línea y envíalo a strategy@.\n\nSKU: ${brief.recommendedSku}\nPágina: ${brief.page}\n`
      : `Hi — the full brief is on the clipboard. Paste it below this line and send it to strategy@.\n\nSKU: ${brief.recommendedSku}\nPage: ${brief.page}\n`
  return capMailtoHref(
    `mailto:${guidePolicy.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
  )
}

/** Full brief in the body, truncated so the href stays under LEAD_MAILTO_HREF_MAX. */
export function leadSafeMailtoHref(brief: LeadBrief): string {
  const subject = leadSubject(brief)
  const body = formatLeadMarkdown(brief)
  const href = `mailto:${guidePolicy.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  return capMailtoHref(href)
}

/** Backward-compatible alias — never emit an uncapped long mailto. */
export function leadMailtoHref(brief: LeadBrief): string {
  return leadSafeMailtoHref(brief)
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
