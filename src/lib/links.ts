export const EMAIL = 'strategy@rutinhq.com'
export const CALENDLY_URL = 'https://calendly.com/rutinhq/30min'
export const MAILTO_EMAIL = `mailto:${EMAIL}`
export const SITE_URL = 'https://www.rutinhq.com'
export const WWW_GTM_URL = `${SITE_URL}/gtm-os`
export const WWW_STORE_URL = `${SITE_URL}/store-os`
export const WWW_NEXUS_URL = `${SITE_URL}/nexus-os`
export const DOCS_URL = 'https://docs.rutinhq.com/'
export const DOCS_CATALOG_URL = 'https://docs.rutinhq.com/catalog/'
export const DOCS_GTM_URL = 'https://docs.rutinhq.com/catalog/gtm-os/'
export const DOCS_STORE_URL = 'https://docs.rutinhq.com/catalog/store-os/'
export const DOCS_NEXUS_URL = 'https://docs.rutinhq.com/catalog/nexus-os/'
export const ONE_PAGER_URL =
  'https://app.notion.com/p/3d0e84e8546a81f88107e5a8ea2adc5a'

function mailto(subject: string) {
  return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}`
}

export const MAILTO_HUB = mailto('RutinHQ')
export const MAILTO_GTM = mailto('GTM OS — fit call')
export const MAILTO_STORE = mailto('STORE OS — fit call')
export const MAILTO_NEXUS = mailto('NEXUS OS — fit call')
