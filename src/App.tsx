import { Route, Routes } from 'react-router-dom'
import { RootLayout } from '@/layouts/RootLayout'
import { lazyPage } from '@/lib/lazyPage'
import { normalizePathname } from '@/lib/i18n/paths'

export const HubPage = lazyPage(() => import('@/pages/index'))
export const GtmOsPage = lazyPage(() => import('@/pages/gtm-os'))
export const StoreOsPage = lazyPage(() => import('@/pages/store-os'))
export const NexusOsPage = lazyPage(() => import('@/pages/nexus-os'))
export const BlogPage = lazyPage(() => import('@/pages/blog'))
export const BlogEsPage = lazyPage(() => import('@/pages/blog-es'))
export const BlogIcpGatedColdOutboundPage = lazyPage(
  () => import('@/pages/blog-icp-gated-cold-outbound'),
)
export const BlogStoreOsAdminAuditPage = lazyPage(
  () => import('@/pages/blog-store-os-admin-audit'),
)
export const BlogOutboundFrioPage = lazyPage(
  () => import('@/pages/blog-outbound-frio'),
)
export const BlogAuditoriaPanelShopifyPage = lazyPage(
  () => import('@/pages/blog-auditoria-panel-shopify'),
)
export const BlogNexusPaperFirstPage = lazyPage(
  () => import('@/pages/blog-nexus-paper-first'),
)
export const BlogMarketingAgenticoPapelPage = lazyPage(
  () => import('@/pages/blog-marketing-agentico-papel'),
)
export const AgentsPage = lazyPage(() => import('@/pages/agents'))
export const AgentsAuthPage = lazyPage(() => import('@/pages/agents-auth'))
export const GtmOsOfferPage = lazyPage(() => import('@/pages/gtm-os-offer'))
export const NotFoundPage = lazyPage(() => import('@/pages/not-found'))

const pages = [
  HubPage,
  GtmOsPage,
  StoreOsPage,
  NexusOsPage,
  BlogPage,
  BlogEsPage,
  BlogIcpGatedColdOutboundPage,
  BlogStoreOsAdminAuditPage,
  BlogOutboundFrioPage,
  BlogAuditoriaPanelShopifyPage,
  BlogNexusPaperFirstPage,
  BlogMarketingAgenticoPapelPage,
  AgentsPage,
  AgentsAuthPage,
  GtmOsOfferPage,
  NotFoundPage,
]

const pageByPath: Record<string, (typeof pages)[number]> = {
  '/': HubPage,
  '/es': HubPage,
  '/gtm-os': GtmOsPage,
  '/es/gtm-os': GtmOsPage,
  '/store-os': StoreOsPage,
  '/es/store-os': StoreOsPage,
  '/nexus-os': NexusOsPage,
  '/es/nexus-os': NexusOsPage,
  '/blog': BlogPage,
  '/es/blog': BlogEsPage,
  '/blog/icp-gated-cold-outbound-without-rented-sdr': BlogIcpGatedColdOutboundPage,
  '/blog/shopify-admin-audit-before-ads': BlogStoreOsAdminAuditPage,
  '/es/blog/outbound-frio-con-icp-sin-sdr-rentado': BlogOutboundFrioPage,
  '/es/blog/auditoria-panel-shopify-antes-de-anuncios':
    BlogAuditoriaPanelShopifyPage,
  '/blog/agentic-marketing-paper-first-before-ads': BlogNexusPaperFirstPage,
  '/es/blog/marketing-agentico-en-papel-antes-de-anuncios':
    BlogMarketingAgenticoPapelPage,
  '/agents': AgentsPage,
  '/es/agents': AgentsPage,
  '/agents/auth': AgentsAuthPage,
  '/es/agents/auth': AgentsAuthPage,
  '/gtm-os/offer': GtmOsOfferPage,
  '/es/gtm-os/offer': GtmOsOfferPage,
}

export async function resolveAllPages() {
  await Promise.all(pages.map((page) => page.preload()))
}

export async function resolvePageForPath(pathname: string) {
  const path = normalizePathname(pathname)
  const page = pageByPath[path] ?? NotFoundPage
  await page.preload()
}

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<HubPage />} />
        <Route path="/es" element={<HubPage />} />
        <Route path="/gtm-os" element={<GtmOsPage />} />
        <Route path="/es/gtm-os" element={<GtmOsPage />} />
        <Route path="/store-os" element={<StoreOsPage />} />
        <Route path="/es/store-os" element={<StoreOsPage />} />
        <Route path="/nexus-os" element={<NexusOsPage />} />
        <Route path="/es/nexus-os" element={<NexusOsPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route
          path="/blog/icp-gated-cold-outbound-without-rented-sdr"
          element={<BlogIcpGatedColdOutboundPage />}
        />
        <Route
          path="/blog/shopify-admin-audit-before-ads"
          element={<BlogStoreOsAdminAuditPage />}
        />
        <Route path="/es/blog" element={<BlogEsPage />} />
        <Route
          path="/es/blog/outbound-frio-con-icp-sin-sdr-rentado"
          element={<BlogOutboundFrioPage />}
        />
        <Route
          path="/es/blog/auditoria-panel-shopify-antes-de-anuncios"
          element={<BlogAuditoriaPanelShopifyPage />}
        />
        <Route
          path="/blog/agentic-marketing-paper-first-before-ads"
          element={<BlogNexusPaperFirstPage />}
        />
        <Route
          path="/es/blog/marketing-agentico-en-papel-antes-de-anuncios"
          element={<BlogMarketingAgenticoPapelPage />}
        />
        <Route path="/agents" element={<AgentsPage />} />
        <Route path="/es/agents" element={<AgentsPage />} />
        <Route path="/agents/auth" element={<AgentsAuthPage />} />
        <Route path="/es/agents/auth" element={<AgentsAuthPage />} />
        <Route path="/gtm-os/offer" element={<GtmOsOfferPage />} />
        <Route path="/es/gtm-os/offer" element={<GtmOsOfferPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
