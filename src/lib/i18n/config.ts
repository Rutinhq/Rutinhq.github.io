export const supportedLanguages = ['en', 'es'] as const
export type SupportedLanguage = (typeof supportedLanguages)[number]
export const defaultLanguage: SupportedLanguage = 'en'
