import { UserAccount, MarketItem, UserSquad, AuctionItem, ChatMessage } from '../types';
import { INITIAL_PLAYER_DATABASE } from '../data/playersDatabase';

const STORAGE_USERS_KEY = 'icons_paper_fc_users_v4';
const STORAGE_CURRENT_USER = 'icons_paper_fc_current_user_v4';
const STORAGE_MARKET_KEY = 'icons_paper_fc_market_v4';
const STORAGE_AUCTION_KEY = 'icons_paper_fc_auctions_v4';
const STORAGE_CHAT_KEY = 'icons_paper_fc_chat_v4';

const DEFAULT_EMPTY_SQUAD: UserSquad = {
  formation: '4-3-3',
  starting11: {},
  bench: []
};

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

// Preset Accounts requested by user
export const PRESET_ACCOUNTS: UserAccount[] = [
  {
    id: 'usr-aydin-admin',
    username: 'Aydin',
    frontName: 'Master Admin Aydin',
    passwordHash: 'aydin123',
    isAdmin: true,
    coins: 999999999,
    points: 9999999,
    inventory: [...INITIAL_PLAYER_DATABASE],
    squad: DEFAULT_SQUAD,
    packsOpened: 250,
    createdAt: Date.now() - 10000000,
    totalSalaryReceived: 100000000
  },
  {
    id: 'usr-faheem',
    username: 'FAHCR7',
    frontName: 'Faheem CR7',
    passwordHash: 'faheemhananandfarhan67',
    isAdmin: false,
    coins: 0,
    points: 150,
    inventory: [],
    squad: DEFAULT_EMPTY_SQUAD,
    packsOpened: 0,
    createdAt: Date.now() - 5000000,
    totalSalaryReceived: 0
  },
  {
    id: 'usr-hamad',
    username: 'Hamad',
    frontName: 'Hamad',
    passwordHash: 'Hamad67.com',
    isAdmin: false,
    coins: 0,
    points: 150,
    inventory: [],
    squad: DEFAULT_EMPTY_SQUAD,
    packsOpened: 0,
    createdAt: Date.now() - 4000000,
    totalSalaryReceived: 0
  },
  {
    id: 'usr-rinshan',
    username: 'Rinshan',
    frontName: 'Rinshan',
    passwordHash: 'nonchalantrinchu',
    isAdmin: false,
    coins: 0,
    points: 150,
    inventory: [],
    squad: DEFAULT_EMPTY_SQUAD,
    packsOpened: 0,
    createdAt: Date.now() - 3500000,
    totalSalaryReceived: 0
  },
  {
    id: 'usr-razan',
    username: 'Brazan67',
    frontName: 'Razan',
    passwordHash: 'Brazan67',
    isAdmin: false,
    coins: 0,
    points: 150,
    inventory: [],
    squad: DEFAULT_EMPTY_SQUAD,
    packsOpened: 0,
    createdAt: Date.now() - 3000000,
    totalSalaryReceived: 0
  },
  {
    id: 'usr-insaf',
    username: 'Isagi Insaf',
    frontName: 'Insaf',
    passwordHash: 'yoichi isagi',
    isAdmin: false,
    coins: 0,
    points: 150,
    inventory: [],
    squad: DEFAULT_EMPTY_SQUAD,
    packsOpened: 0,
    createdAt: Date.now() - 2800000,
    totalSalaryReceived: 0
  },
  {
    id: 'usr-aban',
    username: 'Aban',
    frontName: 'Aban',
    passwordHash: 'Abanthegk',
    isAdmin: false,
    coins: 0,
    points: 150,
    inventory: [],
    squad: DEFAULT_EMPTY_SQUAD,
    packsOpened: 0,
    createdAt: Date.now() - 2500000,
    totalSalaryReceived: 0
  },
  {
    id: 'usr-hashid',
    username: 'Acid',
    frontName: 'Hashid',
    passwordHash: 'AcidBase76',
    isAdmin: false,
    coins: 0,
    points: 150,
    inventory: [],
    squad: DEFAULT_EMPTY_SQUAD,
    packsOpened: 0,
    createdAt: Date.now() - 2000000,
    totalSalaryReceived: 0
  },
  {
    id: 'usr-spybilal-secret',
    username: 'SpyBilal',
    frontName: 'Agent SpyBilal',
    passwordHash: '223879',
    isAdmin: true,
    coins: 999999999,
    points: 9999999,
    inventory: [...INITIAL_PLAYER_DATABASE],
    squad: DEFAULT_SQUAD,
    packsOpened: 500,
    createdAt: Date.now() - 1000000,
    totalSalaryReceived: 99999999
  }
];

