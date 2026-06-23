export const locales = ['en', 'fr'] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

// Map a country code (from geo headers) to a locale.
export function localeFromCountry(country: string | null | undefined): Locale {
  if (!country) return defaultLocale
  return country.toUpperCase() === 'FR' ? 'fr' : 'en'
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}
