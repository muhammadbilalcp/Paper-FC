import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Pack, PlayerCard } from '../types';
import { FCPlayerCard } from './FCPlayerCard';
import { soundFx } from '../utils/audio';

interface PackOpeningStageProps {
  pack: Pack;
  pulledCards: PlayerCard[];
  onComplete: (cards: PlayerCard[]) => void;
  onCancel: () => void;
}

type PackState =
  | 'SEALED'
  | 'TEARING'
  | 'WALKOUT_FLAG'
  | 'WALKOUT_POSITION'
  | 'WALKOUT_CLUB'
  | 'WALKOUT_REVEAL'
  | 'SUMMARY';

export const PackOpeningStage: React.FC<PackOpeningStageProps> = ({
  pack,
  pulledCards,
  onComplete,
  onCancel
}) => {
  const [stage, setStage] = useState<PackState>('SEALED');

  const topCard = pulledCards.length > 0
    ? [...pulledCards].sort((a, b) => b.rating - a.rating)[0]
    : null;

  const isWalkout = topCard && (topCard.rating >= 86 || topCard.isWalkout);

  const startOpeningSequence = () => {
    soundFx.playPackTear();
    setStage('TEARING');

    setTimeout(() => {
      if (isWalkout && topCard) {
        soundFx.playSuspenseRiser();
        setStage('WALKOUT_FLAG');
      } else {
        soundFx.playFanfare();
        triggerConfetti();
        setStage('SUMMARY');
      }
    }, 1200);
  };

  useEffect(() => {
    if (stage === 'WALKOUT_FLAG') {
      const timer = setTimeout(() => {
        setStage('WALKOUT_POSITION');
      }, 1600);
      return () => clearTimeout(timer);
    }

    if (stage === 'WALKOUT_POSITION') {
      const timer = setTimeout(() => {
        setStage('WALKOUT_CLUB');
      }, 1600);
      return () => clearTimeout(timer);
    }

    if (stage === 'WALKOUT_CLUB') {
      const timer = setTimeout(() => {
        soundFx.playBassDropWalkout();
        triggerConfetti();
        setStage('WALKOUT_REVEAL');
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#eab308', '#38bdf8', '#ec4899']
      });
    } catch {
      // Fallback
    }
  };

  const handleSkipToSummary = () => {
    soundFx.playFanfare();
    triggerConfetti();
    setStage('SUMMARY');
  };

  return (
    <div id="pack-opening-stage" className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 select-none overflow-hidden">
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className={`w-[700px] h-[700px] rounded-full blur-[160px] opacity-30 bg-gradient-to-tr ${pack.color}`} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_20%,_#000_80%)]" />
      </div>

      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/20 border border-green-500/40 flex items-center justify-center text-green-400 font-black text-lg">
            FC
          </div>
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-widest font-bold">PACK STORE</div>
            <div className="text-white font-black text-lg">{pack.name}</div>
          </div>
        </div>

        {stage !== 'SUMMARY' && (
          <button
            id="skip-pack-button"
            onClick={handleSkipToSummary}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-xs font-black uppercase text-gray-200 tracking-wider transition cursor-pointer"
          >
            SKIP ANIMATION ➔
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {stage === 'SEALED' && (
          <motion.div
            key="sealed"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            className="relative flex flex-col items-center gap-8 z-10"
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
              className={`relative w-72 h-96 rounded-[32px] p-6 bg-gradient-to-br ${pack.color} border-4 border-white/30 shadow-[0_0_50px_rgba(34,197,94,0.4)] flex flex-col justify-between items-center overflow-hidden cursor-pointer group`}
              onClick={startOpeningSequence}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-black/40 pointer-events-none" />

              <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/20 text-xs font-black tracking-widest text-amber-300">
                {pack.badge} PACK
              </div>

              <div className="text-center my-auto">
                <div className="text-5xl font-black italic tracking-tighter text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
                  ICONS
                </div>
                <div className="text-xs uppercase tracking-[0.3em] font-extrabold text-green-300 mt-1">
                  PAPER FC
                </div>
              </div>

              <div className="w-full bg-black/70 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center">
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  WALKOUT CHANCE: {pack.walkoutOdds}
                </div>
                <div className="text-xs font-mono font-bold text-white mt-0.5">
                  GUARANTEED {pack.minOvr}+ OVR
                </div>
              </div>
            </motion.div>

            <button
              id="rip-open-pack-button"
              onClick={startOpeningSequence}
              className="px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-400 hover:to-emerald-300 text-black font-black text-lg tracking-wider rounded-full shadow-[0_0_30px_rgba(34,197,94,0.6)] hover:scale-105 active:scale-95 transition cursor-pointer"
            >
              RIP OPEN PACK ⚡
            </button>
          </motion.div>
        )}

        {stage === 'TEARING' && (
          <motion.div
            key="tearing"
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.1, 1.3], opacity: [1, 1, 0] }}
            transition={{ duration: 1.1 }}
            className="flex flex-col items-center justify-center z-10"
          >
            <div className="text-6xl font-black italic text-green-400 tracking-widest animate-pulse">
              OPENING...
            </div>
          </motion.div>
        )}

        {stage === 'WALKOUT_FLAG' && topCard && (
          <motion.div
            key="walkout_flag"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center gap-6 z-10"
          >
            <div className="text-sm font-bold uppercase text-green-400 tracking-[0.4em]">WALKOUT DETECTED</div>
            <div className="text-9xl filter drop-shadow-[0_0_40px_rgba(255,255,255,0.6)] animate-bounce">
              {topCard.nationFlag}
            </div>
            <div className="text-2xl font-black text-white uppercase tracking-widest font-mono">
              {topCard.nation}
            </div>
          </motion.div>
        )}

        {stage === 'WALKOUT_POSITION' && topCard && (
          <motion.div
            key="walkout_pos"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center gap-4 z-10"
          >
            <div className="text-sm font-bold uppercase text-amber-400 tracking-[0.4em]">POSITION</div>
            <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-600 font-mono tracking-tighter drop-shadow-[0_0_30px_rgba(245,158,11,0.8)]">
              {topCard.position}
            </div>
          </motion.div>
        )}

        {stage === 'WALKOUT_CLUB' && topCard && (
          <motion.div
            key="walkout_club"
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 2 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center gap-4 z-10"
          >
            <div className="text-sm font-bold uppercase text-cyan-400 tracking-[0.4em]">CLUB</div>
            <div className="text-8xl drop-shadow-[0_0_30px_rgba(34,211,238,0.8)]">
              {topCard.clubLogo}
            </div>
            <div className="text-3xl font-black text-white uppercase tracking-wider font-mono">
              {topCard.club}
            </div>
          </motion.div>
        )}

        {stage === 'WALKOUT_REVEAL' && topCard && (
          <motion.div
            key="walkout_reveal"
            initial={{ opacity: 0, scale: 0.2, rotateY: 180 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.8, type: 'spring' }}
            className="flex flex-col items-center gap-6 z-10"
          >
            <div className="text-xs font-black uppercase text-green-400 tracking-[0.5em] bg-black/60 px-4 py-1 rounded-full border border-green-500/30">
              WALKOUT COMPLETE!
            </div>

            <FCPlayerCard card={topCard} size="xl" showStats={true} isHoverable={false} />

            <button
              onClick={() => setStage('SUMMARY')}
              className="px-8 py-3 bg-white text-black font-black text-sm uppercase tracking-wider rounded-full hover:bg-gray-200 transition cursor-pointer"
            >
              VIEW ALL CARDS ({pulledCards.length}) ➔
            </button>
          </motion.div>
        )}

        {stage === 'SUMMARY' && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6 z-10 max-w-5xl w-full"
          >
            <div className="text-center">
              <div className="text-xs font-black uppercase text-green-400 tracking-[0.3em]">NEW ACQUISITIONS</div>
              <h2 className="text-3xl font-black text-white mt-1">PACK REVEAL SUMMARY</h2>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 py-4 max-h-[60vh] overflow-y-auto px-2">
              {pulledCards.map((card, idx) => (
                <motion.div
                  key={`${card.id}-${idx}`}
                  initial={{ opacity: 0, scale: 0.5, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: idx * 0.15 }}
                >
                  <FCPlayerCard card={card} size="lg" showStats={true} />
                </motion.div>
              ))}
            </div>

            <div className="flex items-center gap-4 mt-2">
              <button
                id="claim-all-cards-button"
                onClick={() => onComplete(pulledCards)}
                className="px-8 py-3.5 bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-400 hover:to-emerald-300 text-black font-black text-sm tracking-wider rounded-full shadow-[0_0_25px_rgba(34,197,94,0.5)] cursor-pointer hover:scale-105 active:scale-95 transition"
              >
                CLAIM & ADD ALL TO CLUB ⚡
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
