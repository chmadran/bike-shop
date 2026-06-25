import { NextResponse, type NextRequest } from 'next/server'

/** Paths with a file extension (e.g. /icon.svg, /bikes/road-bike.png). */
const PUBLIC_FILE = /\.(.*)$/

// ---------------------------------------------------------------------------
// In-memory rate limiter for Eve chat (demo / abuse protection).
// Allows EVE_RATE_LIMIT session POSTs per IP within each EVE_WINDOW_MS window.
// Note: resets when the server process restarts — use Redis/Vercel KV in production.
// ---------------------------------------------------------------------------
const EVE_RATE_LIMIT = 10
const EVE_WINDOW_MS = 60_000 // 1 minute
const rateMap = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateMap.get(ip)

  // New IP or window expired → start a fresh 1-minute bucket.
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + EVE_WINDOW_MS })
    return false
  }

  entry.count++
  return entry.count > EVE_RATE_LIMIT
}

/**
 * Next.js 16 network proxy (replaces middleware.ts).
 * Runs only on paths matched by `config.matcher` below.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Eve chat POST/GET stream — throttle before the request reaches the agent.
  // Matcher still includes /eve/* (no dot in path), so we guard here explicitly.
  if (pathname.startsWith('/eve/v1/session')) {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
    if (isRateLimited(ip)) {
      return new NextResponse('Too many requests', { status: 429 })
    }
  }

  // No other proxy logic yet — pass every matched request through unchanged.
  // (/_next, /api, and dotted static paths are already excluded by `matcher`.)
  return NextResponse.next()
}

export const config = {
  /**
   * Run this proxy only on "app pages", not on:
   *   - /_next/*     (Next.js assets)
   *   - /api/*       (Route Handlers)
   *   - *.*          (static files like .svg, .png, .css)
   *
   * /eve/* is NOT excluded here, so Eve session routes still enter `proxy`
   * and can be rate-limited above.
   */
  matcher: ['/((?!_next|api|.*\\..*).*)'],
}
