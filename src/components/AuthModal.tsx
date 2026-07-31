import React, { useState } from 'react';
import { UserAccount } from '../types';
import { soundFx } from '../utils/audio';

interface AuthModalProps {
  allUsers: UserAccount[];
  onLoginSuccess: (user: UserAccount) => void;
  onRegisterSuccess?: (newUser: UserAccount) => void;
  onClose: () => void;
  canClose?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  allUsers,
  onLoginSuccess,
  onClose,
  canClose = true
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Preset squad with exact 9 usernames
  const AUTHORIZED_SQUAD = [
    { name: 'Faheem', username: 'FAHCR7', badge: '⚡ CR7' },
    { name: 'Hamad', username: 'Hamad', badge: '🔥 98 ST' },
    { name: 'Rinshan', username: 'Rinshan', badge: '💫 RW' },
    { name: 'Razan', username: 'Razan', badge: '🛡️ CM' },
    { name: 'Insaf', username: 'Isagi Insaf', badge: '🎯 Yoichi' },
    { name: 'Aban', username: 'Aban', badge: '🧤 GK' },
    { name: 'Hashid', username: 'Acid', badge: '🧪 Acid' },
    { name: 'Aydin', username: 'Aydin', badge: '👑 Master Admin' },
    { name: 'SpyBilal', username: 'SpyBilal', badge: '🕵️ Agent Spy' }
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedUser = username.trim().toLowerCase();
    const trimmedPass = password.trim();

    // Find account by username, frontName, or alias mapping
    const user = allUsers.find((u) => {
      const uName = u.username.toLowerCase();
      const fName = (u.frontName || '').toLowerCase();

      if (uName === trimmedUser) return true;
      if (fName === trimmedUser || fName.includes(trimmedUser)) return true;

      // Aliases
      if ((trimmedUser === 'faheem' || trimmedUser === 'fahcr7') && (uName === 'fahcr7' || fName.includes('faheem'))) return true;
      if ((trimmedUser === 'hamad') && (uName === 'hamad' || fName.includes('hamad'))) return true;
      if ((trimmedUser === 'rinshan') && (uName === 'rinshan' || fName.includes('rinshan'))) return true;
      if ((trimmedUser === 'razan' || trimmedUser === 'brazan67') && (uName === 'brazan67' || uName === 'razan' || fName.includes('razan'))) return true;
      if ((trimmedUser === 'insaf' || trimmedUser === 'isagi insaf') && (uName === 'isagi insaf' || fName.includes('insaf'))) return true;
      if ((trimmedUser === 'aban') && (uName === 'aban' || fName.includes('aban'))) return true;
      if ((trimmedUser === 'hashid' || trimmedUser === 'acid') && (uName === 'acid' || fName.includes('hashid'))) return true;
      if ((trimmedUser === 'aydin') && (uName === 'aydin' || fName.includes('aydin'))) return true;
      if ((trimmedUser === 'spybilal') && (uName === 'spybilal' || fName.includes('spybilal'))) return true;

      return false;
    });

    if (!user) {
      setErrorMsg('Unauthorized account name! Please select your player username below.');
      return;
    }

    // Check password (case-sensitive or exact match or trimmed)
    if (user.passwordHash !== password && user.passwordHash !== trimmedPass) {
      setErrorMsg(`Incorrect password for @${user.username}! Please enter your correct account password.`);
      return;
    }

    soundFx.playCoinSound();
    onLoginSuccess(user);
    onClose();
  };

  const handleSelectSquadMember = (squadUsername: string) => {
    setUsername(squadUsername);
    setPassword(''); // ONLY autofill username, keep password empty for privacy!
    setErrorMsg('');
  };

  return (
    <div id="auth-modal-overlay" className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl overflow-y-auto p-3 sm:p-6 flex items-center justify-center min-h-full">
      <div className="bg-neutral-950 border-2 border-emerald-500/50 rounded-3xl p-5 sm:p-8 max-w-lg w-full shadow-[0_0_50px_rgba(34,197,94,0.3)] relative my-auto max-h-[95vh] overflow-y-auto">
        {canClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white font-black text-sm flex items-center justify-center cursor-pointer transition"
          >
            ✕
          </button>
        )}

        {/* Modal Logo & Header */}
        <div className="flex flex-col items-center gap-2 mb-5 text-center">
          <div className="w-14 h-14 bg-gradient-to-tr from-green-500 via-emerald-600 to-green-400 rounded-2xl flex items-center justify-center border-2 border-white/20 shadow-[0_0_20px_rgba(34,197,94,0.5)] font-black italic text-3xl text-black">
            FC
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            PAPER <span className="text-green-400">FC</span> SQUAD LOGIN
          </h2>
          <p className="text-xs text-emerald-400 font-medium bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/40">
            🔒 Tap your player card to autofill username, then enter your password!
          </p>
        </div>

        {/* Quick Username Selection Grid */}
        <div className="mb-5">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 text-center">
            TAP PLAYER TO SELECT USERNAME
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {AUTHORIZED_SQUAD.map((member) => (
              <button
                key={member.username}
                type="button"
                onClick={() => handleSelectSquadMember(member.username)}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  username.toLowerCase() === member.username.toLowerCase() || (username.toLowerCase() === 'razan' && member.name === 'Razan')
                    ? 'border-emerald-400 bg-emerald-950/80 shadow-[0_0_15px_rgba(52,211,153,0.5)] scale-105'
                    : 'border-white/10 bg-black/60 hover:border-white/30 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white">{member.name}</span>
                  <span className="text-[9px] font-bold text-gray-400">{member.badge}</span>
                </div>
                <div className="text-[10px] font-mono text-emerald-400/90 truncate mt-1">
                  @{member.username}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 bg-red-500/20 border border-red-500/40 text-red-300 text-xs p-3 rounded-xl font-mono text-center">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
              USERNAME / PLAYER ID
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. FAHCR7, Hamad, Rinshan, Razan, Isagi Insaf, Aban, Acid, Aydin"
              className="w-full bg-black/80 border border-white/20 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-green-400"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
              ACCOUNT PASSWORD
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your private password"
              className="w-full bg-black/80 border border-white/20 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-green-400"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-400 hover:to-emerald-300 text-black font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl transition cursor-pointer mt-2 flex items-center justify-center gap-2"
          >
            <span>LOG IN TO SQUAD PORTAL</span>
            <span>➔</span>
          </button>
        </form>
      </div>
    </div>
  );
};
