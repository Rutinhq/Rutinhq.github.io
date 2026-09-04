export const supportedLanguages = ['es', 'en'] as const
export type SupportedLanguage = (typeof supportedLanguages)[number]
export const defaultLanguage: SupportedLanguage = 'es'
