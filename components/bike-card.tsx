import Image from 'next/image'
import Link from 'next/link'
import type { Bike } from '@/lib/bikes'
import { priceFormatter } from '@/lib/content'

type BikeCardProps = {
  bike: Bike
  priority?: boolean
}

export function BikeCard({ bike, priority }: BikeCardProps) {
  return (
    <Link
      href={`/bikes?bike=${bike.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-foreground/30"
    >
      <div className="overflow-hidden border-b border-border bg-bike-surface">
        <Image
          src={bike.image}
          alt={bike.name}
          width={600}
          height={400}
          className="h-64 w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
          priority={priority}
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
            {bike.category}
          </span>
          <span className="text-sm font-medium">
            {priceFormatter.format(bike.price)}
          </span>
        </div>
        <h3 className="text-lg font-semibold tracking-tight">{bike.name}</h3>
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
          {bike.description}
        </p>
        <p className="mt-auto pt-2 font-mono text-xs text-muted-foreground">
          {bike.spec}
        </p>
        <span className="pt-1 text-xs font-medium text-foreground group-hover:underline">
          More details
        </span>
      </div>
    </Link>
  )
}
