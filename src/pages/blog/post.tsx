import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { MonoTitle, Section } from '@/components/Section'
import { blogPostJsonLd, Seo } from '@/components/Seo'
import { getPost, postPath } from '@/lib/blog'
import {
  DOCS_CATALOG_URL,
  DOCS_GTM_URL,
  DOCS_NEXUS_URL,
  DOCS_STORE_URL,
} from '@/lib/links'
import NotFoundPage from '@/pages/not-found'

const RELATED = [
  { to: '/gtm-os', label: 'GTM OS', docs: DOCS_GTM_URL },
  { to: '/store-os', label: 'Store OS', docs: DOCS_STORE_URL },
  { to: '/nexus-os', label: 'NEXUS OS', docs: DOCS_NEXUS_URL },
] as const

export default function BlogPostPage() {
  const { t } = useTranslation()
  const { slug } = useParams()
  const post = getPost(slug)

  if (!post) {
    return <NotFoundPage />
  }

  const path = postPath(post.slug)

  return (
    <>
      <Seo
        title={`${post.title} — RutinHQ`}
        description={post.description}
        path={path}
        ogType="article"
        publishedTime={post.datePublished}
        jsonLd={blogPostJsonLd({
          path,
          title: post.title,
          description: post.description,
          datePublished: post.datePublished,
        })}
      />

      <Section first>
        <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-primary">
          {t('blog.eyebrow')}
          {post.demo ? ` · ${t('blog.demoBadge')}` : null}
        </p>
        <h1
          className="mt-4 max-w-4xl font-heading font-extrabold tracking-[-0.03em]"
          style={{ fontSize: 'clamp(36px, 6vw, 64px)' }}
        >
          {post.title}
        </h1>
        <p className="mt-3 font-mono text-[11px] tracking-[0.12em] text-muted-foreground">
          {post.datePublished}
        </p>
        <p className="mt-6 max-w-2xl text-[17px] text-foreground md:text-[18px]">
          {post.lede}
        </p>
      </Section>

      {post.sections.map((section) => (
        <Section key={section.heading}>
          <MonoTitle>{section.heading}</MonoTitle>
          <p className="mt-6 max-w-2xl text-[16px] text-foreground">
            {section.body}
          </p>
        </Section>
      ))}

      <Section>
        <MonoTitle>{t('blog.related')}</MonoTitle>
        <ul className="mt-6 max-w-2xl space-y-3 text-[16px]">
          {RELATED.map((item) => (
            <li key={item.to} className="flex flex-wrap gap-x-3 gap-y-1">
              <span className="text-primary" aria-hidden="true">
                ·
              </span>
              <Link to={item.to} className="text-foreground hover:text-primary">
                {item.label}
              </Link>
              <span className="text-muted-foreground">·</span>
              <a
                href={item.docs}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                {t('common.docs')}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-8 max-w-2xl text-sm text-muted-foreground">
          {t('blog.docsLead')}{' '}
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
        <Link
          to="/blog"
          className="mt-8 inline-block font-mono text-[12px] tracking-[0.08em] text-foreground hover:text-primary"
        >
          {t('blog.back')}
        </Link>
      </Section>
    </>
  )
}
