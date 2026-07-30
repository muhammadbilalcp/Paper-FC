export type CardRarity =
  | 'BRONZE_COMMON'
  | 'BRONZE_RARE'
  | 'GOLD_COMMON'
  | 'GOLD_RARE'
  | 'HERO'
  | 'TOTY'
  | 'PRIME_ICON'
  | 'PAPER_LEGEND'
  | 'AYDIN_CUSTOM'
  | 'ZERAL_FC';

export type Position =
  | 'GK'
  | 'CB'
  | 'CB1'
  | 'CB2'
  | 'CB3'
  | 'LB'
  | 'RB'
  | 'CDM'
  | 'CDM1'
  | 'CDM2'
  | 'CM'
  | 'CM1'
  | 'CM2'
  | 'CAM'
  | 'LAM'
  | 'RAM'
  | 'LM'
  | 'RM'
  | 'LW'
  | 'RW'
  | 'ST'
  | 'ST1'
  | 'ST2'
  | 'CF';

export interface CardStats {
  pac: number; // Pace
  sho: number; // Shooting
  pas: number; // Passing
  dri: number; // Dribbling
  def: number; // Defending
  phy: number; // Physical
}

export interface PlayerCard {
  id: string; // Unique card instance ID or template ID
  templateId?: string;
  name: string;
  rating: number; // 75 - 99+
  position: Position;
  rarity: CardRarity;
  nation: string; // e.g. "Brazil", "Argentina", "France", "Portugal", "Turkey", "England"
  nationFlag: string; // emoji or code
  club: string;
  clubLogo: string;
  image: string; // avatar photo URL or styled SVG
  stats: CardStats;
  weakFoot: number; // 1-5
  skillMoves: number; // 1-5
  isWalkout: boolean; // OVR >= 86
  obtainedAt?: number;
  creator?: string; // 'System' or 'Aydin'
  valueCoins?: number;
}

export interface Pack {
  id: string;
  name: string;
  description: string;
  costCoins: number;
  costPoints: number; // Paper Cash
  image: string;
  minOvr: number;
  maxOvr: number;
  badge: string;
  color: string;
  guaranteedRarity?: CardRarity;
  cardCount: number;
  walkoutOdds: string;
}

export type FormationName = '4-3-3' | '4-4-2' | '3-4-3' | '4-2-3-1' | '3-5-2';

export interface PitchSlot {
  slotKey?: string;
  position: Position;
  label: string;
  topPercent: number; // Y position on pitch (0 - 100)
  leftPercent: number; // X position on pitch (0 - 100)
}

export interface UserSquad {
  formation: FormationName;
  starting11: Record<string, PlayerCard | null>; // Slot key to PlayerCard
  bench: PlayerCard[];
}

export interface UserAccount {
  id: string;
  username: string;
  passwordHash: string;
  isAdmin: boolean;
  coins: number;
  points: number; // Paper Cash
  inventory: PlayerCard[]; // All owned cards
  squad: UserSquad;
  packsOpened: number;
  createdAt: number;
  frontName?: string;
  avatarUrl?: string;
  totalSalaryReceived?: number;
}

export interface BidLog {
  bidderUsername: string;
  amount: number;
  timestamp: number;
}

export interface AuctionItem {
  id: string;
  sellerUsername: string;
  card: PlayerCard;
  startingBid: number;
  buyNowPrice: number;
  currentBid: number;
  highestBidderUsername?: string;
  bidHistory: BidLog[];
  expiresAt: number;
  createdAt: number;
  status: 'ACTIVE' | 'SOLD' | 'EXPIRED';
}

export interface ChatMessage {
  id: string;
  senderUsername: string;
  senderFrontName?: string;
  senderAvatar?: string;
  text: string;
  timestamp: number;
  sharedCard?: PlayerCard;
  isAdmin?: boolean;
  isSystem?: boolean;
}

export interface MarketItem {
  id: string;
  sellerUsername: string;
  card: PlayerCard;
  priceCoins: number;
  listedAt: number;
}

export interface HomeScreenUpdate {
  id: string;
  title: string;
  category: 'World Cup Update' | 'Premier League Update' | 'Champions League' | 'TOTS Event' | 'Community Event' | string;
  badge: string;
  description: string;
  bannerGradient: string;
  iconEmoji: string;
  createdAt: number;
  author: string;
  featuredCardName?: string;
  isHot?: boolean;
}
