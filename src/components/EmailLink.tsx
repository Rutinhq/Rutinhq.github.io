import type { ReactNode } from 'react'
import { EMAIL, MAILTO_EMAIL } from '@/lib/links'

const EMAIL_OFF_OPEN = { __html: '<!--email_off-->' }
const EMAIL_OFF_CLOSE = { __html: '<!--/email_off-->' }

type CloudflareEmailOffProps = {
  children: ReactNode
}

/** Emits Cloudflare `email_off` comments so Email Address Obfuscation skips the children. */
export function CloudflareEmailOff({ children }: CloudflareEmailOffProps) {
  return (
    <>
      <span dangerouslySetInnerHTML={EMAIL_OFF_OPEN} />
      {children}
      <span dangerouslySetInnerHTML={EMAIL_OFF_CLOSE} />
    </>
  )
}

type EmailLinkProps = {
  href?: string
  className?: string
  children?: ReactNode
}

export function EmailLink({
  href = MAILTO_EMAIL,
  className,
  children = EMAIL,
}: EmailLinkProps) {
  return (
    <CloudflareEmailOff>
      <a href={href} className={className}>
        {children}
      </a>
    </CloudflareEmailOff>
  )
}
