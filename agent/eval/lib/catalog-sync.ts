import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { neon } from '@neondatabase/serverless'
import type { Bike } from '@/lib/bike-types'

type CatalogRow = {
  model_id: string
  model_name: string
  price_gbp: number
}

const HALLUCINATED_PRICES = [999, 1500, 1999, 2500, 2999, 3500, 5000]

function loadCatalogSeed(): Bike[] {
  const path = join(process.cwd(), 'data/bike-catalog.json')
  return JSON.parse(readFileSync(path, 'utf8')) as Bike[]
}

/** Ensures Neon bike_stock prices match data/bike-catalog.json before price evals run. */
export async function assertCatalogDbInSync(): Promise<void> {
  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error('DATABASE_URL is required — add it to .env.local and run `pnpm seed` first.')
  }

  const sql = neon(process.env.DATABASE_URL)
  const rows = (await sql`
    SELECT DISTINCT ON (model_id)
      model_id, model_name, price_gbp
    FROM bike_stock
    WHERE price_gbp IS NOT NULL
    ORDER BY model_id, updated_at DESC
  `) as CatalogRow[]

  if (rows.length === 0) {
    throw new Error('bike_stock is empty — run `pnpm seed:stock` first.')
  }

  const seed = loadCatalogSeed()
  for (const bike of seed) {
    const row = rows.find((r) => r.model_id === bike.modelId)
    if (!row) {
      throw new Error(`${bike.name} (${bike.modelId}) missing from bike_stock`)
    }
    if (row.price_gbp !== bike.priceGbp) {
      throw new Error(
        `${bike.name}: DB £${row.price_gbp} ≠ seed £${bike.priceGbp} in data/bike-catalog.json`,
      )
    }
  }

  const catalogPrices = new Set(rows.map((r) => r.price_gbp))
  const stray = HALLUCINATED_PRICES.filter((p) => catalogPrices.has(p))
  if (stray.length > 0) {
    throw new Error(`Unexpected trap prices in live catalog: £${stray.join(', £')}`)
  }
}
