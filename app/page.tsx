import { SiteHeader } from '@/components/site/site-header'
import { Hero } from '@/components/site/hero'
import { BikeGrid } from '@/components/bike/bike-grid'
import { Features } from '@/components/site/features'
import { SiteFooter } from '@/components/site/site-footer'
import { FaqBotLauncher } from '@/components/chat/faq-bot-launcher'

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <main className="min-h-dvh bg-background">
      <SiteHeader />
      <Hero />
      <BikeGrid />
      <Features />
      <SiteFooter />
      <FaqBotLauncher />
    </main>
  )
}
