import Image from 'next/image'

export function Hero() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:py-24">
        <div className="flex flex-col items-start gap-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 font-mono text-xs text-muted-foreground">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: 'var(--geist-blue)' }}
            />
            New 2026 lineup
          </span>
          <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            Bikes engineered for the details.
          </h1>
          <p className="max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Cadence builds precision road, mountain, city, and electric bikes.
            Thoughtfully specced, ready to ride, and backed by a team that
            actually rides.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <a
              href="#bikes"
              className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Browse bikes
            </a>
            <a
              href="#faq"
              className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Read the FAQ
            </a>
          </div>
        </div>

        <div className="mt-12 overflow-hidden rounded-lg border border-border bg-muted">
          <Image
            src="/bikes/hero-bike.png"
            alt="A premium Cadence road bicycle"
            width={1200}
            height={700}
            priority
            className="h-auto w-full object-cover"
          />
        </div>
      </div>
    </section>
  )
}
