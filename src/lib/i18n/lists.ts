import { useTranslation } from 'react-i18next'

export function useObjectList<T>(key: string): T[] {
  const { t } = useTranslation()
  const value = t(key, { returnObjects: true })
  return Array.isArray(value) ? (value as T[]) : []
}
