import React, { useState, useEffect } from 'react';
import { UserAccount, PlayerCard, AuctionItem } from '../types';
import { FCPlayerCard } from './FCPlayerCard';
import { getAuctions, saveAuctions, saveUsers } from '../utils/storage';
import { subscribeToAuctions, saveUserToFirestore } from '../lib/firebase';
import { soundFx } from '../utils/audio';

interface BiddingMarketProps {
  currentUser: UserAccount;
  onUpdateUser: (updatedUser: UserAccount) => void;
  allUsers: UserAccount[];
}

export const BiddingMarket: React.FC<BiddingMarketProps> = ({
  currentUser,
  onUpdateUser,
  allUsers
}) => {
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [startingBidInput, setStartingBidInput] = useState<number>(500000);
  const [buyNowInput, setBuyNowInput] = useState<number>(2000000);
  const [durationHours, setDurationHours] = useState<number>(24);
  const [isCreatingAuction, setIsCreatingAuction] = useState<boolean>(false);
  const [customBidAmount, setCustomBidAmount] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<'LIVE_AUCTIONS' | 'MY_LISTINGS' | 'HISTORY'>('LIVE_AUCTIONS');
  const [nowTick, setNowTick] = useState<number>(Date.now());

  // Helper to persist updated user database without changing active currentUser session
  const persistUsers = (usersList: UserAccount[]) => {
    saveUsers(usersList);
    fetch('/api/users/save-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ users: usersList })
    }).catch(() => {});
    for (const u of usersList) {
      saveUserToFirestore(u).catch(() => {});
    }
  };

  // 1. Load & subscribe to live auctions
  useEffect(() => {
    setAuctions(getAuctions());

    const unsub = subscribeToAuctions((freshAuctions) => {
      if (freshAuctions && Array.isArray(freshAuctions)) {
        setAuctions((prev) => {
          const map = new Map<string, AuctionItem>();
          for (const a of prev) if (a && a.id) map.set(a.id, a);
          for (const a of freshAuctions) if (a && a.id) map.set(a.id, a);
          const merged = Array.from(map.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          saveAuctions(merged);
          return merged;
        });
      }
    });

    const intervalId = setInterval(async () => {
      try {
        const res = await fetch('/api/db');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.auctions)) {
            setAuctions((prev) => {
              const map = new Map<string, AuctionItem>();
              for (const a of prev) if (a && a.id) map.set(a.id, a);
              for (const a of data.auctions) if (a && a.id) map.set(a.id, a);
              const merged = Array.from(map.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
              saveAuctions(merged);
              return merged;
            });
          }
        }
      } catch {}
    }, 3000);

    return () => {
      unsub();
      clearInterval(intervalId);
    };
  }, []);

  // 2. Countdown ticker & automatic auction expiration resolution
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setNowTick(now);

      // Check for expired active auctions
      setAuctions((prevAuctions) => {
        let changed = false;
        let workingUsers = [...allUsers];

        const updatedList = prevAuctions.map((auc) => {
          if (auc.status === 'ACTIVE' && auc.expiresAt <= now) {
            changed = true;
            if (auc.highestBidderUsername) {
              // High bidder wins!
              const bidderIdx = workingUsers.findIndex(
                (u) => u.username.toLowerCase() === auc.highestBidderUsername!.toLowerCase()
              );
              if (bidderIdx !== -1) {
                workingUsers[bidderIdx] = {
                  ...workingUsers[bidderIdx],
                  inventory: [
                    ...(workingUsers[bidderIdx].inventory || []),
                    { ...auc.card, id: `${auc.card.id}-won-${now}` }
                  ]
                };
              }
              const sellerIdx = workingUsers.findIndex(
                (u) => u.username.toLowerCase() === auc.sellerUsername.toLowerCase()
              );
              if (sellerIdx !== -1) {
                workingUsers[sellerIdx] = {
                  ...workingUsers[sellerIdx],
                  coins: (workingUsers[sellerIdx].coins || 0) + auc.currentBid
                };
              }
              return { ...auc, status: 'SOLD' as const };
            } else {
              // No bids placed. Return card to seller's inventory!
              const sellerIdx = workingUsers.findIndex(
                (u) => u.username.toLowerCase() === auc.sellerUsername.toLowerCase()
              );
              if (sellerIdx !== -1) {
                workingUsers[sellerIdx] = {
                  ...workingUsers[sellerIdx],
                  inventory: [...(workingUsers[sellerIdx].inventory || []), auc.card]
                };
              }
              return { ...auc, status: 'EXPIRED_UNSOLD' as const };
            }
          }
          return auc;
        });

        if (changed) {
          persistUsers(workingUsers);
          saveAuctions(updatedList);
          const me = workingUsers.find((u) => u.username.toLowerCase() === currentUser.username.toLowerCase());
          if (me) {
            onUpdateUser(me);
          }
        }

        return updatedList;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [allUsers, currentUser.username, onUpdateUser]);

  const formatTimeRemaining = (expiresAt: number) => {
    const diff = expiresAt - nowTick;
    if (diff <= 0) return 'EXPIRED';
    const hours = Math.floor(diff / (1000 * 3600));
    const mins = Math.floor((diff % (1000 * 3600)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  };

  const handleCreateAuction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCardId) return;

    const cardToList = currentUser.inventory.find((c) => c.id === selectedCardId);
    if (!cardToList) return;

    soundFx.playCoinSound();

    // Remove card from seller's inventory
    const updatedInventory = currentUser.inventory.filter((c) => c.id !== selectedCardId);
    const updatedCurrentUser: UserAccount = {
      ...currentUser,
      inventory: updatedInventory
    };

    const newAuction: AuctionItem = {
      id: `auc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sellerUsername: currentUser.username,
      card: cardToList,
      startingBid: startingBidInput,
      currentBid: startingBidInput,
      buyNowPrice: buyNowInput,
      bidHistory: [],
      createdAt: Date.now(),
      expiresAt: Date.now() + durationHours * 3600 * 1000,
      status: 'ACTIVE'
    };

    const updatedAuctions = [newAuction, ...auctions];
    setAuctions(updatedAuctions);
    saveAuctions(updatedAuctions);

    onUpdateUser(updatedCurrentUser);

    const nextUsers = allUsers.map((u) =>
      u.username.toLowerCase() === currentUser.username.toLowerCase() ? updatedCurrentUser : u
    );
    persistUsers(nextUsers);

    setIsCreatingAuction(false);
    setSelectedCardId('');
    alert(`Successfully listed ${cardToList.name} (${cardToList.rating} OVR) on the Bidding Market!`);
  };

  const handlePlaceBid = (auctionId: string) => {
    const auc = auctions.find((a) => a.id === auctionId);
    if (!auc || auc.status !== 'ACTIVE') return;

    if (auc.sellerUsername.toLowerCase() === currentUser.username.toLowerCase()) {
      alert('You cannot bid on your own player auction!');
      return;
    }

    const hasBids = auc.bidHistory && auc.bidHistory.length > 0;
    const minBid = hasBids ? auc.currentBid + 50000 : auc.startingBid;
    const bidAmount = customBidAmount[auctionId] || minBid;

    if (bidAmount < minBid) {
      alert(`Bid must be at least 🪙 ${minBid.toLocaleString()} FC Coins!`);
      return;
    }

    if (currentUser.coins < bidAmount) {
      alert('Insufficient FC Coins balance to place this bid!');
      return;
    }

    soundFx.playCoinSound();

    // Deduct coins from current user
    const updatedCurrentUser: UserAccount = {
      ...currentUser,
      coins: currentUser.coins - bidAmount
    };

    let workingUsers = [...allUsers];

    // If previous highest bidder exists (and is not current bidder), refund them!
    if (
      auc.highestBidderUsername &&
      auc.highestBidderUsername.toLowerCase() !== currentUser.username.toLowerCase()
    ) {
      const prevBidderIdx = workingUsers.findIndex(
        (u) => u.username.toLowerCase() === auc.highestBidderUsername!.toLowerCase()
      );
      if (prevBidderIdx !== -1) {
        workingUsers[prevBidderIdx] = {
          ...workingUsers[prevBidderIdx],
          coins: (workingUsers[prevBidderIdx].coins || 0) + auc.currentBid
        };
      }
    }

    // Update current user in workingUsers
    const curUserIdx = workingUsers.findIndex(
      (u) => u.username.toLowerCase() === currentUser.username.toLowerCase()
    );
    if (curUserIdx !== -1) {
      workingUsers[curUserIdx] = updatedCurrentUser;
    } else {
      workingUsers.push(updatedCurrentUser);
    }

    persistUsers(workingUsers);
    onUpdateUser(updatedCurrentUser);

    const updatedAuctions = auctions.map((a) => {
      if (a.id === auctionId) {
        return {
          ...a,
          currentBid: bidAmount,
          highestBidderUsername: currentUser.username,
          bidHistory: [
            { bidderUsername: currentUser.username, amount: bidAmount, timestamp: Date.now() },
            ...(a.bidHistory || [])
          ]
        };
      }
      return a;
    });

    setAuctions(updatedAuctions);
    saveAuctions(updatedAuctions);
    setCustomBidAmount((prev) => ({ ...prev, [auctionId]: bidAmount + 50000 }));
    alert(`Your bid of 🪙 ${bidAmount.toLocaleString()} FC Coins was placed successfully!`);
  };

  const handleBuyNow = (auctionId: string) => {
    const auc = auctions.find((a) => a.id === auctionId);
    if (!auc || auc.status !== 'ACTIVE') return;

    if (auc.sellerUsername.toLowerCase() === currentUser.username.toLowerCase()) {
      alert('You cannot buy your own listed auction!');
      return;
    }

    if (currentUser.coins < auc.buyNowPrice) {
      alert('Insufficient FC Coins to Buy Now!');
      return;
    }

    soundFx.playFanfare();

    let workingUsers = [...allUsers];

    // 1. If previous highest bidder exists (and is not current buyer), refund them!
    if (
      auc.highestBidderUsername &&
      auc.highestBidderUsername.toLowerCase() !== currentUser.username.toLowerCase()
    ) {
      const prevBidderIdx = workingUsers.findIndex(
        (u) => u.username.toLowerCase() === auc.highestBidderUsername!.toLowerCase()
      );
      if (prevBidderIdx !== -1) {
        workingUsers[prevBidderIdx] = {
          ...workingUsers[prevBidderIdx],
          coins: (workingUsers[prevBidderIdx].coins || 0) + auc.currentBid
        };
      }
    }

    // 2. Give coins to seller
    const sellerIdx = workingUsers.findIndex(
      (u) => u.username.toLowerCase() === auc.sellerUsername.toLowerCase()
    );
    if (sellerIdx !== -1) {
      workingUsers[sellerIdx] = {
        ...workingUsers[sellerIdx],
        coins: (workingUsers[sellerIdx].coins || 0) + auc.buyNowPrice
      };
    }

    // 3. Deduct coins and add card to buyer (currentUser)
    const updatedCurrentUser: UserAccount = {
      ...currentUser,
      coins: currentUser.coins - auc.buyNowPrice,
      inventory: [...currentUser.inventory, { ...auc.card, id: `${auc.card.id}-bought-${Date.now()}` }]
    };

    const curUserIdx = workingUsers.findIndex(
      (u) => u.username.toLowerCase() === currentUser.username.toLowerCase()
    );
    if (curUserIdx !== -1) {
      workingUsers[curUserIdx] = updatedCurrentUser;
    } else {
      workingUsers.push(updatedCurrentUser);
    }

    persistUsers(workingUsers);
    onUpdateUser(updatedCurrentUser);

    const updatedAuctions = auctions.map((a) => {
      if (a.id === auctionId) {
        return {
          ...a,
          status: 'SOLD' as const,
          highestBidderUsername: currentUser.username
        };
      }
      return a;
    });

    setAuctions(updatedAuctions);
    saveAuctions(updatedAuctions);
    alert(`🎉 Congratulations! You bought ${auc.card.name} (${auc.card.rating} OVR) for 🪙 ${auc.buyNowPrice.toLocaleString()} Coins!`);
  };

  const activeAuctions = auctions.filter((a) => a.status === 'ACTIVE' && a.expiresAt > nowTick);
  const myListings = auctions.filter((a) => a.sellerUsername.toLowerCase() === currentUser.username.toLowerCase());
  const historyAuctions = auctions.filter((a) => a.status !== 'ACTIVE' || a.expiresAt <= nowTick);

  return (
    <div id="bidding-market-container" className="w-full flex flex-col gap-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-cyan-950 via-teal-900 to-black border-2 border-cyan-500/50 rounded-3xl p-6 shadow-[0_0_40px_rgba(6,182,212,0.3)]">
        <div className="flex flex-wrap items-center justify-between gap-4 z-10 relative">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-tr from-cyan-400 to-teal-500 rounded-2xl flex items-center justify-center text-black font-black text-3xl shadow-lg">
              🔨
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-cyan-300 bg-cyan-500/20 px-2.5 py-0.5 rounded border border-cyan-500/40">
                  LIVE AUCTION HOUSE
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded">
                  {activeAuctions.length} ACTIVE BIDS
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
                SQUAD PLAYER BIDDING MARKET
              </h1>
            </div>
          </div>

          <button
            onClick={() => setIsCreatingAuction(!isCreatingAuction)}
            className="px-5 py-3 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl transition cursor-pointer flex items-center gap-2"
          >
            <span>{isCreatingAuction ? '✕ CANCEL LISTING' : '➕ PLACE PLAYER FOR BID'}</span>
          </button>
        </div>
      </div>

      {/* Create Listing Drawer */}
      {isCreatingAuction && (
        <form onSubmit={handleCreateAuction} className="bg-neutral-900 border-2 border-cyan-500/60 rounded-3xl p-6 flex flex-col gap-4 shadow-2xl animate-in fade-in">
          <h3 className="text-lg font-black text-cyan-300 flex items-center gap-2">
            <span>🎴</span>
            <span>PUT CARD UP FOR AUCTION</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                SELECT PLAYER FROM YOUR CLUB
              </label>
              <select
                required
                value={selectedCardId}
                onChange={(e) => setSelectedCardId(e.target.value)}
                className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
              >
                <option value="">-- Choose a Card ({currentUser.inventory.length} Available) --</option>
                {currentUser.inventory.map((card) => (
                  <option key={card.id} value={card.id}>
                    [{card.rating} OVR] {card.name} ({card.position} - {card.rarity})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                STARTING BID (COINS)
              </label>
              <input
                type="number"
                required
                min={10000}
                step={50000}
                value={startingBidInput}
                onChange={(e) => setStartingBidInput(Number(e.target.value))}
                className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                BUY IT NOW PRICE (COINS)
              </label>
              <input
                type="number"
                required
                min={startingBidInput}
                step={100000}
                value={buyNowInput}
                onChange={(e) => setBuyNowInput(Number(e.target.value))}
                className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-400">AUCTION DURATION:</span>
              {[1, 6, 24].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setDurationHours(h)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer ${
                    durationHours === h ? 'bg-cyan-500 text-black' : 'bg-white/10 text-gray-300'
                  }`}
                >
                  {h} Hours
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow cursor-pointer transition"
            >
              CONFIRM & POST AUCTION ➔
            </button>
          </div>
        </form>
      )}

      {/* Tabs */}
      <div className="flex bg-neutral-900 p-1 rounded-2xl border border-white/10 max-w-lg">
        <button
          onClick={() => setActiveTab('LIVE_AUCTIONS')}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition uppercase tracking-wider ${
            activeTab === 'LIVE_AUCTIONS'
              ? 'bg-cyan-500 text-black shadow-lg'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          LIVE AUCTIONS ({activeAuctions.length})
        </button>
        <button
          onClick={() => setActiveTab('MY_LISTINGS')}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition uppercase tracking-wider ${
            activeTab === 'MY_LISTINGS'
              ? 'bg-cyan-500 text-black shadow-lg'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          MY LISTINGS ({myListings.length})
        </button>
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition uppercase tracking-wider ${
            activeTab === 'HISTORY'
              ? 'bg-cyan-500 text-black shadow-lg'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          ENDED ({historyAuctions.length})
        </button>
      </div>

      {/* Auction Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(activeTab === 'LIVE_AUCTIONS'
          ? activeAuctions
          : activeTab === 'MY_LISTINGS'
          ? myListings
          : historyAuctions
        ).map((auc) => {
          const hasBids = auc.bidHistory && auc.bidHistory.length > 0;
          const minBid = hasBids ? auc.currentBid + 50000 : auc.startingBid;
          const isMyListing = auc.sellerUsername.toLowerCase() === currentUser.username.toLowerCase();
          const isHighestBidder = auc.highestBidderUsername?.toLowerCase() === currentUser.username.toLowerCase();
          const timeText = formatTimeRemaining(auc.expiresAt);

          return (
            <div
              key={auc.id}
              className={`bg-neutral-900 border-2 ${
                isHighestBidder ? 'border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.3)]' : 'border-white/10 hover:border-cyan-400/60'
              } rounded-3xl p-5 flex flex-col gap-4 shadow-xl transition relative overflow-hidden`}
            >
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                  Seller: <span className="text-cyan-400 font-black">@{auc.sellerUsername}</span>
                </span>
                {auc.status === 'SOLD' ? (
                  <span className="bg-green-500 text-black font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                    SOLD ✅
                  </span>
                ) : auc.status === 'EXPIRED_UNSOLD' || (auc.status === 'ACTIVE' && auc.expiresAt <= nowTick) ? (
                  <span className="bg-red-500/20 text-red-400 border border-red-500/40 font-mono text-[10px] px-2.5 py-0.5 rounded-full">
                    EXPIRED 🛑
                  </span>
                ) : (
                  <span className="bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-mono text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                    ⏱️ {timeText}
                  </span>
                )}
              </div>

              {/* FC Card Preview */}
              <div className="flex justify-center my-1 scale-95 hover:scale-100 transition duration-300">
                <FCPlayerCard card={auc.card} size="md" />
              </div>

              {/* Bid Info Box */}
              <div className="bg-black/80 rounded-2xl p-3 border border-white/10 space-y-2 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-[10px] uppercase">
                    {hasBids ? 'Current High Bid' : 'Starting Bid'}
                  </span>
                  <span className="text-amber-400 font-black text-sm">
                    🪙 {auc.currentBid.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-400">Highest Bidder</span>
                  <span className={`font-bold ${isHighestBidder ? 'text-amber-300 underline font-black' : 'text-emerald-400'}`}>
                    {auc.highestBidderUsername ? `@${auc.highestBidderUsername}` : 'No bids yet'}
                  </span>
                </div>

                <div className="flex justify-between items-center border-t border-white/10 pt-2 text-[11px]">
                  <span className="text-gray-400">Buy It Now</span>
                  <span className="text-cyan-300 font-black">
                    🪙 {auc.buyNowPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              {auc.status === 'ACTIVE' && auc.expiresAt > nowTick && !isMyListing && (
                <div className="space-y-2 pt-1">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step={50000}
                      min={minBid}
                      placeholder={`Min 🪙 ${minBid.toLocaleString()}`}
                      value={customBidAmount[auc.id] !== undefined ? customBidAmount[auc.id] : ''}
                      onChange={(e) =>
                        setCustomBidAmount({ ...customBidAmount, [auc.id]: Number(e.target.value) })
                      }
                      className="flex-1 bg-black/80 border border-white/20 rounded-xl px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      onClick={() => handlePlaceBid(auc.id)}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow transition"
                    >
                      PLACE BID 🔨
                    </button>
                  </div>

                  {/* Quick Increment Chips */}
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-400 justify-end">
                    <span>Quick:</span>
                    <button
                      onClick={() => setCustomBidAmount({ ...customBidAmount, [auc.id]: minBid })}
                      className="px-2 py-0.5 bg-white/10 hover:bg-white/20 rounded text-cyan-300 cursor-pointer"
                    >
                      Min
                    </button>
                    <button
                      onClick={() => setCustomBidAmount({ ...customBidAmount, [auc.id]: minBid + 100000 })}
                      className="px-2 py-0.5 bg-white/10 hover:bg-white/20 rounded text-amber-300 cursor-pointer"
                    >
                      +100k
                    </button>
                    <button
                      onClick={() => setCustomBidAmount({ ...customBidAmount, [auc.id]: minBid + 250000 })}
                      className="px-2 py-0.5 bg-white/10 hover:bg-white/20 rounded text-emerald-300 cursor-pointer"
                    >
                      +250k
                    </button>
                  </div>

                  <button
                    onClick={() => handleBuyNow(auc.id)}
                    className="w-full py-2.5 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow cursor-pointer transition"
                  >
                    BUY NOW FOR 🪙 {auc.buyNowPrice.toLocaleString()} ⚡
                  </button>
                </div>
              )}

              {/* Owner Indicator */}
              {isMyListing && auc.status === 'ACTIVE' && (
                <div className="text-[11px] font-mono text-cyan-300 text-center bg-cyan-950/60 p-2 rounded-xl border border-cyan-500/30">
                  👑 This is your listed auction item
                </div>
              )}

              {/* Bid History */}
              {auc.bidHistory && auc.bidHistory.length > 0 && (
                <div className="text-[10px] font-mono text-gray-400 border-t border-white/10 pt-2 space-y-1">
                  <div className="font-bold text-gray-300 uppercase">Recent Bid Logs ({auc.bidHistory.length}):</div>
                  {auc.bidHistory.slice(0, 3).map((b, i) => (
                    <div key={i} className="flex justify-between text-gray-400">
                      <span>@{b.bidderUsername}</span>
                      <span className="text-amber-300 font-bold">🪙 {b.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {(activeTab === 'LIVE_AUCTIONS'
          ? activeAuctions
          : activeTab === 'MY_LISTINGS'
          ? myListings
          : historyAuctions
        ).length === 0 && (
          <div className="col-span-full bg-neutral-900 border border-white/10 rounded-3xl p-12 text-center text-gray-400">
            <div className="text-4xl mb-3">🔨</div>
            <h3 className="text-lg font-black text-white">NO AUCTIONS IN THIS TAB</h3>
            <p className="text-xs text-gray-500 mt-1">
              {activeTab === 'LIVE_AUCTIONS'
                ? 'Be the first player to place a card up for live auction!'
                : activeTab === 'MY_LISTINGS'
                ? 'You currently have no active player listings.'
                : 'No ended or expired auctions recorded yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
