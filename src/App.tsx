import { Route, Routes } from 'react-router-dom'
import { RootLayout } from '@/layouts/RootLayout'
import HubPage from '@/pages/index'
import GtmOsPage from '@/pages/gtm-os'
import StoreOsPage from '@/pages/store-os'
import NexusOsPage from '@/pages/nexus-os'
import BlogPage from '@/pages/blog'
import BlogEsPage from '@/pages/blog-es'
import BlogIcpGatedColdOutboundPage from '@/pages/blog-icp-gated-cold-outbound'
import BlogOutboundFrioPage from '@/pages/blog-outbound-frio'
import NotFoundPage from '@/pages/not-found'

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<HubPage />} />
        <Route path="/gtm-os" element={<GtmOsPage />} />
        <Route path="/store-os" element={<StoreOsPage />} />
        <Route path="/nexus-os" element={<NexusOsPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route
          path="/blog/icp-gated-cold-outbound-without-rented-sdr"
          element={<BlogIcpGatedColdOutboundPage />}
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
