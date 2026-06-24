import type { Dictionary } from '@/lib/i18n/dictionaries'

export function Features({ dict }: { dict: Dictionary }) {
  return (
    <section id="features" className="border-b border-border">
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {dict.features.title}
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
          {dict.features.items.map((feature) => (
            <div key={feature.title} className="bg-background p-6">
              <h3 className="text-base font-medium tracking-tight">
                {feature.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {feature.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
