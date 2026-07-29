import React, { useState } from 'react';
import { MarketItem, PlayerCard, UserAccount } from '../types';
import { FCPlayerCard } from './FCPlayerCard';
import { soundFx } from '../utils/audio';

interface TransferMarketProps {
  currentUser: UserAccount;
  marketListings: MarketItem[];
  onBuyItem: (item: MarketItem) => void;
  onListItem: (card: PlayerCard, priceCoins: number) => void;
}

export const TransferMarket: React.FC<TransferMarketProps> = ({
  currentUser,
  marketListings,
  onBuyItem,
  onListItem
}) => {
  const [activeTab, setActiveTab] = useState<'BUY' | 'SELL'>('BUY');
  const [searchFilter, setSearchFilter] = useState('');
  const [sellPriceInput, setSellPriceInput] = useState<number>(100000);
  const [selectedSellCard, setSelectedSellCard] = useState<PlayerCard | null>(null);

  const filteredMarket = marketListings.filter((item) =>
    item.card.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    item.card.club.toLowerCase().includes(searchFilter.toLowerCase()) ||
    item.card.position.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleListItemSubmit = () => {
    if (!selectedSellCard || sellPriceInput <= 0) return;
    soundFx.playCoinSound();
    onListItem(selectedSellCard, sellPriceInput);
    setSelectedSellCard(null);
  };

  return (
    <div id="transfer-market-container" className="w-full flex flex-col gap-6">
      <div className="flex justify-between items-center bg-white/5 border border-white/10 p-2 rounded-2xl backdrop-blur-md">
        <div className="flex gap-2">
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('BUY');
            }}
            className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer ${
              activeTab === 'BUY'
                ? 'bg-green-500 text-black shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            BUY PLAYERS 🛒
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('SELL');
            }}
            className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer ${
              activeTab === 'SELL'
                ? 'bg-green-500 text-black shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            SELL FROM CLUB 🏷️
          </button>
        </div>

        {activeTab === 'BUY' && (
          <input
            type="text"
            placeholder="Search player, club or position..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="bg-black/60 border border-white/20 rounded-xl px-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-green-400 w-64 font-mono"
          />
        )}
      </div>

      {activeTab === 'BUY' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredMarket.length === 0 ? (
            <div className="col-span-full py-16 text-center text-gray-500 font-mono">
              No players currently listed on the market!
            </div>
          ) : (
            filteredMarket.map((item) => {
              const canAfford = currentUser.coins >= item.priceCoins;
              const isOwnListing = item.sellerUsername === currentUser.username;

              return (
                <div
                  key={item.id}
                  className="bg-white/5 border border-white/10 rounded-3xl p-4 flex flex-col items-center gap-3 backdrop-blur-md hover:border-green-500/40 transition"
                >
                  <FCPlayerCard card={item.card} size="md" />

                  <div className="w-full bg-black/60 rounded-xl p-2.5 border border-white/10 text-center">
                    <div className="text-[10px] text-gray-400 font-bold uppercase">SELLER: {item.sellerUsername}</div>
                    <div className="text-amber-400 font-mono font-black text-sm mt-0.5">
                      🪙 {item.priceCoins.toLocaleString()} COINS
                    </div>
                  </div>

                  {isOwnListing ? (
                    <span className="text-[10px] text-green-400 font-bold uppercase bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                      YOUR LISTING
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        if (canAfford) {
                          soundFx.playCoinSound();
                          onBuyItem(item);
                        }
                      }}
                      disabled={!canAfford}
                      className={`w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer ${
                        canAfford
                          ? 'bg-green-500 hover:bg-green-400 text-black shadow-md'
                          : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? 'BUY NOW ⚡' : 'INSUFFICIENT COINS'}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'SELL' && (
        <div className="flex flex-col gap-6">
          <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">
            CLICK A PLAYER FROM YOUR CLUB INVENTORY TO LIST FOR SALE
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-[60vh] overflow-y-auto p-2">
            {currentUser.inventory.map((card) => (
              <div
                key={card.id}
                onClick={() => setSelectedSellCard(card)}
                className={`flex justify-center transition cursor-pointer p-2 rounded-2xl ${
                  selectedSellCard?.id === card.id ? 'ring-4 ring-green-400 bg-green-500/10' : ''
                }`}
              >
                <FCPlayerCard card={card} size="sm" />
              </div>
            ))}
          </div>

          {selectedSellCard && (
            <div className="bg-black/90 border border-green-500/50 rounded-3xl p-6 flex flex-wrap items-center justify-between gap-6 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center gap-4">
                <FCPlayerCard card={selectedSellCard} size="sm" showStats={false} isHoverable={false} />
                <div>
                  <div className="text-xs text-green-400 font-bold uppercase tracking-widest">SELECTED FOR SALE</div>
                  <div className="text-xl font-black text-white">{selectedSellCard.name}</div>
                  <div className="text-xs text-gray-400 font-mono mt-1">
                    ESTIMATED VALUE: 🪙 {(selectedSellCard.valueCoins || 100000).toLocaleString()} COINS
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">SET LISTING PRICE (COINS)</label>
                  <input
                    type="number"
                    value={sellPriceInput}
                    onChange={(e) => setSellPriceInput(Number(e.target.value))}
                    className="block mt-1 bg-black border border-white/20 rounded-xl px-4 py-2 text-amber-400 font-mono font-bold text-sm w-48 focus:outline-none focus:border-green-400"
                  />
                </div>

                <button
                  onClick={handleListItemSubmit}
                  className="px-6 py-3 bg-green-500 hover:bg-green-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition cursor-pointer"
                >
                  CONFIRM LISTING ⚡
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
