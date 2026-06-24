import Link from 'next/link'
import type { Dictionary } from '@/lib/i18n/dictionaries'

export function SiteHeader({ dict }: { dict: Dictionary }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-foreground text-background">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                d="M5 17a3 3 0 100-6 3 3 0 000 6zm14 0a3 3 0 100-6 3 3 0 000 6zM8 14l3-7h4l2 4m-9 3l4-7"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="font-mono text-sm font-medium tracking-tight">
            vur selle
          </span>
        </Link>

        <nav className="hidden items-center gap-6 sm:flex">
          {[
            { label: dict.header.nav.bikes, href: '#bikes' },
            { label: dict.header.nav.features, href: '#features' },
            { label: dict.header.nav.faq, href: '#faq' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href="#bikes"
          className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          {dict.header.shop}
        </a>
      </div>
    </header>
  )
}
