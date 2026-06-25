import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { FaqBotLauncher } from '@/components/faq-bot-launcher'
import { BikeCard } from '@/components/bike-card'
import { BikeDetailPanel } from '@/components/bike-detail-panel'
import { bikes, findBikeById } from '@/lib/bikes'
import { site } from '@/lib/content'

type PageProps = {
  searchParams: Promise<{ bike?: string }>
}

export async function generateMetadata({ searchParams }: PageProps) {
  const { bike: bikeId } = await searchParams
  const bike = bikeId ? findBikeById(bikeId) : undefined

  if (bike) {
    return {
      title: `${bike.name} · Vur Selle`,
      description: bike.description,
    }
  }

  return {
    title: 'Bikes · Vur Selle',
    description: site.bikeGrid.subtitle,
  }
}

export default async function BikesPage({ searchParams }: PageProps) {
  const { bike: bikeId } = await searchParams
  const { bikeGrid } = site

  if (bikeId) {
    const bike = findBikeById(bikeId)
    if (!bike) notFound()

    return (
      <main className="min-h-dvh bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
          <Link
            href="/#bikes"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <span aria-hidden="true">←</span> Back to lineup
          </Link>
          <div className="mt-6">
            <BikeDetailPanel bike={bike} />
          </div>
        </div>
        <SiteFooter />
        <FaqBotLauncher />
      </main>
    )
  }

  return (
    <main className="min-h-dvh bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <span aria-hidden="true">←</span> Back to home
        </Link>

        <header className="mt-6 mb-8">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{bikeGrid.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{bikeGrid.subtitle}</p>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {bikes.map((bike, i) => (
            <BikeCard key={bike.id} bike={bike} priority={i === 0} />
          ))}
        </div>
      </div>
      <SiteFooter />
      <FaqBotLauncher />
    </main>
  )
}
