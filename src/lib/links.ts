export const EMAIL = 'strategy@rutinhq.com'
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
export const MAILTO_STORE = mailto('Store OS — fit call')
export const MAILTO_NEXUS = mailto('NEXUS OS — fit call')
