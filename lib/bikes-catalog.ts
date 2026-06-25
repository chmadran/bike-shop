import { unstable_cache } from 'next/cache'
import { neon } from '@neondatabase/serverless'
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
  image: string | null
  description: string | null
  highlights: string[] | null
}

type SqlClient = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<unknown>

function rowToBike(row: StockCatalogRow): Bike {
  return {
    modelId: row.model_id,
    name: row.model_name,
    category: row.category,
    priceGbp: row.price_gbp,
    weightKg: row.weight_kg !== null ? Number(row.weight_kg) : null,
    bestFor: row.best_for ?? '',
    spec: row.spec ?? '',
    description: row.description ?? row.best_for ?? '',
    image: row.image ?? '',
    highlights: Array.isArray(row.highlights) ? row.highlights : [],
  }
}

function isMissingDisplayColumnError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err)
  return message.includes('column "image" does not exist')
}

async function fetchCatalogRows(sql: SqlClient): Promise<StockCatalogRow[]> {
  try {
    return (await sql`
      SELECT DISTINCT ON (model_id)
        model_id,
        model_name,
        category,
        price_gbp,
        weight_kg,
        best_for,
        spec,
        image,
        description,
        highlights
      FROM bike_stock
      WHERE model_id IS NOT NULL AND price_gbp IS NOT NULL
      ORDER BY model_id, warehouse
    `) as StockCatalogRow[]
  } catch (err) {
    if (!isMissingDisplayColumnError(err)) throw err

    const rows = (await sql`
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
      ORDER BY model_id, warehouse
    `) as Omit<StockCatalogRow, 'image' | 'description' | 'highlights'>[]

    return rows.map((row) => ({
      ...row,
      image: null,
      description: null,
      highlights: null,
    }))
  }
}

async function fetchBikeRow(sql: SqlClient, modelId: string): Promise<StockCatalogRow | null> {
  try {
    const rows = (await sql`
      SELECT
        model_id,
        model_name,
        category,
        price_gbp,
        weight_kg,
        best_for,
        spec,
        image,
        description,
        highlights
      FROM bike_stock
      WHERE model_id = ${modelId}
      ORDER BY warehouse
      LIMIT 1
    `) as StockCatalogRow[]

    return rows[0] ?? null
  } catch (err) {
    if (!isMissingDisplayColumnError(err)) throw err

    const rows = (await sql`
      SELECT
        model_id,
        model_name,
        category,
        price_gbp,
        weight_kg,
        best_for,
        spec
      FROM bike_stock
      WHERE model_id = ${modelId}
      ORDER BY warehouse
      LIMIT 1
    `) as Omit<StockCatalogRow, 'image' | 'description' | 'highlights'>[]

    if (!rows[0]) return null
    return { ...rows[0], image: null, description: null, highlights: null }
  }
}

async function fetchBikeCatalogFromDb(): Promise<Bike[]> {
  const sql = neon(process.env.DATABASE_URL!)
  const rows = await fetchCatalogRows(sql)
  return rows.map(rowToBike)
}

export const getCachedBikeCatalog = unstable_cache(
  fetchBikeCatalogFromDb,
  ['bike-catalog'],
  { tags: [CATALOG_TAG] },
)

export async function getCachedBike(modelId: string): Promise<Bike | undefined> {
  const getOne = unstable_cache(
    async () => {
      const sql = neon(process.env.DATABASE_URL!)
      const row = await fetchBikeRow(sql, modelId)
      return row ? rowToBike(row) : null
    },
    ['bike', modelId],
    { tags: [CATALOG_TAG, `bike:${modelId}`] },
  )

  const result = await getOne()
  return result ?? undefined
}
