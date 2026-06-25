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
  const modelId =
    typeof row.modelId === 'string'
      ? row.modelId
      : typeof row.model_id === 'string'
        ? row.model_id
        : null

  if (
    !modelId ||
    typeof row.name !== 'string' ||
    typeof row.category !== 'string' ||
    typeof row.bestFor !== 'string' ||
    priceGbp === null ||
    weightKg === null
  ) {
    return null
  }

  return {
    modelId,
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

function modelMatchesFocus(model: CatalogModel, focus: string): boolean {
  const needle = focus.toLowerCase()
  return (
    model.modelId.toLowerCase() === needle || model.name.toLowerCase() === needle
  )
}

/** Match a bike mentioned in the assistant reply (fallback when stock wasn't checked). */
export function inferFocusModelFromText(
  text: string,
  catalog: CatalogModel[] | null,
): string | null {
  if (!catalog?.length || !text.trim()) return null

  const haystack = text.toLowerCase()
  const matches = catalog.filter(
    (model) =>
      haystack.includes(model.name.toLowerCase()) ||
      haystack.includes(model.modelId.toLowerCase()),
  )

  if (matches.length === 1) return matches[0].modelId
  if (matches.length > 1) {
    const byName = matches.filter((model) => haystack.includes(model.name.toLowerCase()))
    if (byName.length === 1) return byName[0].modelId
  }

  return null
}

/** One card for the recommended model only — never the full catalog grid. */
export function buildRecommendedBikeAttachment(
  catalog: CatalogModel[] | null,
  focusModelId: string | null,
): MessageAttachment | null {
  if (!focusModelId || !catalog?.length) return null

  const match = catalog.find((model) => modelMatchesFocus(model, focusModelId))
  return match ? { type: 'catalog', models: [match] } : null
}

export function focusModelFromStockInput(input: unknown): string | null {
  const row = input as { modelId?: string; modelName?: string } | undefined
  if (typeof row?.modelId === 'string' && row.modelId.trim()) {
    return row.modelId.trim()
  }
  if (typeof row?.modelName === 'string' && row.modelName.trim()) {
    return row.modelName.trim()
  }
  return null
}

export function focusModelFromStockResult(input: unknown, output: unknown): string | null {
  const result = output as { modelId?: string } | undefined
  if (typeof result?.modelId === 'string' && result.modelId.trim()) {
    return result.modelId.trim()
  }
  return focusModelFromStockInput(input)
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
