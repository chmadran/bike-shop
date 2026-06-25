import { getCachedBikeCatalog } from '@/lib/bikes-catalog'
import { site } from '@/lib/content'
import { BikeCard } from '@/components/bike/bike-card'

export async function BikeGrid() {
  const bikes = await getCachedBikeCatalog()
  const { bikeGrid } = site

  return (
    <section id="bikes" className="border-b border-border">
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {bikeGrid.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {bikeGrid.subtitle}
            </p>
          </div>
          <span className="hidden font-mono text-xs text-muted-foreground sm:block">
            {bikeGrid.modelsLabel(bikes.length)}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {bikes.map((bike, i) => (
            <BikeCard key={bike.modelId} bike={bike} priority={i === 0} />
          ))}
        </div>
      </div>
    </section>
  )
}
