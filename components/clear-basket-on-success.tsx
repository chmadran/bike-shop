'use client'

import { useEffect } from 'react'
import { useBasket } from '@/components/basket-provider'

export function ClearBasketOnSuccess() {
  const { clear } = useBasket()

  useEffect(() => {
    clear()
  }, [clear])

  return null
}
