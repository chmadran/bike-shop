import { revalidateTag } from 'next/cache'
import { type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const secret =
    request.headers.get('x-revalidate-secret') ??
    request.nextUrl.searchParams.get('secret')

  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tag = request.nextUrl.searchParams.get('tag') ?? 'bikes'
  revalidateTag(tag, 'max')

  // Per-bike tags must also bust the shared catalog cache used by the grid.
  if (tag.startsWith('bike:') && tag !== 'bikes') {
    revalidateTag('bikes', 'max')
  }

  return Response.json({ revalidated: true, tag })
}
