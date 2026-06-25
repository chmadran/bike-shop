'use client'

import { useBasket } from '@/components/basket-provider'

type AddToBasketButtonProps = {
  bikeId: string
  className?: string
  size?: 'sm' | 'md'
}

export function AddToBasketButton({
  bikeId,
  className = '',
  size = 'md',
}: AddToBasketButtonProps) {
  const { addItem, hasItem } = useBasket()
  const inBasket = hasItem(bikeId)

  const sizeClass =
    size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2 text-sm'

  return (
    <button
      type="button"
      onClick={() => addItem(bikeId)}
      disabled={inBasket}
      className={`rounded-md border border-border bg-foreground font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-default disabled:opacity-60 ${sizeClass} ${className}`}
    >
      {inBasket ? 'In basket' : 'Add to basket'}
    </button>
  )
}
