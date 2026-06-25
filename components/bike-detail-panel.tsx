import Image from 'next/image'
import { AddToBasketButton } from '@/components/add-to-basket-button'
import type { Bike } from '@/lib/bikes'
import { priceFormatter } from '@/lib/content'

export function BikeDetailPanel({ bike }: { bike: Bike }) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card animate-[fadein_0.2s_ease-in]">
      <div className="relative aspect-[4/3] bg-muted sm:aspect-[16/9]">
        <Image
          src={bike.image}
          alt={bike.name}
          fill
          className="object-contain p-2"
          sizes="(max-width: 768px) 100vw, 896px"
          priority
        />
      </div>

      <div className="flex flex-col gap-6 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
              {bike.category}
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{bike.name}</h2>
          </div>
          <p className="text-xl font-medium">{priceFormatter.format(bike.price)}</p>
        </div>

        <p className="text-pretty text-base leading-relaxed text-muted-foreground">
          {bike.description}
        </p>

        <p className="font-mono text-sm text-muted-foreground">{bike.spec}</p>

        <div>
          <h3 className="text-sm font-semibold tracking-tight">Details</h3>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
            {bike.highlights.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-foreground" aria-hidden="true">
                  ·
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <AddToBasketButton bikeId={bike.id} className="w-full sm:w-auto" />

        <p className="border-t border-border pt-4 text-xs text-muted-foreground">
          VAT included · Free 30-day returns · Lifetime frame warranty
        </p>
      </div>
    </section>
  )
}
