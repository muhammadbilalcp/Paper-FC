import React, { useState, useEffect, useRef } from 'react';
import { UserAccount, ChatMessage, PlayerCard } from '../types';
import { getChatMessages, saveChatMessages } from '../utils/storage';
import { soundFx } from '../utils/audio';
import { FCPlayerCard } from './FCPlayerCard';

interface CommunityChatProps {
  currentUser: UserAccount;
}

export const CommunityChat: React.FC<CommunityChatProps> = ({ currentUser }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [textInput, setTextInput] = useState('');
  const [selectedShareCard, setSelectedShareCard] = useState<PlayerCard | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(getChatMessages());
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() && !selectedShareCard) return;

    soundFx.playClick();

    const newMessage: ChatMessage = {
      id: `chat-${Date.now()}`,
      senderUsername: currentUser.username,
      senderFrontName: currentUser.frontName || currentUser.username,
      senderAvatar: currentUser.avatarUrl,
      text: textInput.trim(),
      timestamp: Date.now(),
      sharedCard: selectedShareCard || undefined,
      isAdmin: currentUser.isAdmin
    };

    const updated = [...messages, newMessage];
    setMessages(updated);
    saveChatMessages(updated);

    setTextInput('');
    setSelectedShareCard(null);
  };

  return (
    <div id="community-chat-container" className="w-full flex flex-col gap-4 max-w-4xl mx-auto h-[80vh]">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-black border-2 border-emerald-500/50 rounded-3xl p-5 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-black font-black text-2xl shadow-lg">
            💬
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">SQUAD CLUB ROOM</h2>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-black px-2 py-0.5 rounded border border-emerald-500/40">
                LIVE
              </span>
            </div>
            <p className="text-xs text-gray-400 font-mono">
              Chat with Faheem, Hamad, Rinshan, Razan, Insaf, Aban, Hashid & Aydin!
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono bg-black/50 px-3 py-1.5 rounded-xl border border-white/10">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-gray-300 font-bold">Online: {currentUser.frontName || currentUser.username}</span>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 bg-neutral-950 border-2 border-white/10 rounded-3xl p-4 sm:p-6 overflow-y-auto space-y-4 shadow-inner">
        {messages.map((msg) => {
          const isMe = msg.senderUsername === currentUser.username;
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'} items-start`}
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shrink-0 shadow">
                {msg.senderAvatar ? (
                  <img src={msg.senderAvatar} alt={msg.senderUsername} className="w-full h-full rounded-lg object-cover" />
                ) : (
                  <div className="w-full h-full bg-neutral-900 rounded-lg flex items-center justify-center text-emerald-300 font-black text-xs uppercase">
                    {msg.senderUsername.charAt(0)}
                  </div>
                )}
              </div>

              {/* Message Content Bubble */}
              <div
                className={`max-w-[80%] sm:max-w-[70%] rounded-2xl p-3.5 ${
                  isMe
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-none'
                    : msg.isAdmin
                    ? 'bg-gradient-to-r from-amber-950/90 to-neutral-900 text-amber-100 border border-amber-500/50 rounded-tl-none'
                    : 'bg-neutral-900 border border-white/10 text-gray-200 rounded-tl-none'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-emerald-300">
                      {msg.senderFrontName || msg.senderUsername}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">@{msg.senderUsername}</span>
                    {msg.isAdmin && (
                      <span className="bg-amber-400 text-black font-black text-[9px] px-1.5 rounded uppercase">
                        👑 ADMIN
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] text-gray-400 font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {msg.text && <p className="text-xs sm:text-sm leading-relaxed">{msg.text}</p>}

                {/* Shared Card Display */}
                {msg.sharedCard && (
                  <div className="mt-3 pt-2 border-t border-white/20">
                    <div className="text-[10px] uppercase font-bold text-amber-300 mb-1 flex items-center gap-1">
                      <span>🎴 SHARED PLAYER CARD:</span>
                    </div>
                    <div className="flex justify-center scale-90">
                      <FCPlayerCard card={msg.sharedCard} size="sm" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSendMessage} className="bg-neutral-900 border-2 border-white/10 rounded-2xl p-3 flex flex-col gap-2 shadow-xl">
        {selectedShareCard && (
          <div className="flex items-center justify-between bg-black/60 px-3 py-1.5 rounded-xl border border-emerald-500/40 text-xs">
            <span className="text-emerald-300 font-bold font-mono">
              🎴 Attached: [{selectedShareCard.rating} OVR] {selectedShareCard.name}
            </span>
            <button
              type="button"
              onClick={() => setSelectedShareCard(null)}
              className="text-gray-400 hover:text-white font-black"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex gap-2 items-center">
          {/* Share Card Picker Dropdown */}
          <select
            value={selectedShareCard?.id || ''}
            onChange={(e) => {
              const card = currentUser.inventory.find((c) => c.id === e.target.value);
              setSelectedShareCard(card || null);
            }}
            className="bg-black/80 border border-white/20 rounded-xl px-2 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-400 max-w-[140px] sm:max-w-[200px]"
          >
            <option value="">🎴 Share Card...</option>
            {currentUser.inventory.map((c) => (
              <option key={c.id} value={c.id}>
                [{c.rating}] {c.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type message to squad..."
            className="flex-1 bg-black/80 border border-white/20 rounded-xl px-4 py-2.5 text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-emerald-400"
          />

          <button
            type="submit"
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow cursor-pointer transition shrink-0"
          >
            SEND ➔
          </button>
        </div>
      </form>
    </div>
  );
};
