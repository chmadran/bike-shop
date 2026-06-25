import { site } from '@/lib/content'
import { V0Logo } from '@/components/v0-logo'

export function SiteFooter() {
  return (
    <footer>
      <div className="mx-auto flex max-w-4xl flex-col items-start justify-between gap-4 px-4 py-10 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <V0Logo />
          <span className="font-mono text-sm">vur selle</span>
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          {site.footer.rights(new Date().getFullYear())}
        </p>
      </div>
    </footer>
  )
}
