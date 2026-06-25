import Link from 'next/link'
import { AddToBasketButton } from '@/components/add-to-basket-button'
import type { CatalogModel } from '@/lib/chat-types'
import { bikeDetailPath } from '@/lib/bike-paths'
import { priceFormatter } from '@/lib/content'

function ChatBikeCard({ model }: { model: CatalogModel }) {
  const spec = model.spec ?? `${model.weightKg} kg`
  const detailHref = bikeDetailPath(model.modelId)

  return (
    <article className="rounded-lg border border-border bg-background p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
            {model.category}
          </p>
          <h4 className="text-sm font-semibold tracking-tight">{model.name}</h4>
        </div>
        <p className="shrink-0 text-sm font-medium">{priceFormatter.format(model.priceGbp)}</p>
      </div>
      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
        {model.bestFor}
      </p>
      <p className="mt-1 font-mono text-[10px] text-muted-foreground">{spec}</p>
      <div className="mt-3 flex flex-col gap-2">
        <Link
          href={detailHref}
          className="inline-flex w-full items-center justify-center rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
        >
          More details
        </Link>
        <AddToBasketButton bikeId={model.modelId} size="sm" className="w-full" />
      </div>
    </article>
  )
}

export function ChatBikeAttachments({ models }: { models: CatalogModel[] }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
        Recommended
      </p>
      {models.map((model) => (
        <ChatBikeCard key={model.modelId} model={model} />
      ))}
    </div>
  )
}
