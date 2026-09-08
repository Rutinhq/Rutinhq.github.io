import { useLocation } from 'react-router-dom'
import { isGuideWidgetPath } from '@/guide/config'
import { GuideWidget } from './GuideWidget'

export function GuideHost() {
  const { pathname } = useLocation()
  if (!isGuideWidgetPath(pathname)) return null
  return <GuideWidget />
}
