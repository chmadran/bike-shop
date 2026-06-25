export type CatalogModel = {
  modelId: string
  name: string
  category: string
  priceGbp: number
  weightKg: number
  bestFor: string
  spec: string | null
}

export type MessageAttachment =
  | { type: 'catalog'; models: CatalogModel[] }

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
  attachments?: MessageAttachment[]
}

export type ChatStatus = 'idle' | 'loading' | 'streaming'

export type ChatView = 'chat' | 'history' | 'internals'

export type TurnMeta = {
  totalMs: number
  firstTokenMs: number | null
  interTokenMs: number | null
  toolsCalled: string[]
  skillsLoaded: string[]
  eventCount: number
}

export type StoredSession = {
  key: string
  title: string
  eveSessionId: string | null
  continuationToken: string | null
  streamIndex: number
  messages: ChatMessage[]
  totalCostUsd: number
  createdAt: number
  updatedAt: number
}
