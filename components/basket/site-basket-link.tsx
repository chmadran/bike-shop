'use client'

import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useBasket } from '@/components/basket/basket-provider'

export function SiteBasketLink() {
  const { count } = useBasket()

  return (
    <Link
      href="/basket"
      className="relative inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
      aria-label={count > 0 ? `Basket, ${count} items` : 'Basket'}
    >
      <ShoppingBag className="h-4 w-4" aria-hidden="true" />
      <span>Basket</span>
      {count > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-medium text-background">
          {count}
        </span>
      )}
    </Link>
  )
}
