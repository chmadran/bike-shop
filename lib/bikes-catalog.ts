import { unstable_cache } from 'next/cache'
import { neon } from '@neondatabase/serverless'
import { loadBikeCatalogSeed } from '@/lib/bike-assets'
import type { Bike } from '@/lib/bike-types'

const CATALOG_TAG = 'bikes'

type StockCatalogRow = {
  model_id: string
  model_name: string
  category: string
  price_gbp: number
  weight_kg: number | null
  best_for: string | null
  spec: string | null
}

type SqlClient = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<unknown>

function rowToBike(row: StockCatalogRow, seed: Map<string, Bike>): Bike {
  const fallback = seed.get(row.model_id)

  return {
    modelId: row.model_id,
    name: row.model_name,
    category: row.category,
    priceGbp: row.price_gbp,
    weightKg: row.weight_kg !== null ? Number(row.weight_kg) : fallback?.weightKg ?? null,
    bestFor: row.best_for ?? fallback?.bestFor ?? '',
    spec: row.spec ?? fallback?.spec ?? '',
    description: fallback?.description ?? row.best_for ?? '',
    image: fallback?.image ?? '',
    highlights: fallback?.highlights ?? [],
  }
}

async function fetchCatalogRows(sql: SqlClient): Promise<StockCatalogRow[]> {
  return (await sql`
    SELECT DISTINCT ON (model_id)
      model_id,
      model_name,
      category,
      price_gbp,
      weight_kg,
      best_for,
      spec
    FROM bike_stock
    WHERE model_id IS NOT NULL AND price_gbp IS NOT NULL
    ORDER BY model_id, updated_at DESC, warehouse
  `) as StockCatalogRow[]
}

async function fetchBikeCatalogFromDb(): Promise<Bike[]> {
  const sql = neon(process.env.DATABASE_URL!)
  const seed = loadBikeCatalogSeed()
  const rows = await fetchCatalogRows(sql)
  return rows.map((row) => rowToBike(row, seed))
}

export const getCachedBikeCatalog = unstable_cache(
  fetchBikeCatalogFromDb,
  ['bike-catalog-v2'],
  { tags: [CATALOG_TAG] },
)

/** Always derived from the catalog cache so list/detail/basket show the same image. */
export async function getCachedBike(modelId: string): Promise<Bike | undefined> {
  const catalog = await getCachedBikeCatalog()
  return catalog.find((bike) => bike.modelId === modelId)
}
