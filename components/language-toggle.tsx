'use client'

import { usePathname, useRouter } from 'next/navigation'
import { locales, type Locale } from '@/lib/i18n/config'

const labels: Record<Locale, string> = {
  en: 'EN',
  fr: 'FR',
}

export function LanguageToggle({
  locale,
  label,
}: {
  locale: Locale
  label: string
}) {
  const pathname = usePathname()
  const router = useRouter()

  function switchTo(next: Locale) {
    if (next === locale) return
    // Persist the manual choice so it overrides geo-detection next time.
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000;samesite=lax`

    // Swap the leading locale segment in the current path.
    const segments = pathname.split('/')
    if (locales.includes(segments[1] as Locale)) {
      segments[1] = next
    } else {
      segments.splice(1, 0, next)
    }
    router.push(segments.join('/') || `/${next}`)
  }

  return (
    <div
      className="flex items-center rounded-md border border-border p-0.5"
      role="group"
      aria-label={label}
    >
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchTo(l)}
          aria-pressed={l === locale}
          className={
            l === locale
              ? 'rounded-[5px] bg-foreground px-2 py-1 font-mono text-xs font-medium text-background'
              : 'rounded-[5px] px-2 py-1 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground'
          }
        >
          {labels[l]}
        </button>
      ))}
    </div>
  )
}
