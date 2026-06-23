import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { BikeGrid } from '@/components/bike-grid'
import { Features } from '@/components/features'
import { Faq } from '@/components/faq'
import { SiteFooter } from '@/components/site-footer'
import { FaqBotLauncher } from '@/components/faq-bot-launcher'

export default function Page() {
  return (
    <main className="min-h-dvh bg-background">
      <SiteHeader />
      <Hero />
      <BikeGrid />
      <Features />
      <Faq />
      <SiteFooter />
      <FaqBotLauncher />
    </main>
  )
}
