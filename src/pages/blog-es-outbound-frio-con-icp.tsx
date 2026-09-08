import { Link } from 'react-router-dom'
import { MonoTitle, Section, SimpleTable } from '@/components/Section'
import { Seo, articleJsonLd } from '@/components/Seo'
import { Button } from '@/components/ui/button'
import {
  ARTICLE01,
  ARTICLE01_ALTERNATES,
  ARTICLE01_ES,
  BLOG_INDEX_ES,
} from '@/lib/blog'
import { DOCS_GTM_URL, MAILTO_GTM, WWW_GTM_URL } from '@/lib/links'

const TITLE = `RutinHQ — ${ARTICLE01_ES.title}`

export default function BlogEsOutboundFrioConIcpPage() {
  return (
    <>
      <Seo
        title={TITLE}
        description={ARTICLE01_ES.description}
        path={ARTICLE01_ES.path}
        lang="es"
        locale="es_MX"
        noindex={ARTICLE01_ES.noindex}
        ogType="article"
        alternates={ARTICLE01_ALTERNATES}
        jsonLd={articleJsonLd({
          path: ARTICLE01_ES.path,
          headline: ARTICLE01_ES.title,
          description: ARTICLE01_ES.description,
          datePublished: ARTICLE01_ES.datePublished,
          dateModified: ARTICLE01_ES.dateModified,
          faq: ARTICLE01_ES.faq,
          inLanguage: 'es',
          blogPath: BLOG_INDEX_ES.path,
          breadcrumbHome: 'Inicio',
          breadcrumbBlog: 'Blog',
        })}
      />

      <Section first>
        <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-primary">
          How-to · GTM OS
        </p>
        <p className="mt-3 font-mono text-[12px] tracking-[0.04em] text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Inicio
          </Link>
          {' / '}
          <Link to={BLOG_INDEX_ES.path} className="hover:text-foreground">
            Blog
          </Link>
          {' / '}
          {ARTICLE01_ES.title}
          {' · '}
          <Link to={ARTICLE01.path} className="hover:text-foreground">
            EN
          </Link>
        </p>
        <h1
          className="mt-4 max-w-4xl font-heading font-extrabold tracking-[-0.03em]"
          style={{ fontSize: 'clamp(36px, 6vw, 64px)' }}
        >
          {ARTICLE01_ES.title}
        </h1>
        <p className="mt-6 max-w-2xl text-[17px] text-foreground md:text-[18px]">
          El outbound frío funciona cuando la <strong>máquina</strong> se queda
          fija y solo cambian el lenguaje, los filtros y el ángulo. Un SDR
          rentado se va con el contrato. Un sistema con{' '}
          <strong>puerta de ICP</strong> se queda con tu equipo.
        </p>
      </Section>

      <Section>
        <h2 className="text-2xl font-heading font-extrabold tracking-[-0.03em]">
          Qué significa “con puerta de ICP”
        </h2>
        <p className="mt-6 max-w-2xl text-[16px] leading-7 text-foreground">
          Outbound con puerta de ICP <strong>no abre volumen</strong> hasta que
          los criterios son <strong>verificables</strong>. Nada de listas spray.
          Nada de “ya afinamos cuando lleguen replies.” La puerta es el
          producto: si fallan los tests firmográficos y de motion, la secuencia
          no sale.
        </p>
        <SimpleTable
          headers={['Puerta', 'Señal de pase']}
          rows={[
            ['Fit firmográfico', 'Vertical + rol del buyer coinciden con la hoja'],
            [
              'Fit de motion',
              'Cold email es aceptable; el primer run se queda en frío',
            ],
            [
              'Fit de mensaje',
              'El dolor es lo bastante específico para clasificar replies',
            ],
            [
              'Fit de volumen',
              'No escalas hasta que el vertical previo mostró señal',
            ],
          ]}
        />
      </Section>

      <Section>
        <h2 className="text-2xl font-heading font-extrabold tracking-[-0.03em]">
          Núcleo fijo, inputs que cambian
        </h2>
        <p className="mt-6 max-w-2xl text-[16px] leading-7 text-foreground">
          El GTM OS de RutinHQ trata el outbound como una máquina reutilizable.
          Por vertical cambias:
        </p>
        <ul className="mt-6 max-w-2xl space-y-3 text-[16px] text-foreground">
          <li className="flex gap-3">
            <span className="text-primary" aria-hidden="true">
              ·
            </span>
            <span>
              <strong>Lenguaje</strong> — cómo nombras el dolor
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-primary" aria-hidden="true">
              ·
            </span>
            <span>
              <strong>Filtros</strong> — quién entra al pool
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-primary" aria-hidden="true">
              ·
            </span>
            <span>
              <strong>Ángulo</strong> — qué tesis abre el hilo
            </span>
          </li>
        </ul>
        <p className="mt-6 max-w-2xl text-[16px] leading-7 text-foreground">
          <strong>No</strong> reconstruyes milestones, protocolo de respuesta ni
          gobernanza en cada experimento. Esa es la diferencia entre{' '}
          <strong>instalar un sistema</strong> y rentar un asiento.
        </p>
        <p className="mt-6 max-w-2xl text-[16px] leading-7 text-muted-foreground">
          Prueba de currículo:{' '}
          <a
            href={DOCS_GTM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground underline underline-offset-4 hover:text-primary"
          >
            ficha GTM OS
          </a>{' '}
          · página comercial:{' '}
          <a
            href={WWW_GTM_URL}
            className="text-foreground underline underline-offset-4 hover:text-primary"
          >
            www.rutinhq.com/gtm-os
          </a>
        </p>
      </Section>

      <Section>
        <h2 className="text-2xl font-heading font-extrabold tracking-[-0.03em]">
          Orden de milestones (M0–M7 de un vistazo)
        </h2>
        <p className="mt-6 max-w-2xl text-[16px] leading-7 text-foreground">
          Nada se salta. Cada fase alimenta la siguiente. Validas un vertical
          antes del siguiente.
        </p>
        <SimpleTable
          headers={['M', 'Paso']}
          rows={[
            ['M0', 'Research de sector'],
            ['M1', 'ICP + validación'],
            ['M2', 'Framework de messaging'],
            ['M3', 'Playbook de ventas + puerta'],
            ['M4', 'Activación de campaña'],
            ['M5', 'Crawl / análisis'],
            ['M6', 'KPIs semanales (ongoing)'],
            ['M7', 'Cierre + escala al siguiente vertical'],
          ]}
        />
        <p className="mt-6 max-w-2xl text-[16px] leading-7 text-muted-foreground">
          Saltar M3 para “conseguir juntas más rápido” casi siempre significa
          que escalaste ruido.
        </p>
      </Section>

      <Section>
        <h2 className="text-2xl font-heading font-extrabold tracking-[-0.03em]">
          Responder antes de pitch
        </h2>
        <p className="mt-6 max-w-2xl text-[16px] leading-7 text-foreground">
          Clasifica antes de contestar. En discovery: el lead describe su
          proceso con sus palabras — sin pitch de features.
        </p>
        <SimpleTable
          headers={['Tipo', 'Acción']}
          rows={[
            ['Abierto', 'Responde pronto; tres horarios; call corta'],
            ['Pregunta', 'Framing de research; sin pitch; confirma call'],
            ['Referral', 'Agradece + contacta al referido mencionando'],
            ['OOO', 'Marca; follow-up al regreso'],
            ['No interesado', 'Agradece; descarta; no persigas'],
            ['Silencio (5–7d)', 'Un bump en el hilo; luego descarta'],
          ]}
        />
      </Section>

      <Section>
        <h2 className="text-2xl font-heading font-extrabold tracking-[-0.03em]">
          Para quién / no para quién
        </h2>
        <SimpleTable
          headers={['Para', 'No para']}
          rows={[
            ['Founder / CEO o lead de ops B2B (MX)', 'Ecom / B2C puro'],
            [
              'Ya vendes; el cuello es pipeline repetible',
              '“Solo corre ads”',
            ],
            [
              'Quieres poseer la máquina después del install',
              'RFP enterprise sin dueño de outbound',
            ],
            [
              'Motion cold-first',
              'Compradores que exigen N juntas garantizadas',
            ],
          ]}
        />
      </Section>

      <Section>
        <MonoTitle>FAQ</MonoTitle>
        <div className="mt-8 max-w-2xl space-y-8">
          {ARTICLE01_ES.faq.map((item) => (
            <div key={item.q}>
              <h3 className="text-xl font-heading font-extrabold tracking-[-0.03em]">
                {item.q}
              </h3>
              {item.q === '¿Dónde está la ficha del sistema?' ? (
                <p className="mt-3 text-[16px] leading-7 text-muted-foreground">
                  Mira la{' '}
                  <a
                    href={DOCS_GTM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground underline underline-offset-4 hover:text-primary"
                  >
                    ficha GTM OS en catalog
                  </a>{' '}
                  y la página{' '}
                  <a
                    href={WWW_GTM_URL}
                    className="text-foreground underline underline-offset-4 hover:text-primary"
                  >
                    gtm-os
                  </a>
                  .
                </p>
              ) : (
                <p className="mt-3 text-[16px] leading-7 text-muted-foreground">
                  {item.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <MonoTitle>Un SKU. Un siguiente paso.</MonoTitle>
        <p className="mt-6 max-w-2xl text-[16px] leading-7 text-foreground">
          Discovery, no educate-forever.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button asChild size="lg">
            <a href={MAILTO_GTM}>Habla con RutinHQ</a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href={WWW_GTM_URL}>GTM OS</a>
          </Button>
        </div>
        <p className="mt-6 max-w-2xl text-[16px] leading-7 text-muted-foreground">
          Señales que filtra este post: fit de ICP · dolor de outbound · interés
          gtm-os · seniority founder/ops.
        </p>
      </Section>
    </>
  )
}
