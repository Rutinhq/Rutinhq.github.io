import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { RootLayout } from '@/layouts/RootLayout'
import { normalizePathname } from '@/lib/i18n/paths'
import { resolveLazy } from '@/lib/resolveLazy'

export const HubPage = lazy(() => import('@/pages/index'))
export const GtmOsPage = lazy(() => import('@/pages/gtm-os'))
export const StoreOsPage = lazy(() => import('@/pages/store-os'))
export const NexusOsPage = lazy(() => import('@/pages/nexus-os'))
export const BlogPage = lazy(() => import('@/pages/blog'))
export const BlogEsPage = lazy(() => import('@/pages/blog-es'))
export const BlogIcpGatedColdOutboundPage = lazy(
  () => import('@/pages/blog-icp-gated-cold-outbound'),
)
export const BlogStoreOsAdminAuditPage = lazy(
  () => import('@/pages/blog-store-os-admin-audit'),
)
export const BlogOutboundFrioPage = lazy(() => import('@/pages/blog-outbound-frio'))
export const AgentsPage = lazy(() => import('@/pages/agents'))
export const AgentsAuthPage = lazy(() => import('@/pages/agents-auth'))
export const NotFoundPage = lazy(() => import('@/pages/not-found'))

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

export async function resolveAllPages() {
  await Promise.all(pages.map((page) => resolveLazy(page)))
}

export async function resolvePageForPath(pathname: string) {
  const path = normalizePathname(pathname)
  switch (path) {
    case '/':
    case '/es':
      await resolveLazy(HubPage)
      return
    case '/gtm-os':
    case '/es/gtm-os':
      await resolveLazy(GtmOsPage)
      return
    case '/store-os':
    case '/es/store-os':
      await resolveLazy(StoreOsPage)
      return
    case '/nexus-os':
    case '/es/nexus-os':
      await resolveLazy(NexusOsPage)
      return
    case '/blog':
      await resolveLazy(BlogPage)
      return
    case '/es/blog':
      await resolveLazy(BlogEsPage)
      return
    case '/blog/icp-gated-cold-outbound-without-rented-sdr':
      await resolveLazy(BlogIcpGatedColdOutboundPage)
      return
    case '/blog/shopify-admin-audit-before-ads':
      await resolveLazy(BlogStoreOsAdminAuditPage)
      return
    case '/es/blog/outbound-frio-con-icp-sin-sdr-rentado':
      await resolveLazy(BlogOutboundFrioPage)
      return
    case '/agents':
    case '/es/agents':
      await resolveLazy(AgentsPage)
      return
    case '/agents/auth':
    case '/es/agents/auth':
      await resolveLazy(AgentsAuthPage)
      return
    default:
      await resolveLazy(NotFoundPage)
  }
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
