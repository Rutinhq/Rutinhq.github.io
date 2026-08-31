/// <reference types="vite/client" />

declare module 'virtual:content' {
  type LocaleText = { en: string; es: string }

  export const home: {
    integrations: { name: string }[]
    pillars: { number: string; titleKey: string; bodyKey: string }[]
  }

  export const services: {
    hero: { eyebrowKey: string; headlineKey: string; subheadKey: string }
    items: {
      number: string
      title: LocaleText
      tagline: LocaleText
      description: LocaleText
      deliverables: { en: string[]; es: string[] }
      tools: string[]
      outcome: LocaleText
    }[]
    process: {
      number: string
      title: LocaleText
      body: LocaleText
    }[]
  }

  export const case_studies: {
    studies: {
      id: string
      industry: LocaleText
      challenge: LocaleText
      solution: LocaleText
      metrics: { value: string; label: LocaleText }[]
    }[]
  }
}
