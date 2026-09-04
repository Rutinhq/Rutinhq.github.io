import { Route, Routes } from 'react-router-dom'
import { RootLayout } from '@/layouts/RootLayout'
import HubPage from '@/pages/index'
import GtmOsPage from '@/pages/gtm-os'
import StoreOsPage from '@/pages/store-os'
import NexusOsPage from '@/pages/nexus-os'
import NotFoundPage from '@/pages/not-found'

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<HubPage />} />
        <Route path="/gtm-os" element={<GtmOsPage />} />
        <Route path="/store-os" element={<StoreOsPage />} />
        <Route path="/nexus-os" element={<NexusOsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
