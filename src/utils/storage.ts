import { UserAccount, PlayerCard, MarketItem, UserSquad } from '../types';
import { INITIAL_PLAYER_DATABASE } from '../data/playersDatabase';

const STORAGE_USERS_KEY = 'icons_paper_fc_users_v2';
const STORAGE_CURRENT_USER = 'icons_paper_fc_current_user_v2';
const STORAGE_MARKET_KEY = 'icons_paper_fc_market_v2';

const DEFAULT_SQUAD: UserSquad = {
  formation: '4-3-3',
  starting11: {
    ST: INITIAL_PLAYER_DATABASE.find((p) => p.name.includes('Pelé')) || INITIAL_PLAYER_DATABASE[1],
    LW: INITIAL_PLAYER_DATABASE.find((p) => p.name.includes('Ronaldinho')) || INITIAL_PLAYER_DATABASE[3],
    RW: INITIAL_PLAYER_DATABASE.find((p) => p.name.includes('Messi')) || INITIAL_PLAYER_DATABASE[9],
    CAM: INITIAL_PLAYER_DATABASE.find((p) => p.name.includes('Zidane')) || INITIAL_PLAYER_DATABASE[4],
    CM: INITIAL_PLAYER_DATABASE.find((p) => p.name.includes('Bruyne')) || INITIAL_PLAYER_DATABASE[16],
    CDM: INITIAL_PLAYER_DATABASE.find((p) => p.name.includes('Rodri')) || INITIAL_PLAYER_DATABASE[17],
    CB1: INITIAL_PLAYER_DATABASE.find((p) => p.name.includes('Maldini')) || INITIAL_PLAYER_DATABASE[7],
    CB2: INITIAL_PLAYER_DATABASE.find((p) => p.name.includes('Dijk')) || INITIAL_PLAYER_DATABASE[18],
    LB: INITIAL_PLAYER_DATABASE.find((p) => p.name.includes('Davies')) || INITIAL_PLAYER_DATABASE[23],
    RB: INITIAL_PLAYER_DATABASE.find((p) => p.name.includes('Hakimi')) || INITIAL_PLAYER_DATABASE[24],
    GK: INITIAL_PLAYER_DATABASE.find((p) => p.name.includes('Yashin')) || INITIAL_PLAYER_DATABASE[8]
  },
  bench: [
    INITIAL_PLAYER_DATABASE[0], // Aydin 99
    INITIAL_PLAYER_DATABASE[2], // Maradona
    INITIAL_PLAYER_DATABASE[10], // Ronaldo
    INITIAL_PLAYER_DATABASE[11] // Mbappe
  ]
};

// Default accounts
const AYDIN_ACCOUNT: UserAccount = {
  id: 'usr-aydin-admin',
  username: 'Aydin',
  passwordHash: 'aydin123',
  isAdmin: true,
  coins: 999999999,
  points: 999999,
  inventory: [...INITIAL_PLAYER_DATABASE],
  squad: DEFAULT_SQUAD,
  packsOpened: 142,
  createdAt: Date.now()
};

const DEMO_GUEST_ACCOUNT: UserAccount = {
  id: 'usr-demo-guest',
  username: 'Guest_Striker',
  passwordHash: '123456',
  isAdmin: false,
  coins: 500000,
  points: 1500,
  inventory: INITIAL_PLAYER_DATABASE.slice(10, 20),
  squad: {
    formation: '4-3-3',
    starting11: {
      ST: INITIAL_PLAYER_DATABASE[10],
      LW: INITIAL_PLAYER_DATABASE[15],
      RW: INITIAL_PLAYER_DATABASE[20],
      CAM: INITIAL_PLAYER_DATABASE[21],
      CM: INITIAL_PLAYER_DATABASE[16],
      CDM: INITIAL_PLAYER_DATABASE[17],
      CB1: INITIAL_PLAYER_DATABASE[18],
      CB2: INITIAL_PLAYER_DATABASE[25],
      LB: INITIAL_PLAYER_DATABASE[23],
      RB: INITIAL_PLAYER_DATABASE[24],
      GK: INITIAL_PLAYER_DATABASE[19]
    },
    bench: []
  },
  packsOpened: 12,
  createdAt: Date.now()
};

export function getStoredUsers(): UserAccount[] {
  if (typeof window === 'undefined') return [AYDIN_ACCOUNT, DEMO_GUEST_ACCOUNT];
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      const initial = [AYDIN_ACCOUNT, DEMO_GUEST_ACCOUNT];
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [AYDIN_ACCOUNT, DEMO_GUEST_ACCOUNT];
  }
}

export function saveUsers(users: UserAccount[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed saving users to localStorage', err);
  }
}

export function getCurrentUser(): UserAccount {
  const users = getStoredUsers();
  if (typeof window === 'undefined') return users[0];

  const currentId = localStorage.getItem(STORAGE_CURRENT_USER);
  const found = users.find((u) => u.id === currentId || u.username === currentId);
  if (found) return found;

  // Default to Aydin if none set
  localStorage.setItem(STORAGE_CURRENT_USER, AYDIN_ACCOUNT.id);
  return users[0];
}

export function setCurrentUserSession(user: UserAccount): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_CURRENT_USER, user.id);
}

export function updateUserAccount(updated: UserAccount): void {
  const users = getStoredUsers();
  const idx = users.findIndex((u) => u.id === updated.id);
  if (idx !== -1) {
    users[idx] = updated;
  } else {
    users.push(updated);
  }
  saveUsers(users);
}

// Marketplace storage
export function getMarketItems(): MarketItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_MARKET_KEY);
    if (!raw) {
      const initial: MarketItem[] = [
        {
          id: 'market-1',
          sellerUsername: 'ProGamer99',
          card: INITIAL_PLAYER_DATABASE[2], // Maradona
          priceCoins: 3800000,
          listedAt: Date.now() - 3600000
        },
        {
          id: 'market-2',
          sellerUsername: 'FutMaster',
          card: INITIAL_PLAYER_DATABASE[12], // Haaland
          priceCoins: 2900000,
          listedAt: Date.now() - 1800000
        },
        {
          id: 'market-3',
          sellerUsername: 'PaperKing',
          card: INITIAL_PLAYER_DATABASE[14], // Arda Guler
          priceCoins: 1500000,
          listedAt: Date.now() - 900000
        }
      ];
      localStorage.setItem(STORAGE_MARKET_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveMarketItems(items: MarketItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_MARKET_KEY, JSON.stringify(items));
}
