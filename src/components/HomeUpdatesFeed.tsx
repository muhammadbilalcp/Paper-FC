import React, { useState } from 'react';
import { HomeScreenUpdate, UserAccount } from '../types';
import { soundFx } from '../utils/audio';

interface HomeUpdatesFeedProps {
  updates: HomeScreenUpdate[];
  currentUser: UserAccount;
  onAddUpdate: (newUpdate: HomeScreenUpdate) => void;
  onDeleteUpdate: (updateId: string) => void;
}

export const HomeUpdatesFeed: React.FC<HomeUpdatesFeedProps> = ({
  updates,
  currentUser,
  onAddUpdate,
  onDeleteUpdate
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form states for Aydin to add update
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('World Cup Update');
  const [badge, setBadge] = useState('LIVE NOW 🏆');
  const [description, setDescription] = useState('');
  const [iconEmoji, setIconEmoji] = useState('🏆');
  const [bannerGradient, setBannerGradient] = useState('from-amber-950 via-yellow-900 to-emerald-950');

  const categories = ['ALL', 'World Cup Update', 'Premier League Update', 'Champions League', 'TOTS Event'];

  const filteredUpdates = selectedCategory === 'ALL'
    ? updates
    : updates.filter((u) => u.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  const handleCreateUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    soundFx.playFanfare();

    const newUpdate: HomeScreenUpdate = {
      id: `upd-${Date.now()}`,
      title: title.trim(),
      category,
      badge: badge.trim() || 'LIVE ⚡',
      description: description.trim(),
      bannerGradient,
      iconEmoji: iconEmoji || '⚽',
      createdAt: Date.now(),
      author: `${currentUser.username} (Admin)`,
      isHot: true
    };

    onAddUpdate(newUpdate);

    // Reset form
    setTitle('');
    setDescription('');
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Feed Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-black/60 border border-white/10 p-4 rounded-3xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-green-500 to-emerald-400 rounded-2xl flex items-center justify-center text-black font-black text-xl shadow-lg">
            📢
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white tracking-tight">HOME SCREEN UPDATES & EVENTS</h2>
              <span className="bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                LIVE FEED
              </span>
            </div>
            <p className="text-xs text-gray-400">Official updates from Master Admin Aydin</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {currentUser.isAdmin && (
            <button
              onClick={() => {
                soundFx.playClick();
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-400 hover:to-green-300 text-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition cursor-pointer flex items-center gap-1.5"
            >
              <span>👑</span>
              <span>POST HOME UPDATE</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === cat
                ? 'bg-green-500 text-black shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Updates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUpdates.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 font-mono text-xs bg-white/5 rounded-3xl border border-white/10">
            No updates found for this category. Aydin can post new updates anytime!
          </div>
        ) : (
          filteredUpdates.map((item) => (
            <div
              key={item.id}
              className={`relative overflow-hidden rounded-3xl border-2 border-white/10 bg-gradient-to-br ${item.bannerGradient} p-5 flex flex-col justify-between gap-4 shadow-xl hover:border-green-400/80 transition-all duration-300 group`}
            >
              <div className="flex justify-between items-start gap-2">
                <span className="px-3 py-1 bg-black/70 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-black text-amber-300 uppercase tracking-wider">
                  {item.badge}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-300 bg-black/50 px-2.5 py-0.5 rounded-full border border-white/10">
                    {item.category}
                  </span>
                  {currentUser.isAdmin && (
                    <button
                      onClick={() => onDeleteUpdate(item.id)}
                      title="Delete Update (Admin)"
                      className="w-6 h-6 bg-red-500/30 hover:bg-red-500 text-red-200 hover:text-white rounded-full flex items-center justify-center text-xs transition cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-3 items-start my-1">
                <div className="text-3xl shrink-0 bg-black/40 p-2 rounded-2xl border border-white/10">
                  {item.iconEmoji}
                </div>
                <div className="flex flex-col">
                  <h3 className="text-lg font-black text-white tracking-tight leading-snug group-hover:text-amber-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-200/90 mt-1 font-medium leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 border-t border-white/10 pt-3">
                <span>By: <strong className="text-green-400">{item.author}</strong></span>
                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Aydin Modal to Add New Update */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-950 border-2 border-emerald-500/60 rounded-3xl p-6 max-w-lg w-full shadow-[0_0_40px_rgba(34,197,94,0.3)] relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white font-black text-sm flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-black font-black text-xl shadow-lg">
                👑
              </div>
              <div>
                <h3 className="text-xl font-black text-white">POST HOME SCREEN UPDATE</h3>
                <p className="text-xs text-emerald-400 font-mono">Master Admin Aydin Broadcast</p>
              </div>
            </div>

            <form onSubmit={handleCreateUpdate} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">UPDATE TITLE</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. World Cup Final Knockouts or Premier League TOTS"
                  className="w-full mt-1 bg-black/80 border border-white/20 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-green-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CATEGORY</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full mt-1 bg-black/80 border border-white/20 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-green-400"
                  >
                    <option value="World Cup Update">World Cup Update</option>
                    <option value="Premier League Update">Premier League Update</option>
                    <option value="Champions League">Champions League</option>
                    <option value="TOTS Event">TOTS Event</option>
                    <option value="Community Event">Community Event</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">BADGE TAG</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. LIVE NOW 🏆 or NEW DROP ⚽"
                    className="w-full mt-1 bg-black/80 border border-white/20 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-green-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ICON EMOJI</label>
                  <input
                    type="text"
                    value={iconEmoji}
                    onChange={(e) => setIconEmoji(e.target.value)}
                    placeholder="🏆, 🦁, ⚽, ⭐, 👑"
                    className="w-full mt-1 bg-black/80 border border-white/20 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-green-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">THEME COLOR</label>
                  <select
                    value={bannerGradient}
                    onChange={(e) => setBannerGradient(e.target.value)}
                    className="w-full mt-1 bg-black/80 border border-white/20 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-green-400"
                  >
                    <option value="from-amber-950 via-yellow-900 to-emerald-950">Gold & Emerald (World Cup)</option>
                    <option value="from-blue-950 via-indigo-900 to-purple-950">Blue & Purple (Premier League)</option>
                    <option value="from-sky-950 via-blue-900 to-black">Midnight Blue (Champions League)</option>
                    <option value="from-red-950 via-rose-900 to-black">Crimson Red (Special Event)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">UPDATE DESCRIPTION</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the update, featured player drops, coin boosts, or special event packs..."
                  className="w-full mt-1 bg-black/80 border border-white/20 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-green-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-400 hover:to-green-300 text-black font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg transition cursor-pointer mt-2"
              >
                PUBLISH HOME SCREEN UPDATE NOW 🚀
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
