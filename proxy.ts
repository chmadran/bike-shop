import { NextResponse, type NextRequest } from 'next/server'
import { locales, isLocale } from '@/lib/i18n/config'

const PUBLIC_FILE = /\.(.*)$/

// ---------------------------------------------------------------------------
// Simple in-process rate limiter for the eve agent endpoints.
// 20 requests per IP per minute — enough for a genuine user, blocks scrapers.
// ---------------------------------------------------------------------------
const EVE_RATE_LIMIT = 20
const EVE_WINDOW_MS = 60_000
const rateMap = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + EVE_WINDOW_MS })
    return false
  }
  entry.count++
  return entry.count > EVE_RATE_LIMIT
}

function pathnameHasLocale(pathname: string) {
  return locales.some(
    (locale) =>
      pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  )
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rate-limit eve agent endpoints.
  if (pathname.startsWith('/eve/v1/session')) {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
    if (isRateLimited(ip)) {
      return new NextResponse('Too many requests', { status: 429 })
    }
  }

  // Skip Next internals, API routes, eve agent routes, and static files.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/eve/') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next()
  }

  // Already on a localized path — nothing to do.
  if (pathnameHasLocale(pathname)) {
    return NextResponse.next()
  }

  const url = request.nextUrl.clone()
  url.pathname = `/en${pathname === '/' ? '' : pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
}
