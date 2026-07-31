import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { INITIAL_PLAYER_DATABASE } from "./src/data/playersDatabase";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// Persistent File Store path
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "database.json");

interface GlobalDatabase {
  users: any[];
  market: any[];
  auctions: any[];
  chat: any[];
}

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

const OFFICIAL_USER_IDS = [
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

// Clean default seed users with 0 coins for all 9 official accounts
const SEED_USERS = [
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

function loadDatabase(): GlobalDatabase {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.users) && parsed.users.length > 0) {
        // Enforce strictly 9 official accounts and reset coins to 0 except for SpyBilal
        parsed.users = parsed.users
          .filter((u: any) => OFFICIAL_USER_IDS.includes(u.id))
          .map((u: any) => {
            if (u.id === 'usr-spybilal-secret' || u.username.toLowerCase() === 'spybilal') {
              return {
                ...u,
                isAdmin: true,
                coins: u.coins > 0 ? u.coins : 999999999,
                points: u.points > 0 ? u.points : 9999999
              };
            }
            return {
              ...u,
              isAdmin: u.id === 'usr-aydin-admin' || u.username.toLowerCase() === 'aydin' ? true : false,
              coins: typeof u.coins === 'number' ? u.coins : 0,
              points: typeof u.points === 'number' ? u.points : 0,
              totalSalaryReceived: typeof u.totalSalaryReceived === 'number' ? u.totalSalaryReceived : 0
            };
          });
        if (parsed.users.length === 0) {
          parsed.users = SEED_USERS;
        }
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading database file:", err);
  }
  const initial: GlobalDatabase = {
    users: SEED_USERS,
    market: [],
    auctions: [],
    chat: [
      {
        id: 'chat-welcome',
        senderUsername: 'Aydin',
        senderFrontName: 'Master Admin Aydin',
        text: 'Welcome to Icons Paper FC! Multi-device central server sync active. ⚽',
        timestamp: Date.now(),
        isAdmin: true
      }
    ]
  };
  saveDatabase(initial);
  return initial;
}

function saveDatabase(db: GlobalDatabase) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing database file:", err);
  }
}

// Memory state
let dbState: GlobalDatabase = loadDatabase();

// --- API ROUTES ---

// Get full master database state
app.get("/api/db", (req, res) => {
  res.json(dbState);
});

// Update single user account
app.post("/api/users/update", (req, res) => {
  const user = req.body;
  if (user && (user.id || user.username)) {
    const idx = dbState.users.findIndex(
      (u) => u.id === user.id || u.username.toLowerCase() === user.username.toLowerCase()
    );
    if (idx !== -1) {
      dbState.users[idx] = { ...dbState.users[idx], ...user };
    } else {
      dbState.users.push(user);
    }
    saveDatabase(dbState);
  }
  res.json({ status: "ok", user, allUsers: dbState.users });
});

// Transfer coins or cash directly between accounts
app.post("/api/users/transfer-coins", (req, res) => {
  const { senderId, receiverUsername, coinsAmount, pointsAmount } = req.body;
  const coins = Math.max(0, Number(coinsAmount) || 0);
  const points = Math.max(0, Number(pointsAmount) || 0);

  const senderIdx = dbState.users.findIndex(
    (u) => u.id === senderId || u.username.toLowerCase() === (senderId || "").toLowerCase()
  );

  const cleanTarget = (receiverUsername || "").trim().toLowerCase();
  const receiverIdx = dbState.users.findIndex(
    (u) =>
      u.username.toLowerCase() === cleanTarget ||
      (u.frontName || "").toLowerCase() === cleanTarget ||
      (u.frontName || "").toLowerCase().includes(cleanTarget)
  );

  if (senderIdx === -1 || receiverIdx === -1) {
    return res.status(400).json({ error: "Sender or Receiver account not found!" });
  }

  const sender = dbState.users[senderIdx];
  const receiver = dbState.users[receiverIdx];

  if (!sender.isAdmin) {
    if (coins > sender.coins) {
      return res.status(400).json({ error: "Insufficient FC Coins balance!" });
    }
    if (points > sender.points) {
      return res.status(400).json({ error: "Insufficient Paper Cash balance!" });
    }
    sender.coins -= coins;
    sender.points -= points;
  }

  receiver.coins += coins;
  receiver.points += points;

  saveDatabase(dbState);
  return res.json({ status: "ok", sender, receiver, allUsers: dbState.users });
});

