import { useState, useEffect } from 'react';
import { UserAccount, PlayerCard, MarketItem, HomeScreenUpdate } from './types';
import { INITIAL_PLAYER_DATABASE } from './data/playersDatabase';
import { INITIAL_HOME_UPDATES } from './data/updatesDatabase';
import { PACKS_LIST } from './utils/packs';
import { FCPlayerCard } from './components/FCPlayerCard';
import { Navbar, TabType } from './components/Navbar';
import { PackOpeningStage } from './components/PackOpeningStage';
import { SquadPitch } from './components/SquadPitch';
import { TransferMarket } from './components/TransferMarket';
import { BiddingMarket } from './components/BiddingMarket';
import { CommunityChat } from './components/CommunityChat';
import { UserProfileModal } from './components/UserProfileModal';
import { AydinAdminPanel } from './components/AydinAdminPanel';
import { AuthModal } from './components/AuthModal';
import { HomeUpdatesFeed } from './components/HomeUpdatesFeed';
import { soundFx } from './utils/audio';
import { getStoredUsers, getCurrentUser, saveUsers, updateUserAccount, getMarketItems, saveMarketItems, syncWithServer, setCurrentUserSession } from './utils/storage';
import {
  seedFirestoreIfEmpty,
  subscribeToUsers,
  subscribeToMarket
} from './lib/firebase';

