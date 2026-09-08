import { useTranslation } from 'react-i18next'
import { buttonVariants } from '@/components/ui/button'
import { CALENDLY_URL, EMAIL, MAILTO_EMAIL } from '@/lib/links'
import { cn } from '@/lib/utils'

type CtasProps = {
  className?: string
  docsHref?: string
}

export function Ctas({ className, docsHref }: CtasProps) {
  const { t } = useTranslation()

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      <a
        href={CALENDLY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonVariants({ size: 'lg' })}
      >
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
      <a
        href={MAILTO_EMAIL}
        className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        {t('common.ctaEmail', { email: EMAIL })}
      </a>
    </div>
  )
}