// Reset non-admin account balances to 0 cleanly
app.post("/api/admin/reset-coins", (req, res) => {
  dbState.users = dbState.users.map((u) => {
    if (u.isAdmin) return u;
    return { ...u, coins: 0, points: 150 };
  });
  saveDatabase(dbState);
  res.json({ status: "ok", allUsers: dbState.users });
});

// Complete Database Reset endpoint
app.post("/api/admin/reset-database", (req, res) => {
  dbState = {
    users: SEED_USERS,
    market: [],
    auctions: [],
    chat: [
      {
        id: `chat-welcome-${Date.now()}`,
        senderUsername: 'Aydin',
        senderFrontName: 'Master Admin Aydin',
        text: 'Database cleanly reset! Everyone has 0 starting coins. Multi-device sync ready. ⚽',
        timestamp: Date.now(),
        isAdmin: true
      }
    ]
  };
  saveDatabase(dbState);
  res.json({ status: "ok", db: dbState });
});

// Bulk update users endpoint
app.post("/api/users/save-all", (req, res) => {
  const { users } = req.body;
  if (Array.isArray(users) && users.length > 0) {
    dbState.users = users;
    saveDatabase(dbState);
  }
  res.json({ status: "ok", users: dbState.users });
});

// Save market items
app.post("/api/market/save", (req, res) => {
  const { items } = req.body;
  if (Array.isArray(items)) {
    dbState.market = items;
    saveDatabase(dbState);
  }
  res.json({ status: "ok", market: dbState.market });
});

// Market buy
app.post("/api/market/buy", (req, res) => {
  const { buyerId, itemId } = req.body;
  const itemIdx = dbState.market.findIndex((m) => m.id === itemId);
  if (itemIdx === -1) {
    return res.status(404).json({ error: "Card listing no longer available on market!" });
  }
  const item = dbState.market[itemIdx];
  const buyerIdx = dbState.users.findIndex((u) => u.id === buyerId || u.username === buyerId);
  if (buyerIdx === -1) {
    return res.status(404).json({ error: "Buyer account not found!" });
  }
  const buyer = dbState.users[buyerIdx];
  if (buyer.coins < item.priceCoins) {
    return res.status(400).json({ error: "Insufficient FC Coins!" });
  }

  // Deduct coins & add card
  buyer.coins -= item.priceCoins;
  buyer.inventory.push(item.card);

  // Credit seller
  const sellerIdx = dbState.users.findIndex((u) => u.username === item.sellerUsername);
  if (sellerIdx !== -1) {
    dbState.users[sellerIdx].coins += item.priceCoins;
  }

  // Remove item
  dbState.market.splice(itemIdx, 1);

  saveDatabase(dbState);
  res.json({ status: "ok", buyer, market: dbState.market, allUsers: dbState.users });
});

// Market list
app.post("/api/market/list", (req, res) => {
  const { sellerUsername, card, priceCoins } = req.body;
  const sellerIdx = dbState.users.findIndex((u) => u.username === sellerUsername);
  if (sellerIdx === -1) {
    return res.status(404).json({ error: "Seller account not found!" });
  }
  const seller = dbState.users[sellerIdx];
  seller.inventory = seller.inventory.filter((c: any) => c.id !== card.id);

  const newItem = {
    id: `mkt-${Date.now()}`,
    sellerUsername,
    card,
    priceCoins: Number(priceCoins),
    listedAt: Date.now()
  };
  dbState.market.unshift(newItem);

  saveDatabase(dbState);
  res.json({ status: "ok", seller, market: dbState.market, allUsers: dbState.users });
});

// Save auctions
app.post("/api/auctions/save", (req, res) => {
  const { auctions } = req.body;
  if (Array.isArray(auctions)) {
    dbState.auctions = auctions;
    saveDatabase(dbState);
  }
  res.json({ status: "ok", auctions: dbState.auctions });
});

// Send chat message
app.post("/api/chat/send", (req, res) => {
  const { message } = req.body;
  if (message && message.id) {
    dbState.chat.push(message);
    if (dbState.chat.length > 200) {
      dbState.chat = dbState.chat.slice(-200);
    }
    saveDatabase(dbState);
  }
  res.json({ status: "ok", chat: dbState.chat });
});

// Save full chat
app.post("/api/chat/save", (req, res) => {
  const { messages } = req.body;
  if (Array.isArray(messages)) {
    dbState.chat = messages;
    saveDatabase(dbState);
  }
  res.json({ status: "ok", chat: dbState.chat });
});

// --- VITE MIDDLEWARE / STATIC SERVING ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Shared Multi-Device Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