export default function App() {
  const [users, setUsers] = useState<UserAccount[]>(() => {
    return getStoredUsers();
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => getCurrentUser());

  const [marketListings, setMarketListings] = useState<MarketItem[]>(() => getMarketItems());

  // Real-time Firebase Firestore cloud sync across all devices
  useEffect(() => {
    seedFirestoreIfEmpty();

    const unsubscribeUsers = subscribeToUsers((freshUsers) => {
      if (freshUsers && freshUsers.length > 0) {
        setUsers(freshUsers);
        const activeUserId = localStorage.getItem('icons_paper_fc_current_user_v5');
        if (activeUserId) {
          const freshMe = freshUsers.find(
            (u: UserAccount) =>
              u.id === activeUserId ||
              u.username === activeUserId ||
              u.username.toLowerCase() === activeUserId.toLowerCase() ||
              (u.frontName && u.frontName.toLowerCase() === activeUserId.toLowerCase())
          );
          if (freshMe) {
            setCurrentUser(freshMe);
          }
        }
      }
    });

    const unsubscribeMarket = subscribeToMarket((freshMarket) => {
      setMarketListings(freshMarket);
    });

    // Also fallback sync with Express server
    const doSync = async () => {
      const serverData = await syncWithServer();
      if (serverData.users && Array.isArray(serverData.users) && serverData.users.length > 0) {
        setUsers(serverData.users);
        const activeUserId = localStorage.getItem('icons_paper_fc_current_user_v5');
        if (activeUserId) {
          const freshMe = serverData.users.find(
            (u: UserAccount) =>
              u.id === activeUserId ||
              u.username === activeUserId ||
              u.username.toLowerCase() === activeUserId.toLowerCase() ||
              (u.frontName && u.frontName.toLowerCase() === activeUserId.toLowerCase())
          );
          if (freshMe) {
            setCurrentUser(freshMe);
          }
        }
      }
    };
    doSync();
    const interval = setInterval(doSync, 3000);

    return () => {
      unsubscribeUsers();
      unsubscribeMarket();
      clearInterval(interval);
    };
  }, []);

  const [homeUpdates, setHomeUpdates] = useState<HomeScreenUpdate[]>(() => {
    try {
      const saved = localStorage.getItem('icons_paper_fc_updates_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_HOME_UPDATES;
  });

  const [activeTab, setActiveTab] = useState<TabType>('STORE');

  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(!currentUser);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  const [selectedPackOpening, setSelectedPackOpening] = useState<{
    pack: typeof PACKS_LIST[0];
    pulledCards: PlayerCard[];
  } | null>(null);

  const [inventorySearch, setInventorySearch] = useState('');

  const handleReloadUsers = async () => {
    const serverData = await syncWithServer();
    if (serverData.users && Array.isArray(serverData.users)) {
      setUsers(serverData.users);
      const activeUserId = localStorage.getItem('icons_paper_fc_current_user_v5');
      if (activeUserId) {
        const freshMe = serverData.users.find(
          (u: UserAccount) =>
            u.id === activeUserId ||
            u.username === activeUserId ||
            u.username.toLowerCase() === activeUserId.toLowerCase() ||
            (u.frontName && u.frontName.toLowerCase() === activeUserId.toLowerCase())
        );
        if (freshMe) {
          setCurrentUser(freshMe);
        }
      }
    }
  };

  useEffect(() => {
    try {
      if (currentUser) {
        setCurrentUserSession(currentUser);
      }
      localStorage.setItem('icons_paper_fc_updates_v1', JSON.stringify(homeUpdates));
    } catch {
      // Fail gracefully
    }
  }, [currentUser, homeUpdates]);

  const handleAddHomeUpdate = (newUpdate: HomeScreenUpdate) => {
    setHomeUpdates((prev) => [newUpdate, ...prev]);
  };

  const handleDeleteHomeUpdate = (updateId: string) => {
    setHomeUpdates((prev) => prev.filter((u) => u.id !== updateId));
  };

  const handleUpdateCurrentUser = (updatedUser: UserAccount) => {
    setCurrentUser(updatedUser);
    setUsers((prevUsers) => {
      const exists = prevUsers.some((u) => u.id === updatedUser.id);
      const nextUsers = exists
        ? prevUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u))
        : [...prevUsers, updatedUser];
      saveUsers(nextUsers);
      return nextUsers;
    });
    updateUserAccount(updatedUser);
  };

  const handleOpenPack = (pack: typeof PACKS_LIST[0], currency: 'COINS' | 'POINTS') => {
    if (!currentUser) return;
    const cost = currency === 'COINS' ? pack.costCoins : pack.costPoints;
    const userBalance = currency === 'COINS' ? currentUser.coins : currentUser.points;

    if (userBalance < cost && !currentUser.isAdmin) {
      alert(`Insufficient ${currency}! Earn or add more cash to open this pack.`);
      return;
    }

    soundFx.playCoinSound();

    const updatedUser: UserAccount = {
      ...currentUser,
      coins: currency === 'COINS' ? currentUser.coins - cost : currentUser.coins,
      points: currency === 'POINTS' ? currentUser.points - cost : currentUser.points,
      packsOpened: currentUser.packsOpened + 1
    };

    handleUpdateCurrentUser(updatedUser);

    let eligibleCards = INITIAL_PLAYER_DATABASE.filter(
      (c) => c.rating >= pack.minOvr && c.rating <= pack.maxOvr
    );

    if (pack.guaranteedRarity) {
      const rarityMatches = INITIAL_PLAYER_DATABASE.filter(
        (c) => c.rarity === pack.guaranteedRarity
      );
      if (rarityMatches.length > 0) {
        eligibleCards = rarityMatches;
      }
    }

    const pool = eligibleCards.length > 0 ? eligibleCards : INITIAL_PLAYER_DATABASE;
    const pulled: PlayerCard[] = [];

    for (let i = 0; i < pack.cardCount; i++) {
      const randomIndex = Math.floor(Math.random() * pool.length);
      const chosenTemplate = pool[randomIndex];

      pulled.push({
        ...chosenTemplate,
        id: `${chosenTemplate.id}-${Date.now()}-${i}`,
        obtainedAt: Date.now()
      });
    }

    setSelectedPackOpening({
      pack,
      pulledCards: pulled
    });
  };

  const handleClaimPackCards = (cards: PlayerCard[]) => {
    if (!currentUser) return;
    const updated: UserAccount = {
      ...currentUser,
      inventory: [...currentUser.inventory, ...cards]
    };
    handleUpdateCurrentUser(updated);
    setSelectedPackOpening(null);
  };

  const handleBuyMarketItem = (item: MarketItem) => {
    if (!currentUser) return;
    if (currentUser.coins < item.priceCoins) return;

    const updatedUser: UserAccount = {
      ...currentUser,
      coins: currentUser.coins - item.priceCoins,
      inventory: [...currentUser.inventory, { ...item.card, id: `${item.card.id}-mkt-${Date.now()}` }]
    };

    handleUpdateCurrentUser(updatedUser);

    const updatedUsers = users.map((u) => {
      if (u.username === item.sellerUsername) {
        const credited = { ...u, coins: u.coins + item.priceCoins };
        updateUserAccount(credited);
        return credited;
      }
      return u;
    });
    setUsers(updatedUsers);
    saveUsers(updatedUsers);

    const updatedMarket = marketListings.filter((m) => m.id !== item.id);
    setMarketListings(updatedMarket);
    saveMarketItems(updatedMarket);
  };

  const handleListMarketItem = (card: PlayerCard, priceCoins: number) => {
    if (!currentUser) return;
    const updatedUser: UserAccount = {
      ...currentUser,
      inventory: currentUser.inventory.filter((c) => c.id !== card.id)
    };

    handleUpdateCurrentUser(updatedUser);

    const newMarketItem: MarketItem = {
      id: `mkt-${Date.now()}`,
      sellerUsername: currentUser.username,
      card,
      priceCoins,
      listedAt: Date.now()
    };

    const updatedMarket = [newMarketItem, ...marketListings];
    setMarketListings(updatedMarket);
    saveMarketItems(updatedMarket);
  };

  const handleQuickSellCard = (card: PlayerCard) => {
    if (!currentUser) return;
    const sellPrice = Math.round((card.valueCoins || 100000) * 0.7);
    soundFx.playCoinSound();

    const updatedUser: UserAccount = {
      ...currentUser,
      coins: currentUser.coins + sellPrice,
      inventory: currentUser.inventory.filter((c) => c.id !== card.id)
    };

    handleUpdateCurrentUser(updatedUser);
  };

  if (!currentUser) {
    return (
      <div className="w-full h-screen bg-[#050505] text-white font-sans flex flex-col items-center justify-center p-4 bg-[radial-gradient(circle_at_50%_-20%,_#112211_0%,_#050505_70%)]">
        <AuthModal
          allUsers={users}
          onLoginSuccess={(u) => {
            handleUpdateCurrentUser(u);
            setIsAuthOpen(false);
          }}
          onRegisterSuccess={(nu) => {
            setUsers((prev) => [...prev, nu]);
            handleUpdateCurrentUser(nu);
            setIsAuthOpen(false);
          }}
          onClose={() => {}}
          canClose={false}
        />
      </div>
    );
  }

  const filteredInventory = currentUser.inventory.filter(
    (c) =>
      c.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      c.position.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      c.rarity.toLowerCase().includes(inventorySearch.toLowerCase())
  );

  return (
    <div className="w-full h-screen bg-[#050505] text-white font-sans flex flex-col overflow-hidden select-none bg-[radial-gradient(circle_at_50%_-20%,_#112211_0%,_#050505_70%)]">
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onLogout={() => {
          soundFx.playClick();
          setCurrentUser(null);
          setIsAuthOpen(true);
        }}
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-7xl w-full mx-auto flex flex-col gap-6">
        {activeTab === 'STORE' && (
          <div className="flex flex-col gap-6">
            {/* Live Home Screen Updates Feed */}
            <HomeUpdatesFeed
              updates={homeUpdates}
              currentUser={currentUser}
              onAddUpdate={handleAddHomeUpdate}
              onDeleteUpdate={handleDeleteHomeUpdate}
            />

            <div className="relative overflow-hidden bg-gradient-to-r from-emerald-950 via-black to-emerald-950 border-2 border-green-500/40 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
              <div className="flex flex-col gap-2 max-w-xl">
                <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 border border-green-500/40 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest w-fit">
                  ⚡ SEASON 1: ICONS PAPER FC
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  OPEN ULTIMATE PACKS & BUILD YOUR DREAM TEAM
                </h1>
                <p className="text-xs sm:text-sm text-gray-400">
                  Unpack 99 OVR Zeral FC Legends, TOTY Superstars, and Aydin Exclusive Custom Cards with cinematic walkout animations!
                </p>
              </div>

              {currentUser.isAdmin && (
                <div className="bg-red-500/20 border border-red-500/40 rounded-2xl p-4 text-center shrink-0">
                  <div className="text-xs font-black text-red-400 uppercase tracking-wider">AYDIN MASTER ADMIN</div>
                  <div className="text-[11px] text-gray-300 mt-1">Salary & Gifting Active</div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PACKS_LIST.map((pack) => (
                <div
                  key={pack.id}
                  className={`relative overflow-hidden rounded-3xl border-2 border-white/10 bg-gradient-to-br ${pack.color} p-6 flex flex-col justify-between gap-6 shadow-xl hover:scale-[1.02] hover:border-green-400 transition-all duration-300 group`}
                >
                  <div className="flex justify-between items-start z-10">
                    <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/20 text-xs font-black text-amber-300 tracking-wider">
                      {pack.badge}
                    </span>
                    <span className="text-xs font-mono font-bold bg-black/40 px-2 py-1 rounded text-gray-300">
                      WALKOUT: {pack.walkoutOdds}
                    </span>
                  </div>

                  <div className="flex flex-col items-center text-center my-4 z-10">
                    <div className="text-4xl font-black italic tracking-tighter text-white drop-shadow-lg">
                      {pack.name}
                    </div>
                    <p className="text-xs text-white/80 mt-2 font-medium max-w-xs">{pack.description}</p>
                  </div>

                  <div className="flex items-center gap-3 z-10">
                    <button
                      onClick={() => handleOpenPack(pack, 'COINS')}
                      className="flex-1 py-3 bg-black/80 hover:bg-black border border-amber-400/50 text-amber-300 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition cursor-pointer flex flex-col items-center"
                    >
                      <span>OPEN FOR COINS</span>
                      <span className="text-amber-400 font-mono text-[10px]">🪙 {pack.costCoins.toLocaleString()}</span>
                    </button>

                    <button
                      onClick={() => handleOpenPack(pack, 'POINTS')}
                      className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-400 hover:to-emerald-300 text-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition cursor-pointer flex flex-col items-center"
                    >
                      <span>OPEN FOR CASH</span>
                      <span className="font-mono text-[10px]">$ {pack.costPoints.toLocaleString()}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'SQUAD' && (
          <SquadPitch
            squad={currentUser.squad}
            inventory={currentUser.inventory}
            onUpdateSquad={(newSquad) =>
              handleUpdateCurrentUser({ ...currentUser, squad: newSquad })
            }
          />
        )}

        {activeTab === 'BIDDING' && (
          <BiddingMarket
            currentUser={currentUser}
            onUpdateUser={handleUpdateCurrentUser}
            allUsers={users}
          />
        )}

        {activeTab === 'CHAT' && (
          <CommunityChat currentUser={currentUser} allUsers={users} onUpdateUser={handleUpdateCurrentUser} />
        )}

        {activeTab === 'MARKET' && (
          <TransferMarket
            currentUser={currentUser}
            marketListings={marketListings}
            onBuyItem={handleBuyMarketItem}
            onListItem={handleListMarketItem}
          />
        )}

        {activeTab === 'INVENTORY' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
              <div>
                <h2 className="text-2xl font-black text-white">MY CLUB COLLECTION</h2>
                <p className="text-xs text-gray-400">Total Cards Owned: {currentUser.inventory.length}</p>
              </div>

              <input
                type="text"
                placeholder="Filter collection..."
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                className="bg-black/60 border border-white/20 rounded-xl px-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-green-400 w-64 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {filteredInventory.length === 0 ? (
                <div className="col-span-full py-16 text-center text-gray-500 font-mono">
                  No players found in your collection! Open packs in the Store to get cards.
                </div>
              ) : (
                filteredInventory.map((card) => (
                  <div key={card.id} className="flex flex-col items-center gap-2 group">
                    <FCPlayerCard card={card} size="md" />

                    <button
                      onClick={() => handleQuickSellCard(card)}
                      className="w-full py-1.5 bg-red-500/20 hover:bg-red-500/40 border border-red-500/40 text-red-300 font-black text-[10px] uppercase rounded-xl transition cursor-pointer"
                    >
                      QUICK SELL (🪙 {Math.round((card.valueCoins || 100000) * 0.7).toLocaleString()})
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'ADMIN' && (
          <AydinAdminPanel
            currentUser={currentUser}
            allUsers={users}
            homeUpdates={homeUpdates}
            onRefreshUsers={handleReloadUsers}
            onUpdateUser={(updated) => {
              setUsers((prev) => {
                const exists = prev.some((u) => u.id === updated.id);
                const next = exists
                  ? prev.map((u) => (u.id === updated.id ? updated : u))
                  : [...prev, updated];
                saveUsers(next);
                return next;
              });
              updateUserAccount(updated);
              if (currentUser && updated.id === currentUser.id) {
                setCurrentUser(updated);
              }
            }}
            onUpdateAllUsers={(updatedUsers) => {
              setUsers(updatedUsers);
              saveUsers(updatedUsers);
              if (currentUser) {
                const found = updatedUsers.find((u) => u.id === currentUser.id);
                if (found) setCurrentUser(found);
              }
            }}
            onAddHomeUpdate={handleAddHomeUpdate}
            onDeleteHomeUpdate={handleDeleteHomeUpdate}
          />
        )}
      </main>

      {selectedPackOpening && (
        <PackOpeningStage
          pack={selectedPackOpening.pack}
          pulledCards={selectedPackOpening.pulledCards}
          onComplete={handleClaimPackCards}
          onCancel={() => setSelectedPackOpening(null)}
        />
      )}

      {isProfileOpen && currentUser && (
        <UserProfileModal
          currentUser={currentUser}
          allUsers={users}
          onUpdateUser={handleUpdateCurrentUser}
          onRefreshUsers={handleReloadUsers}
          onClose={() => setIsProfileOpen(false)}
        />
      )}

      {(!currentUser || isAuthOpen) && (
        <AuthModal
          allUsers={users}
          canClose={!!currentUser}
          onLoginSuccess={(u) => handleUpdateCurrentUser(u)}
          onRegisterSuccess={(nu) => handleUpdateCurrentUser(nu)}
          onClose={() => setIsAuthOpen(false)}
        />
      )}

      <footer className="h-9 bg-black border-t border-white/10 flex items-center justify-between px-4 sm:px-8 text-[10px] text-gray-500 font-mono shrink-0">
        <div className="flex gap-4">
          <span>SERVER STATUS: <span className="text-green-400 font-bold">OPERATIONAL ⚡</span></span>
          <span className="hidden sm:inline">CONNECTED SQUAD MEMBERS: 8 ACTIVE</span>
        </div>
        <div>© 2026 ICONS PAPER FC • BUILT FOR AYDIN</div>
      </footer>
    </div>
  );
}
