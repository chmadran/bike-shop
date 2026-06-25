import { bikes } from '@/lib/bikes'
import type { CatalogModel, MessageAttachment } from '@/lib/chat-types'

type ActionResultPayload = {
  kind?: string
  toolName?: string
  name?: string
  output?: unknown
  callId?: string
}

type PendingToolCall = {
  toolName: string
  input: unknown
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function parseCatalogModel(value: unknown): CatalogModel | null {
  if (!value || typeof value !== 'object') return null
  const row = value as Record<string, unknown>

  const priceGbp = toNumber(row.priceGbp)
  const weightKg = toNumber(row.weightKg)
  if (
    typeof row.name !== 'string' ||
    typeof row.category !== 'string' ||
    typeof row.bestFor !== 'string' ||
    priceGbp === null ||
    weightKg === null
  ) {
    return null
  }

  return {
    name: row.name,
    category: row.category,
    priceGbp,
    weightKg,
    bestFor: row.bestFor,
    spec: typeof row.spec === 'string' ? row.spec : null,
  }
}

export function normalizeToolName(toolName: string): string {
  return toolName.replace(/^eve:/, '').split('/').pop() ?? toolName
}

export function parseCatalogOutput(output: unknown): CatalogModel[] | null {
  if (!output || typeof output !== 'object') return null
  const models = (output as { models?: unknown }).models
  if (!Array.isArray(models)) return null

  const parsed = models
    .map(parseCatalogModel)
    .filter((model): model is CatalogModel => model !== null)

  return parsed.length > 0 ? parsed : null
}

export function catalogModelFromLocalBike(modelName: string): CatalogModel | null {
  const bike = bikes.find((item) => item.name.toLowerCase() === modelName.toLowerCase())
  if (!bike) return null

  const weightMatch = bike.spec.match(/^([\d.]+)\s*kg/)
  const weightKg = weightMatch ? Number(weightMatch[1]) : 0

  return {
    name: bike.name,
    category: bike.category,
    priceGbp: bike.price,
    weightKg,
    bestFor: bike.description,
    spec: bike.spec,
  }
}

/** Match a bike name mentioned in the assistant reply (fallback when stock wasn't checked). */
export function inferFocusModelFromText(
  text: string,
  catalog: CatalogModel[] | null,
): string | null {
  if (!catalog?.length || !text.trim()) return null

  const haystack = text.toLowerCase()
  const matches = catalog.filter((model) => haystack.includes(model.name.toLowerCase()))
  return matches.length === 1 ? matches[0].name : null
}

/** One card for the recommended model only — never the full catalog grid. */
export function buildRecommendedBikeAttachment(
  catalog: CatalogModel[] | null,
  focusModel: string | null,
): MessageAttachment | null {
  if (!focusModel) return null

  const fromCatalog = catalog?.find(
    (model) => model.name.toLowerCase() === focusModel.toLowerCase(),
  )
  if (fromCatalog) return { type: 'catalog', models: [fromCatalog] }

  const local = catalogModelFromLocalBike(focusModel)
  return local ? { type: 'catalog', models: [local] } : null
}

export function focusModelFromStockInput(input: unknown): string | null {
  const modelName = (input as { modelName?: string } | undefined)?.modelName
  return typeof modelName === 'string' && modelName.trim() ? modelName.trim() : null
}

export function mergeAttachments(
  existing: MessageAttachment[] | undefined,
  next: MessageAttachment,
): MessageAttachment[] {
  const kept = (existing ?? []).filter((item) => item.type !== next.type)
  return [...kept, next]
}

export function skillNameFromActionResult(result: ActionResultPayload): string | null {
  if (result.kind === 'load-skill-result' && typeof result.name === 'string') {
    return result.name
  }
  return null
}

export function toolNameFromActionResult(result: ActionResultPayload): string | null {
  if (result.kind !== 'tool-result' || typeof result.toolName !== 'string') return null
  return normalizeToolName(result.toolName)
}

export type { PendingToolCall }
