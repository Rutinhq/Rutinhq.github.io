import { MonoTitle, Section } from '@/components/Section'

export type VisibleFaqItem = { q: string; a: string }

/** Compact on-page FAQ. Visible q/a MUST match FAQPage JSON-LD 1:1. */
export function FaqSection({
  title,
  items,
}: {
  title: string
  items: readonly VisibleFaqItem[]
}) {
  if (items.length === 0) return null

  return (
    <Section>
      <MonoTitle>{title}</MonoTitle>
      <div className="mt-6 max-w-2xl space-y-8">
        {items.map((item) => (
          <div key={item.q}>
            <h3 className="text-[17px] font-heading font-extrabold tracking-[-0.02em]">
              {item.q}
            </h3>
            <p className="mt-2 text-[16px] text-muted-foreground">{item.a}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}
