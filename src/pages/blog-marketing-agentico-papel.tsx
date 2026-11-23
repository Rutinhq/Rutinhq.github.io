import { BlogPostLayout, BlogTable } from '@/components/blog'
import { OG_IMAGE, Seo, articleJsonLd, hreflangPair } from '@/components/Seo'
import { ARTICLE03, ARTICLE03_ES, BLOG_ROBOTS, articleSeoTitle } from '@/lib/blog'
import {
  CALENDLY_URL,
  DOCS_NEXUS_URL,
  MAILTO_NEXUS_ES,
  WWW_NEXUS_ES_URL,
} from '@/lib/links'

const TITLE = articleSeoTitle(ARTICLE03_ES.title)

export default function BlogMarketingAgenticoPapelPage() {
  return (
    <>
      <Seo
        title={TITLE}
        description={ARTICLE03_ES.description}
        path={ARTICLE03_ES.path}
        locale="es"
        noindex={ARTICLE03_ES.noindex}
        robots={BLOG_ROBOTS}
        ogType="article"
        datePublished={ARTICLE03_ES.datePublished}
        dateModified={ARTICLE03_ES.dateModified}
        alternates={hreflangPair(ARTICLE03.path, ARTICLE03_ES.path)}
        image={OG_IMAGE.blog}
        jsonLd={articleJsonLd({
          path: ARTICLE03_ES.path,
          headline: ARTICLE03_ES.title,
          description: ARTICLE03_ES.description,
          datePublished: ARTICLE03_ES.datePublished,
          dateModified: ARTICLE03_ES.dateModified,
          faq: ARTICLE03_ES.faq,
          inLanguage: 'es',
          breadcrumbHome: 'Inicio',
          breadcrumbBlog: 'Blog',
        })}
      />

      <BlogPostLayout
        typeLabel="Guía práctica · NEXUS OS"
        breadcrumbs={[
          { label: 'Inicio', to: '/es' },
          { label: 'Blog', to: '/es/blog' },
          { label: ARTICLE03_ES.title },
        ]}
        title={ARTICLE03_ES.title}
        lede={
          <p>
            Marketing agéntico — primero en papel, anuncios solo con aprobación
            explícita. NEXUS OS sigue{' '}
            <strong>Estrategia → Social → Ads</strong>. Hasta que apruebe las
            creatividades, la mezcla y el presupuesto: solo papel (sin píxel,
            sin gasto).
          </p>
        }
        faqTitle="Preguntas frecuentes"
        faq={ARTICLE03_ES.faq.map((item) =>
          item.q === '¿Dónde está la ficha del sistema?'
            ? {
                q: item.q,
                a: (
                  <p>
                    Mire la{' '}
                    <a
                      href={DOCS_NEXUS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      ficha NEXUS OS en el catálogo
                    </a>{' '}
                    y la página{' '}
                    <a href={WWW_NEXUS_ES_URL}>www.rutinhq.com/es/nexus-os</a>.
                  </p>
                ),
              }
            : item,
        )}
        cta={{
          title: 'Un producto. Un siguiente paso.',
          body: (
            <p>
              Agende 30 min de encaje. Revise la compuerta de NEXUS OS —
              primero en papel.
            </p>
          ),
          mailto: MAILTO_NEXUS_ES,
          mailtoLabel: 'strategy@rutinhq.com',
          calendly: CALENDLY_URL,
          calendlyLabel: 'Agendar 30 min',
          lpHref: WWW_NEXUS_ES_URL,
          lpLabel: 'www.rutinhq.com/es/nexus-os',
        }}
      >
        <h2>Qué significa “primero en papel”</h2>
        <p>
          NEXUS OS produce lotes de contenido y planes. No inventa la oferta
          ni el perfil de cliente ideal (ICP) del minorista. La voz de marca
          la define el equipo de operación y marketing del cliente. Hasta que
          apruebe las creatividades, la mezcla y el presupuesto, nada toca un
          píxel y nada se gasta.
        </p>
        <p>
          Anuncios en vivo, píxel o gasto sin aprobación explícita quedan
          fuera de NEXUS OS. Presupuesto en cero presentado como si los
          anuncios ya estuvieran activos está en la lista de “no es para”.
        </p>

        <h2>Cómo funciona NEXUS OS</h2>
        <p>
          La secuencia se queda fija. Los anuncios siguen en pausa hasta que
          se firme la compuerta.
        </p>
        <BlogTable
          headers={['Paso', 'Qué ocurre']}
          rows={[
            ['1', 'Encargo y pilares de contenido (un problema, un producto)'],
            [
              '2',
              'Lote semanal en papel: mensaje · publicación orgánica · historia de producto',
            ],
            ['3', 'Aprobación de voz por el dueño de marca del cliente'],
            ['4', 'Rotación de pilares'],
            [
              '5',
              'Anuncios en pausa hasta que apruebe las creatividades, la mezcla y el presupuesto',
            ],
          ]}
        />

        <h2>Encargo y pilares de contenido</h2>
        <p>
          El encargo nombra un problema y un producto. Los pilares salen de
          ese par — no de una oferta inventada. NEXUS no es dueño del ICP ni
          de la oferta del cliente. El encaje es minorista / tienda en línea
          con oferta y productos claros. Sin oferta / producto no encaja.
        </p>
        <p>
          La demanda desde social es el sistema. Anuncios sin creatividades
          listas no son el punto de partida.
        </p>

        <h2>Lote semanal en papel</h2>
        <p>
          Cada semana produce un lote en papel: mensaje · publicación orgánica
          · historia de producto. El papel queda listo para revisión antes del
          gasto. Las afirmaciones se quedan en lo que el cliente ya posee. El
          resultado es un sistema de contenido repetible sin afirmaciones
          inventadas.
        </p>
        <p className="note">
          Temario:{' '}
          <a href={DOCS_NEXUS_URL} target="_blank" rel="noopener noreferrer">
            ficha NEXUS OS
          </a>
        </p>

        <h2>Aprobación de voz, luego la compuerta de anuncios</h2>
        <p>
          La aprobación de voz corresponde al dueño de marca del cliente. La
          rotación de pilares mantiene el lote en movimiento. Los anuncios
          siguen en pausa hasta que apruebe las creatividades, la mezcla y el
          presupuesto. Sin esa aprobación explícita: solo papel (sin píxel,
          sin gasto).
        </p>

        <h2>Para quién / no para quién</h2>
        <BlogTable
          headers={['Para', 'No para']}
          rows={[
            [
              'Minorista / tienda en línea con oferta y productos claros',
              'Sin oferta / producto',
            ],
            [
              'Quiere demanda desde social como sistema',
              'Anuncios sin creatividades listas',
            ],
            [
              'La voz de marca la define el equipo de operación y marketing del cliente',
              'Presupuesto en cero presentado como si los anuncios ya estuvieran activos',
            ],
          ]}
        />

        <h2>No es GTM OS. No es STORE OS.</h2>
        <p>
          Separación clara: NEXUS ≠ prospección en frío (GTM OS) ≠ panel de
          Shopify de la tienda (STORE OS). NEXUS OS no es GTM OS. No es
          edición de plantilla de Shopify. Es marketing agéntico —
          Estrategia → Social → Ads — primero en papel.
        </p>
      </BlogPostLayout>
    </>
  )
}
