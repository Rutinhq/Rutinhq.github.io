import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export type BlogBreadcrumb = {
  label: string
  to?: string
}

export type BlogFaqItem = {
  q: string
  a: ReactNode
}

export type BlogPostCta = {
  title: string
  body?: ReactNode
  mailto: string
  mailtoLabel?: string
  calendly?: string
  calendlyLabel?: string
  lpHref: string
  lpLabel: string
}

type BlogPostLayoutProps = {
  typeLabel: string
  breadcrumbs: readonly BlogBreadcrumb[]
  title: string
  lede: ReactNode
  children: ReactNode
  draft?: boolean
  faqTitle?: string
  faq?: readonly BlogFaqItem[]
  cta: BlogPostCta
}

export function BlogProse({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn('blog-prose', className)}>{children}</div>
}

export function BlogTable({
  headers,
  rows,
}: {
  headers: string[]
  rows: string[][]
}) {
  return (
    <div className="blog-table-wrap">
      <table>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} scope="col">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join('|')}>
              {row.map((cell, index) => (
                <td
                  key={`${row[0]}-${cell}-${index}`}
                  data-label={headers[index]}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function BlogPostLayout({
  typeLabel,
  breadcrumbs,
  title,
  lede,
  children,
  draft = false,
  faqTitle,
  faq = [],
  cta,
}: BlogPostLayoutProps) {
  return (
    <article className="blog-post">
      <div className="blog-post-column">
        {draft ? (
          <p className="blog-kicker" role="status">
            DRAFT — outline only. Not for index until publish GO.
          </p>
        ) : null}
        <p className="blog-kicker">{typeLabel}</p>
        <nav aria-label="Breadcrumb" className="blog-breadcrumb">
          {breadcrumbs.map((crumb, index) => (
            <span key={`${crumb.label}-${index}`}>
              {index > 0 ? <span aria-hidden="true"> / </span> : null}
              {crumb.to ? (
                <Link to={crumb.to} className="hover:text-foreground">
                  {crumb.label}
                </Link>
              ) : (
                <span>{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>

        <h1 className="blog-post-title">{title}</h1>
        <div className="blog-lede">{lede}</div>

        <BlogProse>{children}</BlogProse>

        {faqTitle && faq.length > 0 ? (
          <section className="blog-faq">
            <h2 className="blog-section-heading">{faqTitle}</h2>
            <div className="blog-faq-list">
              {faq.map((item) => (
                <div key={item.q}>
                  <h3 className="blog-faq-question">{item.q}</h3>
                  <div className="blog-faq-answer">{item.a}</div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <footer className="blog-cta">
          <h2 className="blog-section-heading">{cta.title}</h2>
          {cta.body ? <div className="blog-lede">{cta.body}</div> : null}
          <p className="blog-cta-links">
            {cta.calendly ? (
              <>
                <a
                  href={cta.calendly}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {cta.calendlyLabel ?? 'Calendly'}
                </a>
                {' · '}
              </>
            ) : null}
            <a href={cta.mailto}>{cta.mailtoLabel ?? 'strategy@'}</a>
            {' · '}
            <a href={cta.lpHref}>{cta.lpLabel}</a>
          </p>
        </footer>
      </div>
    </article>
  )
}
