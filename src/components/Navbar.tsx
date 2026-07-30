import React, { useRef } from 'react';
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
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const topControlsRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    soundFx.playClick();
    if (tabsContainerRef.current) {
      const scrollAmount = direction === 'left' ? -180 : 180;
      tabsContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleTopScroll = (direction: 'left' | 'right') => {
    soundFx.playClick();
    if (topControlsRef.current) {
      const scrollAmount = direction === 'left' ? -150 : 150;
      topControlsRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <nav id="app-navbar" className="border-b border-white/10 bg-black/85 backdrop-blur-xl flex flex-col items-center px-2 sm:px-6 py-2 z-40 shrink-0 select-none gap-2 w-full">
      {/* Row 1: Brand Logo + Controls (Music, Balances, User Profile & Log Out) */}
      <div className="flex items-center justify-between w-full gap-2 min-w-0">
        {/* Brand Section */}
        <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => onChangeTab('STORE')}>
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-tr from-green-500 to-emerald-700 rounded-xl flex items-center justify-center border border-white/20 shadow-[0_0_15px_rgba(34,197,94,0.4)]">
            <span className="text-base sm:text-lg font-black italic text-black">FC</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-base font-black tracking-tighter text-white whitespace-nowrap">
              ICONS <span className="text-green-400">PAPER</span> FC
            </span>
            <span className="text-[8px] font-mono text-gray-400 uppercase tracking-widest -mt-1 hidden sm:inline">
              ULTIMATE PACK & SQUAD BUILDER
            </span>
          </div>
        </div>

        {/* Top Controls Container: Scrollable with arrows on mobile */}
        <div className="flex items-center min-w-0 flex-1 justify-end gap-1">
          <button
            onClick={() => handleTopScroll('left')}
            title="Scroll Left"
            className="sm:hidden w-5 h-7 bg-black/80 text-emerald-400 border border-white/10 rounded flex items-center justify-center text-[10px] font-bold shrink-0 cursor-pointer active:scale-95"
          >
            ◀
          </button>

          <div
            ref={topControlsRef}
            className="flex items-center gap-1.5 sm:gap-2.5 overflow-x-auto custom-horizontal-scrollbar touch-pan-x min-w-0 flex-1 sm:flex-initial justify-start sm:justify-end py-0.5"
          >
            {/* FC Mobile Music Player */}
            <MusicPlayer />

            {/* Money & Coins Balances Box */}
            <div className="flex items-center gap-2 sm:gap-3 bg-white/5 border border-white/10 px-2.5 py-1 sm:py-1.5 rounded-xl font-mono text-xs whitespace-nowrap shrink-0">
              <div className="flex items-center gap-1 sm:gap-1.5" title="Paper Cash ($)">
                <span className="text-green-400 font-extrabold">$</span>
                <span className="text-white font-bold text-xs">
                  {currentUser.points.toLocaleString()}
                </span>
              </div>
              <div className="w-px h-3 bg-white/20" />
              <div className="flex items-center gap-1 sm:gap-1.5" title="FC Coins">
                <span>🪙</span>
                <span className="text-amber-300 font-bold text-xs">
                  {currentUser.coins.toLocaleString()}
                </span>
              </div>
            </div>

            {/* User Account Button */}
            <div
              onClick={() => {
                soundFx.playClick();
                onOpenAuth();
              }}
              title="Switch / View Account"
              className="flex items-center gap-1.5 sm:gap-2 bg-black/60 hover:bg-white/10 border border-white/15 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full transition cursor-pointer shrink-0"
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-tr from-green-500 to-emerald-400 p-0.5 flex items-center justify-center font-black text-black text-[9px]">
                {currentUser.username.substring(0, 2).toUpperCase()}
              </div>
              <span className="text-xs font-black text-white whitespace-nowrap flex items-center gap-1">
                {currentUser.username}
                {currentUser.isAdmin && <span className="text-[10px]">👑</span>}
              </span>
            </div>

            {/* Log Out Button */}
            <button
              onClick={() => {
                soundFx.playClick();
                onLogout();
              }}
              title="Log Out Account"
              className="px-2.5 py-1 sm:py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/30 text-red-400 border border-red-500/30 hover:border-red-400 font-black text-xs uppercase tracking-wider flex items-center gap-1 transition cursor-pointer shrink-0 active:scale-95 whitespace-nowrap"
            >
              <span>🚪</span>
              <span>LOG OUT</span>
            </button>
          </div>

          <button
            onClick={() => handleTopScroll('right')}
            title="Scroll Right"
            className="sm:hidden w-5 h-7 bg-black/80 text-emerald-400 border border-white/10 rounded flex items-center justify-center text-[10px] font-bold shrink-0 cursor-pointer active:scale-95"
          >
            ▶
          </button>
        </div>
      </div>

      {/* Row 2: Scrollable Navigation Tabs Bar */}
      <div className="relative flex items-center w-full max-w-full gap-1 pt-0.5">
        <button
          onClick={() => handleScroll('left')}
          title="Scroll Left"
          className="w-6 h-7 bg-black/80 hover:bg-emerald-500/20 text-emerald-400 border border-white/10 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 cursor-pointer active:scale-95"
        >
          ◀
        </button>

        <div
          ref={tabsContainerRef}
          className="flex items-center justify-start gap-1 sm:gap-2 bg-black/70 p-1 rounded-2xl border border-white/15 overflow-x-auto max-w-full w-full whitespace-nowrap custom-horizontal-scrollbar touch-pan-x shrink"
        >
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

        <button
          onClick={() => handleScroll('right')}
          title="Scroll Right"
          className="w-6 h-7 bg-black/80 hover:bg-emerald-500/20 text-emerald-400 border border-white/10 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 cursor-pointer active:scale-95"
        >
          ▶
        </button>
      </div>
    </nav>
  );
};

