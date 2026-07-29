import React, { useState } from 'react';
import { UserSquad, PlayerCard, FormationName, PitchSlot } from '../types';
import { CardVisual } from './CardVisual';
import { soundFx } from '../utils/audio';

interface SquadBuilderProps {
  squad: UserSquad;
  inventory: PlayerCard[];
  onUpdateSquad: (newSquad: UserSquad) => void;
}

const FORMATION_CONFIGS: Record<FormationName, PitchSlot[]> = {
  '4-3-3': [
    { slotKey: 'LW', position: 'LW', label: 'LW', topPercent: 18, leftPercent: 18 },
    { slotKey: 'ST', position: 'ST', label: 'ST', topPercent: 12, leftPercent: 50 },
    { slotKey: 'RW', position: 'RW', label: 'RW', topPercent: 18, leftPercent: 82 },
    { slotKey: 'CAM', position: 'CAM', label: 'CAM', topPercent: 40, leftPercent: 32 },
    { slotKey: 'CM', position: 'CM', label: 'CM', topPercent: 40, leftPercent: 68 },
    { slotKey: 'CDM', position: 'CDM', label: 'CDM', topPercent: 58, leftPercent: 50 },
    { slotKey: 'LB', position: 'LB', label: 'LB', topPercent: 72, leftPercent: 18 },
    { slotKey: 'CB1', position: 'CB1', label: 'CB', topPercent: 75, leftPercent: 38 },
    { slotKey: 'CB2', position: 'CB2', label: 'CB', topPercent: 75, leftPercent: 62 },
    { slotKey: 'RB', position: 'RB', label: 'RB', topPercent: 72, leftPercent: 82 },
    { slotKey: 'GK', position: 'GK', label: 'GK', topPercent: 90, leftPercent: 50 }
  ],
  '4-4-2': [
    { slotKey: 'ST1', position: 'ST1', label: 'ST', topPercent: 15, leftPercent: 35 },
    { slotKey: 'ST2', position: 'ST2', label: 'ST', topPercent: 15, leftPercent: 65 },
    { slotKey: 'LM', position: 'LM', label: 'LM', topPercent: 42, leftPercent: 18 },
    { slotKey: 'CM1', position: 'CM1', label: 'CM', topPercent: 45, leftPercent: 40 },
    { slotKey: 'CM2', position: 'CM2', label: 'CM', topPercent: 45, leftPercent: 60 },
    { slotKey: 'RM', position: 'RM', label: 'RM', topPercent: 42, leftPercent: 82 },
    { slotKey: 'LB', position: 'LB', label: 'LB', topPercent: 72, leftPercent: 18 },
    { slotKey: 'CB1', position: 'CB1', label: 'CB', topPercent: 75, leftPercent: 38 },
    { slotKey: 'CB2', position: 'CB2', label: 'CB', topPercent: 75, leftPercent: 62 },
    { slotKey: 'RB', position: 'RB', label: 'RB', topPercent: 72, leftPercent: 82 },
    { slotKey: 'GK', position: 'GK', label: 'GK', topPercent: 90, leftPercent: 50 }
  ],
  '3-4-3': [
    { slotKey: 'LW', position: 'LW', label: 'LW', topPercent: 15, leftPercent: 20 },
    { slotKey: 'ST', position: 'ST', label: 'ST', topPercent: 12, leftPercent: 50 },
    { slotKey: 'RW', position: 'RW', label: 'RW', topPercent: 15, leftPercent: 80 },
    { slotKey: 'LM', position: 'LM', label: 'LM', topPercent: 42, leftPercent: 18 },
    { slotKey: 'CM1', position: 'CM1', label: 'CM', topPercent: 45, leftPercent: 40 },
    { slotKey: 'CM2', position: 'CM2', label: 'CM', topPercent: 45, leftPercent: 60 },
    { slotKey: 'RM', position: 'RM', label: 'RM', topPercent: 42, leftPercent: 82 },
    { slotKey: 'CB1', position: 'CB1', label: 'CB', topPercent: 75, leftPercent: 25 },
    { slotKey: 'CB2', position: 'CB2', label: 'CB', topPercent: 78, leftPercent: 50 },
    { slotKey: 'CB3', position: 'CB3', label: 'CB', topPercent: 75, leftPercent: 75 },
    { slotKey: 'GK', position: 'GK', label: 'GK', topPercent: 90, leftPercent: 50 }
  ],
  '4-2-3-1': [
    { slotKey: 'ST', position: 'ST', label: 'ST', topPercent: 12, leftPercent: 50 },
    { slotKey: 'LAM', position: 'LAM', label: 'LAM', topPercent: 32, leftPercent: 22 },
    { slotKey: 'CAM', position: 'CAM', label: 'CAM', topPercent: 30, leftPercent: 50 },
    { slotKey: 'RAM', position: 'RAM', label: 'RAM', topPercent: 32, leftPercent: 78 },
    { slotKey: 'CDM1', position: 'CDM1', label: 'CDM', topPercent: 55, leftPercent: 36 },
    { slotKey: 'CDM2', position: 'CDM2', label: 'CDM', topPercent: 55, leftPercent: 64 },
    { slotKey: 'LB', position: 'LB', label: 'LB', topPercent: 72, leftPercent: 18 },
    { slotKey: 'CB1', position: 'CB1', label: 'CB', topPercent: 75, leftPercent: 38 },
    { slotKey: 'CB2', position: 'CB2', label: 'CB', topPercent: 75, leftPercent: 62 },
    { slotKey: 'RB', position: 'RB', label: 'RB', topPercent: 72, leftPercent: 82 },
    { slotKey: 'GK', position: 'GK', label: 'GK', topPercent: 90, leftPercent: 50 }
  ],
  '3-5-2': [
    { slotKey: 'ST1', position: 'ST1', label: 'ST', topPercent: 15, leftPercent: 35 },
    { slotKey: 'ST2', position: 'ST2', label: 'ST', topPercent: 15, leftPercent: 65 },
    { slotKey: 'CAM', position: 'CAM', label: 'CAM', topPercent: 35, leftPercent: 50 },
    { slotKey: 'LM', position: 'LM', label: 'LM', topPercent: 50, leftPercent: 18 },
    { slotKey: 'CDM1', position: 'CDM1', label: 'CDM', topPercent: 55, leftPercent: 38 },
    { slotKey: 'CDM2', position: 'CDM2', label: 'CDM', topPercent: 55, leftPercent: 62 },
    { slotKey: 'RM', position: 'RM', label: 'RM', topPercent: 50, leftPercent: 82 },
    { slotKey: 'CB1', position: 'CB1', label: 'CB', topPercent: 75, leftPercent: 25 },
    { slotKey: 'CB2', position: 'CB2', label: 'CB', topPercent: 78, leftPercent: 50 },
    { slotKey: 'CB3', position: 'CB3', label: 'CB', topPercent: 75, leftPercent: 75 },
    { slotKey: 'GK', position: 'GK', label: 'GK', topPercent: 90, leftPercent: 50 }
  ]
};

