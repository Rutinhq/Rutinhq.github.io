import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { RootLayout } from '@/layouts/RootLayout'
import HubEager from '@/pages/index'
import GtmOsEager from '@/pages/gtm-os'
import StoreOsEager from '@/pages/store-os'
import NexusOsEager from '@/pages/nexus-os'
import BlogEager from '@/pages/blog'
import BlogEsEager from '@/pages/blog-es'
import BlogIcpGatedColdOutboundEager from '@/pages/blog-icp-gated-cold-outbound'
import BlogStoreOsAdminAuditEager from '@/pages/blog-store-os-admin-audit'
import BlogOutboundFrioEager from '@/pages/blog-outbound-frio'
import AgentsEager from '@/pages/agents'
import AgentsAuthEager from '@/pages/agents-auth'
import NotFoundEager from '@/pages/not-found'

const HubPage = import.meta.env.SSR
  ? HubEager
  : lazy(() => import('@/pages/index'))
const GtmOsPage = import.meta.env.SSR
  ? GtmOsEager
  : lazy(() => import('@/pages/gtm-os'))
const StoreOsPage = import.meta.env.SSR
  ? StoreOsEager
  : lazy(() => import('@/pages/store-os'))
const NexusOsPage = import.meta.env.SSR
  ? NexusOsEager
  : lazy(() => import('@/pages/nexus-os'))
const BlogPage = import.meta.env.SSR
  ? BlogEager
  : lazy(() => import('@/pages/blog'))
const BlogEsPage = import.meta.env.SSR
  ? BlogEsEager
  : lazy(() => import('@/pages/blog-es'))
const BlogIcpGatedColdOutboundPage = import.meta.env.SSR
  ? BlogIcpGatedColdOutboundEager
  : lazy(() => import('@/pages/blog-icp-gated-cold-outbound'))
const BlogStoreOsAdminAuditPage = import.meta.env.SSR
  ? BlogStoreOsAdminAuditEager
  : lazy(() => import('@/pages/blog-store-os-admin-audit'))
const BlogOutboundFrioPage = import.meta.env.SSR
  ? BlogOutboundFrioEager
  : lazy(() => import('@/pages/blog-outbound-frio'))
const AgentsPage = import.meta.env.SSR
  ? AgentsEager
  : lazy(() => import('@/pages/agents'))
const AgentsAuthPage = import.meta.env.SSR
  ? AgentsAuthEager
  : lazy(() => import('@/pages/agents-auth'))
const NotFoundPage = import.meta.env.SSR
  ? NotFoundEager
  : lazy(() => import('@/pages/not-found'))

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
