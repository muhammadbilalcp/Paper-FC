import { Pack } from '../types';

export const PACKS_LIST: Pack[] = [
  {
    id: 'pack-standard-gold',
    name: 'Gold Premium Pack',
    description: 'Contains 3 Gold players with a chance at 86+ Walkouts!',
    costCoins: 15000,
    costPoints: 150,
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=400',
    minOvr: 78,
    maxOvr: 92,
    badge: 'GOLD',
    color: 'from-amber-600 via-yellow-500 to-amber-700',
    cardCount: 3,
    walkoutOdds: '15%'
  },
  {
    id: 'pack-paper-hero',
    name: 'Paper Heroes Pack',
    description: 'Guaranteed 84+ rating with boosted chances for Paper Legends!',
    costCoins: 50000,
    costPoints: 500,
    image: 'https://images.unsplash.com/photo-1579952318893-20a310028bf8?auto=format&fit=crop&q=80&w=400',
    minOvr: 84,
    maxOvr: 95,
    badge: 'HERO',
    color: 'from-purple-600 via-fuchsia-500 to-pink-600',
    cardCount: 3,
    walkoutOdds: '45%'
  },
  {
    id: 'pack-toty-special',
    name: 'TOTY Superstars Pack',
    description: 'High chance to pull 95+ OVR Team of the Year Superstars!',
    costCoins: 150000,
    costPoints: 1200,
    image: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&q=80&w=400',
    minOvr: 88,
    maxOvr: 98,
    badge: 'TOTY',
    color: 'from-blue-600 via-cyan-400 to-indigo-700',
    cardCount: 4,
    walkoutOdds: '75%',
    guaranteedRarity: 'TOTY'
  },
  {
    id: 'pack-prime-icons',
    name: 'Prime ICONS Pack',
    description: 'Exclusive pack containing football legends (Pelé, Zidane, R9, Ronaldinho)!',
    costCoins: 300000,
    costPoints: 2500,
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=400',
    minOvr: 92,
    maxOvr: 98,
    badge: 'PRIME ICON',
    color: 'from-yellow-400 via-amber-300 to-yellow-600',
    cardCount: 3,
    walkoutOdds: '95%',
    guaranteedRarity: 'PRIME_ICON'
  },
  {
    id: 'pack-aydin-ultimate',
    name: 'Aydin Ultimate Crown Pack',
    description: 'Supreme God-Tier pack! Guaranteed Walkout Icons + Ultra Rare 99 Aydin Card!',
    costCoins: 1000000,
    costPoints: 5000,
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=400',
    minOvr: 95,
    maxOvr: 99,
    badge: 'AYDIN ULTRA',
    color: 'from-emerald-500 via-green-400 to-teal-700',
    cardCount: 5,
    walkoutOdds: '100%'
  }
];
