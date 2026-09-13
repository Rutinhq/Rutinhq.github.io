import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { RootLayout } from '@/layouts/RootLayout'

const HubPage = lazy(() => import('@/pages/index'))
const GtmOsPage = lazy(() => import('@/pages/gtm-os'))
const StoreOsPage = lazy(() => import('@/pages/store-os'))
const NexusOsPage = lazy(() => import('@/pages/nexus-os'))
const BlogPage = lazy(() => import('@/pages/blog'))
const BlogEsPage = lazy(() => import('@/pages/blog-es'))
const BlogIcpGatedColdOutboundPage = lazy(
  () => import('@/pages/blog-icp-gated-cold-outbound'),
)
const BlogStoreOsAdminAuditPage = lazy(
  () => import('@/pages/blog-store-os-admin-audit'),
)
const BlogOutboundFrioPage = lazy(() => import('@/pages/blog-outbound-frio'))
const NotFoundPage = lazy(() => import('@/pages/not-found'))

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
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
