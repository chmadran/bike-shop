import Link from 'next/link'
import { site } from '@/lib/content'
import { V0Logo } from '@/components/v0-logo'

export function SiteHeader() {
  const { nav, shop } = site.header

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <V0Logo />
          <span className="font-mono text-sm font-medium tracking-tight">
            vur selle
          </span>
        </Link>

        <nav className="hidden items-center gap-6 sm:flex">
          <a href="#bikes" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            {nav.bikes}
          </a>
          <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            {nav.features}
          </a>
        </nav>

        <a
          href="#bikes"
          className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          {shop}
        </a>
      </div>
    </header>
  )
}
