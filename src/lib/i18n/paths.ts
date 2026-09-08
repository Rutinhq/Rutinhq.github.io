export type PageLocale = 'en' | 'es'

const ARTICLE_PAIRS = [
  {
    en: '/blog/icp-gated-cold-outbound-without-rented-sdr',
    es: '/es/blog/outbound-frio-con-icp-sin-sdr-rentado',
  },
] as const

export function normalizePathname(pathname: string): string {
  const trimmed = pathname.split('?')[0]?.replace(/\/$/, '') ?? ''
  return trimmed === '' ? '/' : trimmed
}

export function languageFromPathname(pathname: string): PageLocale {
  const path = normalizePathname(pathname)
  return path === '/es' || path.startsWith('/es/') ? 'es' : 'en'
}

export function stripLocalePrefix(pathname: string): string {
  const path = normalizePathname(pathname)
  if (path === '/es') return '/'
  if (path.startsWith('/es/')) return path.slice(3) || '/'
  return path
}

export function withLocale(pathname: string, lang: PageLocale): string {
  const bare = stripLocalePrefix(pathname)
  if (lang === 'en') return bare
  return bare === '/' ? '/es' : `/es${bare}`
}

/** Map the current URL onto the same page in `lang`. Article slugs differ by locale. */
export function localePath(pathname: string, lang: PageLocale): string {
  const normalized = normalizePathname(pathname)
  for (const pair of ARTICLE_PAIRS) {
    if (normalized === pair.en || normalized === pair.es) return pair[lang]
  }
  return withLocale(normalized, lang)
}
