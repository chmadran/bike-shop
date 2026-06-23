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
    switchLabel: string
  }
  hero: {
    badge: string
    title: string
    subtitle: string
    browse: string
    readFaq: string
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
    switchLabel: 'Language',
  },
  hero: {
    badge: 'New 2026 lineup',
    title: 'Bikes engineered for the details.',
    subtitle:
      'Vur Selle builds precision road, mountain, city, and electric bikes. Thoughtfully specced, ready to ride, and backed by a team that actually rides.',
    browse: 'Browse bikes',
    readFaq: 'Read the FAQ',
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

const fr: Dictionary = {
  intl: { locale: 'fr-FR', currency: 'EUR' },
  header: {
    nav: { bikes: 'Vélos', features: 'Avantages', faq: 'FAQ' },
    shop: 'Boutique',
    switchLabel: 'Langue',
  },
  hero: {
    badge: 'Nouvelle gamme 2026',
    title: 'Des vélos pensés dans le moindre détail.',
    subtitle:
      'Vur Selle conçoit des vélos de route, VTT, urbains et électriques de précision. Équipement soigné, prêts à rouler, et soutenus par une équipe qui roule vraiment.',
    browse: 'Voir les vélos',
    readFaq: 'Lire la FAQ',
    stats: {
      models: { label: 'Modèles', value: '4' },
      warranty: { label: 'Garantie', value: 'À vie' },
      returns: { label: 'Retours', value: '30 jours' },
    },
    imageAlt: 'Un vélo de route Vur Selle haut de gamme',
  },
  bikeGrid: {
    title: 'La gamme',
    subtitle: 'Quatre vélos, une seule obsession de la qualité.',
    models: (n) => `${n} modèles`,
  },
  bikes: {
    'meridian-rd': {
      name: 'Meridian RD',
      category: 'Route',
      price: 3700,
      description:
        'Un vélo de route en carbone ultraléger, réglé pour les longues montées et les descentes rapides.',
      spec: '7,1 kg · Carbone · 22 vitesses',
    },
    'summit-tr': {
      name: 'Summit TR',
      category: 'VTT',
      price: 4750,
      description:
        'Un VTT tout-suspendu qui absorbe les terrains accidentés sans vous ralentir.',
      spec: '13,4 kg · 150 mm de débattement · 12 vitesses',
    },
    'district-cb': {
      name: 'District CB',
      category: 'Ville',
      price: 1690,
      description:
        'Un vélo urbain épuré et sans entretien, conçu pour les trajets quotidiens et le stationnement facile.',
      spec: '11,0 kg · Courroie · 8 vitesses',
    },
    'volt-ev': {
      name: 'Volt EV',
      category: 'Électrique',
      price: 4450,
      description:
        'Un vélo électrique avec batterie intégrée et 90 km d’autonomie pour avaler les kilomètres sans effort.',
      spec: '19,5 kg · 90 km d’autonomie · moteur 250 W',
    },
  },
  features: {
    title: 'Pourquoi rouler avec nous',
    items: [
      {
        title: 'Retours gratuits sous 30 jours',
        body: 'Roulez pendant un mois. Si ce n’est pas le bon, renvoyez-le à nos frais.',
      },
      {
        title: 'Livré prêt à rouler',
        body: 'Assemblé à 95 % dès la sortie du carton. Montez les pédales, réglez le guidon, et c’est parti.',
      },
      {
        title: 'Garantie cadre à vie',
        body: 'Chaque cadre Vur Selle est garanti tant que vous possédez le vélo.',
      },
      {
        title: 'Révision annuelle offerte',
        body: 'Présentez-le une fois par an dans un atelier partenaire pour un entretien gratuit.',
      },
    ],
  },
  faq: {
    title: 'Questions fréquentes',
    subtitle:
      'Vous ne trouvez pas ce qu’il vous faut ? Demandez à notre assistant dans le coin.',
    items: [
      {
        q: 'Combien de temps prend la livraison ?',
        a: 'La plupart des commandes sont expédiées sous 2 jours ouvrés et arrivent en 5 à 7 jours ouvrés. Vous recevrez un lien de suivi par e-mail dès que votre vélo est en route.',
      },
      {
        q: 'Dois-je assembler le vélo ?',
        a: 'Les vélos arrivent assemblés à environ 95 %. Vous devrez fixer les pédales, redresser le guidon et vérifier la pression des pneus. Cela prend environ 15 minutes avec les outils fournis.',
      },
      {
        q: 'Quelles tailles sont disponibles ?',
        a: 'Chaque modèle est proposé en S, M, L et XL. Utilisez le guide des tailles sur chaque page produit, ou envoyez-nous votre taille et votre entrejambe et nous vous recommanderons un ajustement.',
      },
      {
        q: 'Quelle est votre politique de retour ?',
        a: 'Vous pouvez retourner n’importe quel vélo sous 30 jours pour un remboursement intégral, tant qu’il est en état de revente. Les frais de retour sont à notre charge.',
      },
      {
        q: 'La batterie du vélo électrique est-elle couverte par la garantie ?',
        a: 'Oui. La batterie du Volt EV est garantie 2 ans, et le cadre bénéficie de notre garantie à vie comme tous les vélos Vur Selle.',
      },
    ],
  },
  footer: {
    rights: (year) => `© ${year} Vur Selle Bikes. Conçu pour la démo.`,
  },
  bot: {
    title: 'Assistant FAQ',
    placeholder:
      'C’est ici que vivra votre bot FAQ. Insérez votre composant de chat ici pour répondre aux questions sur la livraison, les tailles et les retours.',
    mount: 'point de montage du bot',
    open: 'Ouvrir l’assistant FAQ',
    close: 'Fermer l’assistant',
  },
}

const dictionaries: Record<Locale, Dictionary> = { en, fr }

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}
