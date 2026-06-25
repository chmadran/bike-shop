import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Bike } from '@/lib/bike-types'

let seedCache: Map<string, Bike> | null = null

/** Static marketing assets — always from JSON, never from DB (avoids ISR/DB drift). */
export function loadBikeCatalogSeed(): Map<string, Bike> {
  if (seedCache) return seedCache
  const path = join(process.cwd(), 'data/bike-catalog.json')
  const seed = JSON.parse(readFileSync(path, 'utf8')) as Bike[]
  seedCache = new Map(seed.map((bike) => [bike.modelId, bike]))
  return seedCache
}
