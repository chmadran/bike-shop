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
      'So light your Strava followers will assume you edited the elevation. Built for climbs, descents, and pretending the headwind is "character building".',
    image: '/bikes/road-bike.png',
    spec: '7.1 kg · Carbon · 22-speed · 0 excuses',
  },
  {
    id: 'summit-tr',
    name: 'Summit TR',
    category: 'Mountain',
    price: 4100,
    description:
      'Full suspension for when the trail gets spicy and your confidence gets mild. Eats roots for breakfast. Does not eat mud pies.',
    image: '/bikes/mountain-bike.png',
    spec: '13.4 kg · 150mm travel · 12-speed · 1 spare ego',
  },
  {
    id: 'district-cb',
    name: 'District CB',
    category: 'City',
    price: 1450,
    description:
      'The sensible choice. Belt drive, low fuss, fits in a flat share hallway. Your housemates will still leave it behind the bins anyway.',
    image: '/bikes/city-bike.png',
    spec: '11.0 kg · Belt drive · 8-speed · cup holder compatible*',
  },
  {
    id: 'volt-ev',
    name: 'Volt EV',
    category: 'Electric',
    price: 3850,
    description:
      'Hills? What hills? Arrive at the office looking fresh, not like you wrestled a weather system. Battery good for longer than your smartphone.',
    image: '/bikes/electric-bike.png',
    spec: '19.5 kg · 90 km range · 250W motor · smug mode: ON',
  },
]
