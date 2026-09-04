import { useTranslation } from 'react-i18next'
import { Ctas } from '@/components/Ctas'
import { skuJsonLd, Seo } from '@/components/Seo'
import { useObjectList } from '@/lib/i18n/lists'
import { MAILTO_GTM } from '@/lib/links'

type LadderItem = { sku: string; time: string }
type PriceRow = { sku: string; what: string; time: string; price: string }

export default function GtmOsPage() {
  const { t } = useTranslation()
  const problems = useObjectList<string>('gtm.problem.items')
  const ladder = useObjectList<LadderItem>('gtm.ladder.items')
  const who = useObjectList<string>('gtm.who.items')
  const notFor = useObjectList<string>('gtm.notFor.items')
  const rows = useObjectList<PriceRow>('gtm.prices.rows')

  return (
    <>
      <Seo
        title={t('seo.gtmTitle')}
        description={t('seo.gtmDescription')}
        path="/gtm-os"
        jsonLd={skuJsonLd('/gtm-os', t('seo.gtmTitle'), t('seo.gtmDescription'))}
      />

      <section className="bg-background py-16 md:py-20">
        <div className="container mx-auto px-6 md:px-10">
          <h1
            className="max-w-4xl font-heading font-extrabold tracking-[-0.03em]"
            style={{ fontSize: 'clamp(36px, 6vw, 64px)' }}
          >
            {t('gtm.hero.headline')}
          </h1>
          <p className="mt-6 max-w-2xl text-[17px] text-muted-foreground md:text-[18px]">
            {t('gtm.hero.subhead')}
          </p>
          <Ctas className="mt-10" mailto={MAILTO_GTM} />
        </div>
      </section>

      <section className="border-t border-border bg-background py-12 md:py-16">
        <div className="container mx-auto px-6 md:px-10">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            {t('gtm.problem.title')}
          </h2>
          <ul className="mt-6 max-w-2xl space-y-3">
            {problems.map((item) => (
              <li key={item} className="flex gap-3 text-[16px] text-foreground">
                <span className="text-primary" aria-hidden="true">
                  ·
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-border bg-background py-12 md:py-16">
        <div className="container mx-auto px-6 md:px-10">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            {t('gtm.install.title')}
          </h2>
          <p className="mt-6 font-mono text-[15px] tracking-[0.04em] text-foreground md:text-[18px]">
            {t('gtm.install.line')}
          </p>
        </div>
      </section>

      <section className="border-t border-border bg-background py-12 md:py-16">
        <div className="container mx-auto px-6 md:px-10">
          <h2 className="mb-8 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            {t('gtm.ladder.title')}
          </h2>
          <div className="grid grid-cols-1 border-t border-border sm:grid-cols-2 lg:grid-cols-4">
            {ladder.map((item, index) => (
              <article
                key={item.sku}
                className={`py-8 ${index > 0 ? 'border-t border-border sm:border-t-0 sm:border-l sm:border-border sm:px-6' : 'sm:pr-6'} ${index > 1 ? 'lg:border-t-0' : ''} ${index === 2 ? 'sm:border-t sm:border-l-0 lg:border-t-0 lg:border-l' : ''} ${index === 3 ? 'sm:border-t lg:border-t-0' : ''}`}
              >
                <h3 className="text-xl font-heading font-extrabold tracking-[-0.03em]">
                  {item.sku}
                </h3>
                <p className="mt-3 font-mono text-[12px] uppercase tracking-[0.14em] text-primary">
                  {item.time}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-background py-12 md:py-16">
        <div className="container mx-auto grid grid-cols-1 gap-12 px-6 md:grid-cols-2 md:gap-16 md:px-10">
          <div>
            <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
              {t('gtm.who.title')}
            </h2>
            <ul className="mt-6 space-y-3">
              {who.map((item) => (
                <li key={item} className="flex gap-3 text-foreground">
                  <span className="text-primary" aria-hidden="true">
                    ·
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {t('gtm.notFor.title')}
            </h2>
            <ul className="mt-6 space-y-3">
              {notFor.map((item) => (
                <li key={item} className="flex gap-3 text-muted-foreground">
                  <span aria-hidden="true">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-background py-12 md:py-16">
        <div className="container mx-auto px-6 md:px-10">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            {t('gtm.prices.title')}
          </h2>
          <div className="mt-8 overflow-x-auto border border-border">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead className="bg-card">
                <tr>
                  <th className="border-b border-border px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {t('gtm.prices.sku')}
                  </th>
                  <th className="border-b border-border px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {t('gtm.prices.what')}
                  </th>
                  <th className="border-b border-border px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {t('gtm.prices.time')}
                  </th>
                  <th className="border-b border-border px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {t('gtm.prices.price')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.sku}>
                    <td className="border-b border-border px-4 py-4 font-heading font-extrabold">
                      {row.sku}
                    </td>
                    <td className="border-b border-border px-4 py-4 text-sm text-muted-foreground">
                      {row.what}
                    </td>
                    <td className="border-b border-border px-4 py-4 font-mono text-[12px] text-foreground">
                      {row.time}
                    </td>
                    <td className="border-b border-border px-4 py-4 font-mono text-[12px] text-primary">
                      {row.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-sm text-foreground">{t('gtm.prices.payment')}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('gtm.prices.afterCase')}
          </p>
        </div>
      </section>
    </>
  )
}
