import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { FaqBotLauncher } from '@/components/faq-bot-launcher'

export default function CheckoutCancelPage() {
  return (
    <main className="min-h-dvh bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Checkout cancelled</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          No payment was taken. Your basket is still saved.
        </p>
        <Link
          href="/basket"
          className="mt-8 inline-flex rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Return to basket
        </Link>
      </div>
      <SiteFooter />
      <FaqBotLauncher />
    </main>
  )
}
