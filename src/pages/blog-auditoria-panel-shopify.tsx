import { BlogPostLayout, BlogTable } from '@/components/blog'
import { OG_IMAGE, Seo, articleJsonLd, hreflangPair } from '@/components/Seo'
import { ARTICLE02, ARTICLE02_ES, BLOG_ROBOTS, articleSeoTitle } from '@/lib/blog'
import {
  CALENDLY_URL,
  DOCS_STORE_URL,
  MAILTO_STORE_ES,
  WWW_STORE_ES_URL,
} from '@/lib/links'

const TITLE = articleSeoTitle(
  'Auditoría panel Shopify antes de anuncios',
)
const FAQ_SHEET = ARTICLE02_ES.faq.find(
  (item) => item.q === '¿Dónde está la ficha del sistema?',
)!

export default function BlogAuditoriaPanelShopifyPage() {
  return (
    <>
      <Seo
        title={TITLE}
        description={ARTICLE02_ES.description}
        path={ARTICLE02_ES.path}
        locale="es"
        noindex={ARTICLE02_ES.noindex}
        robots={BLOG_ROBOTS}
        ogType="article"
        datePublished={ARTICLE02_ES.datePublished}
        dateModified={ARTICLE02_ES.dateModified}
        alternates={hreflangPair(ARTICLE02.path, ARTICLE02_ES.path)}
        image={OG_IMAGE.blog}
        jsonLd={articleJsonLd({
          path: ARTICLE02_ES.path,
          headline: ARTICLE02_ES.title,
          description: ARTICLE02_ES.description,
          datePublished: ARTICLE02_ES.datePublished,
          dateModified: ARTICLE02_ES.dateModified,
          faq: ARTICLE02_ES.faq,
          inLanguage: 'es',
          breadcrumbHome: 'Inicio',
          breadcrumbBlog: 'Blog',
        })}
      />

      <BlogPostLayout
        typeLabel="Guía práctica · STORE OS"
        breadcrumbs={[
          { label: 'Inicio', to: '/es' },
          { label: 'Blog', to: '/es/blog' },
          { label: ARTICLE02_ES.title },
        ]}
        title={ARTICLE02_ES.title}
        lede={
          <p>
            Haga que la tienda convierta antes de comprar anuncios.{' '}
            <strong>STORE OS</strong> es auditoría y configuración del panel de
            Shopify — variantes, precio, peso, envío — para que la fricción de
            la operación deje de matar la conversión. El siguiente paso es
            STORE OS, no una campaña de anuncios.
          </p>
        }
        faqTitle="Preguntas frecuentes"
        faq={ARTICLE02_ES.faq.map((item) =>
          item.q === FAQ_SHEET.q
            ? {
                q: item.q,
                a: (
                  <p>
                    Mire la{' '}
                    <a
                      href={DOCS_STORE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      ficha STORE OS en el catálogo
                    </a>{' '}
                    y la página{' '}
                    <a href={WWW_STORE_ES_URL}>www.rutinhq.com/es/store-os</a>.
                  </p>
                ),
              }
            : item,
        )}
        cta={{
          title: 'Un producto. Un siguiente paso.',
          body: (
            <p>
              Agende 30 min de encaje. El siguiente paso es STORE OS — no
              anuncios.
            </p>
          ),
          mailto: MAILTO_STORE_ES,
          mailtoLabel: 'strategy@rutinhq.com',
          calendly: CALENDLY_URL,
          calendlyLabel: 'Agendar 30 min',
          lpHref: WWW_STORE_ES_URL,
          lpLabel: 'www.rutinhq.com/es/store-os',
        }}
      >
        <h2>Por qué el panel de Shopify va antes de los anuncios</h2>
        <p>
          Los anuncios no corrigen una tienda que no convierte. STORE OS pone
          primero el panel de Shopify para que la fricción de la operación
          deje de matar la conversión. El trabajo es una auditoría y una
          configuración replicables — no un rediseño de plantilla, no
          creatividades, no una agencia de anuncios. Anuncios y creatividades
          quedan fuera de alcance; viven en NEXUS OS. El catálogo nombra el
          resultado: tienda que convierte con menos fricción de operación,
          configuración del panel coherente y una base lista antes de gastar
          en anuncios.
        </p>

        <h2>Cómo funciona STORE OS</h2>
        <p>
          La máquina se queda fija. Cada instalación sigue el mismo orden. Nada
          se salta. Los archivos de plantilla no entran en el camino.
        </p>
        <BlogTable
          headers={['Paso', 'Qué ocurre']}
          rows={[
            ['1', 'Ficha de diagnóstico de fricción en el panel de Shopify'],
            ['2', 'Auditoría: variantes, precio, peso, envío'],
            [
              '3',
              'Configuración del panel de Shopify según el patrón del sistema (sin editar archivos de plantilla)',
            ],
            ['4', 'Lista de entrega al equipo'],
            [
              '5',
              'Anuncios y creatividades quedan fuera de alcance (NEXUS OS)',
            ],
          ]}
        />

        <h2>Ficha de diagnóstico de fricción</h2>
        <p>
          El primer paso nombra la fricción de la operación en el panel de
          Shopify. Es una ficha de diagnóstico de esa superficie — no
          puntuaciones inventadas, no un caso de estudio, no una auditoría de
          plantilla. El lector es una marca que vende directo al consumidor en
          Shopify: quiere anuncios, pero la tienda aún no convierte.
        </p>
        <h2>Auditoría: variantes, precio, peso, envío</h2>
        <p>
          La auditoría es replicable y acotada. STORE OS toca cuatro campos del
          panel: variantes, precio, peso, envío. El catálogo o las tarifas de
          envío de otra tienda no son el entregable. Bots que hacen pedidos por
          su cuenta no son el entregable. La auditoría no se convierte en
          edición de archivos de plantilla / Dawn.
        </p>

        <h2>Configuración del panel según el patrón del sistema</h2>
        <p>
          Después de la auditoría, la configuración del panel sigue el patrón
          del sistema. Solo configuración — sin editar archivos de plantilla.
          El patrón es el de STORE OS en el catálogo, no una segunda plantilla
          ni una campaña de anuncios metida en el panel.
        </p>
        <p className="note">
          Temario:{' '}
          <a href={DOCS_STORE_URL} target="_blank" rel="noopener noreferrer">
            STORE OS en el catálogo
          </a>
        </p>

        <h2>Lista de entrega al equipo</h2>
        <p>
          La entrega es una lista más el traspaso para que el equipo posea el
          panel después de la instalación. Esa es la diferencia entre instalar
          un sistema y rentar un asiento: el panel se queda con el cliente. El
          traspaso no incluye anuncios; las creatividades viven en NEXUS OS.
        </p>

        <h2>Para quién / no para quién</h2>
        <BlogTable
          headers={['Para', 'No para']}
          rows={[
            [
              'Marcas que venden directo al consumidor en Shopify',
              'Solo trabajo de plantilla',
            ],
            [
              'Hay fricción en la operación de la tienda',
              'Anuncios sin una tienda que convierta',
            ],
            [
              'Quiere anuncios, pero la tienda aún no convierte',
              'Solo creatividades',
            ],
            [
              'Desea poseer el panel después de la instalación',
              'Shopify Plus de gran empresa sin un responsable del panel',
            ],
          ]}
        />

        <h2>Fuera de alcance</h2>
        <p>
          STORE OS no es una agencia de anuncios. No es edición de archivos de
          plantilla / Dawn. No usa el catálogo ni las tarifas de envío de otra
          tienda. No son bots que hacen pedidos por su cuenta. Anuncios y
          creatividades quedan fuera de alcance y viven en NEXUS OS. La tienda
          convierte primero; el gasto viene después.
        </p>
      </BlogPostLayout>
    </>
  )
}
