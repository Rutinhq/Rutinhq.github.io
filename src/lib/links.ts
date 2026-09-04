export const CALENDLY_URL = 'https://calendly.com/rutinhq/30min'
export const EMAIL = 'rutinhqsolutions@gmail.com'
export const DOCS_URL = 'https://docs.rutinhq.com'
export const ONE_PAGER_URL =
  'https://app.notion.com/p/3d0e84e8546a81f88107e5a8ea2adc5a'

function mailto(subject: string) {
  return `mailto:${EMAIL}?subject=${subject}`
}

export const MAILTO_HUB = mailto('RutinHQ')
export const MAILTO_GTM = mailto('GTM%20OS')
export const MAILTO_STORE = mailto('Store%20OS')
export const MAILTO_NEXUS = mailto('NEXUS%20OS')
