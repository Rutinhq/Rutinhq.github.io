import { useTranslation } from 'react-i18next'
import { buttonVariants } from '@/components/ui/button'
import { MAILTO_EMAIL } from '@/lib/links'
import { cn } from '@/lib/utils'

type CtasProps = {
  className?: string
  docsHref?: string
  mailtoHref?: string
}

export function Ctas({ className, docsHref, mailtoHref = MAILTO_EMAIL }: CtasProps) {
  const { t } = useTranslation()

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      <a href={mailtoHref} className={buttonVariants({ size: 'lg' })}>
        {t('common.ctaPrimary')}
      </a>
      {docsHref ? (
        <a
          href={docsHref}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ size: 'lg', variant: 'outline' })}
        >
          {t('common.ctaDocs')}
        </a>
      ) : null}
    </div>
  )
}
