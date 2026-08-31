import { Route, Routes } from 'react-router-dom'
import { RootLayout } from '@/layouts/RootLayout'
import CaseStudiesPage from '@/pages/case-studies'
import HomePage from '@/pages/index'
import ServicesPage from '@/pages/services'

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/case-studies" element={<CaseStudiesPage />} />
      </Route>
    </Routes>
  )
}
