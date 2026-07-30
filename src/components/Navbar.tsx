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
    <nav id="app-navbar" className="border-b border-white/10 bg-black/80 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between px-3 sm:px-8 py-2 md:py-0 md:h-16 z-40 shrink-0 select-none gap-2 md:gap-4">
      {/* Top Row on Mobile / Left Brand Section */}
      <div className="flex items-center justify-between w-full md:w-auto gap-3">
        <div className="flex items-center gap-2.5 cursor-pointer shrink-0" onClick={() => onChangeTab('STORE')}>
          <div className="w-9 h-9 bg-gradient-to-tr from-green-500 to-emerald-700 rounded-xl flex items-center justify-center border border-white/20 shadow-[0_0_15px_rgba(34,197,94,0.4)]">
            <span className="text-lg font-black italic text-black">FC</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm sm:text-lg font-black tracking-tighter text-white">
              ICONS <span className="text-green-400">PAPER</span> FC
            </span>
            <span className="text-[8px] sm:text-[9px] font-mono text-gray-400 uppercase tracking-widest -mt-1 hidden sm:inline">
              ULTIMATE PACK & SQUAD BUILDER
            </span>
          </div>
        </div>

        {/* Mobile Right Quick Controls */}
        <div className="flex items-center gap-2 md:hidden">
          <MusicPlayer />

          <div className="flex items-center gap-1 bg-black/60 border border-white/10 px-1.5 py-1 rounded-xl font-mono text-[10px]">
            <span className="text-green-400 font-bold">${currentUser.points.toLocaleString()}</span>
            <span className="text-amber-300 font-bold">🪙{currentUser.coins.toLocaleString()}</span>
          </div>

          <div
            onClick={onOpenAuth}
            className="flex items-center gap-1 bg-black/60 hover:bg-white/10 border border-white/15 px-1.5 py-1 rounded-full cursor-pointer"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-400 font-black text-black text-[9px] flex items-center justify-center">
              {currentUser.username.substring(0, 2).toUpperCase()}
            </div>
            <span className="text-[11px] font-bold text-white max-w-[50px] truncate">{currentUser.username}</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs: Smooth Horizontal Scrollable Pill Bar */}
      <div className="flex items-center gap-1.5 bg-black/70 p-1 rounded-2xl border border-white/15 overflow-x-auto max-w-full w-full md:w-auto whitespace-nowrap scrollbar-none touch-pan-x shrink-0">
        <button
          onClick={() => {
            soundFx.playClick();
            onChangeTab('STORE');
          }}
          className={`px-3 sm:px-4 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer shrink-0 whitespace-nowrap ${
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
          className={`px-3 sm:px-4 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer shrink-0 whitespace-nowrap ${
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
          className={`px-3 sm:px-4 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer shrink-0 whitespace-nowrap ${
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
          className={`px-3 sm:px-4 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer shrink-0 whitespace-nowrap ${
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
            className={`px-3 sm:px-4 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer border shrink-0 whitespace-nowrap ${
              activeTab === 'ADMIN'
                ? 'bg-amber-500 text-black border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                : 'text-amber-400 border-amber-500/30 hover:bg-amber-500/10'
            }`}
          >
            CONDUCTOR PANEL 📜
          </button>
        )}
      </div>

      {/* Desktop User Profile & Controls */}
      <div className="hidden md:flex items-center gap-3">
        {/* FC Mobile Music Player */}
        <MusicPlayer />

        {/* Balances Pill */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl font-mono text-xs">
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

        {/* User Account Menu */}
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
