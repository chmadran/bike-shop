export type CatalogModel = {
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
