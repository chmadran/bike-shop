'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  loadBasketFromStorage,
  saveBasketToStorage,
  type BasketItem,
} from '@/lib/basket-storage'

type BasketContextValue = {
  items: BasketItem[]
  count: number
  addItem: (bikeId: string) => void
  removeItem: (bikeId: string) => void
  clear: () => void
  hasItem: (bikeId: string) => boolean
}

const BasketContext = createContext<BasketContextValue | null>(null)

export function BasketProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BasketItem[]>([])

  useEffect(() => {
    setItems(loadBasketFromStorage())
  }, [])

  const addItem = useCallback((bikeId: string) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.bikeId === bikeId)
      const next = existing
        ? prev.map((item) =>
            item.bikeId === bikeId ? { ...item, quantity: item.quantity + 1 } : item,
          )
        : [...prev, { bikeId, quantity: 1 }]
      saveBasketToStorage(next)
      return next
    })
  }, [])

  const removeItem = useCallback((bikeId: string) => {
    setItems((prev) => {
      const next = prev.filter((item) => item.bikeId !== bikeId)
      saveBasketToStorage(next)
      return next
    })
  }, [])

  const clear = useCallback(() => {
    setItems([])
    saveBasketToStorage([])
  }, [])

  const hasItem = useCallback(
    (bikeId: string) => items.some((item) => item.bikeId === bikeId),
    [items],
  )

  const count = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  )

  const value = useMemo(
    () => ({ items, count, addItem, removeItem, clear, hasItem }),
    [items, count, addItem, removeItem, clear, hasItem],
  )

  return <BasketContext.Provider value={value}>{children}</BasketContext.Provider>
}

export function useBasket() {
  const ctx = useContext(BasketContext)
  if (!ctx) {
    throw new Error('useBasket must be used within BasketProvider')
  }
  return ctx
}
