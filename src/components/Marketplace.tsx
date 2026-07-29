import React, { useState } from 'react';
import { MarketItem, PlayerCard, UserAccount } from '../types';
import { getMarketItems, saveMarketItems, updateUserAccount } from '../utils/storage';
import { CardVisual } from './CardVisual';
import { soundFx } from '../utils/audio';

interface MarketplaceProps {
  currentUser: UserAccount;
  onRefreshUser: () => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({
  currentUser,
  onRefreshUser
}) => {
  const [marketItems, setMarketItems] = useState<MarketItem[]>(getMarketItems());
  const [selectedCardToList, setSelectedCardToList] = useState<PlayerCard | null>(null);
  const [listPrice, setListPrice] = useState<number>(500000);

  const handleBuyCard = (item: MarketItem) => {
    if (currentUser.coins < item.priceCoins) {
      alert(`⚠️ You need ${item.priceCoins.toLocaleString()} Coins to buy this card!`);
      return;
    }

    soundFx.playCoinSound();

    // Deduct coins & add card to inventory
    const updatedUser: UserAccount = {
      ...currentUser,
      coins: currentUser.coins - item.priceCoins,
      inventory: [item.card, ...currentUser.inventory]
    };

    updateUserAccount(updatedUser);

    // Remove item from market
    const updatedMarket = marketItems.filter((i) => i.id !== item.id);
    saveMarketItems(updatedMarket);
    setMarketItems(updatedMarket);

    onRefreshUser();
    alert(`🎉 Successfully bought ${item.card.name} for ${item.priceCoins.toLocaleString()} Coins!`);
  };

  const handleListCard = () => {
    if (!selectedCardToList) return;
    soundFx.playCoinSound();

    const newItem: MarketItem = {
      id: `mkt-${Date.now()}`,
      sellerUsername: currentUser.username,
      card: selectedCardToList,
      priceCoins: listPrice,
      listedAt: Date.now()
    };

    const updatedMarket = [newItem, ...marketItems];
    saveMarketItems(updatedMarket);
    setMarketItems(updatedMarket);

    // Remove from user's current inventory
    const updatedInventory = currentUser.inventory.filter((c) => c.id !== selectedCardToList.id);
    const updatedUser: UserAccount = {
      ...currentUser,
      inventory: updatedInventory
    };

    updateUserAccount(updatedUser);
    onRefreshUser();
    setSelectedCardToList(null);
    alert(`📢 ${selectedCardToList.name} listed on the Transfer Market for ${listPrice.toLocaleString()} Coins!`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
      {/* Transfer Market Header */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 bg-green-500/20 text-green-400 font-mono text-[10px] font-bold rounded uppercase tracking-widest">
            TRANSFER MARKET
          </span>
          <h2 className="text-2xl font-black text-white italic mt-1">
            BUY & SELL PLAYER CARDS
          </h2>
          <p className="text-xs text-gray-400">
            Trade with players worldwide or buy top stars with your Coins.
          </p>
        </div>

        <button
          onClick={() => setSelectedCardToList(currentUser.inventory[0] || null)}
          className="px-5 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-black text-xs rounded-xl shadow-md transition active:scale-95 uppercase tracking-wider"
        >
          ➕ LIST YOUR CARD FOR SALE
        </button>
      </div>

      {/* Sell Modal / Drawer */}
      {selectedCardToList && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b120c] border-2 border-amber-500/50 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                List Card on Transfer Market
              </h3>
              <button
                onClick={() => setSelectedCardToList(null)}
                className="text-gray-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-4">
              <CardVisual card={selectedCardToList} size="sm" />
              <div className="space-y-2 flex-1">
                <label className="text-[10px] text-gray-400 uppercase font-bold">
                  Select Card from Inventory
                </label>
                <select
                  value={selectedCardToList.id}
                  onChange={(e) => {
                    const found = currentUser.inventory.find((c) => c.id === e.target.value);
                    if (found) setSelectedCardToList(found);
                  }}
                  className="w-full bg-black/60 border border-white/20 text-white text-xs font-bold rounded-xl p-2.5"
                >
                  {currentUser.inventory.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.rating} OVR - {c.position})
                    </option>
                  ))}
                </select>

                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-bold">
                    Asking Price (Coins)
                  </label>
                  <input
                    type="number"
                    value={listPrice}
                    onChange={(e) => setListPrice(Number(e.target.value))}
                    className="w-full bg-black/60 border border-white/20 text-yellow-400 font-mono text-xs font-bold rounded-xl p-2.5"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleListCard}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-black text-xs rounded-xl shadow-lg transition active:scale-95 uppercase tracking-wider"
            >
              🚀 CONFIRM MARKET LISTING
            </button>
          </div>
        </div>
      )}

      {/* Market Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {marketItems.map((item) => (
          <div
            key={item.id}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-between gap-3 hover:border-green-500/50 transition group"
          >
            <div className="w-full flex justify-between items-center text-[10px] text-gray-400 border-b border-white/10 pb-2">
              <span>Seller: <strong className="text-white">{item.sellerUsername}</strong></span>
              <span className="text-green-400 font-mono font-bold">LIVE</span>
            </div>

            <CardVisual card={item.card} size="md" />

            <div className="w-full space-y-2 pt-2 border-t border-white/10">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 font-bold uppercase">PRICE:</span>
                <span className="text-yellow-400 font-mono font-black text-sm">
                  {item.priceCoins.toLocaleString()} Coins
                </span>
              </div>

              <button
                onClick={() => handleBuyCard(item)}
                disabled={item.sellerUsername === currentUser.username}
                className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                  item.sellerUsername === currentUser.username
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-400 text-black shadow-md active:scale-95'
                }`}
              >
                {item.sellerUsername === currentUser.username ? 'YOUR LISTING' : '🛒 BUY NOW'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
