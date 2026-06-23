const faqs = [
  {
    q: 'How long does shipping take?',
    a: 'Most orders ship within 2 business days and arrive in 5–7 business days. You will get a tracking link by email as soon as your bike is on its way.',
  },
  {
    q: 'Do I need to assemble the bike?',
    a: 'Bikes arrive about 95% assembled. You will need to attach the pedals, straighten the handlebars, and check the tire pressure. It takes around 15 minutes with the included tools.',
  },
  {
    q: 'What sizes are available?',
    a: 'Every model comes in S, M, L, and XL. Use the size guide on each product page, or message us your height and inseam and we will recommend a fit.',
  },
  {
    q: 'What is your return policy?',
    a: 'You can return any bike within 30 days for a full refund, as long as it is in resalable condition. Return shipping is on us.',
  },
  {
    q: 'Is the electric bike battery covered under warranty?',
    a: 'Yes. The Volt EV battery is covered for 2 years, and the frame carries our lifetime warranty like every Cadence bike.',
  },
]

export function Faq() {
  return (
    <section id="faq" className="border-b border-border">
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Frequently asked questions
          </h2>
          <p className="text-sm text-muted-foreground">
            Can&apos;t find what you need? Ask our assistant in the corner.
          </p>
        </div>

        <div className="mt-8 divide-y divide-border overflow-hidden rounded-lg border border-border">
          {faqs.map((faq) => (
            <details key={faq.q} className="group bg-card">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 text-sm font-medium transition-colors hover:bg-muted">
                {faq.q}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-45"
                  aria-hidden="true"
                >
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </summary>
              <p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
