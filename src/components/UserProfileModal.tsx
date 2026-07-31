import React, { useState, useRef } from 'react';
import { UserAccount } from '../types';
import { soundFx } from '../utils/audio';
import { transferCoinsApi } from '../utils/storage';

interface UserProfileModalProps {
  currentUser: UserAccount;
  allUsers?: UserAccount[];
  onUpdateUser: (updatedUser: UserAccount) => void;
  onRefreshUsers?: () => void;
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
  allUsers = [],
  onUpdateUser,
  onRefreshUsers,
  onClose
}) => {
  const [frontName, setFrontName] = useState(currentUser.frontName || currentUser.username);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || PRESET_AVATARS[0].url);
  const [customAvatarInput, setCustomAvatarInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Transfer Coins State
  const [targetRecipient, setTargetRecipient] = useState('');
  const [transferAmount, setTransferAmount] = useState<number>(100000);
  const [transferStatus, setTransferStatus] = useState<{ msg: string; isError: boolean } | null>(null);
  const [isSending, setIsSending] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError('');
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, GIF, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Optimize and compress photo to 400x400 canvas
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round(height * (MAX_SIZE / width));
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round(width * (MAX_SIZE / height));
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setAvatarUrl(dataUrl);
          setCustomAvatarInput('');
          soundFx.playCoinSound();
        }
      };
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file from library.');
    };
    reader.readAsDataURL(file);
  };

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

  const handleSendCoins = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferStatus(null);
    if (!targetRecipient.trim()) {
      setTransferStatus({ msg: 'Please select or enter recipient username.', isError: true });
      return;
    }
    if (transferAmount <= 0) {
      setTransferStatus({ msg: 'Please enter a valid amount of FC Coins.', isError: true });
      return;
    }
    if (!currentUser.isAdmin && currentUser.coins < transferAmount) {
      setTransferStatus({ msg: `Insufficient FC Coins! You have 🪙 ${currentUser.coins.toLocaleString()}`, isError: true });
      return;
    }

    setIsSending(true);
    const res = await transferCoinsApi(currentUser.id, targetRecipient.trim(), transferAmount);
    setIsSending(false);

    if (res.success) {
      soundFx.playCoinSound();
      setTransferStatus({ msg: res.message, isError: false });
      if (onRefreshUsers) onRefreshUsers();
    } else {
      setTransferStatus({ msg: res.message, isError: true });
    }
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
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <img
              src={avatarUrl}
              alt={frontName}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.5)] group-hover:opacity-80 transition"
            />
            <div className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition text-white text-[10px] font-bold">
              <span>📷 CHANGE</span>
              <span>PHOTO</span>
            </div>
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
            ✅ Profile picture & name updated successfully!
          </div>
        )}

        {uploadError && (
          <div className="mb-4 bg-red-500/20 border border-red-500/50 text-red-300 text-xs p-3 rounded-xl font-mono text-center">
            ⚠️ {uploadError}
          </div>
        )}

        {/* Hidden File Input for Device Photo Library */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handlePhotoUpload}
          className="hidden"
        />

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
              PROFILE PICTURE
            </label>

            {/* Direct Device Photo Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2 border border-emerald-400/40 mb-3"
            >
              <span>📷 CHOOSE FROM PHOTO LIBRARY / GALLERY</span>
            </button>

            <div className="border-t border-white/10 pt-3">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                OR CHOOSE PRESET AVATAR
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
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                OR PASTE IMAGE URL
              </label>
              <input
                type="url"
                value={customAvatarInput}
                onChange={(e) => setCustomAvatarInput(e.target.value)}
                placeholder="https://..."
                className="w-full bg-black/80 border border-white/20 rounded-xl px-4 py-2 text-white font-mono text-xs focus:outline-none focus:border-green-400"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-400 hover:to-emerald-300 text-black font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl transition cursor-pointer mt-2"
          >
            SAVE PROFILE SETTINGS ➔
          </button>
        </form>

        {/* Transfer FC Coins to Player Account Section */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <span>🪙 SEND FC COINS TO FRIEND</span>
          </h3>

          <form onSubmit={handleSendCoins} className="space-y-3 bg-black/50 p-4 rounded-2xl border border-amber-500/30">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                RECIPIENT PLAYER ACCOUNT
              </label>
              <select
                value={targetRecipient}
                onChange={(e) => setTargetRecipient(e.target.value)}
                className="w-full bg-neutral-900 border border-white/20 rounded-xl px-3 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="">Select player account...</option>
                {allUsers
                  .filter((u) => u.username !== currentUser.username)
                  .map((u) => (
                    <option key={u.id} value={u.username}>
                      @{u.username} ({u.frontName || u.username}) - Bal: 🪙 {u.coins.toLocaleString()}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                AMOUNT TO SEND (FC COINS 🪙)
              </label>
              <input
                type="number"
                min="1000"
                step="1000"
                value={transferAmount}
                onChange={(e) => setTransferAmount(Number(e.target.value))}
                className="w-full bg-neutral-900 border border-white/20 rounded-xl px-3 py-2 text-amber-300 font-mono font-bold text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            {transferStatus && (
              <div
                className={`text-xs p-2.5 rounded-xl font-mono ${
                  transferStatus.isError
                    ? 'bg-red-500/20 border border-red-500/50 text-red-300'
                    : 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                }`}
              >
                {transferStatus.msg}
              </div>
            )}

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition cursor-pointer disabled:opacity-50"
            >
              {isSending ? 'SENDING COINS...' : '💸 TRANSFER COINS NOW'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

