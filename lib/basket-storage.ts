export type BasketItem = {
  bikeId: string
  quantity: number
}

export const BASKET_STORAGE_KEY = 'vs_basket'

export function loadBasketFromStorage(): BasketItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = JSON.parse(localStorage.getItem(BASKET_STORAGE_KEY) ?? '[]') as BasketItem[]
    return raw.filter(
      (item) =>
        typeof item.bikeId === 'string' &&
        typeof item.quantity === 'number' &&
        item.quantity > 0,
    )
  } catch {
    return []
  }
}

export function saveBasketToStorage(items: BasketItem[]) {
  localStorage.setItem(BASKET_STORAGE_KEY, JSON.stringify(items))
}
