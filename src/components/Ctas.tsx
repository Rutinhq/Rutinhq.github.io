import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { CALENDLY_URL, MAILTO_GTM } from '@/lib/links'
import { cn } from '@/lib/utils'

export function Ctas({ className }: { className?: string }) {
  const { t } = useTranslation()

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      <Button asChild size="lg">
        <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
          {t('hero.ctaPrimary')}
        </a>
      </Button>
      <Button asChild size="lg" variant="outline">
        <a href={MAILTO_GTM}>{t('hero.ctaSecondary')}</a>
      </Button>
    </div>
  )
}
