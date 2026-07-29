import React, { useState } from 'react';
import { UserAccount } from '../types';
import { soundFx } from '../utils/audio';

interface AuthModalProps {
  allUsers: UserAccount[];
  onLoginSuccess: (user: UserAccount) => void;
  onRegisterSuccess: (newUser: UserAccount) => void;
  onClose: () => void;
  canClose?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  allUsers,
  onLoginSuccess,
  onRegisterSuccess,
  onClose,
  canClose = true
}) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('REGISTER');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedUser = username.trim();
    const user = allUsers.find((u) => u.username.toLowerCase() === trimmedUser.toLowerCase());

    if (!user) {
      setErrorMsg('Account not found! Please check your username or create a new account.');
      return;
    }

    if (user.passwordHash !== password) {
      setErrorMsg('Incorrect password! Please try again.');
      return;
    }

    soundFx.playCoinSound();
    onLoginSuccess(user);
    onClose();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedUser = username.trim();
    if (!trimmedUser || !password) {
      setErrorMsg('Username and password are required!');
      return;
    }

    const existing = allUsers.find((u) => u.username.toLowerCase() === trimmedUser.toLowerCase());
    if (existing) {
      setErrorMsg('Username is already taken! Please choose a different name or log in.');
      return;
    }

    const isAdmin = trimmedUser.toLowerCase() === 'aydin';

    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      username: trimmedUser,
      passwordHash: password,
      isAdmin,
      coins: isAdmin ? 999999999 : 0,
      points: isAdmin ? 999999999 : 0,
      inventory: [],
      squad: {
        formation: '4-3-3',
        starting11: {},
        bench: []
      },
      packsOpened: 0,
      createdAt: Date.now()
    };

    soundFx.playCoinSound();
    onRegisterSuccess(newUser);
    onClose();
  };

  return (
    <div id="auth-modal-overlay" className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-neutral-950 border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[0_0_50px_rgba(34,197,94,0.3)] relative overflow-hidden">
        {canClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white font-black text-sm flex items-center justify-center cursor-pointer transition"
          >
            ✕
          </button>
        )}

        {/* Modal Logo & Header */}
        <div className="flex flex-col items-center gap-2 mb-6 text-center">
          <div className="w-14 h-14 bg-gradient-to-tr from-green-500 via-emerald-600 to-green-400 rounded-2xl flex items-center justify-center border-2 border-white/20 shadow-[0_0_20px_rgba(34,197,94,0.5)] font-black italic text-3xl text-black">
            FC
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            PAPER <span className="text-green-400">FC</span> GATEWAY
          </h2>
          <p className="text-xs text-gray-400">
            Welcome! Log in or create an account to start playing.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex bg-black/80 p-1 rounded-2xl border border-white/15 mb-6">
          <button
            onClick={() => {
              setErrorMsg('');
              setMode('REGISTER');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition cursor-pointer uppercase tracking-wider ${
              mode === 'REGISTER'
                ? 'bg-gradient-to-r from-green-500 to-emerald-400 text-black shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            CREATE ACCOUNT
          </button>
          <button
            onClick={() => {
              setErrorMsg('');
              setMode('LOGIN');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition cursor-pointer uppercase tracking-wider ${
              mode === 'LOGIN'
                ? 'bg-gradient-to-r from-green-500 to-emerald-400 text-black shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            LOG IN
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 bg-red-500/20 border border-red-500/40 text-red-300 text-xs p-3 rounded-xl font-mono text-center">
            {errorMsg}
          </div>
        )}

        {/* Form for Normal Register or Login */}
        <form onSubmit={mode === 'LOGIN' ? handleLogin : handleRegister} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
              USERNAME
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={mode === 'REGISTER' ? 'Choose username (e.g. Aydin or Alex)' : 'Enter your username'}
              className="w-full bg-black/80 border border-white/20 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-green-400"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
              PASSWORD
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full bg-black/80 border border-white/20 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-green-400"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-400 hover:to-emerald-300 text-black font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl transition cursor-pointer mt-2"
          >
            {mode === 'LOGIN' ? 'LOG IN NOW ➔' : 'CREATE ACCOUNT NOW ➔'}
          </button>
        </form>
      </div>
    </div>
  );
};

