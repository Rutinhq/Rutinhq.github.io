import { useTranslation } from 'react-i18next'
import { EmailLink } from '@/components/EmailLink'
import { buttonVariants } from '@/components/ui/button'
import { CALENDLY_URL, EMAIL, MAILTO_EMAIL } from '@/lib/links'
import { cn } from '@/lib/utils'

type CtasProps = {
  className?: string
  docsHref?: string
  mailtoHref?: string
}

export function Ctas({ className, docsHref, mailtoHref = MAILTO_EMAIL }: CtasProps) {
  const { t } = useTranslation()

  return (
    <div className={cn('flex flex-col items-start gap-3', className)}>
      <div className="flex flex-wrap items-center gap-3">
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
      </div>
      <p className="text-sm text-muted-foreground">
        {t('common.ctaEmailSecondary')}{' '}
        <EmailLink
          href={mailtoHref}
          className="text-foreground underline underline-offset-4 hover:text-primary"
        >
          {EMAIL}
        </EmailLink>
      </p>
    </div>
  )
}
