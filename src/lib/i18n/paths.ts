import { useLocation } from 'react-router-dom'
import type { SupportedLanguage } from './config'

export type PageLocale = SupportedLanguage
export type SkuSlug = 'gtm-os' | 'store-os' | 'nexus-os'

export const HUB_PATHS = { en: '/', es: '/es' } as const
export const GTM_PATHS = { en: '/gtm-os', es: '/es/gtm-os' } as const
export const STORE_PATHS = { en: '/store-os', es: '/es/store-os' } as const
export const NEXUS_PATHS = { en: '/nexus-os', es: '/es/nexus-os' } as const
export const BLOG_PATHS = { en: '/blog', es: '/es/blog' } as const
export const ARTICLE01_PATHS = {
  en: '/blog/icp-gated-cold-outbound-without-rented-sdr',
  es: '/es/blog/outbound-frio-con-icp-sin-sdr-rentado',
} as const

const ARTICLE_PAIRS = [ARTICLE01_PATHS] as const

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

export function hubPath(lang: PageLocale): string {
  return HUB_PATHS[lang]
}

export function skuPath(sku: SkuSlug, lang: PageLocale): string {
  return withLocale(`/${sku}`, lang)
}

export function useLocale() {
  const { pathname } = useLocation()
  const lang = languageFromPathname(pathname)
  return {
    lang,
    isEs: lang === 'es',
    hubPath: withLocale('/', lang),
    blogPath: withLocale('/blog', lang),
    skuPath: (sku: SkuSlug) => skuPath(sku, lang),
    localePath: (next: PageLocale) => localePath(pathname, next),
  }
}
