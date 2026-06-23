import Image from 'next/image'
import { bikes } from '@/lib/bikes'
import type { Dictionary } from '@/lib/i18n/dictionaries'

export function BikeGrid({ dict }: { dict: Dictionary }) {
  const priceFormatter = new Intl.NumberFormat(dict.intl.locale, {
    style: 'currency',
    currency: dict.intl.currency,
    maximumFractionDigits: 0,
  })

  return (
    <section id="bikes" className="border-b border-border">
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {dict.bikeGrid.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {dict.bikeGrid.subtitle}
            </p>
          </div>
          <span className="hidden font-mono text-xs text-muted-foreground sm:block">
            {dict.bikeGrid.models(bikes.length)}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {bikes.map((bike) => {
            const content = dict.bikes[bike.id]
            return (
              <article
                key={bike.id}
                className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-foreground/30"
              >
                <div className="overflow-hidden border-b border-border bg-muted">
                  <Image
                    src={bike.image}
                    alt={content.name}
                    width={600}
                    height={400}
                    className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                      {content.category}
                    </span>
                    <span className="text-sm font-medium">
                      {priceFormatter.format(content.price)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight">
                    {content.name}
                  </h3>
                  <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                    {content.description}
                  </p>
                  <p className="mt-auto pt-2 font-mono text-xs text-muted-foreground">
                    {content.spec}
                  </p>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
