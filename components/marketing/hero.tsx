import Image from 'next/image'
import type { Dictionary } from '@/lib/i18n/dictionaries'

export function Hero({ dict }: { dict: Dictionary }) {
  const { hero } = dict

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col items-start gap-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 font-mono text-xs text-muted-foreground">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: 'var(--geist-blue)' }}
              />
              {hero.badge}
            </span>
            <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              {hero.title}
            </h1>
            <p className="max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              {hero.subtitle}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">

            </div>

            <dl className="mt-6 grid w-full max-w-md grid-cols-3 gap-4 border-t border-border pt-6">
              <div>
                <dt className="font-mono text-xs text-muted-foreground">
                  {hero.stats.models.label}
                </dt>
                <dd className="mt-1 text-xl font-semibold tracking-tight">
                  {hero.stats.models.value}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-xs text-muted-foreground">
                  {hero.stats.warranty.label}
                </dt>
                <dd className="mt-1 text-xl font-semibold tracking-tight">
                  {hero.stats.warranty.value}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-xs text-muted-foreground">
                  {hero.stats.returns.label}
                </dt>
                <dd className="mt-1 text-xl font-semibold tracking-tight">
                  {hero.stats.returns.value}
                </dd>
              </div>
            </dl>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-xl border border-border bg-muted shadow-sm">
              <Image
                src="/bikes/hero-bike.png"
                alt={hero.imageAlt}
                width={1200}
                height={900}
                priority
                className="aspect-[4/3] h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
