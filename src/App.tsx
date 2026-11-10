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
export const AgentsPage = lazyPage(() => import('@/pages/agents'))
export const AgentsAuthPage = lazyPage(() => import('@/pages/agents-auth'))
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
  AgentsPage,
  AgentsAuthPage,
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
  '/agents': AgentsPage,
  '/es/agents': AgentsPage,
  '/agents/auth': AgentsAuthPage,
  '/es/agents/auth': AgentsAuthPage,
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
        <Route path="/agents" element={<AgentsPage />} />
        <Route path="/es/agents" element={<AgentsPage />} />
        <Route path="/agents/auth" element={<AgentsAuthPage />} />
        <Route path="/es/agents/auth" element={<AgentsAuthPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
