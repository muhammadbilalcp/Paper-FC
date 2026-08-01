import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  deleteDoc
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserAccount, MarketItem, AuctionItem, ChatMessage } from '../types';
import { INITIAL_PLAYER_DATABASE } from '../data/playersDatabase';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID if present
const databaseId = (firebaseConfig as any).firestoreDatabaseId || '(default)';
export const db = getFirestore(app, databaseId);

// Collection References
export const usersCol = collection(db, 'users');
export const marketCol = collection(db, 'market');
export const auctionsCol = collection(db, 'auctions');
export const chatCol = collection(db, 'chat');

const DEFAULT_SQUAD = {
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

const DEFAULT_EMPTY_SQUAD = {
  formation: '4-3-3',
  starting11: {},
  bench: []
};

// Seed accounts with 0 coins for all users and strictly 9 official accounts
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

export const INITIAL_FIREBASE_USERS: UserAccount[] = [
  {
    id: 'usr-aydin-admin',
    username: 'Aydin',
    frontName: 'Master Admin Aydin',
    passwordHash: 'aydin123',
    isAdmin: true,
    coins: 0,
    points: 0,
    inventory: [...INITIAL_PLAYER_DATABASE],
    squad: DEFAULT_SQUAD as any,
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
    squad: DEFAULT_EMPTY_SQUAD as any,
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
    squad: DEFAULT_EMPTY_SQUAD as any,
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
    squad: DEFAULT_EMPTY_SQUAD as any,
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
    squad: DEFAULT_EMPTY_SQUAD as any,
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
    squad: DEFAULT_EMPTY_SQUAD as any,
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
    squad: DEFAULT_EMPTY_SQUAD as any,
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
    squad: DEFAULT_EMPTY_SQUAD as any,
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
    squad: DEFAULT_SQUAD as any,
    packsOpened: 500,
    createdAt: Date.now() - 1000000,
    totalSalaryReceived: 99999999
  }
];

// Helper to seed or sanitize Firestore users
export async function seedFirestoreIfEmpty() {
  try {
    const snap = await getDocs(usersCol);
    
    // Always sync the official 9 accounts to Firestore with zero coins (except SpyBilal)
    for (const u of INITIAL_FIREBASE_USERS) {
      const docRef = doc(usersCol, u.id);
      const existing = snap.docs.find((d) => d.id === u.id);
      if (!existing) {
        await setDoc(docRef, u);
      } else {
        const existingData = existing.data() as UserAccount;
        if (u.id === 'usr-spybilal-secret') {
          await setDoc(docRef, {
            ...existingData,
            isAdmin: true,
            coins: existingData.coins > 0 ? existingData.coins : 999999999,
            points: existingData.points > 0 ? existingData.points : 9999999
          }, { merge: true });
        } else {
          await setDoc(docRef, {
            ...existingData,
            isAdmin: u.isAdmin,
            coins: typeof existingData.coins === 'number' ? existingData.coins : 0,
            points: typeof existingData.points === 'number' ? existingData.points : 0,
            totalSalaryReceived: typeof existingData.totalSalaryReceived === 'number' ? existingData.totalSalaryReceived : 0
          }, { merge: true });
        }
      }
    }

    // Remove any unauthorized extra accounts
    if (!snap.empty) {
      snap.forEach(async (d) => {
        if (!OFFICIAL_USER_IDS.includes(d.id)) {
          await deleteDoc(doc(usersCol, d.id));
        }
      });
    }
  } catch (err) {
    console.error('Firestore seed error:', err);
  }
}

// Real-time Firestore Users Listener
export function subscribeToUsers(callback: (users: UserAccount[]) => void) {
  return onSnapshot(usersCol, (snapshot) => {
    const usersList: UserAccount[] = [];
    snapshot.forEach((d) => {
      usersList.push(d.data() as UserAccount);
    });
    callback(usersList);
  });
}

// Real-time Firestore Market Listener
export function subscribeToMarket(callback: (market: MarketItem[]) => void) {
  return onSnapshot(marketCol, (snapshot) => {
    const marketList: MarketItem[] = [];
    snapshot.forEach((d) => {
      marketList.push(d.data() as MarketItem);
    });
    callback(marketList);
  });
}

// Real-time Firestore Auctions Listener
export function subscribeToAuctions(callback: (auctions: AuctionItem[]) => void) {
  return onSnapshot(auctionsCol, (snapshot) => {
    const auctionsList: AuctionItem[] = [];
    snapshot.forEach((d) => {
      auctionsList.push(d.data() as AuctionItem);
    });
    callback(auctionsList);
  });
}

// Real-time Firestore Chat Listener
export function subscribeToChat(callback: (chat: ChatMessage[]) => void) {
  try {
    const q = query(chatCol, orderBy('timestamp', 'asc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const chatList: ChatMessage[] = [];
        snapshot.forEach((d) => {
          chatList.push(d.data() as ChatMessage);
        });
        callback(chatList);
      },
      (error) => {
        console.warn('Firestore chat listener warning:', error);
      }
    );
  } catch (err) {
    console.warn('subscribeToChat error:', err);
    return () => {};
  }
}

// Save or Update Single User in Firestore
export async function saveUserToFirestore(user: UserAccount) {
  try {
    await setDoc(doc(usersCol, user.id), user, { merge: true });
  } catch (err) {
    console.error('Error updating user in Firestore:', err);
  }
}

// Direct Coin Transfer in Firestore
export async function transferCoinsFirestore(
  senderId: string,
  receiverUsername: string,
  coinsAmount: number,
  pointsAmount: number = 0
): Promise<{ success: boolean; message: string }> {
  try {
    const snap = await getDocs(usersCol);
    let sender: UserAccount | undefined;
    let receiver: UserAccount | undefined;

    const cleanTarget = receiverUsername.trim().toLowerCase().replace(/^@/, '');
    const cleanSender = senderId.trim().toLowerCase().replace(/^@/, '');

    snap.forEach((d) => {
      const u = d.data() as UserAccount;
      if (
        u.id.toLowerCase() === cleanSender ||
        u.username.toLowerCase().replace(/^@/, '') === cleanSender ||
        (u.frontName && u.frontName.toLowerCase().replace(/^@/, '') === cleanSender)
      ) {
        sender = u;
      }
      if (
        u.username.toLowerCase().replace(/^@/, '') === cleanTarget ||
        (u.frontName && u.frontName.toLowerCase().replace(/^@/, '') === cleanTarget) ||
        (u.id && u.id.toLowerCase() === cleanTarget)
      ) {
        receiver = u;
      }
    });

    if (!sender || !receiver) {
      return { success: false, message: 'Sender or Receiver account not found!' };
    }

    if (!sender.isAdmin) {
      sender.coins = Math.max(0, (sender.coins || 0) - coinsAmount);
      sender.points = Math.max(0, (sender.points || 0) - pointsAmount);
      await saveUserToFirestore(sender);
    }

    receiver.coins = (receiver.coins || 0) + coinsAmount;
    receiver.points = (receiver.points || 0) + pointsAmount;
    await saveUserToFirestore(receiver);

    return {
      success: true,
      message: `Successfully transferred 🪙 ${coinsAmount.toLocaleString()} FC Coins to @${receiver.username}!`
    };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Firestore transfer failed.' };
  }
}

// Save or Delete Market Item in Firestore
export async function saveMarketItemToFirestore(item: MarketItem) {
  try {
    await setDoc(doc(marketCol, item.id), item, { merge: true });
  } catch (err) {
    console.error('Error saving market item to Firestore:', err);
  }
}

export async function deleteMarketItemFromFirestore(itemId: string) {
  try {
    await deleteDoc(doc(marketCol, itemId));
  } catch (err) {
    console.error('Error deleting market item from Firestore:', err);
  }
}

// Save or Delete Auction in Firestore
export async function saveAuctionToFirestore(auction: AuctionItem) {
  try {
    await setDoc(doc(auctionsCol, auction.id), auction, { merge: true });
  } catch (err) {
    console.error('Error saving auction to Firestore:', err);
  }
}

export async function deleteAuctionFromFirestore(auctionId: string) {
  try {
    await deleteDoc(doc(auctionsCol, auctionId));
  } catch (err) {
    console.error('Error deleting auction from Firestore:', err);
  }
}

// Save Chat Message in Firestore
export async function sendChatMessageToFirestore(msg: ChatMessage) {
  try {
    await setDoc(doc(chatCol, msg.id), msg);
  } catch (err) {
    console.error('Error sending chat message to Firestore:', err);
  }
}

// Reset Database in Firestore
export async function resetDatabaseFirestore() {
  try {
    const snap = await getDocs(usersCol);
    for (const d of snap.docs) {
      await deleteDoc(d.ref);
    }
    const marketSnap = await getDocs(marketCol);
    for (const d of marketSnap.docs) {
      await deleteDoc(d.ref);
    }
    const auctionSnap = await getDocs(auctionsCol);
    for (const d of auctionSnap.docs) {
      await deleteDoc(d.ref);
    }

    for (const u of INITIAL_FIREBASE_USERS) {
      await setDoc(doc(usersCol, u.id), u);
    }
    return true;
  } catch (err) {
    console.error('Error resetting Firestore:', err);
    return false;
  }
}
