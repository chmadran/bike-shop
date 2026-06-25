import Image from 'next/image'
import type { CatalogModel } from '@/lib/chat-types'
import { bikes } from '@/lib/bikes'
import { priceFormatter } from '@/lib/content'

function findBikeImage(modelName: string): string | null {
  const bike = bikes.find((item) => item.name.toLowerCase() === modelName.toLowerCase())
  return bike?.image ?? null
}

function ChatBikeCard({ model }: { model: CatalogModel }) {
  const image = findBikeImage(model.name)
  const spec = model.spec ?? `${model.weightKg} kg`

  return (
    <article className="flex gap-3 rounded-md border border-border bg-background/50 p-2">
      {image ? (
        <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
          <Image src={image} alt={model.name} fill className="object-cover" sizes="80px" />
        </div>
      ) : (
        <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] text-muted-foreground">
          No image
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
              {model.category}
            </p>
            <h4 className="text-sm font-semibold tracking-tight">{model.name}</h4>
          </div>
          <p className="shrink-0 text-sm font-medium">{priceFormatter.format(model.priceGbp)}</p>
        </div>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {model.bestFor}
        </p>
        <p className="mt-1 font-mono text-[10px] text-muted-foreground">{spec}</p>
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
        <ChatBikeCard key={model.name} model={model} />
      ))}
    </div>
  )
}
