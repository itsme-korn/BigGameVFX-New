/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Station, AudioTrack } from './types';
import { INITIAL_TRACKS } from './data';
import StationSelector from './components/StationSelector';
import AudioPlayer from './components/AudioPlayer';
import UploadModal from './components/UploadModal';
import { playSynthesizedSound } from './audioSynth';
import {
  Volume2,
  RefreshCw,
  Sparkles,
  ArrowLeft,
  Search,
  Shield,
  AudioLines
} from 'lucide-react';

const SILENT_AUDIO = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAAAD';

export default function App() {
  // Navigation & Filtering States
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom Track Repository (persisted in client localStorage)
  const [tracks, setTracks] = useState<AudioTrack[]>(() => {
    try {
      const savedStr = localStorage.getItem('big_game_vfx_tracks_v1');
      if (savedStr) {
        let saved = JSON.parse(savedStr) as AudioTrack[];
        // Clean up: delete all sounds in Stacking Blocks except the bomb ticking sound, phone sound, PROXIE - Bad Shawty, YOASOBI, and ซากกน (사기꾼)
        saved = saved.filter(t => t.station !== 'Stacking Blocks' || t.id === 'sb-bomb-timer' || t.id === 'sb-phone-sound' || t.id === 'sb-proxie-bad-shawty' || t.id === 'sb-yoasobi' || t.id === 'sb-sagikkun');

        // Clean up: delete all sounds in The Money Drop except the intro, the million pound drop timer, PROXIE - Bad Shawty, YOASOBI, and ซากกน (사기꾼)
        saved = saved.filter(t => t.station !== 'The Money Drop' || t.id === 'md-intro' || t.id === 'md-timer' || t.id === 'md-proxie-bad-shawty' || t.id === 'md-yoasobi' || t.id === 'md-sagikkun');

        // Clean up: delete tracks 1-3 if present (Attention Horn, Start Round Whistle, Base Cleared Level Fanfare)
        saved = saved.filter(t => 
          !t.title.toLowerCase().includes('attention horn') && 
          !t.title.toLowerCase().includes('start round whistle') && 
          !t.title.toLowerCase().includes('base cleared level')
        );

        // Merge latest default INITIAL_TRACKS into local storage to ensure new files are always available
        INITIAL_TRACKS.forEach((initTrack) => {
          const idx = saved.findIndex((t) => t.id === initTrack.id);
          if (idx !== -1) {
            saved[idx] = {
              ...saved[idx],
              ...initTrack
            };
          } else {
            saved.push(initTrack);
          }
        });
        return saved;
      }
      return INITIAL_TRACKS;
    } catch {
      return INITIAL_TRACKS;
    }
  });

  // Modal control
  const [showUpload, setShowUpload] = useState(false);

  // Unified audio player context management
  const [activeTrack, setActiveTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Keep reference to avoid stale closures in core stream event listeners
  const activeTrackRef = useRef<AudioTrack | null>(null);
  useEffect(() => {
    activeTrackRef.current = activeTrack;
  }, [activeTrack]);

  // Synchronise custom tracks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('big_game_vfx_tracks_v1', JSON.stringify(tracks));
    } catch (e) {
      console.error('Failed to preserve tracks in browser storage', e);
    }
  }, [tracks]);

  // Handle HTML Audio Lifecycle
  useEffect(() => {
    // Construct single audio context instance
    const audio = new Audio();
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const onAudioEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const onAudioError = (e: any) => {
      console.warn('Playback error caught on audio element:', e);
      if (!activeTrackRef.current || audio.src === '' || audio.src.startsWith('data:')) {
        // Suppress errors for blank paths or default silent wav
        return;
      }
      setIsPlaying(false);
      setAudioError('Playback failed: This audio track cannot be loaded. Please ensure the URL is valid, active, and supports direct HTTPS streaming.');
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onAudioEnded);
    audio.addEventListener('error', onAudioError);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onAudioEnded);
      audio.removeEventListener('error', onAudioError);
    };
  }, []);

  // Update audio source when dynamic active track changes
  useEffect(() => {
    if (!audioRef.current) return;
    setAudioError(null); // Clear errors on channel change

    if (activeTrack) {
      audioRef.current.src = activeTrack.url;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          console.warn('Playback gesture required or source error:', err);
          setIsPlaying(false);
          setAudioError('Media source error: Failed to initialize or play the requested trail. Please verify that this audio URL allows CORS access.');
        });
      }
    } else {
      audioRef.current.pause();
      // Ensure we load the base64 silent WAV instead of an empty string to keep browser state pristine
      audioRef.current.src = SILENT_AUDIO;
    }
  }, [activeTrack]);

  // Audio Play controls
  const handlePlayPauseToggle = (track: AudioTrack) => {
    if (!audioRef.current) return;

    if (activeTrack?.id === track.id) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch((err) => {
          console.error('Playback error:', err);
        });
        setIsPlaying(true);
      }
    } else {
      setActiveTrack(track);
      setIsPlaying(true);
      setCurrentTime(0);
    }
  };

  const handleSeek = (track: AudioTrack, time: number) => {
    if (!audioRef.current) return;
    
    if (activeTrack?.id === track.id) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    } else {
      // If scrubbed before play, set it as the active track and pause state
      setActiveTrack(track);
      setIsPlaying(false);
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.currentTime = time;
          setCurrentTime(time);
        }
      }, 50);
    }
  };

  const handleSaveTrack = (newTrack: AudioTrack) => {
    setTracks((prev) => [newTrack, ...prev]);
  };

  const handleDeleteTrack = (trackId: string) => {
    if (activeTrack?.id === trackId) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setActiveTrack(null);
      setIsPlaying(false);
    }
    setTracks((prev) => prev.filter((t) => t.id !== trackId));
  };

  const handleResetTracks = () => {
    if (confirm('Are you sure you want to reset all tracks to original template? This removes any manually uploaded files.')) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setActiveTrack(null);
      setIsPlaying(false);
      setTracks(INITIAL_TRACKS);
      alert('Sound effects database restored.');
    }
  };

  // Switch Stations View
  const handleExitToHome = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setActiveTrack(null);
    setIsPlaying(false);
    setSelectedStation(null);
  };

  // --- Dynamic Filtering Core Logic ---
  // A track aligns if:
  // 1. It belongs to the active selected Station base OR is flagged as a global system track ('all')
  // 2. If Station mode is 'all' (Master Console), we show all tracks.
  const baseFilterTracks = tracks.filter((t) => {
    if (!selectedStation) return false;
    if (selectedStation === 'all') return true;
    return t.station === selectedStation || t.station === 'all';
  });

  // Filter based on searching query input
  const finalFilteredTracks = baseFilterTracks.filter((t) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(query) ||
      (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(query)))
    );
  });

  // Render starting question landing view
  if (!selectedStation) {
    return <StationSelector onSelectStation={setSelectedStation} />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between font-sans">
      
      {/* 🚀 Sleek Bluish to Purple Custom Top Header area */}
      <header className="bg-gradient-to-r from-blue-750 via-indigo-600 to-fuchsia-600 text-white px-6 py-5 shadow-lg select-none relative overflow-hidden">
        {/* Ambient top lines flare */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_50%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 relative z-10">
          
          {/* Top-left says "BigGameVFX 2026" */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 shadow-md">
              <AudioLines className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight font-display">BigGameVFX</span>
                <span className="text-[10px] font-mono font-bold bg-white/20 text-white px-2 py-0.5 rounded-full uppercase border border-white/10">
                  2026
                </span>
              </div>
              <p className="text-[11px] text-white/70 tracking-wide font-mono">STAFF PLAYBACK PORTAL</p>
            </div>
          </div>

          {/* Top-right Changer Button */}
          <button 
            onClick={handleExitToHome}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/10 hover:border-white/20 rounded-xl text-xs font-semibold uppercase tracking-tight flex items-center gap-1.5 transition-all shadow-xs active:scale-97 cursor-pointer select-none"
          >
            <span>🔄 เปลี่ยนฐาน (คุณเป็น Staff ฐานไหนค้าบ?)</span>
          </button>
          
        </div>
      </header>

      {/* Main Content Pane */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 flex flex-col gap-6">
        
        {/* --- Top Dashboard Banner Header Bar, styled dynamically styled to look outstanding --- */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          {/* Decorative radial pattern glow */}
          <div className="absolute -right-40 -top-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <button
                id="exit-to-selector-btn"
                onClick={handleExitToHome}
                className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg transition-transform active:scale-95 border border-white/5 cursor-pointer mr-2"
                title="Change active station base"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display">
                Game VFX Audio Library
              </h1>
            </div>
            
            <p className="text-slate-400 text-sm mt-1 max-w-2xl leading-relaxed">
              Play high-fidelity assets directly in your web browser. Double click or tap on elements instantly. 
            </p>
          </div>

          {/* Dashboard action items */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap justify-center">
            {/* Reset templates database */}
            <button
              id="reset-sfx-database-btn"
              onClick={handleResetTracks}
              className="p-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer"
              title="Reset tracks database template"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* --- Full Width Content Area (Sidebar removed) --- */}
        <div className="w-full space-y-4">
          
          {/* Control Bar: Search Input and Actions */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-xs">
            <div className="relative w-full sm:max-w-xs">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Filter by keyword or #tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-400 focus:outline-none transition-colors"
              />
            </div>

            <div className="flex items-center gap-4 flex-wrap justify-end">
              {/* Summary of listed records */}
              <div className="text-xs font-mono font-medium text-slate-400">
                LISTING: <span className="text-slate-800 font-bold bg-slate-100 px-2 py-1 rounded-sm">{finalFilteredTracks.length} sound assets</span>
              </div>

              {/* Upload Custom Sound Track */}
              <button
                onClick={() => setShowUpload(true)}
                className="px-4 py-2 bg-gradient-to-r from-indigo-650 to-purple-650 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <span>+ Upload Custom SFX</span>
              </button>
            </div>
          </div>

          {audioError && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs md:text-sm shadow-xs select-none">
              <div className="flex items-center gap-2">
                <span className="text-red-500 font-bold font-mono shrink-0">⚠️ ERR:</span>
                <span>{audioError}</span>
              </div>
              <button 
                onClick={() => setAudioError(null)}
                className="text-red-500 hover:text-red-700 font-bold text-[10px] px-2.5 py-1 rounded bg-white hover:bg-red-50 border border-red-150 cursor-pointer transition-colors shrink-0 uppercase tracking-tighter"
              >
                Dismiss
              </button>
            </div>
          )}

            {/* Track entries rows list */}
            {finalFilteredTracks.length > 0 ? (
              <div className="space-y-3.5" id="audio-tracks-rendered-wrapper">
                {finalFilteredTracks.map((track, i) => (
                  <AudioPlayer
                    key={track.id}
                    index={i + 1}
                    track={track}
                    isPlaying={isPlaying && activeTrack?.id === track.id}
                    currentTime={activeTrack?.id === track.id ? currentTime : 0}
                    duration={activeTrack?.id === track.id ? duration : track.durationSeconds}
                    onPlayPauseToggle={handlePlayPauseToggle}
                    onSeek={handleSeek}
                    onDeleteTrack={handleDeleteTrack}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-xs">
                <p className="text-slate-400 text-sm">No designated sound tracks found matching selected criteria.</p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-3 text-xs text-indigo-600 font-bold hover:underline"
                  >
                    Clear Search Filter
                  </button>
                )}
              </div>
            )}
          </div>

      </main>

      {/* Elegant Standard Responsive Footer details */}
      <footer className="footer-panel bg-white border-t border-slate-200 py-6 px-6 mt-16 select-none shadow-xs text-slate-500 font-mono text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span>© 2026 BigGameVFX. Built for ultimate high-performance sound effects sharing.</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="bg-slate-100 font-bold text-slate-500 px-2.5 py-0.5 rounded-full">
              v2.1.0-STABLE
            </span>
            <span className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer underline">
              Console Setup
            </span>
          </div>
        </div>
      </footer>

      {/* Upload FX Pop-up Modal */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSaveTrack={handleSaveTrack}
          defaultStation={selectedStation}
        />
      )}

    </div>
  );
}
