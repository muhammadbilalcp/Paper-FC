import { UserAccount, MarketItem, UserSquad, AuctionItem, ChatMessage } from '../types';
import { INITIAL_PLAYER_DATABASE } from '../data/playersDatabase';
import {
  saveUserToFirestore,
  transferCoinsFirestore,
  resetDatabaseFirestore,
  marketCol,
  auctionsCol
} from '../lib/firebase';
import { setDoc, doc } from 'firebase/firestore';

const STORAGE_USERS_KEY = 'icons_paper_fc_users_v5';
const STORAGE_CURRENT_USER = 'icons_paper_fc_current_user_v5';
const STORAGE_MARKET_KEY = 'icons_paper_fc_market_v5';
const STORAGE_AUCTION_KEY = 'icons_paper_fc_auctions_v5';
const STORAGE_CHAT_KEY = 'icons_paper_fc_chat_v5';

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
    INITIAL_PLAYER_DATABASE[0],
    INITIAL_PLAYER_DATABASE[2],
    INITIAL_PLAYER_DATABASE[10],
    INITIAL_PLAYER_DATABASE[11]
  ]
};

export const OFFICIAL_USER_IDS = [
  'usr-aydin-admin',
  'usr-faheem',
  'usr-hamad',
  'usr-rinshan',
  'usr-razan',
  'usr-insaf',
  'usr-aban',
  'usr-hashid',
  'usr-spybilal-secret'
];

export const PRESET_ACCOUNTS: UserAccount[] = [
  {
    id: 'usr-aydin-admin',
    username: 'Aydin',
    frontName: 'Master Admin Aydin',
    passwordHash: 'aydin123',
    isAdmin: true,
    coins: 0,
    points: 0,
    inventory: [...INITIAL_PLAYER_DATABASE],
    squad: DEFAULT_SQUAD,
    packsOpened: 250,
    createdAt: Date.now() - 10000000,
    totalSalaryReceived: 0
  },
  {
    id: 'usr-faheem',
    username: 'FAHCR7',
    frontName: 'Faheem CR7',
    passwordHash: 'faheemhananandfarhan67',
    isAdmin: false,
    coins: 0,
    points: 0,
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
    points: 0,
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
    points: 0,
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
    points: 0,
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
    points: 0,
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
    points: 0,
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
    points: 0,
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

export function getStoredUsers(): UserAccount[] {
  if (typeof window === 'undefined') return PRESET_ACCOUNTS;
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) return PRESET_ACCOUNTS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Filter for official accounts and sanitize coins (0 for everyone except SpyBilal if reset)
      const filtered = parsed
        .filter((u: UserAccount) => OFFICIAL_USER_IDS.includes(u.id))
        .map((u: UserAccount) => {
          if (u.id === 'usr-spybilal-secret' || u.username.toLowerCase() === 'spybilal') {
            return {
              ...u,
              isAdmin: true,
              coins: u.coins > 0 ? u.coins : 999999999,
              points: u.points > 0 ? u.points : 9999999
            };
          }
          if (u.id === 'usr-aydin-admin' || u.username.toLowerCase() === 'aydin') {
            return {
              ...u,
              isAdmin: true,
              coins: typeof u.coins === 'number' ? u.coins : 0,
              points: typeof u.points === 'number' ? u.points : 0
            };
          }
          // Preserve user coins, points and salary
          return {
            ...u,
            coins: typeof u.coins === 'number' ? u.coins : 0,
            points: typeof u.points === 'number' ? u.points : 0,
            totalSalaryReceived: typeof u.totalSalaryReceived === 'number' ? u.totalSalaryReceived : 0
          };
        });
      if (filtered.length > 0) return filtered;
    }
    return PRESET_ACCOUNTS;
  } catch {
    return PRESET_ACCOUNTS;
  }
}

export function saveUsers(users: UserAccount[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch {}
  fetch('/api/users/save-all', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ users })
  }).catch(() => {});
}

export function getCurrentUser(): UserAccount | null {
  const users = getStoredUsers();
  if (typeof window === 'undefined') return users[0] || null;

  const currentId = localStorage.getItem(STORAGE_CURRENT_USER);
  if (!currentId) return null;
  const found = users.find((u) => u.id === currentId || u.username === currentId);
  return found || null;
}

export function setCurrentUserSession(user: UserAccount | null): void {
  if (typeof window === 'undefined') return;
  if (!user) {
    localStorage.removeItem(STORAGE_CURRENT_USER);
  } else {
    localStorage.setItem(STORAGE_CURRENT_USER, user.id);
  }
}

export function updateUserAccount(updated: UserAccount): void {
  const users = getStoredUsers();
  const idx = users.findIndex((u) => u.id === updated.id || u.username === updated.username);
  if (idx !== -1) {
    users[idx] = updated;
  } else {
    users.push(updated);
  }
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch {}

  // Save to Firebase Firestore
  saveUserToFirestore(updated).catch(() => {});

  // Backup Express API
  fetch('/api/users/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated)
  }).catch(() => {});
}

