import React, { useState } from 'react';
import { UserAccount } from '../types';
import { soundFx } from '../utils/audio';

interface UserProfileModalProps {
  currentUser: UserAccount;
  onUpdateUser: (updatedUser: UserAccount) => void;
  onClose: () => void;
}

const PRESET_AVATARS = [
  { label: '🔥 Zeral Flame', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400' },
  { label: '⚡ Electric Legend', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400' },
  { label: '👑 Golden King', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400' },
  { label: '🎯 Precision Striker', url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=400' },
  { label: '🛡️ Diamond Shield', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400' },
  { label: '🧤 Master Keeper', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400' }
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  currentUser,
  onUpdateUser,
  onClose
}) => {
  const [frontName, setFrontName] = useState(currentUser.frontName || currentUser.username);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || PRESET_AVATARS[0].url);
  const [customAvatarInput, setCustomAvatarInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playCoinSound();

    const finalAvatar = customAvatarInput.trim() || avatarUrl;

    const updated: UserAccount = {
      ...currentUser,
      frontName: frontName.trim() || currentUser.username,
      avatarUrl: finalAvatar
    };

    onUpdateUser(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div id="user-profile-modal-overlay" className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl overflow-y-auto p-4 flex items-center justify-center min-h-full">
      <div className="bg-neutral-950 border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[0_0_50px_rgba(34,197,94,0.3)] relative my-auto max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white font-black text-sm flex items-center justify-center cursor-pointer transition"
        >
          ✕
        </button>

        {/* Profile Header */}
        <div className="flex flex-col items-center gap-3 mb-6 text-center">
          <div className="relative">
            <img
              src={avatarUrl}
              alt={frontName}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.5)]"
            />
            {currentUser.isAdmin && (
              <span className="absolute -top-2 -right-2 bg-amber-400 text-black text-xs p-1 rounded-full font-black shadow-lg">
                👑
              </span>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {frontName || currentUser.username}
            </h2>
            <p className="text-xs text-gray-400 font-mono">
              Username: <span className="text-emerald-400 font-bold">@{currentUser.username}</span>
            </p>
          </div>
        </div>

        {/* Financial & Salary Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6 bg-black/60 p-3.5 rounded-2xl border border-white/10 text-xs font-mono">
          <div>
            <div className="text-gray-400 text-[10px] uppercase font-bold">Paper Cash Balance</div>
            <div className="text-green-400 font-black text-sm mt-0.5">
              ${currentUser.points.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-[10px] uppercase font-bold">FC Coins</div>
            <div className="text-amber-300 font-black text-sm mt-0.5">
              🪙 {currentUser.coins.toLocaleString()}
            </div>
          </div>
          <div className="col-span-2 pt-2 border-t border-white/10 flex justify-between items-center">
            <span className="text-gray-400 text-[10px] uppercase font-bold">Aydin Admin Salary Received</span>
            <span className="text-emerald-300 font-black">
              ${(currentUser.totalSalaryReceived || 0).toLocaleString()} 💰
            </span>
          </div>
        </div>

        {savedSuccess && (
          <div className="mb-4 bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs p-3 rounded-xl font-mono text-center animate-bounce">
            ✅ Profile settings updated successfully!
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
              FRONT NAME / DISPLAY NAME
            </label>
            <input
              type="text"
              required
              value={frontName}
              onChange={(e) => setFrontName(e.target.value)}
              placeholder="e.g. Faheem CR7, Hamad 98, Rinshan"
              className="w-full bg-black/80 border border-white/20 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-green-400"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
              CHOOSE AVATAR PICTURE
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {PRESET_AVATARS.map((av, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setAvatarUrl(av.url);
                    setCustomAvatarInput('');
                  }}
                  className={`p-1.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                    avatarUrl === av.url && !customAvatarInput
                      ? 'border-emerald-400 bg-emerald-950/60 shadow-[0_0_10px_rgba(52,211,153,0.4)]'
                      : 'border-white/10 bg-black/40 hover:border-white/30'
                  }`}
                >
                  <img src={av.url} alt={av.label} className="w-10 h-10 rounded-lg object-cover" />
                  <span className="text-[9px] text-gray-300 font-bold truncate w-full">{av.label}</span>
                </button>
              ))}
            </div>

            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
              OR PASTE CUSTOM PHOTO IMAGE URL
            </label>
            <input
              type="url"
              value={customAvatarInput}
              onChange={(e) => setCustomAvatarInput(e.target.value)}
              placeholder="https://..."
              className="w-full bg-black/80 border border-white/20 rounded-xl px-4 py-2 text-white font-mono text-xs focus:outline-none focus:border-green-400"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-400 hover:to-emerald-300 text-black font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl transition cursor-pointer mt-2"
          >
            SAVE PROFILE SETTINGS ➔
          </button>
        </form>
      </div>
    </div>
  );
};
