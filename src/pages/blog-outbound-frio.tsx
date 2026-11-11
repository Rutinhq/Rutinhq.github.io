import { BlogPostLayout, BlogTable } from '@/components/blog'
import { OG_IMAGE, Seo, articleJsonLd, hreflangPair } from '@/components/Seo'
import { ARTICLE01, ARTICLE01_ES, BLOG_ROBOTS, articleSeoTitle } from '@/lib/blog'
import {
  CALENDLY_URL,
  DOCS_GTM_URL,
  MAILTO_GTM_ES,
  WWW_GTM_ES_URL,
} from '@/lib/links'

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
        robots={BLOG_ROBOTS}
        ogType="article"
        datePublished={ARTICLE01_ES.datePublished}
        dateModified={ARTICLE01_ES.dateModified}
        alternates={hreflangPair(ARTICLE01.path, ARTICLE01_ES.path)}
        image={OG_IMAGE.blog}
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
        typeLabel="Guía práctica · GTM OS"
        draft={ARTICLE01_ES.draft}
        breadcrumbs={[
          { label: 'Inicio', to: '/' },
          { label: 'Blog', to: '/es/blog' },
          { label: ARTICLE01_ES.title },
        ]}
        title={ARTICLE01_ES.title}
        lede={
          <p>
            La prospección en frío funciona cuando la <strong>máquina</strong> se queda
            fija y solo cambian el lenguaje, los filtros y el ángulo. Un SDR
            externo se va con el contrato. Un sistema con{' '}
            <strong>filtro de perfil de cliente ideal (ICP)</strong> se queda con su equipo.
          </p>
        }
        faqTitle="Preguntas frecuentes"
        faq={ARTICLE01_ES.faq.map((item) =>
          item.q === '¿Dónde está la ficha del sistema?'
            ? {
                q: item.q,
                a: (
                  <p>
                    Mire la{' '}
                    <a
                      href={DOCS_GTM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      ficha GTM OS en el catálogo
                    </a>{' '}
                    y la página{' '}
                    <a href={WWW_GTM_ES_URL}>www.rutinhq.com/es/gtm-os</a>.
                  </p>
                ),
              }
            : item,
        )}
        cta={{
          title: 'Un producto. Un siguiente paso.',
          mailto: MAILTO_GTM_ES,
          mailtoLabel: 'strategy@rutinhq.com',
          calendly: CALENDLY_URL,
          calendlyLabel: 'Agendar 30 min',
          lpHref: WWW_GTM_ES_URL,
          lpLabel: 'www.rutinhq.com/es/gtm-os',
        }}
      >
        <h2>Qué significa filtrar por perfil de cliente ideal (ICP)</h2>
        <p>
          Prospección en frío con filtro de perfil de cliente ideal (ICP){' '}
          <strong>no abre volumen</strong> hasta que
          los criterios son <strong>verificables</strong>. Nada de listas indiscriminadas.
          Nada de “ya afinamos cuando lleguen respuestas.” El filtro es el
          producto: si fallan las pruebas de datos de la empresa y de modelo de venta, la secuencia
          no sale.
        </p>
        <BlogTable
          headers={['Filtro', 'Criterio para seguir']}
          rows={[
            [
              'Encaje de datos de la empresa',
              'Sector y cargo del comprador coinciden con la hoja',
            ],
            [
              'Encaje de modelo de venta',
              'El correo en frío es aceptable; el primer envío se queda en frío',
            ],
            [
              'Encaje de mensaje',
              'El dolor es lo bastante específico para clasificar respuestas',
            ],
            [
              'Encaje de volumen',
              'No escala hasta que el vertical previo mostró señal',
            ],
          ]}
        />

        <h2>Núcleo fijo, entradas que cambian</h2>
        <p>
          El GTM OS de RutinHQ trata la prospección en frío como una máquina reutilizable.
          Por vertical cambie:
        </p>
        <ul>
          <li>
            <strong>Lenguaje</strong> — cómo nombra el dolor
          </li>
          <li>
            <strong>Filtros</strong> — quién entra a la lista
          </li>
          <li>
            <strong>Ángulo</strong> — qué tesis abre el hilo
          </li>
        </ul>
        <p>
          <strong>No</strong> reconstruya etapas, protocolo de respuesta ni
          gobernanza en cada experimento. Esa es la diferencia entre instalar un
          sistema y rentar un asiento.
        </p>
        <p className="note">
          Prueba de temario:{' '}
          <a
            href={DOCS_GTM_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            ficha GTM OS
          </a>
        </p>

        <h2>Orden de etapas (M0–M7 de un vistazo)</h2>
        <p>
          Nada se salta. Cada fase alimenta la siguiente. Valide un vertical
          antes del siguiente.
        </p>
        <BlogTable
          headers={['M', 'Paso']}
          rows={[
            ['M0', 'Investigación de sector'],
            ['M1', 'ICP + validación'],
            ['M2', 'Marco de mensajes'],
            ['M3', 'Guía de ventas y criterio de avance'],
            ['M4', 'Activación de campaña'],
            ['M5', 'Rastreo / análisis'],
            ['M6', 'Indicadores semanales (continuo)'],
            ['M7', 'Cierre + escala al siguiente vertical'],
          ]}
        />
        <p className="note">
          Si se salta M3 para conseguir reuniones más rápido, casi siempre se
          escala ruido.
        </p>

        <h2>Responder antes del discurso de venta</h2>
        <p>
          Clasifique antes de contestar. En la primera conversación: el prospecto describe su
          proceso con sus palabras — sin discurso de funciones.
        </p>
        <BlogTable
          headers={['Tipo', 'Acción']}
          rows={[
            ['Abierto', 'Responda pronto; tres horarios; llamada corta'],
            ['Pregunta', 'Encuadre de investigación; sin discurso de venta; confirma la llamada'],
            ['Referido', 'Agradezca y contacte al referido mencionando'],
            ['Fuera de oficina', 'Marque; seguimiento al regreso'],
            ['No interesado', 'Agradezca, descarte y no persiga'],
            ['Silencio (5 a 7 días)', 'Un recordatorio en el hilo; luego descarte'],
          ]}
        />

        <h2>Para quién / no para quién</h2>
        <BlogTable
          headers={['Para', 'No para']}
          rows={[
            ['Fundador / director general o responsable de operación B2B (MX)', 'Comercio electrónico / B2C puro'],
            [
              'Ya vende; el cuello es flujo de ventas repetible',
              '“Solo corre anuncios”',
            ],
            [
              'Desea poseer la máquina después de la instalación',
              'Solicitud de propuesta empresarial sin dueño de prospección en frío',
            ],
            [
              'Modelo primero en frío',
              'Compradores que exigen un número fijo de reuniones',
            ],
          ]}
        />
      </BlogPostLayout>
    </>
  )
}
