import React, { useState } from 'react';
import { UserAccount, PlayerCard, Position, CardRarity } from '../types';
import { getStoredUsers, saveUsers } from '../utils/storage';
import { soundFx } from '../utils/audio';

interface AdminPanelProps {
  currentAydinUser: UserAccount;
  onRefreshUsers: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentAydinUser,
  onRefreshUsers
}) => {
  const [users, setUsers] = useState<UserAccount[]>(getStoredUsers());
  const [selectedTargetUserId, setSelectedTargetUserId] = useState<string>(users[0]?.id || '');
  const [cashAmount, setCashAmount] = useState<number>(1000000);
  const [coinsAmount, setCoinsAmount] = useState<number>(10000000);

  // Custom Player Generator State
  const [newPlayerName, setNewPlayerName] = useState<string>('King Aydin Prime');
  const [newPlayerRating, setNewPlayerRating] = useState<number>(99);
  const [newPlayerPosition, setNewPlayerPosition] = useState<Position>('ST');
  const [newPlayerRarity, setNewPlayerRarity] = useState<CardRarity>('AYDIN_CUSTOM');
  const [newPlayerNation, setNewPlayerNation] = useState<string>('Turkey');
  const [newPlayerFlag, setNewPlayerFlag] = useState<string>('🇹🇷');
  const [newPlayerClub, setNewPlayerClub] = useState<string>('ICONS Paper FC');
  const [newPlayerPhoto, setNewPlayerPhoto] = useState<string>(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
  );

  const targetUser = users.find((u) => u.id === selectedTargetUserId) || users[0];

  const handleGrantCashAndCoins = () => {
    soundFx.playCoinSound();
    const updatedUsers = users.map((u) => {
      if (u.id === targetUser.id) {
        return {
          ...u,
          coins: u.coins + coinsAmount,
          points: u.points + cashAmount
        };
      }
      return u;
    });

    saveUsers(updatedUsers);
    setUsers(updatedUsers);
    onRefreshUsers();
    alert(`⚡ Granted $${cashAmount.toLocaleString()} Paper Cash & ${coinsAmount.toLocaleString()} Coins to ${targetUser.username}!`);
  };

  const handleCreateCustomPlayer = () => {
    soundFx.playFanfare();
    const customCard: PlayerCard = {
      id: `custom-${Date.now()}`,
      name: newPlayerName,
      rating: newPlayerRating,
      position: newPlayerPosition,
      rarity: newPlayerRarity,
      nation: newPlayerNation,
      nationFlag: newPlayerFlag,
      club: newPlayerClub,
      clubLogo: '👑',
      image: newPlayerPhoto,
      stats: { pac: 99, sho: 99, pas: 99, dri: 99, def: 95, phy: 99 },
      weakFoot: 5,
      skillMoves: 5,
      isWalkout: true,
      creator: 'Aydin',
      valueCoins: 10000000
    };

    const updatedUsers = users.map((u) => {
      if (u.id === targetUser.id) {
        return {
          ...u,
          inventory: [customCard, ...u.inventory]
        };
      }
      return u;
    });

    saveUsers(updatedUsers);
    setUsers(updatedUsers);
    onRefreshUsers();
    alert(`👑 Custom Player "${newPlayerName}" (OVR ${newPlayerRating}) created and granted to ${targetUser.username}!`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-pink-900 to-red-900 border-2 border-purple-500/50 rounded-3xl p-6 shadow-[0_0_30px_rgba(168,85,247,0.3)] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
            <span className="px-2.5 py-0.5 bg-yellow-400 text-black text-[10px] font-black rounded uppercase tracking-widest">
              AYDIN OWNER MASTER PANEL
            </span>
          </div>
          <h2 className="text-2xl font-black text-white italic mt-1">
            CONTROL EVERY ACCOUNT & CASH BALANCES
          </h2>
          <p className="text-xs text-gray-300">
            You are logged in as <strong className="text-yellow-300 font-mono">Aydin</strong>. You have supreme admin power over ICONS Paper FC.
          </p>
        </div>

        <div className="bg-black/60 border border-white/20 rounded-2xl p-4 text-xs font-mono">
          <div className="text-gray-400 text-[10px] uppercase font-bold">AYDIN ADMIN CREDENTIALS</div>
          <div className="mt-1 text-white">USERNAME: <span className="text-green-400 font-bold">Aydin</span></div>
          <div className="text-white">PASSWORD: <span className="text-green-400 font-bold">aydin123</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Grant Cash & Coins to Anyone */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-black text-green-400 uppercase tracking-widest flex items-center gap-2">
            <span>💰</span> GRANT COINS & PAPER CASH
          </h3>

          <div>
            <label className="text-[10px] text-gray-400 uppercase font-bold">Select Target Account</label>
            <select
              value={selectedTargetUserId}
              onChange={(e) => setSelectedTargetUserId(e.target.value)}
              className="w-full mt-1 bg-black/60 border border-white/20 text-white text-xs font-bold rounded-xl p-3 focus:border-green-500 focus:outline-none"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username} {u.isAdmin ? '(Admin Aydin)' : ''} - Bal: ${u.points.toLocaleString()} | {u.coins.toLocaleString()} Coins
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-gray-400 uppercase font-bold">Paper Cash ($)</label>
              <input
                type="number"
                value={cashAmount}
                onChange={(e) => setCashAmount(Number(e.target.value))}
                className="w-full mt-1 bg-black/60 border border-white/20 text-green-400 font-mono text-xs font-bold rounded-xl p-3 focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 uppercase font-bold">Gold Coins</label>
              <input
                type="number"
                value={coinsAmount}
                onChange={(e) => setCoinsAmount(Number(e.target.value))}
                className="w-full mt-1 bg-black/60 border border-white/20 text-yellow-400 font-mono text-xs font-bold rounded-xl p-3 focus:outline-none focus:border-yellow-500"
              />
            </div>
          </div>

          <button
            onClick={handleGrantCashAndCoins}
            className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-black font-black text-xs rounded-xl shadow-lg transition active:scale-95 uppercase tracking-wider"
          >
            ⚡ GRANT CASH TO {targetUser.username.toUpperCase()}
          </button>
        </div>

        {/* Section 2: Custom Card Creator */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
            <span>✨</span> CREATE AYDIN CUSTOM PLAYER CARD
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-gray-400 uppercase font-bold">Player Name</label>
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                className="w-full mt-1 bg-black/60 border border-white/20 text-white text-xs font-bold rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 uppercase font-bold">OVR Rating (75-99)</label>
              <input
                type="number"
                max={99}
                min={75}
                value={newPlayerRating}
                onChange={(e) => setNewPlayerRating(Number(e.target.value))}
                className="w-full mt-1 bg-black/60 border border-white/20 text-yellow-400 font-bold text-xs rounded-xl p-2.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-gray-400 uppercase font-bold">Position</label>
              <select
                value={newPlayerPosition}
                onChange={(e) => setNewPlayerPosition(e.target.value as Position)}
                className="w-full mt-1 bg-black/60 border border-white/20 text-white text-xs font-bold rounded-xl p-2.5"
              >
                <option value="ST">ST</option>
                <option value="LW">LW</option>
                <option value="RW">RW</option>
                <option value="CAM">CAM</option>
                <option value="CM">CM</option>
                <option value="CDM">CDM</option>
                <option value="CB">CB</option>
                <option value="LB">LB</option>
                <option value="RB">RB</option>
                <option value="GK">GK</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-400 uppercase font-bold">Rarity</label>
              <select
                value={newPlayerRarity}
                onChange={(e) => setNewPlayerRarity(e.target.value as CardRarity)}
                className="w-full mt-1 bg-black/60 border border-white/20 text-white text-xs font-bold rounded-xl p-2.5"
              >
                <option value="AYDIN_CUSTOM">AYDIN CUSTOM (99)</option>
                <option value="PRIME_ICON">PRIME ICON</option>
                <option value="TOTY">TOTY</option>
                <option value="PAPER_LEGEND">PAPER LEGEND</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-400 uppercase font-bold">Flag</label>
              <input
                type="text"
                value={newPlayerFlag}
                onChange={(e) => setNewPlayerFlag(e.target.value)}
                className="w-full mt-1 bg-black/60 border border-white/20 text-white text-xs font-bold rounded-xl p-2.5 text-center"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-gray-400 uppercase font-bold">Photo URL</label>
            <input
              type="text"
              value={newPlayerPhoto}
              onChange={(e) => setNewPlayerPhoto(e.target.value)}
              className="w-full mt-1 bg-black/60 border border-white/20 text-gray-300 text-[10px] rounded-xl p-2.5"
            />
          </div>

          <button
            onClick={handleCreateCustomPlayer}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-500 hover:to-red-500 text-white font-black text-xs rounded-xl shadow-lg transition active:scale-95 uppercase tracking-wider"
          >
            👑 GENERATE & GIVE CARD TO {targetUser.username.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
};
