import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Section({
  children,
  className,
  first = false,
}: {
  children: ReactNode
  className?: string
  first?: boolean
}) {
  return (
    <section
      className={cn(
        'bg-background py-12 md:py-16',
        first ? 'py-16 md:py-20' : 'border-t border-border',
        className,
      )}
    >
      <div className="container mx-auto px-6 md:px-10">{children}</div>
    </section>
  )
}

export function MonoTitle({
  children,
  muted = false,
}: {
  children: ReactNode
  muted?: boolean
}) {
  return (
    <h2
      className={cn(
        'font-mono text-[11px] uppercase tracking-[0.18em]',
        muted ? 'text-muted-foreground' : 'text-primary',
      )}
    >
      {children}
    </h2>
  )
}

export function BulletList({
  items,
  muted = false,
}: {
  items: string[]
  muted?: boolean
}) {
  return (
    <ul className="mt-6 max-w-2xl space-y-3">
      {items.map((item) => (
        <li
          key={item}
          className={cn(
            'flex gap-3 text-[16px]',
            muted ? 'text-muted-foreground' : 'text-foreground',
          )}
        >
          <span className={muted ? undefined : 'text-primary'} aria-hidden="true">
            ·
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}
