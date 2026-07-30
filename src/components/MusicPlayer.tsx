import React, { useState, useEffect } from 'react';
import { fcMusicEngine, FC_MOBILE_TRACKS, TrackInfo } from '../utils/musicEngine';
import { soundFx } from '../utils/audio';

export const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(fcMusicEngine.getIsPlaying());
  const [isMuted, setIsMuted] = useState<boolean>(fcMusicEngine.getIsMuted());
  const [volume, setVolume] = useState<number>(fcMusicEngine.getVolume());
  const [currentTrack, setCurrentTrack] = useState<TrackInfo>(fcMusicEngine.getCurrentTrack());
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = fcMusicEngine.subscribe(() => {
      setIsPlaying(fcMusicEngine.getIsPlaying());
      setIsMuted(fcMusicEngine.getIsMuted());
      setVolume(fcMusicEngine.getVolume());
      setCurrentTrack(fcMusicEngine.getCurrentTrack());
    });
    return unsubscribe;
  }, []);

  const handleTogglePlay = () => {
    soundFx.playClick();
    fcMusicEngine.togglePlay();
  };

  const handleToggleMute = () => {
    soundFx.playClick();
    fcMusicEngine.toggleMute();
  };

  const handleNextTrack = () => {
    soundFx.playClick();
    fcMusicEngine.nextTrack();
  };

  const handlePrevTrack = () => {
    soundFx.playClick();
    fcMusicEngine.prevTrack();
  };

  const handleSelectTrack = (index: number) => {
    soundFx.playClick();
    fcMusicEngine.selectTrack(index);
    if (!fcMusicEngine.getIsPlaying()) {
      fcMusicEngine.play();
    }
  };

  const handleVolumeChange = (newVol: number) => {
    fcMusicEngine.setVolume(newVol);
    if (newVol > 0 && fcMusicEngine.getIsMuted()) {
      fcMusicEngine.setMute(false);
    }
  };

  return (
    <div id="fc-music-player-widget" className="relative z-30">
      {/* Compact Header Pill Bar */}
      <div className="flex items-center gap-2 bg-neutral-900/90 border border-emerald-500/40 px-3 py-1.5 rounded-2xl shadow-[0_0_20px_rgba(34,197,94,0.2)] backdrop-blur-md">
        {/* Animated Equalizer Visualizer */}
        <div className="flex items-end gap-0.5 h-4 w-4 shrink-0">
          <span className={`w-1 bg-green-400 rounded-t ${isPlaying && !isMuted ? 'animate-bounce h-4' : 'h-1.5'}`} style={{ animationDuration: '0.6s' }} />
          <span className={`w-1 bg-emerald-300 rounded-t ${isPlaying && !isMuted ? 'animate-bounce h-3' : 'h-2'}`} style={{ animationDuration: '0.4s' }} />
          <span className={`w-1 bg-amber-400 rounded-t ${isPlaying && !isMuted ? 'animate-bounce h-4' : 'h-1'}`} style={{ animationDuration: '0.8s' }} />
        </div>

        {/* Current Track Label */}
        <div className="flex flex-col text-left max-w-[120px] sm:max-w-[160px] overflow-hidden">
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest leading-none">
              FC OST 🎵
            </span>
            <span className="text-[8px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1 rounded font-mono">
              {currentTrack.genre.split(' ')[0]}
            </span>
          </div>
          <span className="text-xs font-black text-white truncate leading-tight">
            {currentTrack.title}
          </span>
        </div>

        {/* Controls: Play/Pause, Next */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleTogglePlay}
            title={isPlaying ? 'Pause FC Music' : 'Play FC Music'}
            className="w-7 h-7 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black flex items-center justify-center text-xs shadow-md transition cursor-pointer"
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          <button
            onClick={handleNextTrack}
            title="Next Track"
            className="w-7 h-7 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center text-xs transition cursor-pointer"
          >
            ⏭
          </button>

          <button
            onClick={handleToggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
            className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition cursor-pointer ${
              isMuted ? 'bg-red-500/30 text-red-400 border border-red-500/40' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            {isMuted || volume === 0 ? '🔇' : '🔊'}
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setIsExpanded(!isExpanded);
            }}
            title="Music Settings & Song List"
            className={`px-2 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer border ${
              isExpanded ? 'bg-green-500 text-black border-green-300' : 'bg-black/60 text-gray-300 border-white/20 hover:bg-white/10'
            }`}
          >
            SONGS 🎧
          </button>
        </div>
      </div>

      {/* Expanded Track Selection & Volume Panel */}
      {isExpanded && (
        <div className="absolute right-0 top-12 w-80 bg-neutral-950 border-2 border-emerald-500/60 rounded-3xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.9)] z-50 flex flex-col gap-3 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-base">⚽</span>
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                FC MOBILE OFFICIAL SOUNDTRACK
              </h4>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>

          {/* Volume Control Section */}
          <div className="bg-black/80 border border-white/10 p-3 rounded-2xl flex flex-col gap-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-gray-300">
              <span className="flex items-center gap-1 font-bold text-emerald-400">
                🔊 VOLUME ({isMuted ? '0%' : `${Math.round(volume * 100)}%`})
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleVolumeChange(0.15)}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${volume <= 0.2 && !isMuted ? 'bg-green-500 text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                >
                  LOW
                </button>
                <button
                  onClick={() => handleVolumeChange(0.5)}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${volume > 0.2 && volume <= 0.6 && !isMuted ? 'bg-green-500 text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                >
                  MED
                </button>
                <button
                  onClick={() => handleVolumeChange(1.0)}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${volume > 0.6 && !isMuted ? 'bg-green-500 text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                >
                  MAX
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs">🔈</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-green-400 cursor-pointer h-1.5 bg-gray-800 rounded-lg"
              />
              <span className="text-xs">🔊</span>
            </div>
          </div>

          {/* Songs List */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
              SELECT TRACK ({FC_MOBILE_TRACKS.length})
            </span>
            {FC_MOBILE_TRACKS.map((track, idx) => {
              const isSelected = fcMusicEngine.getCurrentTrackIndex() === idx;
              return (
                <div
                  key={track.id}
                  onClick={() => handleSelectTrack(idx)}
                  className={`p-2.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-950 via-teal-900 to-black border-emerald-400 text-white shadow-md'
                      : 'bg-black/60 border-white/10 text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs bg-gradient-to-tr ${track.gradient}`}>
                      {track.icon}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-white leading-tight flex items-center gap-1.5">
                        {track.title}
                        {isSelected && isPlaying && (
                          <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
                        )}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {track.artist}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-gray-300 font-mono">
                      {track.bpm} BPM
                    </span>
                    <button
                      className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center ${
                        isSelected && isPlaying
                          ? 'bg-green-500 text-black'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      {isSelected && isPlaying ? '⏸' : '▶'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[10px] text-gray-400 text-center font-mono border-t border-white/10 pt-2">
            FC Mobile Soundtrack • Continuous High-Quality Audio
          </div>
        </div>
      )}
    </div>
  );
};