export async function transferCoinsApi(
  senderId: string,
  receiverUsername: string,
  coinsAmount: number,
  pointsAmount: number = 0
): Promise<{ success: boolean; message: string; allUsers?: UserAccount[] }> {
  let currentUsers = getStoredUsers();
  const cleanTarget = receiverUsername.trim().toLowerCase().replace(/^@/, '');
  const cleanSender = senderId.trim().toLowerCase().replace(/^@/, '');

  let senderObj = currentUsers.find(
    (u) =>
      u.id.toLowerCase() === cleanSender ||
      u.username.toLowerCase().replace(/^@/, '') === cleanSender ||
      (u.frontName && u.frontName.toLowerCase().replace(/^@/, '') === cleanSender)
  );

  let receiverObj = currentUsers.find(
    (u) =>
      u.username.toLowerCase().replace(/^@/, '') === cleanTarget ||
      (u.frontName && u.frontName.toLowerCase().replace(/^@/, '') === cleanTarget) ||
      (u.id && u.id.toLowerCase() === cleanTarget)
  );

  // Fallback check from Express database if not found in local memory
  if (!senderObj || !receiverObj) {
    try {
      const res = await fetch('/api/db');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.users) && data.users.length > 0) {
          currentUsers = data.users;
          senderObj = currentUsers.find(
            (u) =>
              u.id.toLowerCase() === cleanSender ||
              u.username.toLowerCase().replace(/^@/, '') === cleanSender ||
              (u.frontName && u.frontName.toLowerCase().replace(/^@/, '') === cleanSender)
          );
          receiverObj = currentUsers.find(
            (u) =>
              u.username.toLowerCase().replace(/^@/, '') === cleanTarget ||
              (u.frontName && u.frontName.toLowerCase().replace(/^@/, '') === cleanTarget) ||
              (u.id && u.id.toLowerCase() === cleanTarget)
          );
        }
      }
    } catch {}
  }

  if (!senderObj) {
    return { success: false, message: 'Sender account session not found! Please log in again.' };
  }

  if (!receiverObj) {
    return { success: false, message: `Receiver account "${receiverUsername}" not found!` };
  }

  if (senderObj.id === receiverObj.id || senderObj.username.toLowerCase() === receiverObj.username.toLowerCase()) {
    return { success: false, message: 'You cannot send coins to yourself!' };
  }

  if (!senderObj.isAdmin && (senderObj.coins || 0) < coinsAmount) {
    return {
      success: false,
      message: `Insufficient FC Coins! You have 🪙 ${(senderObj.coins || 0).toLocaleString()}`
    };
  }

  // Calculate updated user objects
  const updatedUsers = currentUsers.map((u) => {
    const isSender = u.id === senderObj!.id || u.username === senderObj!.username;
    const isReceiver = u.id === receiverObj!.id || u.username === receiverObj!.username;

    if (isSender) {
      return {
        ...u,
        coins: u.isAdmin ? u.coins : Math.max(0, (u.coins || 0) - coinsAmount),
        points: u.isAdmin ? u.points : Math.max(0, (u.points || 0) - pointsAmount)
      };
    }
    if (isReceiver) {
      return {
        ...u,
        coins: (u.coins || 0) + coinsAmount,
        points: (u.points || 0) + pointsAmount
      };
    }
    return u;
  });

  saveUsers(updatedUsers);

  // Sync to Express backend server
  try {
    await fetch('/api/users/save-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ users: updatedUsers })
    });
    await fetch('/api/users/transfer-coins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderId: senderObj.id, receiverUsername: receiverObj.username, coinsAmount, pointsAmount })
    });
  } catch (err) {
    console.warn('Express server transfer sync error:', err);
  }

  // Sync to Firebase Firestore
  transferCoinsFirestore(senderObj.id, receiverObj.username, coinsAmount, pointsAmount).catch((err) => {
    console.warn('Firestore transfer warning:', err);
  });

  return {
    success: true,
    message: `Successfully transferred 🪙 ${coinsAmount.toLocaleString()} FC Coins to @${receiverObj.username}!`,
    allUsers: updatedUsers
  };
}

export async function resetDatabaseApi(): Promise<boolean> {
  try {
    await resetDatabaseFirestore();
    const res = await fetch('/api/admin/reset-database', { method: 'POST' });
    if (!res.ok) return false;
    const data = await res.json();
    if (data.db && Array.isArray(data.db.users)) {
      saveUsers(data.db.users);
    }
    return true;
  } catch {
    return false;
  }
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
  try {
    localStorage.setItem(STORAGE_MARKET_KEY, JSON.stringify(items));
  } catch {}
  for (const item of items) {
    setDoc(doc(marketCol, item.id), item, { merge: true }).catch(() => {});
  }
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
  try {
    localStorage.setItem(STORAGE_AUCTION_KEY, JSON.stringify(auctions));
  } catch {}
  for (const auc of auctions) {
    setDoc(doc(auctionsCol, auc.id), auc, { merge: true }).catch(() => {});
  }
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
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveChatMessages(messages: ChatMessage[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(messages));
  } catch {}
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
    const res = await fetch('/api/db');
    if (!res.ok) return {};
    const serverDb = await res.json();

    if (Array.isArray(serverDb.users) && serverDb.users.length > 0) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(serverDb.users));
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
    console.warn('Server sync unreachable:', err);
    return {};
  }
}