// Combine local presets with incoming list
function mergePresetAccounts(usersList: UserAccount[]): UserAccount[] {
  const combined = [...usersList];
  let updated = false;

  for (const preset of PRESET_ACCOUNTS) {
    const matchIndex = combined.findIndex(
      (u) =>
        u.username.toLowerCase() === preset.username.toLowerCase() ||
        u.id === preset.id ||
        (u.frontName && u.frontName.toLowerCase().includes(preset.username.toLowerCase()))
    );

    if (matchIndex === -1) {
      combined.push(preset);
      updated = true;
    } else {
      // Ensure passwordHash matches PRESET_ACCOUNTS
      if (combined[matchIndex].passwordHash !== preset.passwordHash) {
        combined[matchIndex] = {
          ...combined[matchIndex],
          passwordHash: preset.passwordHash,
          frontName: preset.frontName || combined[matchIndex].frontName
        };
        updated = true;
      }
    }
  }

  return combined;
}

export function getStoredUsers(): UserAccount[] {
  if (typeof window === 'undefined') return PRESET_ACCOUNTS;
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(PRESET_ACCOUNTS));
      return PRESET_ACCOUNTS;
    }
    const parsed: UserAccount[] = JSON.parse(raw);
    const merged = mergePresetAccounts(parsed);
    if (merged.length !== parsed.length) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(merged));
    }
    return merged;
  } catch {
    return PRESET_ACCOUNTS;
  }
}

export function saveUsers(users: UserAccount[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
    // Background sync to server
    fetch('/api/users/save-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ users })
    }).catch(() => {});
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
  localStorage.setItem(STORAGE_CURRENT_USER, PRESET_ACCOUNTS[0].id);
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

  // Direct server push
  fetch('/api/users/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated)
  }).catch(() => {});
}

// Marketplace storage
export function getMarketItems(): MarketItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_MARKET_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveMarketItems(items: MarketItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_MARKET_KEY, JSON.stringify(items));
  fetch('/api/market/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items })
  }).catch(() => {});
}

// Live Auctions Storage
export function getAuctions(): AuctionItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_AUCTION_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveAuctions(auctions: AuctionItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_AUCTION_KEY, JSON.stringify(auctions));
  fetch('/api/auctions/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ auctions })
  }).catch(() => {});
}

// Live Chat Storage
export function getChatMessages(): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_CHAT_KEY);
    if (!raw) {
      const initialChat: ChatMessage[] = [
        {
          id: 'chat-welcome',
          senderUsername: 'Aydin',
          senderFrontName: 'Master Admin Aydin',
          text: 'Welcome to Icons Paper FC! Squad chat is live across all devices. ⚽',
          timestamp: Date.now(),
          isAdmin: true
        }
      ];
      localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(initialChat));
      return initialChat;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveChatMessages(messages: ChatMessage[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(messages));
  fetch('/api/chat/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages })
  }).catch(() => {});
}

// --- SERVER REAL-TIME SYNC ---
export async function syncWithServer(): Promise<{
  users?: UserAccount[];
  market?: MarketItem[];
  auctions?: AuctionItem[];
  chat?: ChatMessage[];
}> {
  if (typeof window === 'undefined') return {};
  try {
    const localUsers = getStoredUsers();
    const localMarket = getMarketItems();
    const localAuctions = getAuctions();
    const localChat = getChatMessages();

    // Send local state to merge with server database
    const res = await fetch('/api/db/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        users: localUsers,
        market: localMarket,
        auctions: localAuctions,
        chat: localChat
      })
    });

    if (!res.ok) return {};
    const serverDb = await res.json();

    if (Array.isArray(serverDb.users) && serverDb.users.length > 0) {
      const merged = mergePresetAccounts(serverDb.users);
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(merged));
    }
    if (Array.isArray(serverDb.market)) {
      localStorage.setItem(STORAGE_MARKET_KEY, JSON.stringify(serverDb.market));
    }
    if (Array.isArray(serverDb.auctions)) {
      localStorage.setItem(STORAGE_AUCTION_KEY, JSON.stringify(serverDb.auctions));
    }
    if (Array.isArray(serverDb.chat)) {
      localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(serverDb.chat));
    }

    return serverDb;
  } catch (err) {
    console.warn('Server sync offline or unreachable:', err);
    return {};
  }
}
