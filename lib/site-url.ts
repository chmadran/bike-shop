function normalizeSiteUrl(raw: string): string | null {
  const trimmed = raw.trim().replace(/\/$/, '')
  if (!trimmed) return null

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`

  try {
    const url = new URL(withProtocol)
    return url.origin
  } catch {
    return null
  }
}

function siteUrlFromRequest(request: Request): string | null {
  const origin = request.headers.get('origin')
  if (origin) return normalizeSiteUrl(origin)

  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  if (!host) return null

  const proto = request.headers.get('x-forwarded-proto') ?? 'http'
  return normalizeSiteUrl(`${proto}://${host}`)
}

/** Resolve absolute site origin for Stripe redirect URLs. */
export function getSiteUrl(request?: Request): string {
  if (request) {
    const fromRequest = siteUrlFromRequest(request)
    if (fromRequest) return fromRequest
  }

  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL
  if (fromEnv) {
    const normalized = normalizeSiteUrl(fromEnv)
    if (normalized) return normalized
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  return 'http://localhost:3000'
}
