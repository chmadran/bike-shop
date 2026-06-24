import type { Dictionary } from '@/lib/i18n/dictionaries'

export function Faq({ dict }: { dict: Dictionary }) {
  return (
    <section id="faq" className="border-b border-border">
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {dict.faq.title}
          </h2>
          <p className="text-sm text-muted-foreground">{dict.faq.subtitle}</p>
        </div>

        <div className="mt-8 divide-y divide-border overflow-hidden rounded-lg border border-border">
          {dict.faq.items.map((faq) => (
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
