import Link from 'next/link'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { FaqBotLauncher } from '@/components/chat/faq-bot-launcher'
import { ClearBasketOnSuccess } from '@/components/basket/clear-basket-on-success'

export default function CheckoutSuccessPage() {
  return (
    <main className="min-h-dvh bg-background">
      <ClearBasketOnSuccess />
      <SiteHeader />
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
          Test order complete
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Thanks for your order</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Payment succeeded in Stripe test mode. Open your Stripe Dashboard (test mode) under
          Payments to see it.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Back to home
        </Link>
      </div>
      <SiteFooter />
      <FaqBotLauncher />
    </main>
  )
}
