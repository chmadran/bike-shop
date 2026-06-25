import { site } from '@/lib/content'

export function Features() {
  const { features } = site

  return (
    <section id="features" className="border-b border-border">
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {features.title}
        </h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2">
          {features.items.map((item) => (
            <li key={item.title} className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold tracking-tight">{item.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
