export type Bike = {
  id: string
  name: string
  category: string
  price: number
  description: string
  image: string
  spec: string
  highlights: string[]
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
    highlights: [
      'Carbon frame and fork for climbing and long days in the saddle',
      'Shimano 105 groupset — reliable shifting without the pro-team price tag',
      '32 mm tyre clearance for UK chip-seal and the occasional cobble',
    ],
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
    highlights: [
      '150 mm front and rear travel for proper trail days',
      '12-speed drivetrain with a wide-range cassette for steep climbs',
      'Dropper-post ready — add one when the descents get serious',
    ],
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
    highlights: [
      'Gates Carbon belt drive — quiet, clean, almost no maintenance',
      'Upright geometry for traffic visibility and all-day comfort',
      'Mudguard and rack mounts for year-round commuting',
    ],
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
    highlights: [
      '250 W motor with smooth pedal assist up to 25 km/h (UK legal limit)',
      'Up to 90 km range on a single charge — enough for a week of commuting',
      'Integrated lights and lock mount for daily city use',
    ],
  },
]

export function findBikeById(id: string): Bike | undefined {
  return bikes.find((bike) => bike.id === id)
}

export function findBikeByName(name: string): Bike | undefined {
  return bikes.find((bike) => bike.name.toLowerCase() === name.toLowerCase())
}

export function bikeDetailPath(idOrName: string): string | null {
  const bike = findBikeById(idOrName) ?? findBikeByName(idOrName)
  return bike ? `/bikes?bike=${bike.id}` : null
}
