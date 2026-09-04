import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Section } from '@/components/Section'
import { Seo } from '@/components/Seo'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <>
      <Seo
        title={t('seo.notFoundTitle')}
        description={t('notFound.body')}
        path="/404"
      />
      <Section first>
        <h1
          className="max-w-4xl font-heading font-extrabold tracking-[-0.03em]"
          style={{ fontSize: 'clamp(36px, 6vw, 64px)' }}
        >
          {t('notFound.title')}
        </h1>
        <p className="mt-6 max-w-2xl text-[17px] text-muted-foreground">
          {t('notFound.body')}
        </p>
        <Button asChild size="lg" className="mt-10">
          <Link to="/">{t('notFound.back')}</Link>
        </Button>
      </Section>
    </>
  )
}
