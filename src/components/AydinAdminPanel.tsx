import React, { useState, useEffect } from 'react';
import { UserAccount, PlayerCard, HomeScreenUpdate } from '../types';
import { INITIAL_PLAYER_DATABASE } from '../data/playersDatabase';
import { soundFx } from '../utils/audio';

interface AydinAdminPanelProps {
  currentUser: UserAccount;
  allUsers: UserAccount[];
  homeUpdates?: HomeScreenUpdate[];
  onUpdateUser: (updatedUser: UserAccount) => void;
  onUpdateAllUsers?: (updatedUsers: UserAccount[]) => void;
  onRefreshUsers?: () => void;
  onAddHomeUpdate?: (newUpdate: HomeScreenUpdate) => void;
  onDeleteHomeUpdate?: (updateId: string) => void;
}

export const AydinAdminPanel: React.FC<AydinAdminPanelProps> = ({
  currentUser,
  allUsers,
  homeUpdates = [],
  onUpdateUser,
  onUpdateAllUsers,
  onRefreshUsers,
  onAddHomeUpdate,
  onDeleteHomeUpdate
}) => {
  const [selectedUsername, setSelectedUsername] = useState<string>(allUsers[0]?.username || currentUser.username);
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');
  const [cashAmount, setCashAmount] = useState<number>(1000000);
  const [coinsAmount, setCoinsAmount] = useState<number>(5000000);
  const [selectedCardId, setSelectedCardId] = useState<string>(INITIAL_PLAYER_DATABASE[0].id);

  // Quick Add Friend Account State
  const [newFriendUsername, setNewFriendUsername] = useState('');
  const [newFriendPassword, setNewFriendPassword] = useState('');
  const [isAddingFriend, setIsAddingFriend] = useState(false);

  // Auto Refresh Users when opening Conductor Panel
  useEffect(() => {
    if (onRefreshUsers) {
      onRefreshUsers();
    }
  }, []);

  const handleAddFriendAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newFriendUsername.trim();
    if (!trimmed || !newFriendPassword) return;

    const exists = allUsers.some((u) => u.username.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      alert(`User "${trimmed}" already exists in the registered database!`);
      return;
    }

    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      username: trimmed,
      passwordHash: newFriendPassword,
      isAdmin: trimmed.toLowerCase() === 'aydin',
      coins: 15000,
      points: 15000,
      inventory: [],
      squad: {
        formation: '4-3-3',
        starting11: {},
        bench: []
      },
      packsOpened: 0,
      createdAt: Date.now()
    };

    soundFx.playCoinSound();
    onUpdateUser(newUser);
    setNewFriendUsername('');
    setNewFriendPassword('');
    setIsAddingFriend(false);
    alert(`Successfully registered friend account "${trimmed}" with 15k Coins starter bonus!`);
  };

  const [customName, setCustomName] = useState<string>('Aydin God');
  const [customOvr, setCustomOvr] = useState<number>(99);
  const [customPos, setCustomPos] = useState<string>('ST');

  // Quick Home Update state
  const [updateTitle, setUpdateTitle] = useState('WORLD CUP KNOCKOUT SPECIAL');
  const [updateCategory, setUpdateCategory] = useState('World Cup Update');
  const [updateBadge, setUpdateBadge] = useState('LIVE NOW 🏆');
  const [updateDesc, setUpdateDesc] = useState('Unpack 99 OVR World Cup Legends & win 2x Paper Cash rewards on all packs!');

  const targetUser = allUsers.find((u) => u.username === selectedUsername) || currentUser;

  const handlePostHomeUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateTitle || !updateDesc || !onAddHomeUpdate) return;

    soundFx.playFanfare();

    const newUpdate: HomeScreenUpdate = {
      id: `upd-${Date.now()}`,
      title: updateTitle,
      category: updateCategory,
      badge: updateBadge,
      description: updateDesc,
      bannerGradient: updateCategory === 'Premier League Update' 
        ? 'from-blue-950 via-indigo-900 to-purple-950'
        : 'from-amber-950 via-yellow-900 to-emerald-950',
      iconEmoji: updateCategory === 'Premier League Update' ? '🦁' : '🏆',
      createdAt: Date.now(),
      author: 'Aydin (Admin)',
      isHot: true
    };

    onAddHomeUpdate(newUpdate);
    alert('Home Screen Update published successfully! Check the Store/Home Screen live feed.');
  };

  const handleGrantCash = () => {
    soundFx.playCoinSound();
    const updated: UserAccount = {
      ...targetUser,
      points: targetUser.points + cashAmount
    };
    onUpdateUser(updated);
  };

  const handlePaySalary = (amount: number) => {
    soundFx.playCoinSound();
    const currentSalary = targetUser.totalSalaryReceived || 0;
    const updated: UserAccount = {
      ...targetUser,
      points: targetUser.points + amount,
      totalSalaryReceived: currentSalary + amount
    };
    onUpdateUser(updated);
    alert(`Paid $${amount.toLocaleString()} Salary to ${targetUser.frontName || targetUser.username}!`);
  };

  const handleGrantCoins = () => {
    soundFx.playCoinSound();
    const updated: UserAccount = {
      ...targetUser,
      coins: targetUser.coins + coinsAmount
    };
    onUpdateUser(updated);
  };

  const handleGiftCard = () => {
    soundFx.playCoinSound();
    const cardToGift = INITIAL_PLAYER_DATABASE.find((c) => c.id === selectedCardId);
    if (!cardToGift) return;

    const newCardInstance: PlayerCard = {
      ...cardToGift,
      id: `${cardToGift.id}-${Date.now()}`,
      obtainedAt: Date.now()
    };

    const updated: UserAccount = {
      ...targetUser,
      inventory: [...targetUser.inventory, newCardInstance]
    };
    onUpdateUser(updated);
  };

  const handleCreateCustomCard = () => {
    soundFx.playFanfare();
    const newCustomCard: PlayerCard = {
      id: `custom-aydin-${Date.now()}`,
      name: customName,
      rating: customOvr,
      position: customPos as any,
      rarity: 'AYDIN_CUSTOM',
      nation: 'Turkey',
      nationFlag: '🇹🇷',
      club: 'ICONS Paper FC',
      clubLogo: '⚡',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      stats: { pac: customOvr, sho: customOvr, pas: customOvr, dri: customOvr, def: customOvr, phy: customOvr },
      weakFoot: 5,
      skillMoves: 5,
      isWalkout: true,
      creator: 'Aydin',
      valueCoins: 10000000
    };

    const updated: UserAccount = {
      ...targetUser,
      inventory: [...targetUser.inventory, newCustomCard]
    };
    onUpdateUser(updated);
  };

  if (!currentUser.isAdmin) {
    return (
      <div className="bg-red-950/40 border border-red-500/40 rounded-3xl p-8 text-center max-w-lg mx-auto">
        <div className="text-4xl mb-3">⛔</div>
        <h2 className="text-2xl font-black text-red-400">ACCESS RESTRICTED</h2>
        <p className="text-xs text-gray-400 mt-2">
          Only <span className="text-amber-400 font-bold">Aydin</span> has Master Administrator powers to grant cash and edit accounts.
        </p>
      </div>
    );
  }

  return (
    <div id="aydin-admin-panel" className="w-full flex flex-col gap-6">
      <div className="relative overflow-hidden bg-gradient-to-r from-red-950 via-emerald-950 to-black border-2 border-emerald-500/60 rounded-3xl p-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
        <div className="flex flex-wrap items-center justify-between gap-4 z-10 relative">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-black font-black text-2xl shadow-lg animate-pulse">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded border border-emerald-500/40">
                  AYDIN MASTER ACCESS
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
                ICONS PAPER FC MASTER CONTROLLER
              </h1>
            </div>
          </div>

          <div className="bg-black/60 border border-white/10 rounded-2xl p-3 flex gap-6 text-xs font-mono">
            <div>
              <div className="text-gray-400">MASTER ADMIN</div>
              <div className="text-emerald-400 font-bold">Aydin</div>
            </div>
            <div>
              <div className="text-gray-400">CREDENTIALS</div>
              <div className="text-amber-300 font-bold">U: Aydin / P: aydin123</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-4 backdrop-blur-md">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <span className="text-lg">💵</span>
            <h3 className="text-base font-black text-white">GRANT CASH & COINS</h3>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">SELECT USER ACCOUNT</label>
            <select
              value={selectedUsername}
              onChange={(e) => setSelectedUsername(e.target.value)}
              className="w-full mt-1.5 bg-black/80 border border-white/20 rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-green-400"
            >
              {allUsers.map((u) => (
                <option key={u.id} value={u.username}>
                  {u.username} {u.isAdmin ? '👑 (Aydin)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-black/50 p-3 rounded-2xl border border-white/5 text-xs font-mono space-y-1">
            <div className="text-gray-400">Current User Balances:</div>
            <div className="text-green-400 font-bold">Paper Cash: ${targetUser.points.toLocaleString()}</div>
            <div className="text-amber-400 font-bold">Coins: 🪙 {targetUser.coins.toLocaleString()}</div>
            <div className="text-emerald-300 font-bold border-t border-white/10 pt-1">Total Salary Paid: ${(targetUser.totalSalaryReceived || 0).toLocaleString()} 💰</div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">PAPER CASH ($)</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="number"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(Number(e.target.value))}
                  className="flex-1 bg-black/80 border border-white/20 rounded-xl px-3 py-1.5 text-white font-mono text-xs"
                />
                <button
                  onClick={handleGrantCash}
                  className="px-4 py-1.5 bg-green-500 hover:bg-green-400 text-black font-black text-xs rounded-xl cursor-pointer"
                >
                  GIVE CASH ⚡
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-emerald-400 uppercase">PAY SALARY ($)</label>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => handlePaySalary(cashAmount)}
                  className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow cursor-pointer"
                >
                  PAY ${cashAmount.toLocaleString()} SALARY 💰
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">COINS</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="number"
                  value={coinsAmount}
                  onChange={(e) => setCoinsAmount(Number(e.target.value))}
                  className="flex-1 bg-black/80 border border-white/20 rounded-xl px-3 py-1.5 text-white font-mono text-xs"
                />
                <button
                  onClick={handleGrantCoins}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl cursor-pointer"
                >
                  GIVE COINS 🪙
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-4 backdrop-blur-md">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <span className="text-lg">🎴</span>
            <h3 className="text-base font-black text-white">GIFT LEGENDARY CARD</h3>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">SELECT CARD FROM DATABASE</label>
            <select
              value={selectedCardId}
              onChange={(e) => setSelectedCardId(e.target.value)}
              className="w-full mt-1.5 bg-black/80 border border-white/20 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-green-400"
            >
              {INITIAL_PLAYER_DATABASE.map((card) => (
                <option key={card.id} value={card.id}>
                  [{card.rating} OVR] {card.name} ({card.position} - {card.rarity})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGiftCard}
            className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-400 hover:from-yellow-400 hover:to-amber-300 text-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition cursor-pointer"
          >
            GIFT CARD TO {targetUser.username.toUpperCase()} ⚡
          </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-4 backdrop-blur-md">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <span className="text-lg">⚡</span>
            <h3 className="text-base font-black text-emerald-400">CREATE 99 GOD CARD</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">PLAYER NAME</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full mt-1 bg-black/80 border border-white/20 rounded-xl px-3 py-1.5 text-white font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">RATING (OVR)</label>
                <input
                  type="number"
                  value={customOvr}
                  onChange={(e) => setCustomOvr(Number(e.target.value))}
                  className="w-full mt-1 bg-black/80 border border-white/20 rounded-xl px-3 py-1.5 text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">POSITION</label>
                <select
                  value={customPos}
                  onChange={(e) => setCustomPos(e.target.value)}
                  className="w-full mt-1 bg-black/80 border border-white/20 rounded-xl px-3 py-1.5 text-white font-mono text-xs"
                >
                  <option value="ST">ST</option>
                  <option value="CAM">CAM</option>
                  <option value="RW">RW</option>
                  <option value="LW">LW</option>
                  <option value="CM">CM</option>
                  <option value="CB">CB</option>
                  <option value="GK">GK</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleCreateCustomCard}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-400 hover:to-green-300 text-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-[0_0_20px_rgba(52,211,153,0.5)] transition cursor-pointer"
            >
              SPAWN & GIVE 99 GOD CARD 👑
            </button>
          </div>
        </div>
      </div>

      {/* REGISTERED USERS MANAGER TABLE */}
      <div className="bg-neutral-900 border-2 border-emerald-500/50 rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-black font-black text-xl shadow-lg">
              👥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white">ALL REGISTERED ACCOUNTS TABLE</h3>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black px-2.5 py-0.5 rounded-full font-mono">
                  {allUsers.length} PLAYERS
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono">Conductor Aydin Hub: Grant Paper Cash, FC Coins, or Cards to any registered player</p>
            </div>
          </div>

          {/* Search & Refresh & Mass Grant Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              placeholder="Search username..."
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              className="bg-black/80 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 font-mono w-36 sm:w-48"
            />

            <button
              onClick={() => {
                soundFx.playClick();
                setIsAddingFriend(!isAddingFriend);
              }}
              className="px-3 py-1.5 bg-purple-500 hover:bg-purple-400 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow transition cursor-pointer flex items-center gap-1"
            >
              ➕ ADD FRIEND
            </button>

            {onRefreshUsers && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  onRefreshUsers();
                  alert(`Refreshed! Currently ${allUsers.length} player account(s) loaded.`);
                }}
                className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow transition cursor-pointer flex items-center gap-1"
              >
                🔄 REFRESH
              </button>
            )}

            <button
              onClick={() => {
                soundFx.playCoinSound();
                const updated = allUsers.map((u) => ({ ...u, points: u.points + 1000000 }));
                if (onUpdateAllUsers) {
                  onUpdateAllUsers(updated);
                } else {
                  updated.forEach((u) => onUpdateUser(u));
                }
                alert('Granted $1,000,000 Paper Cash to ALL registered players!');
              }}
              className="px-3 py-1.5 bg-green-500 hover:bg-green-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow transition cursor-pointer"
            >
              💵 GIVE $1M TO ALL
            </button>
            <button
              onClick={() => {
                soundFx.playCoinSound();
                const updated = allUsers.map((u) => ({ ...u, coins: u.coins + 5000000 }));
                if (onUpdateAllUsers) {
                  onUpdateAllUsers(updated);
                } else {
                  updated.forEach((u) => onUpdateUser(u));
                }
                alert('Granted 5,000,000 FC Coins to ALL registered players!');
              }}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow transition cursor-pointer"
            >
              🪙 GIVE 5M COINS TO ALL
            </button>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to reset ALL users money and coins to ZERO?')) {
                  soundFx.playClick();
                  const updated = allUsers.map((u) => ({ ...u, coins: 0, points: 0, totalSalaryReceived: 0 }));
                  if (onUpdateAllUsers) {
                    onUpdateAllUsers(updated);
                  } else {
                    updated.forEach((u) => onUpdateUser(u));
                  }
                  alert('Reset money and coins for ALL 9 accounts to ZERO!');
                }
              }}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow transition cursor-pointer"
            >
              🧹 RESET ALL MONEY TO ZERO
            </button>
          </div>
        </div>

        {isAddingFriend && (
          <form onSubmit={handleAddFriendAccount} className="bg-purple-950/40 border-2 border-purple-500/50 p-4 rounded-2xl flex flex-wrap items-end gap-3 animate-in fade-in zoom-in-95">
            <div className="flex-1 min-w-[140px]">
              <label className="text-[10px] font-bold text-purple-300 uppercase tracking-widest block mb-1">
                Friend's Username
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Leo, Cristiano, Marcus"
                value={newFriendUsername}
                onChange={(e) => setNewFriendUsername(e.target.value)}
                className="w-full bg-black/80 border border-purple-400/40 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 font-mono"
              />
            </div>

            <div className="flex-1 min-w-[140px]">
              <label className="text-[10px] font-bold text-purple-300 uppercase tracking-widest block mb-1">
                Friend's Password
              </label>
              <input
                type="password"
                required
                placeholder="Enter password"
                value={newFriendPassword}
                onChange={(e) => setNewFriendPassword(e.target.value)}
                className="w-full bg-black/80 border border-purple-400/40 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 font-mono"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow cursor-pointer transition"
              >
                SAVE REGISTRATION ➔
              </button>
              <button
                type="button"
                onClick={() => setIsAddingFriend(false)}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-gray-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                CANCEL
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 uppercase text-[10px] font-mono">
                <th className="p-3">User</th>
                <th className="p-3">Role</th>
                <th className="p-3">Paper Cash</th>
                <th className="p-3">Coins</th>
                <th className="p-3">Inventory</th>
                <th className="p-3 text-right">Quick Aydin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {allUsers
                .filter((u) => u.username.toLowerCase().includes(userSearchQuery.toLowerCase()))
                .map((u) => (
                <tr key={u.id} className="hover:bg-white/5 transition">
                  <td className="p-3 font-bold text-white flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-black flex items-center justify-center text-xs">
                      {u.username.charAt(0).toUpperCase()}
                    </span>
                    <span>{u.username}</span>
                  </td>
                  <td className="p-3">
                    {u.isAdmin ? (
                      <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                        👑 MASTER ADMIN
                      </span>
                    ) : (
                      <span className="bg-gray-800 text-gray-300 text-[10px] px-2 py-0.5 rounded uppercase font-mono">
                        PLAYER
                      </span>
                    )}
                  </td>
                  <td className="p-3 font-mono text-green-400 font-bold">
                    ${u.points.toLocaleString()}
                  </td>
                  <td className="p-3 font-mono text-amber-300 font-bold">
                    🪙 {u.coins.toLocaleString()}
                  </td>
                  <td className="p-3 font-mono text-gray-300">
                    {u.inventory.length} Cards
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => {
                        soundFx.playCoinSound();
                        onUpdateUser({
                          ...u,
                          points: u.points + 1000000
                        });
                      }}
                      title="Give $1,000,000 Cash"
                      className="px-2.5 py-1 bg-green-500 hover:bg-green-400 text-black font-black text-[10px] rounded-lg transition cursor-pointer"
                    >
                      + $1M 💵
                    </button>
                    <button
                      onClick={() => {
                        soundFx.playCoinSound();
                        onUpdateUser({
                          ...u,
                          coins: u.coins + 5000000
                        });
                      }}
                      title="Give 5,000,000 Coins"
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-black font-black text-[10px] rounded-lg transition cursor-pointer"
                    >
                      + 🪙 5M
                    </button>
                    <button
                      onClick={() => {
                        soundFx.playFanfare();
                        const pele = INITIAL_PLAYER_DATABASE.find((c) => c.id === 'pele-98-icon') || INITIAL_PLAYER_DATABASE[0];
                        const instance = { ...pele, id: `gift-pele-${Date.now()}`, obtainedAt: Date.now() };
                        onUpdateUser({
                          ...u,
                          inventory: [...u.inventory, instance]
                        });
                      }}
                      title="Gift Pelé 98 Icon"
                      className="px-2.5 py-1 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-[10px] rounded-lg transition cursor-pointer"
                    >
                      Pelé 98 👑
                    </button>
                    <button
                      onClick={() => {
                        soundFx.playFanfare();
                        const aydinCard = INITIAL_PLAYER_DATABASE.find((c) => c.id === 'aydin-99-king') || INITIAL_PLAYER_DATABASE[0];
                        const instance = { ...aydinCard, id: `gift-aydin-${Date.now()}`, obtainedAt: Date.now() };
                        onUpdateUser({
                          ...u,
                          inventory: [...u.inventory, instance]
                        });
                      }}
                      title="Gift Aydin 99 Owner Card"
                      className="px-2.5 py-1 bg-emerald-400 hover:bg-emerald-300 text-black font-black text-[10px] rounded-lg transition cursor-pointer"
                    >
                      Aydin 99 ⚡
                    </button>
                    {!u.isAdmin && (
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to kick and reset account @${u.username}?`)) {
                            soundFx.playClick();
                            onUpdateUser({
                              ...u,
                              coins: 0,
                              points: 150,
                              inventory: [],
                              squad: { formation: '4-3-3', starting11: {}, bench: [] }
                            });
                            alert(`Kicked & reset account @${u.username}!`);
                          }
                        }}
                        title="Kick and Reset Account"
                        className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white font-black text-[10px] rounded-lg transition cursor-pointer"
                      >
                        KICK 🚫
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Home Screen Updates & Announcements Publisher */}
      <div className="bg-gradient-to-r from-neutral-900 via-emerald-950 to-neutral-900 border-2 border-emerald-500/50 rounded-3xl p-6 flex flex-col gap-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-black font-black text-xl shadow-lg">
              📢
            </div>
            <div>
              <h3 className="text-xl font-black text-white">HOME SCREEN UPDATES & EVENTS PUBLISHER</h3>
              <p className="text-xs text-emerald-400 font-mono">Create World Cup Updates, Premier League Drops, or custom announcements for the Home Screen</p>
            </div>
          </div>
        </div>

        <form onSubmit={handlePostHomeUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">UPDATE TITLE</label>
            <input
              type="text"
              required
              value={updateTitle}
              onChange={(e) => setUpdateTitle(e.target.value)}
              placeholder="e.g. World Cup Final Tournament or Premier League TOTS"
              className="w-full mt-1 bg-black/80 border border-white/20 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-green-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CATEGORY</label>
              <select
                value={updateCategory}
                onChange={(e) => setUpdateCategory(e.target.value)}
                className="w-full mt-1 bg-black/80 border border-white/20 rounded-xl px-2 py-2 text-white font-mono text-xs focus:outline-none focus:border-green-400"
              >
                <option value="World Cup Update">World Cup Update</option>
                <option value="Premier League Update">Premier League Update</option>
                <option value="Champions League">Champions League</option>
                <option value="TOTS Event">TOTS Event</option>
                <option value="Community Event">Community Event</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">BADGE TAG</label>
              <input
                type="text"
                value={updateBadge}
                onChange={(e) => setUpdateBadge(e.target.value)}
                placeholder="e.g. LIVE NOW 🏆"
                className="w-full mt-1 bg-black/80 border border-white/20 rounded-xl px-2 py-2 text-white font-mono text-xs focus:outline-none focus:border-green-400"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">UPDATE DESCRIPTION</label>
            <textarea
              required
              rows={2}
              value={updateDesc}
              onChange={(e) => setUpdateDesc(e.target.value)}
              placeholder="Write update news details for players..."
              className="w-full mt-1 bg-black/80 border border-white/20 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-green-400"
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-400 hover:to-emerald-300 text-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition cursor-pointer flex items-center gap-2"
            >
              <span>📢 PUBLISH TO LIVE HOME SCREEN FEED</span>
            </button>
          </div>
        </form>

        {/* Existing Active Updates list */}
        {homeUpdates.length > 0 && (
          <div className="mt-2 border-t border-white/10 pt-4">
            <div className="text-xs font-bold text-gray-400 uppercase mb-3">CURRENT ACTIVE HOME SCREEN UPDATES ({homeUpdates.length}):</div>
            <div className="space-y-2">
              {homeUpdates.map((u) => (
                <div key={u.id} className="bg-black/60 border border-white/10 rounded-2xl p-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-black text-xs">{u.title}</span>
                      <span className="bg-white/10 text-amber-300 text-[10px] px-2 py-0.5 rounded font-mono">{u.category}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{u.description}</p>
                  </div>

                  {onDeleteHomeUpdate && (
                    <button
                      onClick={() => onDeleteHomeUpdate(u.id)}
                      className="px-3 py-1 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white text-[10px] font-black rounded-xl transition cursor-pointer shrink-0"
                    >
                      DELETE ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

