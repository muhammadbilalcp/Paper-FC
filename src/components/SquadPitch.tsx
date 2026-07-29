import React, { useState } from 'react';
import { PlayerCard, FormationName, PitchSlot, UserSquad } from '../types';
import { FCPlayerCard } from './FCPlayerCard';
import { soundFx } from '../utils/audio';

interface SquadPitchProps {
  squad: UserSquad;
  inventory: PlayerCard[];
  onUpdateSquad: (newSquad: UserSquad) => void;
}

const FORMATIONS: Record<FormationName, PitchSlot[]> = {
  '4-3-3': [
    { position: 'GK', label: 'GK', topPercent: 86, leftPercent: 50 },
    { position: 'LB', label: 'LB', topPercent: 70, leftPercent: 15 },
    { position: 'CB', label: 'LCB', topPercent: 74, leftPercent: 38 },
    { position: 'CB', label: 'RCB', topPercent: 74, leftPercent: 62 },
    { position: 'RB', label: 'RB', topPercent: 70, leftPercent: 85 },
    { position: 'CM', label: 'LCM', topPercent: 48, leftPercent: 28 },
    { position: 'CAM', label: 'CAM', topPercent: 42, leftPercent: 50 },
    { position: 'CM', label: 'RCM', topPercent: 48, leftPercent: 72 },
    { position: 'LW', label: 'LW', topPercent: 22, leftPercent: 20 },
    { position: 'ST', label: 'ST', topPercent: 16, leftPercent: 50 },
    { position: 'RW', label: 'RW', topPercent: 22, leftPercent: 80 }
  ],
  '4-4-2': [
    { position: 'GK', label: 'GK', topPercent: 86, leftPercent: 50 },
    { position: 'LB', label: 'LB', topPercent: 70, leftPercent: 15 },
    { position: 'CB', label: 'LCB', topPercent: 74, leftPercent: 38 },
    { position: 'CB', label: 'RCB', topPercent: 74, leftPercent: 62 },
    { position: 'RB', label: 'RB', topPercent: 70, leftPercent: 85 },
    { position: 'LM', label: 'LM', topPercent: 46, leftPercent: 18 },
    { position: 'CM', label: 'LCM', topPercent: 48, leftPercent: 40 },
    { position: 'CM', label: 'RCM', topPercent: 48, leftPercent: 60 },
    { position: 'RM', label: 'RM', topPercent: 46, leftPercent: 82 },
    { position: 'ST', label: 'LST', topPercent: 20, leftPercent: 38 },
    { position: 'ST', label: 'RST', topPercent: 20, leftPercent: 62 }
  ],
  '3-4-3': [
    { position: 'GK', label: 'GK', topPercent: 86, leftPercent: 50 },
    { position: 'CB', label: 'LCB', topPercent: 75, leftPercent: 25 },
    { position: 'CB', label: 'CCB', topPercent: 76, leftPercent: 50 },
    { position: 'CB', label: 'RCB', topPercent: 75, leftPercent: 75 },
    { position: 'LM', label: 'LM', topPercent: 48, leftPercent: 15 },
    { position: 'CM', label: 'LCM', topPercent: 48, leftPercent: 38 },
    { position: 'CM', label: 'RCM', topPercent: 48, leftPercent: 62 },
    { position: 'RM', label: 'RM', topPercent: 48, leftPercent: 85 },
    { position: 'LW', label: 'LW', topPercent: 20, leftPercent: 22 },
    { position: 'ST', label: 'ST', topPercent: 16, leftPercent: 50 },
    { position: 'RW', label: 'RW', topPercent: 20, leftPercent: 78 }
  ],
  '4-2-3-1': [
    { position: 'GK', label: 'GK', topPercent: 86, leftPercent: 50 },
    { position: 'LB', label: 'LB', topPercent: 70, leftPercent: 15 },
    { position: 'CB', label: 'LCB', topPercent: 74, leftPercent: 38 },
    { position: 'CB', label: 'RCB', topPercent: 74, leftPercent: 62 },
    { position: 'RB', label: 'RB', topPercent: 70, leftPercent: 85 },
    { position: 'CDM', label: 'LCDM', topPercent: 56, leftPercent: 35 },
    { position: 'CDM', label: 'RCDM', topPercent: 56, leftPercent: 65 },
    { position: 'CAM', label: 'LCAM', topPercent: 35, leftPercent: 22 },
    { position: 'CAM', label: 'CCAM', topPercent: 33, leftPercent: 50 },
    { position: 'CAM', label: 'RCAM', topPercent: 35, leftPercent: 78 },
    { position: 'ST', label: 'ST', topPercent: 16, leftPercent: 50 }
  ],
  '3-5-2': [
    { position: 'GK', label: 'GK', topPercent: 86, leftPercent: 50 },
    { position: 'CB', label: 'LCB', topPercent: 75, leftPercent: 25 },
    { position: 'CB', label: 'CCB', topPercent: 76, leftPercent: 50 },
    { position: 'CB', label: 'RCB', topPercent: 75, leftPercent: 75 },
    { position: 'CDM', label: 'LCDM', topPercent: 58, leftPercent: 38 },
    { position: 'CDM', label: 'RCDM', topPercent: 58, leftPercent: 62 },
    { position: 'LM', label: 'LM', topPercent: 42, leftPercent: 15 },
    { position: 'CAM', label: 'CAM', topPercent: 38, leftPercent: 50 },
    { position: 'RM', label: 'RM', topPercent: 42, leftPercent: 85 },
    { position: 'ST', label: 'LST', topPercent: 18, leftPercent: 38 },
    { position: 'ST', label: 'RST', topPercent: 18, leftPercent: 62 }
  ]
};

