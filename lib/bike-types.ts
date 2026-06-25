export type Bike = {
  modelId: string
  name: string
  category: string
  priceGbp: number
  weightKg: number | null
  bestFor: string
  spec: string
  description: string
  image: string
  highlights: string[]
}

/** @deprecated Use Bike */
export type BikeModel = Bike
