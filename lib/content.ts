export const site = {
  header: {
    nav: { bikes: 'Bikes', features: 'Features' },
    shop: 'Shop',
  },
  hero: {
    badge: 'New 2026 lineup',
    title: 'Bikes engineered for the details.',
    subtitle:
      'Vur Selle builds precision road, mountain, city, and electric bikes. Thoughtfully specced, ready to ride, and backed by a team that actually rides.',
    stats: {
      models: { label: 'Models', value: '4' },
      warranty: { label: 'Warranty', value: 'Lifetime' },
      returns: { label: 'Returns', value: '30 days' },
    },
    imageAlt: 'A premium Vur Selle road bicycle',
  },
  bikeGrid: {
    title: 'The lineup',
    subtitle: 'Four bikes, one obsession with quality.',
    modelsLabel: (n: number) => `${n} models`,
  },
  features: {
    title: 'Why ride with us',
    items: [
      {
        title: 'Free 30-day returns',
        body: 'Ride it for a month. If it is not the one, send it back on us.',
      },
      {
        title: 'Shipped ready to ride',
        body: '95% assembled out of the box. Add the pedals, set the bars, go.',
      },
      {
        title: 'Lifetime frame warranty',
        body: 'Every Vur Selle frame is covered for as long as you own the bike.',
      },
      {
        title: 'Free annual tune-up',
        body: 'Bring it to any partner shop once a year for a complimentary service.',
      },
    ],
  },
  footer: {
    rights: (year: number) => `© ${year} Vur Selle Bikes. Built for the demo.`,
  },
} as const

export const priceFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
})
