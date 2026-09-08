import { fallbackReply, guidePolicy } from './config'
import type { GuideChatMessage, GuideLocale } from './types'

const HARDCODED_SECURITY_HINTS = [
  'password',
  'contraseña',
  'contrasena',
  'api key',
  'apikey',
  'api-key',
  'access token',
  'secret key',
  'admin secret',
  'shopify token',
  'shopify secret',
  'private key',
  'credencial',
  'credentials',
  'cuenta bancaria',
  'bank account',
  'routing number',
  'workspace id',
  'private ops',
  'day-of ops',
  'internal notion',
  'notion interno',
  'correo interno',
  'email privado',
  'private email',
  'capo',
  'fuzzyflags',
  'fzf',
  'faa',
  'banorte',
  'clabe',
  'saldo',
  'notion',
] as const

const LEAK_RE =
  /\b(capo|fuzzyflags|fzf|banorte|faa|clabe|password|api[-\s]?key|contraseña)\b/i

function escapeRe(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Phrase match, or word-boundary for single tokens (avoids "admin" false hits). */
export function hintMatches(hay: string, hint: string): boolean {
  const text = hay.toLowerCase()
  const h = hint.toLowerCase()
  if (!h) return false
  if (h.includes(' ')) return text.includes(h)
  return new RegExp(`(?:^|[^a-z0-9_])${escapeRe(h)}(?:[^a-z0-9_]|$)`).test(text)
}

export function securityHints(): string[] {
  const fromPolicy = guidePolicy.securityHints
  if (Array.isArray(fromPolicy) && fromPolicy.length > 0) return fromPolicy
  return [...HARDCODED_SECURITY_HINTS]
}

export function isSecurityText(text: string, hints = securityHints()): boolean {
  return hints.some((hint) => hintMatches(text, hint))
}

export function isSecurityProbe(messages: GuideChatMessage[]): boolean {
  const hay = messages.map((m) => m.content).join('\n')
  return isSecurityText(hay)
}

export function securityReply(locale: GuideLocale): string {
  return fallbackReply('security', locale)
}

export function replyLeaksPrivate(text: string): boolean {
  return LEAK_RE.test(text)
}

export function enforceSafeReply(reply: string, locale: GuideLocale): string {
  if (replyLeaksPrivate(reply)) return securityReply(locale)
  return reply
}
