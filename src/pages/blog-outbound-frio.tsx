import { BlogPostLayout, BlogTable } from '@/components/blog'
import { Seo, articleJsonLd, hreflangPair } from '@/components/Seo'
import { ARTICLE01, ARTICLE01_ES, articleSeoTitle } from '@/lib/blog'
import { DOCS_GTM_URL, MAILTO_GTM, WWW_GTM_URL } from '@/lib/links'

const TITLE = articleSeoTitle(ARTICLE01_ES.title)

export default function BlogOutboundFrioPage() {
  return (
    <>
      <Seo
        title={TITLE}
        description={ARTICLE01_ES.description}
        path={ARTICLE01_ES.path}
        locale="es"
        noindex={ARTICLE01_ES.noindex}
        ogType="article"
        alternates={hreflangPair(ARTICLE01.path, ARTICLE01_ES.path)}
        jsonLd={articleJsonLd({
          path: ARTICLE01_ES.path,
          headline: ARTICLE01_ES.title,
          description: ARTICLE01_ES.description,
          datePublished: ARTICLE01_ES.datePublished,
          dateModified: ARTICLE01_ES.dateModified,
          faq: ARTICLE01_ES.faq,
          inLanguage: 'es',
          breadcrumbHome: 'Inicio',
          breadcrumbBlog: 'Blog',
        })}
      />

      <BlogPostLayout
        typeLabel="How-to · GTM OS"
        breadcrumbs={[
          { label: 'Inicio', to: '/' },
          { label: 'Blog', to: '/es/blog' },
          { label: ARTICLE01_ES.title },
        ]}
        title={ARTICLE01_ES.title}
        lede={
          <p>
            El outbound frío funciona cuando la <strong>máquina</strong> se queda
            fija y solo cambian el lenguaje, los filtros y el ángulo. Un SDR
            rentado se va con el contrato. Un sistema con{' '}
            <strong>puerta de ICP</strong> se queda con tu equipo.
          </p>
        }
        faqTitle="FAQ"
        faq={ARTICLE01_ES.faq.map((item) =>
          item.q === '¿Dónde está la ficha del sistema?'
            ? {
                q: item.q,
                a: (
                  <p>
                    Mira la{' '}
                    <a
                      href={DOCS_GTM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      ficha GTM OS en catalog
                    </a>{' '}
                    y la página{' '}
                    <a href={WWW_GTM_URL}>www.rutinhq.com/gtm-os</a>.
                  </p>
                ),
              }
            : item,
        )}
        cta={{
          title: 'Un SKU. Un siguiente paso.',
          mailto: MAILTO_GTM,
          mailtoLabel: 'strategy@',
          lpHref: WWW_GTM_URL,
          lpLabel: 'www.rutinhq.com/gtm-os',
        }}
      >
        <h2>Qué significa “con puerta de ICP”</h2>
        <p>
          Outbound con puerta de ICP <strong>no abre volumen</strong> hasta que
          los criterios son <strong>verificables</strong>. Nada de listas spray.
          Nada de “ya afinamos cuando lleguen replies.” La puerta es el
          producto: si fallan los tests firmográficos y de motion, la secuencia
          no sale.
        </p>
        <BlogTable
          headers={['Puerta', 'Señal de pase']}
          rows={[
            [
              'Fit firmográfico',
              'Vertical + rol del buyer coinciden con la hoja',
            ],
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

        <h2>Núcleo fijo, inputs que cambian</h2>
        <p>
          El GTM OS de RutinHQ trata el outbound como una máquina reutilizable.
          Por vertical cambias:
        </p>
        <ul>
          <li>
            <strong>Lenguaje</strong> — cómo nombras el dolor
          </li>
          <li>
            <strong>Filtros</strong> — quién entra al pool
          </li>
          <li>
            <strong>Ángulo</strong> — qué tesis abre el hilo
          </li>
        </ul>
        <p>
          <strong>No</strong> reconstruyes milestones, protocolo de respuesta ni
          gobernanza en cada experimento. Esa es la diferencia entre instalar un
          sistema y rentar un asiento.
        </p>
        <p className="note">
          Prueba de currículo:{' '}
          <a
            href={DOCS_GTM_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            ficha GTM OS
          </a>
        </p>

        <h2>Orden de milestones (M0–M7 de un vistazo)</h2>
        <p>
          Nada se salta. Cada fase alimenta la siguiente. Validas un vertical
          antes del siguiente.
        </p>
        <BlogTable
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
        <p className="note">
          Saltar M3 para “conseguir juntas más rápido” casi siempre significa
          que escalaste ruido.
        </p>

        <h2>Responder antes de pitch</h2>
        <p>
          Clasifica antes de contestar. En discovery: el lead describe su
          proceso con sus palabras — sin pitch de features.
        </p>
        <BlogTable
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

        <h2>Para quién / no para quién</h2>
        <BlogTable
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
      </BlogPostLayout>
    </>
  )
}
