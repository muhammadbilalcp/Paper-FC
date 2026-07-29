import { HomeScreenUpdate } from '../types';

export const INITIAL_HOME_UPDATES: HomeScreenUpdate[] = [
  {
    id: 'upd-world-cup-2026',
    title: 'WORLD CUP ICONS EXTRAVAGANZA',
    category: 'World Cup Update',
    badge: 'LIVE NOW 🏆',
    description: 'Unpack 99 OVR World Cup Legends including Pelé, Maradona, and Ronaldinho! Earn double Paper Cash rewards when opening store packs today.',
    bannerGradient: 'from-amber-950 via-yellow-900 to-emerald-950',
    iconEmoji: '🏆',
    createdAt: Date.now() - 3600000,
    author: 'Game Conductor',
    featuredCardName: 'Pelé 98',
    isHot: true
  },
  {
    id: 'upd-premier-league-tots',
    title: 'PREMIER LEAGUE SUPERSTARS UNLEASHED',
    category: 'Premier League Update',
    badge: 'NEW DROP ⚽',
    description: 'Premier League TOTS cards are here! Collect Haaland (98 OVR), De Bruyne (96 OVR), Saka (87 OVR), and Saliba (88 OVR) with boosted pace & physical stats.',
    bannerGradient: 'from-blue-950 via-indigo-900 to-purple-950',
    iconEmoji: '🦁',
    createdAt: Date.now() - 7200000,
    author: 'Game Conductor',
    featuredCardName: 'De Bruyne 96',
    isHot: true
  },
  {
    id: 'upd-ucl-nights',
    title: 'CHAMPIONS LEAGUE NIGHTS OF LEGENDS',
    category: 'Champions League',
    badge: 'SPECIAL EVENT ⭐️',
    description: 'Night of Champions special event! Open Prime Icon packs to unlock legendary European UCL winners like Zidane and Yashin.',
    bannerGradient: 'from-sky-950 via-blue-900 to-black',
    iconEmoji: '⭐',
    createdAt: Date.now() - 14400000,
    author: 'Game Conductor',
    featuredCardName: 'Zidane 96',
    isHot: false
  }
];
