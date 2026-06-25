import { getCachedBikeCatalog } from '@/lib/bikes-catalog'
import { BasketView } from '@/components/basket-view'

export const dynamic = 'force-dynamic'

export default async function BasketPage() {
  const catalog = await getCachedBikeCatalog()
  return <BasketView catalog={catalog} />
}
