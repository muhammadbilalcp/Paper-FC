import React from 'react';
import { PlayerCard } from '../types';

interface FCPlayerCardProps {
  card: PlayerCard;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  showStats?: boolean;
  isHoverable?: boolean;
  className?: string;
}

export const FCPlayerCard: React.FC<FCPlayerCardProps> = ({
  card,
  size = 'md',
  onClick,
  showStats = true,
  isHoverable = true,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-28 h-40 text-[9px]',
    md: 'w-44 h-64 text-xs',
    lg: 'w-60 h-[340px] text-sm',
    xl: 'w-80 h-[460px] text-base'
  }[size];

  const ratingSizes = {
    sm: 'text-base font-black',
    md: 'text-2xl font-black',
    lg: 'text-4xl font-black',
    xl: 'text-5xl font-black'
  }[size];

  const nameSizes = {
    sm: 'text-[10px] tracking-tight',
    md: 'text-sm tracking-normal',
    lg: 'text-lg tracking-wide',
    xl: 'text-2xl tracking-wider'
  }[size];

  // Determine Tier: BRONZE (<75 OVR), GOLD ANONYMOUS (75-87 OVR), DIAMOND (88+ OVR or Special)
  const isZeral = card.rarity === 'ZERAL_FC';
  const isBronze = card.rating < 75 || card.rarity.includes('BRONZE');
  const isDiamond = (card.rating >= 88 || card.rarity === 'PRIME_ICON' || card.rarity === 'TOTY' || card.rarity === 'AYDIN_CUSTOM' || card.rarity === 'PAPER_LEGEND') && !isZeral;
  const isGoldAnonymous = !isBronze && !isDiamond && !isZeral; // 75 - 87 OVR Gold Rare/Common

  const getCardTheme = () => {
    if (isZeral) {
      return {
        cardBg: 'bg-gradient-to-b from-emerald-950 via-teal-800 to-cyan-950',
        border: 'border-2 border-emerald-300 shadow-[0_0_25px_rgba(52,211,153,0.8)] animate-pulse',
        badgeBg: 'bg-emerald-400 text-black font-black shadow-[0_0_10px_rgba(52,211,153,0.9)]',
        textColor: 'text-emerald-200',
        glare: 'from-emerald-300/40 via-teal-200/20 to-transparent',
        badgeText: '⚡ ZERAL FC'
      };
    } else if (isDiamond) {
      // DIAMOND CRYSTAL TIER (88+ OVR or Special Superstars)
      return {
        cardBg: 'bg-gradient-to-b from-cyan-950 via-sky-800 to-indigo-950',
        border: 'border-2 border-cyan-300 shadow-[0_0_25px_rgba(34,211,238,0.7)] animate-pulse',
        badgeBg: 'bg-cyan-300 text-blue-950 font-black shadow-[0_0_10px_rgba(34,211,238,0.9)]',
        textColor: 'text-cyan-200',
        glare: 'from-cyan-300/40 via-sky-200/20 to-transparent',
        badgeText: '💎 DIAMOND'
      };
    } else if (isGoldAnonymous) {
      // GOLD RARE TIER WITH ANONYMOUS GOLD PHOTO (75-87 OVR)
      return {
        cardBg: 'bg-gradient-to-b from-amber-300 via-yellow-500 to-amber-700',
        border: 'border-2 border-yellow-300 shadow-[0_0_20px_rgba(234,179,8,0.5)]',
        badgeBg: 'bg-yellow-400 text-black font-black border border-black/20',
        textColor: 'text-black',
        glare: 'from-amber-200/40 via-yellow-100/20 to-transparent',
        badgeText: '👑 GOLD RARE'
      };
    } else {
      // BRONZE TIER (< 75 OVR)
      return {
        cardBg: 'bg-gradient-to-b from-stone-800 via-amber-950 to-stone-900',
        border: 'border-2 border-amber-800/80 shadow-md',
        badgeBg: 'bg-amber-800 text-amber-100 font-bold border border-amber-600',
        textColor: 'text-amber-300',
        glare: 'from-amber-700/20 via-transparent to-transparent',
        badgeText: '🥉 BRONZE'
      };
    }
  };

  const theme = getCardTheme();

  return (
    <div
      id={`player-card-${card.id}`}
      onClick={onClick}
      className={`relative select-none rounded-[20px] overflow-hidden flex flex-col justify-between ${sizeClasses} ${theme.cardBg} ${theme.border} transition-all duration-300 ${
        isHoverable ? 'hover:scale-105 hover:-translate-y-1.5 cursor-pointer hover:shadow-2xl' : ''
      } ${className}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-tr ${theme.glare} pointer-events-none opacity-90`} />
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:10px_10px] pointer-events-none" />

      {/* Top Banner */}
      <div className="relative z-10 p-2 sm:p-3 flex justify-between items-start">
        <div className="flex flex-col items-center">
          <span className={`${ratingSizes} ${theme.textColor} leading-none font-mono drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}>
            {card.rating}
          </span>
          <span className={`font-extrabold uppercase text-[10px] sm:text-xs ${isGoldAnonymous ? 'text-black' : 'text-white'} tracking-widest mt-0.5`}>
            {card.position}
          </span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="text-base sm:text-xl drop-shadow" title={card.nation}>
            {card.nationFlag}
          </span>
          <span className="text-xs sm:text-sm font-bold bg-black/40 px-1 rounded backdrop-blur-sm text-white" title={card.club}>
            {card.clubLogo}
          </span>
        </div>
      </div>

      {/* Center Image Container - Vector Emblem Silhouettes (No stock photos) */}
      <div className="relative z-0 flex-1 flex items-center justify-center -mt-3 mb-1 overflow-hidden px-2">
        {isZeral ? (
          /* ZERAL FC VECTOR EMBLEM SILHOUETTE */
          <div className="relative w-full h-full max-h-[170px] flex flex-col items-center justify-center bg-gradient-to-b from-emerald-950/90 via-teal-800/40 to-cyan-950/90 rounded-xl overflow-hidden border border-emerald-300/80 shadow-[inset_0_0_20px_rgba(52,211,153,0.5)]">
            <svg className="w-24 h-24 drop-shadow-[0_0_16px_rgba(52,211,153,0.9)]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="url(#zeralGradF)" stroke="#34D399" strokeWidth="2" />
              <path d="M50 22 C42 22 35 29 35 37 C35 45 42 52 50 52 C58 52 65 45 65 37 C65 29 58 22 50 22 Z" fill="#022c22" opacity="0.9" />
              <path d="M25 78 C25 63 36 55 50 55 C64 55 75 63 75 78 Z" fill="#022c22" opacity="0.9" />
              <path d="M45 28 L55 28 L42 48 L58 48 L38 72 L44 54 L32 54 Z" fill="#34D399" />
              <defs>
                <linearGradient id="zeralGradF" x1="0" y1="0" x2="100" y2="100">
                  <stop stopColor="#34D399" />
                  <stop offset="0.5" stopColor="#0D9488" />
                  <stop offset="1" stopColor="#064E3B" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute bottom-1 px-2 py-0.5 bg-emerald-950/90 border border-emerald-300 rounded text-[8px] font-black text-emerald-200 tracking-wider uppercase flex items-center gap-1 shadow-md">
              <span>⚡</span>
              <span>ZERAL FC SPECIAL</span>
            </div>
          </div>
        ) : isDiamond ? (
          /* DIAMOND SUPERSTAR VECTOR EMBLEM SILHOUETTE */
          <div className="relative w-full h-full max-h-[170px] flex flex-col items-center justify-center bg-gradient-to-b from-cyan-950/90 via-sky-800/40 to-indigo-950/90 rounded-xl overflow-hidden border border-cyan-300/80 shadow-[inset_0_0_20px_rgba(34,211,238,0.5)]">
            <svg className="w-24 h-24 drop-shadow-[0_0_16px_rgba(34,211,238,0.9)]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="50,12 85,38 72,88 28,88 15,38" fill="url(#diamondGradF)" stroke="#67E8F9" strokeWidth="2" />
              <path d="M50 25 C42 25 35 32 35 40 C35 48 42 55 50 55 C58 55 65 48 65 40 C65 32 58 25 50 25 Z" fill="#083344" opacity="0.9" />
              <path d="M25 80 C25 65 36 57 50 57 C64 57 75 65 75 80 Z" fill="#083344" opacity="0.9" />
              <path d="M50 12 L50 88 M15 38 L85 38 M28 88 L50 38 L72 88" stroke="#A5F3FC" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
              <defs>
                <linearGradient id="diamondGradF" x1="0" y1="0" x2="100" y2="100">
                  <stop stopColor="#22D3EE" />
                  <stop offset="0.5" stopColor="#0284C7" />
                  <stop offset="1" stopColor="#1E1B4B" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute bottom-1 px-2 py-0.5 bg-cyan-950/90 border border-cyan-300 rounded text-[8px] font-black text-cyan-200 tracking-wider uppercase flex items-center gap-1 shadow-md">
              <span>💎</span>
              <span>DIAMOND SUPERSTAR</span>
            </div>
          </div>
        ) : isGoldAnonymous ? (
          /* GOLD RARE VECTOR EMBLEM SILHOUETTE */
          <div className="relative w-full h-full max-h-[170px] flex flex-col items-center justify-center bg-gradient-to-b from-amber-950/80 via-yellow-600/40 to-black/90 rounded-xl overflow-hidden border border-yellow-300/80 shadow-[inset_0_0_15px_rgba(234,179,8,0.5)] group">
            <svg className="w-24 h-24 drop-shadow-[0_0_12px_rgba(253,224,71,0.9)]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="38" fill="url(#goldGlowF)" opacity="0.7" />
              <path d="M50 18 C40 18 32 26 32 36 C32 46 40 54 50 54 C60 54 68 46 68 36 C68 26 60 18 50 18 Z" fill="url(#goldGradF)" />
              <path d="M18 88 C18 68 32 58 50 58 C68 58 82 68 82 88 Z" fill="url(#goldGradF)" />
              <rect x="35" y="30" width="30" height="9" rx="4.5" fill="#000" stroke="#FFD700" strokeWidth="1.5" />
              <circle cx="43" cy="34.5" r="2" fill="#FFD700" />
              <circle cx="57" cy="34.5" r="2" fill="#FFD700" />
              <defs>
                <radialGradient id="goldGlowF" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(50 50) scale(38)">
                  <stop stopColor="#FDE047" />
                  <stop offset="1" stopColor="#EAB308" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="goldGradF" x1="0" y1="0" x2="100" y2="100">
                  <stop stopColor="#FEF08A" />
                  <stop offset="0.5" stopColor="#EAB308" />
                  <stop offset="1" stopColor="#854D0E" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute bottom-1 px-1.5 py-0.5 bg-black/90 border border-yellow-400 rounded text-[8px] font-black text-amber-300 tracking-wider uppercase flex items-center gap-1">
              <span>👑</span>
              <span>GOLD RARE</span>
            </div>
          </div>
        ) : (
          /* BRONZE VECTOR SILHOUETTE */
          <div className="relative w-full h-full max-h-[170px] flex flex-col items-center justify-center bg-gradient-to-b from-stone-900 via-amber-950/80 to-black rounded-xl overflow-hidden border border-amber-800/80">
            <svg className="w-20 h-20 drop-shadow-[0_0_8px_rgba(180,83,9,0.6)]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 20 C40 20 32 28 32 38 C32 48 40 56 50 56 C60 56 68 48 68 38 C68 28 60 20 50 20 Z" fill="url(#bronzeGradF)" />
              <path d="M20 90 C20 70 32 60 50 60 C68 60 80 70 80 90 Z" fill="url(#bronzeGradF)" />
              <defs>
                <linearGradient id="bronzeGradF" x1="0" y1="0" x2="100" y2="100">
                  <stop stopColor="#D97706" />
                  <stop offset="0.5" stopColor="#92400E" />
                  <stop offset="1" stopColor="#451A03" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute bottom-1 px-1.5 py-0.5 bg-black/80 border border-amber-700 rounded text-[8px] font-bold text-amber-400 tracking-wider uppercase flex items-center gap-1">
              <span>🥉</span>
              <span>BRONZE CARD</span>
            </div>
          </div>
        )}
      </div>

      {/* Card Footer Banner */}
      <div className="relative z-10 bg-black/80 backdrop-blur-md p-1.5 sm:p-2 border-t border-white/10 flex flex-col items-center">
        <div className={`font-black uppercase text-center text-white truncate w-full ${nameSizes} drop-shadow`}>
          {card.name}
        </div>

        {showStats && size !== 'sm' && (
          <div className="w-full grid grid-cols-6 gap-0.5 mt-1 pt-1 border-t border-white/10 text-[9px] sm:text-[10px] text-center font-mono font-bold text-gray-300">
            <div>
              <div className="text-[7px] text-gray-400 font-sans uppercase">PAC</div>
              <div className={card.stats.pac >= 90 ? 'text-green-400' : ''}>{card.stats.pac}</div>
            </div>
            <div>
              <div className="text-[7px] text-gray-400 font-sans uppercase">SHO</div>
              <div className={card.stats.sho >= 90 ? 'text-green-400' : ''}>{card.stats.sho}</div>
            </div>
            <div>
              <div className="text-[7px] text-gray-400 font-sans uppercase">PAS</div>
              <div className={card.stats.pas >= 90 ? 'text-green-400' : ''}>{card.stats.pas}</div>
            </div>
            <div>
              <div className="text-[7px] text-gray-400 font-sans uppercase">DRI</div>
              <div className={card.stats.dri >= 90 ? 'text-green-400' : ''}>{card.stats.dri}</div>
            </div>
            <div>
              <div className="text-[7px] text-gray-400 font-sans uppercase">DEF</div>
              <div className={card.stats.def >= 90 ? 'text-green-400' : ''}>{card.stats.def}</div>
            </div>
            <div>
              <div className="text-[7px] text-gray-400 font-sans uppercase">PHY</div>
              <div className={card.stats.phy >= 90 ? 'text-green-400' : ''}>{card.stats.phy}</div>
            </div>
          </div>
        )}

        <div className="mt-1">
          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${theme.badgeBg}`}>
            {theme.badgeText}
          </span>
        </div>
      </div>
    </div>
  );
};

