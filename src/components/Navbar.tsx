import React from 'react';
import { UserAccount } from '../types';
import { soundFx } from '../utils/audio';
import { MusicPlayer } from './MusicPlayer';

interface NavbarProps {
  currentUser: UserAccount;
  activeTab: 'STORE' | 'SQUAD' | 'MARKET' | 'INVENTORY' | 'ADMIN';
  onChangeTab: (tab: 'STORE' | 'SQUAD' | 'MARKET' | 'INVENTORY' | 'ADMIN') => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  onChangeTab,
  onOpenAuth,
  onLogout
}) => {
  return (
    <nav id="app-navbar" className="h-16 border-b border-white/10 bg-black/60 backdrop-blur-xl flex items-center justify-between px-4 sm:px-8 z-40 shrink-0 select-none">
      {/* Brand & FC Mobile Icon Logo */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => onChangeTab('STORE')}>
        <div className="w-10 h-10 bg-gradient-to-tr from-green-500 to-emerald-700 rounded-xl flex items-center justify-center border border-white/20 shadow-[0_0_15px_rgba(34,197,94,0.4)]">
          <span className="text-xl font-black italic text-black">FC</span>
        </div>
        <div className="hidden sm:flex flex-col">
          <span className="text-lg font-black tracking-tighter text-white">
            ICONS <span className="text-green-400">PAPER</span> FC
          </span>
          <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest -mt-1">
            ULTIMATE PACK & SQUAD BUILDER
          </span>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-1 bg-black/50 p-1 rounded-2xl border border-white/10">
        <button
          onClick={() => {
            soundFx.playClick();
            onChangeTab('STORE');
          }}
          className={`px-3 sm:px-4 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer ${
            activeTab === 'STORE'
              ? 'bg-green-500 text-black shadow-md'
              : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          PACK STORE 📦
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            onChangeTab('SQUAD');
          }}
          className={`px-3 sm:px-4 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer ${
            activeTab === 'SQUAD'
              ? 'bg-green-500 text-black shadow-md'
              : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          MY SQUAD ⚽
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            onChangeTab('MARKET');
          }}
          className={`px-3 sm:px-4 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer ${
            activeTab === 'MARKET'
              ? 'bg-green-500 text-black shadow-md'
              : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          MARKET 🛒
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            onChangeTab('INVENTORY');
          }}
          className={`px-3 sm:px-4 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer ${
            activeTab === 'INVENTORY'
              ? 'bg-green-500 text-black shadow-md'
              : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          CLUB ({currentUser.inventory.length}) 🎴
        </button>

        {currentUser.isAdmin && (
          <button
            onClick={() => {
              soundFx.playClick();
              onChangeTab('ADMIN');
            }}
            className={`px-3 sm:px-4 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer border ${
              activeTab === 'ADMIN'
                ? 'bg-amber-500 text-black border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                : 'text-amber-400 border-amber-500/30 hover:bg-amber-500/10'
            }`}
          >
            CONDUCTOR PANEL 📜
          </button>
        )}
      </div>

      {/* User Profile & Balances */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* FC Mobile Music Player */}
        <MusicPlayer />

        {/* Balances Pill */}
        <div className="hidden lg:flex items-center gap-3 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl font-mono text-xs">
          <div className="flex items-center gap-1.5" title="Paper Cash ($)">
            <span className="text-green-400 font-extrabold">$</span>
            <span className="text-white font-bold">{currentUser.points.toLocaleString()}</span>
          </div>
          <div className="w-px h-3 bg-white/20" />
          <div className="flex items-center gap-1.5" title="Coins">
            <span>🪙</span>
            <span className="text-amber-300 font-bold">{currentUser.coins.toLocaleString()}</span>
          </div>
        </div>

        {/* User Account Menu / Switch */}
        <div className="flex items-center gap-2">
          <div
            onClick={onOpenAuth}
            className="flex items-center gap-2.5 bg-black/60 hover:bg-white/10 border border-white/15 px-3 py-1.5 rounded-full transition cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-green-500 to-emerald-400 p-0.5 flex items-center justify-center font-black text-black text-[10px]">
              {currentUser.username.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-black text-white leading-tight flex items-center gap-1">
                {currentUser.username}
                {currentUser.isAdmin && <span className="text-[10px]">👑</span>}
              </span>
              <span className="text-[8px] text-gray-400 font-mono">
                {currentUser.isAdmin ? 'GAME CONDUCTOR' : 'PLAYER'}
              </span>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Sign Out"
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-gray-400 flex items-center justify-center text-xs font-bold transition cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>
    </nav>
  );
};
