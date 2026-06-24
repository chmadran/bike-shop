import { NextResponse, type NextRequest } from 'next/server'
import { parseChatMessage } from '@/lib/validation/chat'

const PUBLIC_FILE = /\.(.*)$/

// Simple in-process rate limiter for the eve agent endpoints.
// 20 requests per IP per minute — enough for a genuine user, blocks scrapers.
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

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rate-limit + validate eve agent endpoints.
  if (pathname.startsWith('/eve/v1/session')) {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
    if (isRateLimited(ip)) {
      return new NextResponse('Too many requests', { status: 429 })
    }

    // Sanitize the chat payload server-side before it reaches the agent.
    // Only message-bearing POSTs carry a body worth validating (the GET
    // streaming endpoint has none). We clone the request so reading the body
    // here does not consume the stream forwarded downstream to eve.
    if (request.method === 'POST') {
      let body: unknown
      try {
        body = await request.clone().json()
      } catch {
        return NextResponse.json(
          { error: 'Invalid JSON body.' },
          { status: 400 },
        )
      }

      const result = parseChatMessage(body)
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }
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

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
}