export const SquadPitch: React.FC<SquadPitchProps> = ({
  squad,
  inventory,
  onUpdateSquad
}) => {
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

  const currentSlots = FORMATIONS[squad.formation];

  const startingPlayers = Object.values(squad.starting11).filter((p): p is PlayerCard => p !== null && p !== undefined);
  const teamOvr = startingPlayers.length > 0
    ? Math.round(startingPlayers.reduce((acc, curr) => acc + curr.rating, 0) / 11)
    : 0;

  const calculateChemistry = (): number => {
    if (startingPlayers.length === 0) return 0;
    let chemPoints = 0;
    const nationsCount: Record<string, number> = {};
    const clubsCount: Record<string, number> = {};

    startingPlayers.forEach((p) => {
      nationsCount[p.nation] = (nationsCount[p.nation] || 0) + 1;
      clubsCount[p.club] = (clubsCount[p.club] || 0) + 1;
    });

    Object.values(nationsCount).forEach((cnt) => {
      if (cnt >= 2) chemPoints += 15;
      if (cnt >= 4) chemPoints += 15;
    });

    Object.values(clubsCount).forEach((cnt) => {
      if (cnt >= 2) chemPoints += 15;
      if (cnt >= 3) chemPoints += 20;
    });

    chemPoints += startingPlayers.length * 3;

    return Math.min(100, chemPoints);
  };

  const chemistry = calculateChemistry();

  const selectedSlot = selectedSlotIndex !== null ? currentSlots[selectedSlotIndex] : null;

  const assignedIds = new Set(
    Object.entries(squad.starting11)
      .filter(([idxStr, card]) => card !== null && card !== undefined && Number(idxStr) !== selectedSlotIndex)
      .map(([, card]) => (card as PlayerCard).id)
  );

  const availableCards = inventory.filter((card) => !assignedIds.has(card.id));

  const handleSelectFormation = (formName: FormationName) => {
    soundFx.playClick();
    onUpdateSquad({
      ...squad,
      formation: formName
    });
  };

  const handleAssignPlayer = (card: PlayerCard | null) => {
    if (selectedSlotIndex === null) return;
    soundFx.playClick();

    const updatedXI = {
      ...squad.starting11,
      [selectedSlotIndex]: card
    };

    onUpdateSquad({
      ...squad,
      starting11: updatedXI
    });

    setSelectedSlotIndex(null);
  };

  const handleAutoFillBest = () => {
    soundFx.playCoinSound();
    const sortedInv = [...inventory].sort((a, b) => b.rating - a.rating);
    const newXI: Record<string, PlayerCard | null> = {};

    const usedIds = new Set<string>();

    currentSlots.forEach((slot, idx) => {
      let match = sortedInv.find((c) => c.position === slot.position && !usedIds.has(c.id));
      if (!match) {
        match = sortedInv.find((c) => !usedIds.has(c.id));
      }

      if (match) {
        newXI[idx] = match;
        usedIds.add(match.id);
      } else {
        newXI[idx] = null;
      }
    });

    onUpdateSquad({
      ...squad,
      starting11: newXI
    });
  };

  return (
    <div id="squad-pitch-container" className="flex flex-col gap-4 w-full">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-tr from-green-500 to-emerald-600 rounded-2xl flex flex-col items-center justify-center border border-white/20 shadow-[0_0_15px_rgba(34,197,94,0.4)]">
              <span className="text-[10px] text-black font-black uppercase tracking-tighter">OVR</span>
              <span className="text-2xl font-black text-black leading-none font-mono">{teamOvr}</span>
            </div>
            <div>
              <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">SQUAD OVERALL</div>
              <div className="text-white font-extrabold text-sm">{startingPlayers.length} / 11 PLAYERS SET</div>
            </div>
          </div>

          <div className="flex items-center gap-3 border-l border-white/10 pl-6">
            <div className="w-12 h-12 bg-black/60 rounded-xl flex items-center justify-center border border-cyan-500/40 text-cyan-400 font-mono font-black text-lg">
              ⚡{chemistry}
            </div>
            <div>
              <div className="text-xs text-cyan-400 font-bold uppercase tracking-widest">CHEMISTRY</div>
              <div className="text-xs text-gray-400 font-mono">MAX BOOST ACTIVE</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10">
            {(Object.keys(FORMATIONS) as FormationName[]).map((fName) => (
              <button
                key={fName}
                onClick={() => handleSelectFormation(fName)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
                  squad.formation === fName
                    ? 'bg-green-500 text-black shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {fName}
              </button>
            ))}
          </div>

          <button
            id="squad-autofill-button"
            onClick={handleAutoFillBest}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.4)] transition cursor-pointer"
          >
            AUTO-FILL BEST ⚡
          </button>
        </div>
      </div>

      <div className="relative w-full aspect-[4/3] max-h-[640px] bg-gradient-to-b from-emerald-950 via-green-900 to-emerald-950 rounded-3xl border-4 border-white/10 overflow-hidden shadow-2xl p-4 flex items-center justify-center">
        <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(0deg,_#ffffff20,_#ffffff20_40px,_transparent_40px,_transparent_80px)] pointer-events-none" />

        <div className="absolute inset-4 border-2 border-white/30 rounded-2xl pointer-events-none">
          <div className="absolute top-1/2 left-0 right-0 border-t-2 border-white/30" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white/30 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/40 rounded-full" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-28 border-b-2 border-x-2 border-white/30" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-56 h-28 border-t-2 border-x-2 border-white/30" />
        </div>

        <div className="absolute inset-0">
          {currentSlots.map((slot, index) => {
            const assignedCard = squad.starting11[index];

            return (
              <div
                key={`${slot.position}-${index}`}
                style={{
                  top: `${slot.topPercent}%`,
                  left: `${slot.leftPercent}%`
                }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
              >
                {assignedCard ? (
                  <div className="relative group">
                    <FCPlayerCard
                      card={assignedCard}
                      size="sm"
                      showStats={false}
                      onClick={() => setSelectedSlotIndex(index)}
                    />
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black/80 text-green-400 font-extrabold text-[8px] px-2 py-0.5 rounded-full border border-green-500/40 uppercase font-mono">
                      {slot.position}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedSlotIndex(index);
                    }}
                    className="w-16 h-20 rounded-xl bg-black/60 backdrop-blur-md border-2 border-dashed border-green-400/60 hover:border-green-400 hover:bg-green-500/20 flex flex-col items-center justify-center text-center p-1 group transition cursor-pointer shadow-lg"
                  >
                    <span className="text-green-400 font-mono font-black text-xs group-hover:scale-110 transition-transform">
                      +
                    </span>
                    <span className="text-[9px] font-bold text-gray-300 uppercase mt-0.5">
                      {slot.label}
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedSlotIndex !== null && selectedSlot && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-white/20 rounded-3xl p-6 max-w-3xl w-full max-h-[85vh] flex flex-col gap-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div>
                <div className="text-xs text-green-400 font-bold uppercase tracking-widest">
                  SELECT PLAYER FOR {selectedSlot.label} ({selectedSlot.position})
                </div>
                <h3 className="text-xl font-black text-white">YOUR CLUB INVENTORY</h3>
              </div>

              <button
                onClick={() => setSelectedSlotIndex(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white font-black text-sm flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {squad.starting11[selectedSlotIndex] && (
              <div className="flex justify-end">
                <button
                  onClick={() => handleAssignPlayer(null)}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 font-black text-xs rounded-xl transition cursor-pointer"
                >
                  REMOVE PLAYER FROM POSITION
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-2">
              {availableCards.length === 0 ? (
                <div className="col-span-full py-12 text-center text-gray-500">
                  No available players to select! Open more packs in the Store.
                </div>
              ) : (
                availableCards.map((card) => (
                  <div key={card.id} className="flex justify-center">
                    <FCPlayerCard
                      card={card}
                      size="md"
                      showStats={false}
                      onClick={() => handleAssignPlayer(card)}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
