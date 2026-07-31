import React, { useState, useEffect, useRef } from 'react';
import { UserAccount, ChatMessage, PlayerCard } from '../types';
import { getChatMessages, saveChatMessages, getStoredUsers } from '../utils/storage';
import { subscribeToChat, chatCol } from '../lib/firebase';
import { setDoc, doc } from 'firebase/firestore';
import { soundFx } from '../utils/audio';
import { FCPlayerCard } from './FCPlayerCard';

interface CommunityChatProps {
  currentUser: UserAccount;
  allUsers?: UserAccount[];
  onUpdateUser?: (updated: UserAccount) => void;
}

export const CommunityChat: React.FC<CommunityChatProps> = ({ currentUser, allUsers, onUpdateUser }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [textInput, setTextInput] = useState('');
  const [selectedShareCard, setSelectedShareCard] = useState<PlayerCard | null>(null);
  const [chatMode, setChatMode] = useState<'GLOBAL' | 'PRIVATE'>('GLOBAL');
  const [selectedFriend, setSelectedFriend] = useState<UserAccount | null>(null);
  const [friendSearchQuery, setFriendSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Available users list for searching
  const availableUsers: UserAccount[] = (allUsers && allUsers.length > 0 ? allUsers : getStoredUsers())
    .filter((u) => u.id !== currentUser.id && u.username !== currentUser.username)
    .filter((u) => {
      // Hide secret accounts from public search unless current user is that account
      if (u.id === 'usr-spybilal-secret' || u.username.toLowerCase() === 'spybilal') {
        return currentUser.id === 'usr-spybilal-secret' || currentUser.username.toLowerCase() === 'spybilal';
      }
      return true;
    });

  // Current user's friend list usernames
  const friendUsernames: string[] = currentUser.friends || [];
  const friendObjects = availableUsers.filter((u) => friendUsernames.includes(u.username));

  useEffect(() => {
    setMessages(getChatMessages());
    const unsub = subscribeToChat((freshMessages) => {
      if (freshMessages) {
        setMessages(freshMessages);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatMode, selectedFriend]);

  const handleToggleFriend = (targetUser: UserAccount) => {
    soundFx.playClick();
    const currentFriends = currentUser.friends || [];
    const isFriend = currentFriends.includes(targetUser.username);
    const updatedFriends = isFriend
      ? currentFriends.filter((name) => name !== targetUser.username)
      : [...currentFriends, targetUser.username];

    const updatedUser: UserAccount = {
      ...currentUser,
      friends: updatedFriends
    };

    if (onUpdateUser) {
      onUpdateUser(updatedUser);
    }
  };

  const handleStartPrivateChat = (targetUser: UserAccount) => {
    soundFx.playClick();
    // Ensure they are added to friends list if not already
    const currentFriends = currentUser.friends || [];
    if (!currentFriends.includes(targetUser.username)) {
      const updatedUser: UserAccount = {
        ...currentUser,
        friends: [...currentFriends, targetUser.username]
      };
      if (onUpdateUser) {
        onUpdateUser(updatedUser);
      }
    }

    setSelectedFriend(targetUser);
    setChatMode('PRIVATE');
    setFriendSearchQuery('');
    setShowSearchDropdown(false);
  };

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
      isAdmin: currentUser.isAdmin,
      ...(chatMode === 'PRIVATE' && selectedFriend
        ? {
            recipientUsername: selectedFriend.username,
            recipientFrontName: selectedFriend.frontName || selectedFriend.username
          }
        : {})
    };

    const updated = [...messages, newMessage];
    setMessages(updated);
    saveChatMessages(updated);

    // Save directly to Firestore doc
    setDoc(doc(chatCol, newMessage.id), newMessage).catch(() => {});

    setTextInput('');
    setSelectedShareCard(null);
  };

  // Filter messages based on global vs private mode
  const filteredMessages = messages.filter((msg) => {
    if (chatMode === 'GLOBAL') {
      // Global chat shows messages without recipient
      return !msg.recipientUsername;
    } else {
      // Private mode: if friend selected, show DM between me and friend
      if (!selectedFriend) return false;
      return (
        (msg.senderUsername === currentUser.username && msg.recipientUsername === selectedFriend.username) ||
        (msg.senderUsername === selectedFriend.username && msg.recipientUsername === currentUser.username)
      );
    }
  });

  // Matching search results for search bar
  const searchResults = friendSearchQuery.trim()
    ? availableUsers.filter(
        (u) =>
          u.username.toLowerCase().includes(friendSearchQuery.toLowerCase()) ||
          (u.frontName && u.frontName.toLowerCase().includes(friendSearchQuery.toLowerCase()))
      )
    : [];

  // Count unread or total private messages per friend
  const getPrivateCountForUser = (targetUsername: string) => {
    return messages.filter(
      (m) =>
        (m.senderUsername === targetUsername && m.recipientUsername === currentUser.username) ||
        (m.senderUsername === currentUser.username && m.recipientUsername === targetUsername)
    ).length;
  };

  return (
    <div id="community-chat-container" className="w-full flex flex-col gap-4 max-w-4xl mx-auto h-[82vh]">
      {/* Top Controls Header & Mode Switcher */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-black border-2 border-emerald-500/50 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-xl relative">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-black font-black text-2xl shadow-lg shrink-0">
            {chatMode === 'GLOBAL' ? '💬' : '🔒'}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black text-white truncate">
                {chatMode === 'GLOBAL' ? 'SQUAD CLUB ROOM' : selectedFriend ? `DM WITH @${selectedFriend.username}` : 'PRIVATE MESSAGES'}
              </h2>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-black px-2 py-0.5 rounded border border-emerald-500/40 shrink-0">
                {chatMode === 'GLOBAL' ? 'LIVE' : 'ENCRYPTED'}
              </span>
            </div>
            <p className="text-xs text-gray-400 font-mono truncate">
              {chatMode === 'GLOBAL'
                ? 'Chat with Faheem, Hamad, Rinshan, Razan, Insaf, Aban, Hashid & Aydin!'
                : selectedFriend
                ? `Direct private messaging session with ${selectedFriend.frontName || selectedFriend.username}`
                : 'Select a friend or search to start private messaging'}
            </p>
          </div>
        </div>

        {/* Global / Private Mode Selector Tabs */}
        <div className="flex items-center bg-black/60 p-1.5 rounded-2xl border border-white/10 shrink-0 gap-1">
          <button
            onClick={() => {
              soundFx.playClick();
              setChatMode('GLOBAL');
            }}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              chatMode === 'GLOBAL'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>🌐</span>
            <span>GLOBAL</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setChatMode('PRIVATE');
              if (!selectedFriend && friendObjects.length > 0) {
                setSelectedFriend(friendObjects[0]);
              }
            }}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-black transition cursor-pointer flex items-center gap-1.5 relative ${
              chatMode === 'PRIVATE'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>🔒</span>
            <span>FRIENDS DM</span>
            {friendUsernames.length > 0 && (
              <span className="bg-black/80 text-amber-300 text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                {friendUsernames.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Friends Search Bar */}
      <div className="relative w-full z-20">
        <div className="flex items-center bg-neutral-900 border-2 border-emerald-500/40 rounded-2xl p-2 gap-2 shadow-lg">
          <span className="text-emerald-400 font-bold text-sm pl-2">🔍</span>
          <input
            type="text"
            value={friendSearchQuery}
            onChange={(e) => {
              setFriendSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
            placeholder="Search friends or squad members to chat privately (e.g. Faheem, Hamad, Aydin...)"
            className="flex-1 bg-transparent text-white placeholder-gray-500 font-mono text-xs focus:outline-none"
          />
          {friendSearchQuery && (
            <button
              onClick={() => {
                setFriendSearchQuery('');
                setShowSearchDropdown(false);
              }}
              className="text-gray-400 hover:text-white font-black text-xs px-2"
            >
              ✕
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showSearchDropdown && friendSearchQuery.trim() !== '' && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-900 border-2 border-emerald-500/50 rounded-2xl p-3 shadow-2xl space-y-2 max-h-64 overflow-y-auto">
            <div className="text-[10px] uppercase font-mono font-bold text-gray-400 px-1">
              SEARCH RESULTS ({searchResults.length})
            </div>
            {searchResults.length === 0 ? (
              <div className="text-xs text-gray-500 font-mono p-2 text-center">
                No squad member found matching "{friendSearchQuery}"
              </div>
            ) : (
              searchResults.map((user) => {
                const isFriend = friendUsernames.includes(user.username);
                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between bg-black/60 hover:bg-white/5 p-2.5 rounded-xl border border-white/10 transition"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-black text-emerald-300 text-xs uppercase shrink-0">
                        {user.username.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-white truncate">
                            {user.frontName || user.username}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">@{user.username}</span>
                          {user.isAdmin && (
                            <span className="bg-amber-400 text-black font-black text-[8px] px-1 rounded">
                              ADMIN
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleToggleFriend(user)}
                        className={`px-2.5 py-1 text-[10px] font-black font-mono rounded-lg transition cursor-pointer border ${
                          isFriend
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                            : 'bg-white/10 text-gray-300 border-white/20 hover:bg-white/20'
                        }`}
                      >
                        {isFriend ? '⭐ FRIEND' : '➕ ADD FRIEND'}
                      </button>

                      <button
                        onClick={() => handleStartPrivateChat(user)}
                        className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-black text-[10px] font-mono rounded-lg shadow hover:brightness-110 transition cursor-pointer"
                      >
                        💬 CHAT PRIVATELY
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Friends DM Selector Sub-Bar (When in PRIVATE mode) */}
      {chatMode === 'PRIVATE' && (
        <div className="bg-neutral-900 border border-amber-500/30 rounded-2xl p-2.5 flex items-center gap-2 overflow-x-auto shadow-inner">
          <span className="text-xs font-mono font-bold text-amber-400 shrink-0 px-1">
            MY FRIENDS:
          </span>

          {availableUsers.map((friend) => {
            const isSelected = selectedFriend?.username === friend.username;
            const msgCount = getPrivateCountForUser(friend.username);
            const isFriend = friendUsernames.includes(friend.username);

            return (
              <button
                key={friend.id}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedFriend(friend);
                  if (!isFriend) {
                    handleToggleFriend(friend);
                  }
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black border-amber-300 shadow-md font-black'
                    : isFriend
                    ? 'bg-black/60 text-gray-200 border-white/15 hover:border-amber-400/50'
                    : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{friend.frontName || friend.username}</span>
                {msgCount > 0 && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-black text-amber-300 font-black' : 'bg-amber-500/30 text-amber-300'
                    }`}
                  >
                    {msgCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Messages Stream */}
      <div className="flex-1 bg-neutral-950 border-2 border-white/10 rounded-3xl p-4 sm:p-6 overflow-y-auto space-y-4 shadow-inner">
        {filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center text-gray-500 font-mono gap-2">
            <span className="text-4xl">{chatMode === 'GLOBAL' ? '💬' : '🔒'}</span>
            <p className="text-sm font-bold text-gray-300">
              {chatMode === 'GLOBAL'
                ? 'No global messages yet! Start the conversation.'
                : selectedFriend
                ? `No private messages with @${selectedFriend.username} yet. Send a direct message below!`
                : 'Select a friend or search to start private messaging!'}
            </p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
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
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 ${
                    isMe
                      ? msg.recipientUsername
                        ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-tr-none shadow-md border border-amber-400/40'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-none'
                      : msg.recipientUsername
                      ? 'bg-gradient-to-r from-amber-950/80 to-neutral-900 text-amber-100 border border-amber-500/50 rounded-tl-none'
                      : msg.isAdmin
                      ? 'bg-gradient-to-r from-amber-950/90 to-neutral-900 text-amber-100 border border-amber-500/50 rounded-tl-none'
                      : 'bg-neutral-900 border border-white/10 text-gray-200 rounded-tl-none'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-black text-emerald-300">
                        {msg.senderFrontName || msg.senderUsername}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">@{msg.senderUsername}</span>
                      
                      {msg.isAdmin && (
                        <span className="bg-amber-400 text-black font-black text-[9px] px-1.5 rounded uppercase">
                          👑 ADMIN
                        </span>
                      )}

                      {/* Private DM Badge */}
                      {msg.recipientUsername && (
                        <span className="bg-black/60 text-amber-300 text-[9px] font-mono px-1.5 rounded border border-amber-500/30 flex items-center gap-1">
                          🔒 DM to @{msg.recipientUsername}
                        </span>
                      )}

                      {/* Quick DM Button on global messages */}
                      {!isMe && !msg.recipientUsername && (
                        <button
                          onClick={() => {
                            const found = availableUsers.find((u) => u.username === msg.senderUsername);
                            if (found) {
                              handleStartPrivateChat(found);
                            }
                          }}
                          className="text-[9px] font-mono text-emerald-300 hover:text-white bg-black/40 hover:bg-emerald-500/20 px-1.5 py-0.5 rounded transition cursor-pointer"
                          title="Send Private Message"
                        >
                          💬 DM
                        </button>
                      )}
                    </div>
                    
                    <span className="text-[9px] text-gray-400 font-mono shrink-0">
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
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSendMessage} className="bg-neutral-900 border-2 border-white/10 rounded-2xl p-3 flex flex-col gap-2 shadow-xl">
        {chatMode === 'PRIVATE' && selectedFriend && (
          <div className="flex items-center justify-between bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30 text-xs">
            <span className="text-amber-300 font-bold font-mono flex items-center gap-1.5">
              <span>🔒 DIRECT MESSAGE TO:</span>
              <span className="text-white underline">@{selectedFriend.username} ({selectedFriend.frontName || selectedFriend.username})</span>
            </span>
            <button
              type="button"
              onClick={() => setChatMode('GLOBAL')}
              className="text-gray-400 hover:text-white font-mono text-[10px] uppercase"
            >
              Switch to Global 🌐
            </button>
          </div>
        )}

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
            placeholder={
              chatMode === 'PRIVATE' && selectedFriend
                ? `Private DM to ${selectedFriend.frontName || selectedFriend.username}...`
                : "Type message to squad..."
            }
            className="flex-1 bg-black/80 border border-white/20 rounded-xl px-4 py-2.5 text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-emerald-400"
          />

          <button
            type="submit"
            className={`px-5 py-2.5 font-black text-xs uppercase tracking-wider rounded-xl shadow cursor-pointer transition shrink-0 ${
              chatMode === 'PRIVATE'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black hover:brightness-110'
                : 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black'
            }`}
          >
            {chatMode === 'PRIVATE' ? 'SEND DM 🔒' : 'SEND ➔'}
          </button>
        </div>
      </form>
    </div>
  );
};
