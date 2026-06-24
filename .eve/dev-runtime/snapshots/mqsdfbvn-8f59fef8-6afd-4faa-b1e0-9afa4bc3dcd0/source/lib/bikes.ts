export type Bike = {
  id: string
  name: string
  category: string
  price: number
  description: string
  image: string
  spec: string
}

export const bikes: Bike[] = [
  {
    id: 'meridian-rd',
    name: 'Meridian RD',
    category: 'Road',
    price: 3200,
    description:
      'A featherweight carbon road bike tuned for long climbs and fast descents.',
    image: '/bikes/road-bike.png',
    spec: '7.1 kg · Carbon · 22-speed',
  },
  {
    id: 'summit-tr',
    name: 'Summit TR',
    category: 'Mountain',
    price: 4100,
    description:
      'Full-suspension trail bike that soaks up rough terrain without slowing you down.',
    image: '/bikes/mountain-bike.png',
    spec: '13.4 kg · 150mm travel · 12-speed',
  },
  {
    id: 'district-cb',
    name: 'District CB',
    category: 'City',
    price: 1450,
    description:
      'A clean, low-maintenance commuter built for daily city rides and easy parking.',
    image: '/bikes/city-bike.png',
    spec: '11.0 kg · Belt drive · 8-speed',
  },
  {
    id: 'volt-ev',
    name: 'Volt EV',
    category: 'Electric',
    price: 3850,
    description:
      'An electric bike with an integrated battery and a 90 km range for effortless miles.',
    image: '/bikes/electric-bike.png',
    spec: '19.5 kg · 90 km range · 250W motor',
  },
]
