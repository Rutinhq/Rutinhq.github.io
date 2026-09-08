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
  lpHref: string
  lpLabel: string
}

type BlogPostLayoutProps = {
  typeLabel: string
  breadcrumbs: readonly BlogBreadcrumb[]
  title: string
  lede: ReactNode
  children: ReactNode
  faqTitle: string
  faq: readonly BlogFaqItem[]
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
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join('|')}>
              {row.map((cell, index) => (
                <td key={`${row[0]}-${cell}-${index}`}>{cell}</td>
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
  faqTitle,
  faq,
  cta,
}: BlogPostLayoutProps) {
  return (
    <article className="bg-background px-5 py-12 sm:px-6 md:px-10 md:py-16">
      <div className="mx-auto w-full max-w-[65ch]">
        <p className="text-[13px] font-medium text-primary">{typeLabel}</p>
        <nav
          aria-label="Breadcrumb"
          className="mt-3 text-[13px] leading-6 text-muted-foreground"
        >
          {breadcrumbs.map((crumb, index) => (
            <span key={`${crumb.label}-${index}`}>
              {index > 0 ? <span aria-hidden="true"> / </span> : null}
              {crumb.to ? (
                <Link to={crumb.to} className="hover:text-foreground">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-foreground/80">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>

        <h1 className="blog-post-title mt-6">{title}</h1>
        <div className="blog-lede mt-5">{lede}</div>

        <BlogProse className="mt-12">{children}</BlogProse>

        <section className="mt-14 border-t border-border pt-10">
          <h2 className="blog-section-heading">{faqTitle}</h2>
          <div className="mt-8 space-y-8">
            {faq.map((item) => (
              <div key={item.q}>
                <h3 className="blog-faq-question">{item.q}</h3>
                <div className="blog-faq-answer mt-2">{item.a}</div>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-14 border-t border-border pt-10">
          <h2 className="blog-section-heading">{cta.title}</h2>
          {cta.body ? <div className="blog-lede mt-4">{cta.body}</div> : null}
          <p className="mt-5 text-[18px] leading-[1.7] text-foreground">
            <a
              href={cta.mailto}
              className="underline underline-offset-4 hover:text-primary"
            >
              {cta.mailtoLabel ?? 'strategy@'}
            </a>
            {' · '}
            <a
              href={cta.lpHref}
              className="underline underline-offset-4 hover:text-primary"
            >
              {cta.lpLabel}
            </a>
          </p>
        </footer>
      </div>
    </article>
  )
}
