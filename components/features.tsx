const features = [
  {
    title: 'Free 30-day returns',
    body: 'Ride it for a month. If it is not the one, send it back on us.',
  },
  {
    title: 'Shipped ready to ride',
    body: '95% assembled out of the box. Add the pedals, set the bars, go.',
  },
  {
    title: 'Lifetime frame warranty',
    body: 'Every Cadence frame is covered for as long as you own the bike.',
  },
  {
    title: 'Free annual tune-up',
    body: 'Bring it to any partner shop once a year for a complimentary service.',
  },
]

export function Features() {
  return (
    <section id="features" className="border-b border-border">
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Why ride with us
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
          {features.map((feature) => (
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
