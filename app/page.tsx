import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { BikeGrid } from '@/components/bike-grid'
import { Features } from '@/components/features'
import { SiteFooter } from '@/components/site-footer'
import { FaqBotLauncher } from '@/components/faq-bot-launcher'
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
