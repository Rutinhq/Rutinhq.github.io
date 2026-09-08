import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Section } from '@/components/Section'
import { blogIndexJsonLd, Seo } from '@/components/Seo'
import { POSTS, postPath } from '@/lib/blog'
import { DOCS_CATALOG_URL } from '@/lib/links'

export default function BlogIndexPage() {
  const { t } = useTranslation()

  return (
    <>
      <Seo
        title={t('seo.blogTitle')}
        description={t('seo.blogDescription')}
        path="/blog"
        jsonLd={blogIndexJsonLd(t('seo.blogTitle'), t('seo.blogDescription'))}
      />

      <Section first>
        <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-primary">
          {t('blog.eyebrow')}
        </p>
        <h1
          className="mt-4 max-w-4xl font-heading font-extrabold tracking-[-0.03em]"
          style={{ fontSize: 'clamp(36px, 6vw, 64px)' }}
        >
          {t('blog.headline')}
        </h1>
        <p className="mt-6 max-w-2xl text-[17px] text-muted-foreground md:text-[18px]">
          {t('blog.subhead')}
        </p>
      </Section>

      <Section>
        <ul className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          {POSTS.map((post) => (
            <li key={post.slug}>
              <article>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {post.datePublished}
                  {post.demo ? ` · ${t('blog.demoBadge')}` : null}
                </p>
                <h2 className="mt-3 text-2xl font-heading font-extrabold tracking-[-0.03em]">
                  <Link
                    to={postPath(post.slug)}
                    className="hover:text-primary"
                  >
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-3 max-w-xl text-[16px] text-muted-foreground">
                  {post.description}
                </p>
                <Link
                  to={postPath(post.slug)}
                  className="mt-6 inline-block font-mono text-[12px] tracking-[0.08em] text-foreground hover:text-primary"
                >
                  {t('blog.read')}
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {t('blog.catalogLead')}{' '}
          <Link to="/gtm-os" className="text-foreground underline underline-offset-4 hover:text-primary">
            GTM OS
          </Link>
          ,{' '}
          <Link to="/store-os" className="text-foreground underline underline-offset-4 hover:text-primary">
            Store OS
          </Link>
          ,{' '}
          <Link to="/nexus-os" className="text-foreground underline underline-offset-4 hover:text-primary">
            NEXUS OS
          </Link>
          . {t('blog.docsLead')}{' '}
          <a
            href={DOCS_CATALOG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground underline underline-offset-4 hover:text-primary"
          >
            docs.rutinhq.com/catalog
          </a>
          .
        </p>
      </Section>
    </>
  )
}
