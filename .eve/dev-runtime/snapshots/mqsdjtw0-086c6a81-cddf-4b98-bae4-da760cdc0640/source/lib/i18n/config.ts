export const locales = ['en'] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

export function localeFromCountry(_country: string | null | undefined): Locale {
  return defaultLocale
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}
