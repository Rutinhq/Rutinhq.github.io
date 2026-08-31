import { Button } from '@/components/ui/button'

export function CtaBand({
  headline,
  subhead,
  cta,
}: {
  headline: string
  subhead: string
  cta: string
}) {
  return (
    <section className="border-t border-border bg-card py-24 md:py-32">
      <div className="container mx-auto px-6 md:px-10">
        <h2
          className="max-w-2xl font-heading font-extrabold tracking-[-0.03em]"
          style={{ fontSize: 'clamp(28px, 5vw, 48px)' }}
        >
          {headline}
        </h2>
        <p className="mt-6 max-w-xl text-muted-foreground">{subhead}</p>
        <Button asChild className="mt-10" size="lg">
          <a href="#contact">{cta}</a>
        </Button>
      </div>
    </section>
  )
}
