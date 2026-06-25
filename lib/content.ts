export const site = {
  header: {
    nav: { bikes: 'Bikes', features: 'Features' },
    shop: 'Shop',
  },
  hero: {
    badge: 'New 2026 lineup',
    title: 'Bikes engineered for the details.',
    subtitle:
      'Backed by a team that actually rides, unlike your friend that still owns a folding bike.',
    stats: {
      models: { label: 'Models', value: '4' },
      warranty: { label: 'Warranty', value: 'Lifetime' },
      returns: { label: 'Returns', value: '30 days' },
    },
    imageAlt: 'A premium Vur Selle road bicycle, definitely not Photoshopped',
  },
  bikeGrid: {
    title: 'The lineup',
    subtitle: 'Four bikes, one obsession with quality, zero obsession with puncture repair at 6am.',
    modelsLabel: (n: number) => `${n} models · infinite café stops`,
  },
  features: {
    title: 'Why ride with us',
    items: [
      {
        title: 'Free 30-day returns',
        body: 'Ride it for a month. If it is not the one, send it back on us. No awkward break-up speech required.',
      },
      {
        title: 'Shipped ready to ride',
        body: '95% assembled out of the box. The other 5% is attaching your dignity after telling friends you are "getting into cycling".',
      },
      {
        title: 'Lifetime frame warranty',
        body: 'Every Vur Selle frame is covered for as long as you own the bike. Your New Year\'s resolutions are not, sadly.',
      },
      {
        title: 'Free annual tune-up',
        body: 'Bring it to any partner shop once a year. They will tighten bolts; we will pretend you always stored it indoors.',
      },
    ],
  },
  footer: {
    rights: (year: number) =>
      `© ${year} Vur Selle Bikes. Built for the demo.`,
  },
} as const

export const priceFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
})