export const SquadBuilder: React.FC<SquadBuilderProps> = ({
  squad,
  inventory,
  onUpdateSquad
}) => {
  const [selectedSlotKey, setSelectedSlotKey] = useState<string | null>(null);

  const slots = FORMATION_CONFIGS[squad.formation] || FORMATION_CONFIGS['4-3-3'];

  // Calculate team OVR
  const starterCards = Object.values(squad.starting11).filter((c): c is PlayerCard => c !== null);
  const totalRating = starterCards.length > 0
    ? Math.round(starterCards.reduce((acc, curr) => acc + curr.rating, 0) / starterCards.length)
    : 0;

  // Calculate chemistry (matching nations/clubs)
  const chemistry = Math.min(100, starterCards.length * 9);

  const handleSelectSlot = (slotKey: string) => {
    soundFx.playClick();
    setSelectedSlotKey(slotKey);
  };

  const handlePlacePlayer = (card: PlayerCard) => {
    if (!selectedSlotKey) return;
    soundFx.playCoinSound();

    // Check if card is already in starting 11 elsewhere, remove from old slot
    const newStarting11 = { ...squad.starting11 };
    Object.keys(newStarting11).forEach((key) => {
      if (newStarting11[key]?.id === card.id) {
        newStarting11[key] = null;
      }
    });

    newStarting11[selectedSlotKey] = card;

    onUpdateSquad({
      ...squad,
      starting11: newStarting11
    });

    setSelectedSlotKey(null);
  };

  const handleRemoveFromSlot = (slotKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playClick();
    const newStarting11 = { ...squad.starting11 };
    newStarting11[slotKey] = null;
    onUpdateSquad({
      ...squad,
      starting11: newStarting11
    });
  };

  const handleAutoBuildBestSquad = () => {
    soundFx.playCoinSound();
    const sorted = [...inventory].sort((a, b) => b.rating - a.rating);
    const newStarting11: Record<string, PlayerCard | null> = {};

    slots.forEach((slot, index) => {
      if (sorted[index]) {
        newStarting11[slot.slotKey] = sorted[index];
      } else {
        newStarting11[slot.slotKey] = null;
      }
    });

    onUpdateSquad({
      ...squad,
      starting11: newStarting11
    });
  };

  const handleFormationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    soundFx.playClick();
    onUpdateSquad({
      ...squad,
      formation: e.target.value as FormationName
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto p-2 sm:p-4">
      {/* Pitch Layout Area */}
      <div className="flex-1 flex flex-col items-center">
        {/* Squad Bar Controls */}
        <div className="w-full bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">TEAM OVR</span>
              <span className="text-3xl font-black text-amber-400 font-mono drop-shadow">
                {totalRating}
              </span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">CHEMISTRY</span>
              <span className="text-2xl font-black text-green-400 font-mono">
                {chemistry} / 100
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <label className="text-[10px] text-gray-400 uppercase font-bold">Formation</label>
              <select
                value={squad.formation}
                onChange={handleFormationChange}
                className="bg-black/60 border border-white/20 text-white text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:border-green-500"
              >
                <option value="4-3-3">4-3-3 (Default)</option>
                <option value="4-4-2">4-4-2</option>
                <option value="3-4-3">3-4-3</option>
                <option value="4-2-3-1">4-2-3-1</option>
                <option value="3-5-2">3-5-2</option>
              </select>
            </div>

            <button
              onClick={handleAutoBuildBestSquad}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-black font-black text-xs rounded-xl shadow-md transition active:scale-95 uppercase tracking-wider mt-3 sm:mt-0"
            >
              ⚡ AUTO BEST SQUAD
            </button>
          </div>
        </div>

        {/* Dynamic Football Pitch */}
        <div className="relative w-full aspect-[3/4] max-w-[550px] bg-gradient-to-b from-emerald-900 via-green-900 to-emerald-950 border-4 border-green-500/40 rounded-[32px] overflow-hidden shadow-[0_0_50px_rgba(34,197,94,0.15)] flex flex-col justify-between p-4">
          {/* Pitch Markings */}
          <div className="absolute inset-0 pointer-events-none border border-white/20 m-3 rounded-2xl">
            {/* Center Line */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-white/20" />
            {/* Center Circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/20 rounded-full" />
            {/* Top Penalty Box */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 border-b border-x border-white/20 rounded-b-xl" />
            {/* Bottom Penalty Box */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-24 border-t border-x border-white/20 rounded-t-xl" />
          </div>

          {/* Render Pitch Slots */}
          {slots.map((slot) => {
            const placedCard = squad.starting11[slot.slotKey];
            const isSelected = selectedSlotKey === slot.slotKey;

            return (
              <div
                key={slot.slotKey}
                onClick={() => handleSelectSlot(slot.slotKey)}
                style={{
                  top: `${slot.topPercent}%`,
                  left: `${slot.leftPercent}%`
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer transform hover:scale-110 transition-transform duration-200"
              >
                {placedCard ? (
                  <div className="relative group">
                    <CardVisual card={placedCard} size="sm" showStats={false} />
                    <button
                      onClick={(e) => handleRemoveFromSlot(slot.slotKey, e)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white text-[10px] font-black rounded-full shadow opacity-0 group-hover:opacity-100 transition"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div
                    className={`w-16 h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-1 transition ${
                      isSelected
                        ? 'border-yellow-400 bg-yellow-400/20 scale-110 shadow-[0_0_15px_rgba(250,204,21,0.5)]'
                        : 'border-white/40 bg-black/40 hover:border-green-400 hover:bg-green-500/20'
                    }`}
                  >
                    <span className="text-white font-black text-xs">{slot.label}</span>
                    <span className="text-[9px] text-green-400 font-bold mt-1">+ ADD</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Drawer: Club Inventory Selector */}
      <div className="w-full lg:w-96 bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col h-[650px]">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Club Cards Inventory
            </h3>
            <p className="text-[10px] text-gray-400">
              {inventory.length} Cards Owned • Select to place in team slot
            </p>
          </div>
          {selectedSlotKey && (
            <span className="px-2 py-1 bg-yellow-400 text-black text-[10px] font-black rounded">
              Slot: {selectedSlotKey}
            </span>
          )}
        </div>

        {/* Cards Grid */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {inventory.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-xs">
              No cards in inventory. Open packs to collect cards!
            </div>
          ) : (
            inventory
              .sort((a, b) => b.rating - a.rating)
              .map((card, idx) => {
                const isInSquad = (Object.values(squad.starting11) as (PlayerCard | null)[]).some(
                  (c) => c !== null && c.id === card.id
                );

                return (
                  <div
                    key={`${card.id}-${idx}`}
                    onClick={() => handlePlacePlayer(card)}
                    className={`p-2 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                      isInSquad
                        ? 'bg-green-500/10 border-green-500/40 opacity-75'
                        : 'bg-white/5 border-white/10 hover:border-green-400 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-12 bg-gradient-to-b from-yellow-400 to-amber-600 rounded flex items-center justify-center font-black text-black text-xs shadow">
                        {card.rating}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1">
                          {card.name} <span>{card.nationFlag}</span>
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {card.position} • {card.club} • {card.rarity.replace('_', ' ')}
                        </div>
                      </div>
                    </div>

                    {isInSquad ? (
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[9px] font-bold rounded">
                        IN TEAM
                      </span>
                    ) : (
                      <button className="px-3 py-1 bg-white/10 hover:bg-green-500 hover:text-black text-white text-[10px] font-bold rounded-lg transition">
                        SELECT
                      </button>
                    )}
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
};
