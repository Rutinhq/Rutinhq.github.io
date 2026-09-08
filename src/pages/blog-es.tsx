import { Link } from 'react-router-dom'
import { MonoTitle, Section } from '@/components/Section'
import { Seo, blogIndexJsonLd } from '@/components/Seo'
import { Button } from '@/components/ui/button'
import {
  ARTICLE01_ES,
  BLOG_FEATURED_COMING_ES,
  BLOG_FILTER_SIGNALS_ES,
  BLOG_INDEX,
  BLOG_INDEX_ALTERNATES,
  BLOG_INDEX_ES,
} from '@/lib/blog'
import {
  DOCS_CATALOG_URL,
  DOCS_GTM_URL,
  MAILTO_HUB,
  WWW_GTM_URL,
  WWW_NEXUS_URL,
  WWW_STORE_URL,
} from '@/lib/links'

export default function BlogEsPage() {
  return (
    <>
      <Seo
        title={BLOG_INDEX_ES.title}
        description={BLOG_INDEX_ES.description}
        path={BLOG_INDEX_ES.path}
        lang="es"
        locale="es_MX"
        noindex={BLOG_INDEX_ES.noindex}
        alternates={BLOG_INDEX_ALTERNATES}
        jsonLd={blogIndexJsonLd(
          [{ path: ARTICLE01_ES.path, name: ARTICLE01_ES.title }],
          {
            path: BLOG_INDEX_ES.path,
            name: BLOG_INDEX_ES.title,
            description: BLOG_INDEX_ES.description,
            inLanguage: 'es',
            listName: 'Destacado',
          },
        )}
      />

      <Section first>
        <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-primary">
          Radar · filtro
        </p>
        <p className="mt-3 font-mono text-[12px] tracking-[0.04em] text-muted-foreground">
          <Link to={BLOG_INDEX.path} className="hover:text-foreground">
            EN
          </Link>
        </p>
        <h1
          className="mt-4 max-w-4xl font-heading font-extrabold tracking-[-0.03em]"
          style={{ fontSize: 'clamp(36px, 6vw, 64px)' }}
        >
          Sistemas que te quedan — para founders que instalan, no rentan
        </h1>
        <p className="mt-6 max-w-2xl text-[17px] text-muted-foreground md:text-[18px]">
          Este blog es un radar. Cada nota te dice si encajas en el ICP, nombra
          un dolor real de ops o GTM, y si quieres un sistema que se quede en tu
          equipo cuando se acaba el contrato. Dos escritorios: estrategia de CEO
          + install de ops. El siguiente paso es discovery, no un curso eterno.
        </p>
      </Section>

      <Section>
        <MonoTitle>Marco de filtro</MonoTitle>
        <p className="mt-6 max-w-2xl text-[16px] text-muted-foreground">
          Este blog etiqueta señal. En cada camino el CTA es discovery
          (strategy@) — no un pozo de artículos.
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
            How-to · GTM OS
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
            <Link to={ARTICLE01_ES.path}>Lee la guía</Link>
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
        <MonoTitle>Si tu cuello es…</MonoTitle>
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3">
          <article className="flex flex-col py-8 lg:pr-8">
            <h2 className="text-2xl font-heading font-extrabold tracking-[-0.03em]">
              Pipeline frío repetible / puertas de ICP
            </h2>
            <p className="mt-3 flex-1 text-[16px] text-muted-foreground">
              Empieza con Article01 y sigue a GTM OS.
            </p>
            <p className="mt-8 font-mono text-[12px] tracking-[0.04em]">
              <Link
                to={ARTICLE01_ES.path}
                className="text-foreground underline underline-offset-4 hover:text-primary"
              >
                Article01
              </Link>
              {' · '}
              <a
                href={WWW_GTM_URL}
                className="text-foreground underline underline-offset-4 hover:text-primary"
              >
                GTM OS
              </a>
            </p>
          </article>
          <article className="flex flex-col border-t border-border py-8 lg:border-t-0 lg:border-l lg:border-border lg:px-8">
            <h2 className="text-2xl font-heading font-extrabold tracking-[-0.03em]">
              Poseer la máquina vs retainer
            </h2>
            <p className="mt-3 flex-1 text-[16px] text-muted-foreground">
              Posts M1 cuando existan. Hoy el outbound es GTM OS.
            </p>
            <p className="mt-8 font-mono text-[12px] tracking-[0.04em]">
              <a
                href={WWW_GTM_URL}
                className="text-foreground underline underline-offset-4 hover:text-primary"
              >
                GTM OS
              </a>
            </p>
          </article>
          <article className="flex flex-col border-t border-border py-8 lg:border-t-0 lg:border-l lg:border-border lg:px-8">
            <h2 className="text-2xl font-heading font-extrabold tracking-[-0.03em]">
              Currículo / mapa de sistemas
            </h2>
            <p className="mt-3 flex-1 text-[16px] text-muted-foreground">
              Prueba en catalog — no es una segunda oferta.
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

      <Section>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="lg">
            <a href={MAILTO_HUB}>Habla con RutinHQ</a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href={WWW_GTM_URL}>GTM OS</a>
          </Button>
        </div>
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
            ficha GTM
          </a>
          {' · '}
          LP primaria{' '}
          <a
            href={WWW_GTM_URL}
            className="text-foreground underline underline-offset-4 hover:text-primary"
          >
            GTM OS
          </a>
          .
        </p>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          En espera hasta que esos escritorios tengan GO:{' '}
          <a
            href={WWW_STORE_URL}
            className="underline underline-offset-4 hover:text-foreground"
          >
            Store OS
          </a>
          {' · '}
          <a
            href={WWW_NEXUS_URL}
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
