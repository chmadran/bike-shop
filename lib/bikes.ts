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
      'So light, it is life changing. Next thing you know you are spending 100 pounds a month on bike gears.',
    image: '/bikes/road-bike.png',
    spec: '7.1 kg · Carbon · 22-speed',
  },
  {
    id: 'summit-tr',
    name: 'Summit TR',
    category: 'Mountain',
    price: 4100,
    description:
      'Full suspension for when the trail gets spicy and your confidence gets mild.',
    image: '/bikes/mountain-bike.png',
    spec: '13.4 kg · 150mm travel · 12-speed',
  },
  {
    id: 'district-cb',
    name: 'District CB',
    category: 'City',
    price: 1450,
    description:
      'The sensible choice, fits its in a flat share hallway.',
    image: '/bikes/city-bike.png',
    spec: '11.0 kg · Belt drive · 8-speed',
  },
  {
    id: 'volt-ev',
    name: 'Volt EV',
    category: 'Electric',
    price: 3850,
    description:
      'Feeling a bit lazy? Arrive at the office looking fresh. Battery good for longer than your smartphone.',
    image: '/bikes/electric-bike.png',
    spec: '19.5 kg · 90 km range · 250W motor',
  },
]
