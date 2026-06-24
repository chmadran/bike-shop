import type { Locale } from './config'

export type BikeContent = {
  name: string
  category: string
  price: number
  description: string
  spec: string
}

export type Dictionary = {
  intl: { locale: string; currency: string }
  header: {
    nav: { bikes: string; features: string; faq: string }
    shop: string
  }
  hero: {
    badge: string
    title: string
    subtitle: string
    stats: {
      models: { label: string; value: string }
      warranty: { label: string; value: string }
      returns: { label: string; value: string }
    }
    imageAlt: string
  }
  bikeGrid: {
    title: string
    subtitle: string
    models: (n: number) => string
  }
  // Bike content keyed by bike id
  bikes: Record<string, BikeContent>
  features: {
    title: string
    items: { title: string; body: string }[]
  }
  faq: {
    title: string
    subtitle: string
    items: { q: string; a: string }[]
  }
  footer: {
    rights: (year: number) => string
  }
  bot: {
    title: string
    placeholder: string
    mount: string
    open: string
    close: string
  }
}

const en: Dictionary = {
  intl: { locale: 'en-GB', currency: 'GBP' },
  header: {
    nav: { bikes: 'Bikes', features: 'Features', faq: 'FAQ' },
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
    models: (n) => `${n} models`,
  },
  bikes: {
    'meridian-rd': {
      name: 'Meridian RD',
      category: 'Road',
      price: 3200,
      description:
        'A featherweight carbon road bike tuned for long climbs and fast descents.',
      spec: '7.1 kg · Carbon · 22-speed',
    },
    'summit-tr': {
      name: 'Summit TR',
      category: 'Mountain',
      price: 4100,
      description:
        'Full-suspension trail bike that soaks up rough terrain without slowing you down.',
      spec: '13.4 kg · 150mm travel · 12-speed',
    },
    'district-cb': {
      name: 'District CB',
      category: 'City',
      price: 1450,
      description:
        'A clean, low-maintenance commuter built for daily city rides and easy parking.',
      spec: '11.0 kg · Belt drive · 8-speed',
    },
    'volt-ev': {
      name: 'Volt EV',
      category: 'Electric',
      price: 3850,
      description:
        'An electric bike with an integrated battery and a 90 km range for effortless miles.',
      spec: '19.5 kg · 90 km range · 250W motor',
    },
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
  faq: {
    title: 'Frequently asked questions',
    subtitle: "Can't find what you need? Ask our assistant in the corner.",
    items: [
      {
        q: 'How long does shipping take?',
        a: 'Most orders ship within 2 business days and arrive in 5–7 business days. You will get a tracking link by email as soon as your bike is on its way.',
      },
      {
        q: 'Do I need to assemble the bike?',
        a: 'Bikes arrive about 95% assembled. You will need to attach the pedals, straighten the handlebars, and check the tire pressure. It takes around 15 minutes with the included tools.',
      },
      {
        q: 'What sizes are available?',
        a: 'Every model comes in S, M, L, and XL. Use the size guide on each product page, or message us your height and inseam and we will recommend a fit.',
      },
      {
        q: 'What is your return policy?',
        a: 'You can return any bike within 30 days for a full refund, as long as it is in resalable condition. Return shipping is on us.',
      },
      {
        q: 'Is the electric bike battery covered under warranty?',
        a: 'Yes. The Volt EV battery is covered for 2 years, and the frame carries our lifetime warranty like every Vur Selle bike.',
      },
    ],
  },
  footer: {
    rights: (year) => `© ${year} Vur Selle Bikes. Built for the demo.`,
  },
  bot: {
    title: 'FAQ Assistant',
    placeholder:
      'This is where your FAQ bot will live. Drop your chat component in here to answer questions about shipping, sizing, and returns.',
    mount: 'bot mount point',
    open: 'Open FAQ assistant',
    close: 'Close assistant',
  },
}


const dictionaries: Record<Locale, Dictionary> = { en }

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}
