import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type CtasProps = {
  className?: string
  mailto: string
  docsHref?: string
}

export function Ctas({ className, mailto, docsHref }: CtasProps) {
  const { t } = useTranslation()

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      <Button asChild size="lg">
        <a href={mailto}>{t('common.ctaPrimary')}</a>
      </Button>
      {docsHref ? (
        <Button asChild size="lg" variant="outline">
          <a href={docsHref} target="_blank" rel="noopener noreferrer">
            {t('common.ctaDocs')}
          </a>
        </Button>
      ) : null}
    </div>
  )
}
