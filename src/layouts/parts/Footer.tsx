import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type FormState = 'idle' | 'sending' | 'success' | 'error'

export function Footer() {
  const { t } = useTranslation()
  const [state, setState] = useState<FormState>('idle')
  const year = new Date().getFullYear()

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    if (String(data.get('_gotcha') ?? '')) return

    const name = String(data.get('name') ?? '').trim()
    const company = String(data.get('company') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    if (!name || !company || !email) return

    setState('sending')
    try {
      const response = await fetch('/api/contact/lead-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation: {
            messages_attributes: [
              { body: 'New strategy call request from landing page.' },
            ],
            data: {
              __gd_contact_form_title: 'Book a Strategy Call',
              Company: company,
            },
          },
          user: { email, name },
        }),
      })
      if (!response.ok) throw new Error('failed')
      setState('success')
      form.reset()
    } catch {
      setState('error')
    }
  }

  return (
    <footer id="contact" className="border-t border-border bg-background py-20 md:py-28">
      <div className="container mx-auto px-6 md:px-10">
        <p className="mb-8 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {t('footer.sectionLabel')}
        </p>
        <h2
          className="max-w-2xl font-heading font-extrabold tracking-[-0.03em]"
          style={{ fontSize: 'clamp(28px, 5vw, 48px)' }}
        >
          {t('footer.headline')}
        </h2>
        <p className="mt-6 max-w-xl text-muted-foreground">{t('footer.subhead')}</p>

        {state === 'success' ? (
          <p className="mt-12 max-w-xl border border-border bg-card px-6 py-8 text-foreground">
            {t('footer.successMsg')}
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-12 max-w-3xl">
            <input
              type="text"
              name="_gotcha"
              tabIndex={-1}
              autoComplete="off"
              className="absolute"
              style={{ left: -9999 }}
              aria-hidden="true"
            />
            <div className="grid grid-cols-1 md:grid-cols-2">
              <Input
                name="name"
                required
                placeholder={t('footer.namePlaceholder')}
                className="border border-border md:border-r-0 md:border-b-0"
              />
              <Input
                name="company"
                required
                placeholder={t('footer.companyPlaceholder')}
                className="border border-t-0 border-border md:border-t md:border-b-0"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2">
              <Input
                name="email"
                type="email"
                required
                placeholder={t('footer.emailPlaceholder')}
                className="border border-t-0 border-border md:border-r-0"
              />
              <Button
                type="submit"
                size="lg"
                disabled={state === 'sending'}
                className="h-14 w-full rounded-none border border-t-0 border-border md:border-t"
              >
                {state === 'sending' ? t('footer.sending') : t('footer.submitBtn')}
              </Button>
            </div>
            {state === 'error' ? (
              <p className="mt-4 text-sm text-destructive">{t('footer.error')}</p>
            ) : (
              <p className="mt-4 text-xs text-muted-foreground">
                {t('footer.disclaimer')}
              </p>
            )}
          </form>
        )}

        <p className="mt-16 font-mono text-[11px] tracking-[0.06em] text-muted-foreground">
          © {year} RutinHQ. {t('footer.copyright')}
        </p>
      </div>
    </footer>
  )
}
