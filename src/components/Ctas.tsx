import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { CALENDLY_URL } from '@/lib/links'
import { cn } from '@/lib/utils'

type CtasProps = {
  className?: string
  mailto: string
  primaryKey?: string
}

export function Ctas({
  className,
  mailto,
  primaryKey = 'common.ctaPrimary',
}: CtasProps) {
  const { t } = useTranslation()

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      <Button asChild size="lg">
        <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
          {t(primaryKey)}
        </a>
      </Button>
      <Button asChild size="lg" variant="outline">
        <a href={mailto}>{t('common.ctaSecondary')}</a>
      </Button>
    </div>
  )
}
