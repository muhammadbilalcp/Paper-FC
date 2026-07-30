import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

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

function loadDatabase(): GlobalDatabase {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error reading database file:", err);
  }
  return { users: [], market: [], auctions: [], chat: [] };
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

// Memory cache
let dbState: GlobalDatabase = loadDatabase();

// --- API ROUTES ---

// Get full shared database state
app.get("/api/db", (req, res) => {
  res.json(dbState);
});

// Full sync endpoint (merges and saves)
app.post("/api/db/sync", (req, res) => {
  const { users, market, auctions, chat } = req.body || {};

  if (Array.isArray(users) && users.length > 0) {
    // Merge users matching by ID
    const mergedUsers = [...dbState.users];
    for (const u of users) {
      const idx = mergedUsers.findIndex((existing) => existing.id === u.id);
      if (idx !== -1) {
        mergedUsers[idx] = { ...mergedUsers[idx], ...u };
      } else {
        mergedUsers.push(u);
      }
    }
    dbState.users = mergedUsers;
  }

  if (Array.isArray(market)) {
    dbState.market = market;
  }

  if (Array.isArray(auctions)) {
    dbState.auctions = auctions;
  }

  if (Array.isArray(chat)) {
    dbState.chat = chat;
  }

  saveDatabase(dbState);
  res.json(dbState);
});

// Bulk update users endpoint
app.post("/api/users/save-all", (req, res) => {
  const { users } = req.body;
  if (Array.isArray(users)) {
    dbState.users = users;
    saveDatabase(dbState);
  }
  res.json({ status: "ok", users: dbState.users });
});

// Update single user account
app.post("/api/users/update", (req, res) => {
  const user = req.body;
  if (user && user.id) {
    const idx = dbState.users.findIndex((u) => u.id === user.id);
    if (idx !== -1) {
      dbState.users[idx] = { ...dbState.users[idx], ...user };
    } else {
      dbState.users.push(user);
    }
    saveDatabase(dbState);
  }
  res.json({ status: "ok", user, allUsers: dbState.users });
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
    // Keep max 200 messages
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
