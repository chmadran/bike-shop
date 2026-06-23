import { NextResponse, type NextRequest } from 'next/server'
import { locales, localeFromCountry, isLocale } from '@/lib/i18n/config'

const PUBLIC_FILE = /\.(.*)$/

function pathnameHasLocale(pathname: string) {
  return locales.some(
    (locale) =>
      pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  )
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip Next internals, API routes, and static files.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next()
  }

  // Already on a localized path — nothing to do.
  if (pathnameHasLocale(pathname)) {
    return NextResponse.next()
  }

  // 1. Respect a previously chosen locale (manual toggle sets this cookie).
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
  // 2. Otherwise fall back to the visitor's country from Vercel geo headers.
  const country = request.headers.get('x-vercel-ip-country')

  const locale =
    cookieLocale && isLocale(cookieLocale)
      ? cookieLocale
      : localeFromCountry(country)

  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
}
