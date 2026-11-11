import { Link } from 'react-router-dom'
import { Ctas } from '@/components/Ctas'
import { FaqSection } from '@/components/Faq'
import { MonoTitle, Section } from '@/components/Section'
import { OG_IMAGE, Seo, blogIndexJsonLd, hreflangPair } from '@/components/Seo'
import { Button } from '@/components/ui/button'
import {
  ARTICLE01_ES,
  ARTICLE02,
  BLOG_FEATURED_COMING_ES,
  BLOG_FILTER_SIGNALS_ES,
  BLOG_INDEX,
  BLOG_INDEX_ES,
  BLOG_ROBOTS,
} from '@/lib/blog'
import {
  DOCS_CATALOG_URL,
  DOCS_GTM_URL,
  WWW_GTM_ES_URL,
  WWW_NEXUS_ES_URL,
  WWW_STORE_ES_URL,
} from '@/lib/links'

export default function BlogEsPage() {
  return (
    <>
      <Seo
        title={BLOG_INDEX_ES.title}
        description={BLOG_INDEX_ES.description}
        path={BLOG_INDEX_ES.path}
        locale="es"
        noindex={BLOG_INDEX_ES.noindex}
        robots={BLOG_ROBOTS}
        alternates={hreflangPair(BLOG_INDEX.path, BLOG_INDEX_ES.path)}
        image={OG_IMAGE.blog}
        jsonLd={blogIndexJsonLd({
          path: BLOG_INDEX_ES.path,
          name: BLOG_INDEX_ES.title,
          description: BLOG_INDEX_ES.description,
          inLanguage: 'es',
          faq: BLOG_INDEX_ES.faq,
        })}
      />

      <Section first>
        <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-primary">
          Radar · filtro
        </p>
        <h1
          className="mt-4 max-w-4xl font-heading font-extrabold tracking-[-0.03em]"
          style={{ fontSize: 'clamp(36px, 6vw, 64px)' }}
        >
          Sistemas que usted posee — filtrados para fundadores que instalan, no rentan
        </h1>
        <p className="mt-6 max-w-2xl text-[17px] text-muted-foreground md:text-[18px]">
          El blog de RutinHQ es un radar: cada artículo deja ver si encaja en
          nuestro perfil de cliente ideal (ICP), si nombra un dolor real de operación o de prospección y si desea un
          sistema que se quede con su equipo. Hay dos capas: estrategia de dirección y
          operación instalada. El siguiente paso es una llamada de encaje, no un ciclo de
          contenido sin fin.
        </p>
      </Section>

      <Section>
        <MonoTitle>Marco de filtro</MonoTitle>
        <p className="mt-6 max-w-2xl text-[16px] text-muted-foreground">
          Este blog etiqueta señal del lector. En cada camino, el siguiente paso es una
          llamada de encaje (strategy@) — no un pozo de contenido.
        </p>
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-4">
          {BLOG_FILTER_SIGNALS_ES.map((signal, index) => (
            <article
              key={signal.name}
              className={`flex flex-col py-8 ${
                index > 0
                  ? 'border-t border-border lg:border-t-0 lg:border-l lg:border-border lg:px-8'
                  : 'lg:pr-8'
              }`}
            >
              <h2 className="text-2xl font-heading font-extrabold tracking-[-0.03em]">
                {signal.name}
              </h2>
              <p className="mt-3 text-[16px] text-muted-foreground">
                {signal.thesis}
              </p>
            </article>
          ))}
        </div>
      </Section>

      <Section>
        <MonoTitle>Destacado</MonoTitle>
        <article className="mt-8 max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            Guía práctica · GTM OS
          </p>
          <h2 className="mt-3 text-2xl font-heading font-extrabold tracking-[-0.03em]">
            <Link to={ARTICLE01_ES.path} className="hover:text-primary">
              {ARTICLE01_ES.title}
            </Link>
          </h2>
          <p className="mt-3 text-[16px] text-muted-foreground">
            {ARTICLE01_ES.job}
          </p>
          <Button asChild className="mt-8" size="lg">
            <Link to={ARTICLE01_ES.path}>Lea la guía práctica</Link>
          </Button>
        </article>
        <article className="mt-10 max-w-2xl border-t border-border pt-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            Guía práctica · STORE OS · borrador · EN
          </p>
          <h2 className="mt-3 text-2xl font-heading font-extrabold tracking-[-0.03em]">
            <Link to={ARTICLE02.path} className="hover:text-primary">
              Auditoría del panel de Shopify antes de comprar anuncios
            </Link>
          </h2>
          <p className="mt-3 text-[16px] text-muted-foreground">
            Esquema en inglés (borrador). El texto público sigue en inglés; aún no hay
            versión en español.
          </p>
          <Button asChild className="mt-8" size="lg">
            <Link to={ARTICLE02.path}>Lea el esquema en inglés</Link>
          </Button>
        </article>
        <div className="mt-12 grid grid-cols-1 border-t border-border lg:grid-cols-3">
          {BLOG_FEATURED_COMING_ES.map((item, index) => (
            <article
              key={item.title}
              className={`flex flex-col py-8 ${
                index > 0
                  ? 'border-t border-border lg:border-t-0 lg:border-l lg:border-border lg:px-8'
                  : 'lg:pr-8'
              }`}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {item.type} · próximamente
              </p>
              <h2 className="mt-3 text-2xl font-heading font-extrabold tracking-[-0.03em] text-muted-foreground">
                {item.title}
              </h2>
            </article>
          ))}
        </div>
      </Section>

      <Section>
        <MonoTitle>Si su cuello es…</MonoTitle>
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3">
          <article className="flex flex-col py-8 lg:pr-8">
            <h2 className="text-2xl font-heading font-extrabold tracking-[-0.03em]">
              Flujo de ventas en frío repetible / filtros de perfil de cliente ideal (ICP)
            </h2>
            <p className="mt-3 flex-1 text-[16px] text-muted-foreground">
              Empiece por la guía práctica, luego GTM OS.
            </p>
            <p className="mt-8 font-mono text-[12px] tracking-[0.04em]">
              <Link
                to={ARTICLE01_ES.path}
                className="text-foreground underline underline-offset-4 hover:text-primary"
              >
                Guía práctica
              </Link>
              {' · '}
              <a
                href={WWW_GTM_ES_URL}
                className="text-foreground underline underline-offset-4 hover:text-primary"
              >
                GTM OS
              </a>
            </p>
          </article>
          <article className="flex flex-col border-t border-border py-8 lg:border-t-0 lg:border-l lg:border-border lg:px-8">
            <h2 className="text-2xl font-heading font-extrabold tracking-[-0.03em]">
              Fricción del panel de Shopify antes de anuncios
            </h2>
            <p className="mt-3 flex-1 text-[16px] text-muted-foreground">
              Esquema STORE OS en inglés (borrador). Anuncios fuera de alcance.
            </p>
            <p className="mt-8 font-mono text-[12px] tracking-[0.04em]">
              <Link
                to={ARTICLE02.path}
                className="text-foreground underline underline-offset-4 hover:text-primary"
              >
                Esquema en inglés
              </Link>
              {' · '}
              <a
                href={WWW_STORE_ES_URL}
                className="text-foreground underline underline-offset-4 hover:text-primary"
              >
                STORE OS
              </a>
            </p>
          </article>
          <article className="flex flex-col border-t border-border py-8 lg:border-t-0 lg:border-l lg:border-border lg:px-8">
            <h2 className="text-2xl font-heading font-extrabold tracking-[-0.03em]">
              Temario / mapa de sistemas
            </h2>
            <p className="mt-3 flex-1 text-[16px] text-muted-foreground">
              Prueba de catálogo — no una segunda oferta.
            </p>
            <p className="mt-8 font-mono text-[12px] tracking-[0.04em]">
              <a
                href={DOCS_CATALOG_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline underline-offset-4 hover:text-primary"
              >
                docs.rutinhq.com/catalog/
              </a>
            </p>
          </article>
        </div>
      </Section>

      <FaqSection title="Preguntas frecuentes" items={BLOG_INDEX_ES.faq} />

      <Section>
        <Ctas />
        <p className="mt-6 max-w-2xl text-sm text-muted-foreground">
          Prueba:{' '}
          <a
            href={DOCS_CATALOG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground underline underline-offset-4 hover:text-primary"
          >
            catálogo de sistemas
          </a>
          {' · '}
          <a
            href={DOCS_GTM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground underline underline-offset-4 hover:text-primary"
          >
            ficha de GTM OS
          </a>
          {' · '}
          Página de producto{' '}
          <a
            href={WWW_GTM_ES_URL}
            className="text-foreground underline underline-offset-4 hover:text-primary"
          >
            GTM OS
          </a>
          .
        </p>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          En espera hasta que esas páginas de producto estén listas:{' '}
          <a
            href={WWW_STORE_ES_URL}
            className="underline underline-offset-4 hover:text-foreground"
          >
            STORE OS
          </a>
          {' · '}
          <a
            href={WWW_NEXUS_ES_URL}
            className="underline underline-offset-4 hover:text-foreground"
          >
            NEXUS OS
          </a>
          .
        </p>
      </Section>
    </>
  )
}
