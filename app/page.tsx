import { SiteHeader } from '@/components/layout/site-header'
import { Hero } from '@/components/marketing/hero'
import { BikeGrid } from '@/components/marketing/bike-grid'
import { Features } from '@/components/marketing/features'
import { SiteFooter } from '@/components/layout/site-footer'
import { FaqBotLauncher } from '@/components/chat/faq-bot-launcher'
import { getDictionary } from '@/lib/i18n/dictionaries'

export default function Page() {
  const dict = getDictionary('en')

  return (
    <main className="min-h-dvh bg-background">
      <SiteHeader dict={dict} />
      <Hero dict={dict} />
      <BikeGrid dict={dict} />
      <Features dict={dict} />
      <SiteFooter dict={dict} />
      <FaqBotLauncher />
    </main>
  )
}
