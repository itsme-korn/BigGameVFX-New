/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AudioTrack } from '../types';
import { Play, Pause, Music, Trash2, Star, Flame, Waves, Sparkles } from 'lucide-react';

interface AudioPlayerProps {
  key?: any;
  index: number;
  track: AudioTrack;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPauseToggle: (track: AudioTrack) => void;
  onSeek: (track: AudioTrack, time: number) => void;
  onDeleteTrack?: (trackId: string) => void;
}

export default function AudioPlayer({
  index,
  track,
  isPlaying,
  currentTime,
  duration,
  onPlayPauseToggle,
  onSeek,
  onDeleteTrack
}: AudioPlayerProps) {
  const isCorrectDing = track.title.toLowerCase().includes('correct ding') || track.id.toLowerCase().includes('correct-ding');
  const isWrongDing = track.title.toLowerCase().includes('wrong ding') || track.id.toLowerCase().includes('wrong-ding');
  
  // Format MM:SS
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    onSeek(track, time);
  };

  // Get distinct icon based on Station
  const getStationIcon = () => {
    switch (track.station) {
      case 'Stacking Blocks':
        return <Star className={`w-4 h-4 ${isPlaying ? 'text-indigo-350' : 'text-indigo-500'} animate-pulse`} />;
      case 'The Money Drop':
        return <Flame className={`w-4 h-4 ${isPlaying ? 'text-purple-350' : 'text-purple-500'}`} />;
      case 'เกมบันไดงู':
        return <Waves className={`w-4 h-4 ${isPlaying ? 'text-emerald-350' : 'text-emerald-500'}`} />;
      default:
        return <Music className={`w-4 h-4 ${isPlaying ? 'text-slate-300' : 'text-slate-500'}`} />;
    }
  };

  const formattedIndex = index.toString().padStart(2, '0');

  let containerBgBorder = '';
  if (isPlaying) {
    if (isCorrectDing) {
      containerBgBorder = 'bg-emerald-950 border-emerald-950 text-white shadow-xl shadow-emerald-950/15 font-sans';
    } else if (isWrongDing) {
      containerBgBorder = 'bg-rose-950 border-rose-950 text-white shadow-xl shadow-rose-950/15 font-sans';
    } else {
      containerBgBorder = 'bg-slate-900 border-slate-950 text-white shadow-xl shadow-indigo-950/15 font-sans';
    }
  } else {
    if (isCorrectDing) {
      containerBgBorder = 'bg-emerald-50/60 border-emerald-200 hover:border-emerald-350 text-slate-800 hover:bg-emerald-50/80 shadow-md transform hover:-translate-y-0.5 transition-all duration-200 ring-2 ring-emerald-500/20';
    } else if (isWrongDing) {
      containerBgBorder = 'bg-rose-50/60 border-rose-200 hover:border-rose-350 text-slate-800 hover:bg-rose-50/80 shadow-md transform hover:-translate-y-0.5 transition-all duration-200 ring-2 ring-rose-500/20';
    } else {
      containerBgBorder = 'bg-white border-slate-100 hover:border-slate-200 text-slate-800 hover:bg-slate-50 shadow-xs';
    }
  }

  let indicatorBg = 'bg-slate-200';
  if (isPlaying) {
    indicatorBg = isCorrectDing ? 'bg-emerald-400' : isWrongDing ? 'bg-rose-400' : 'bg-indigo-500';
  } else {
    if (isCorrectDing) indicatorBg = 'bg-emerald-400';
    else if (isWrongDing) indicatorBg = 'bg-rose-400';
  }

  let playBtnClasses = '';
  if (isPlaying) {
    if (isCorrectDing) {
      playBtnClasses = 'bg-white hover:bg-emerald-50 text-emerald-600';
    } else if (isWrongDing) {
      playBtnClasses = 'bg-white hover:bg-rose-50 text-rose-600';
    } else {
      playBtnClasses = 'bg-white hover:bg-slate-100 text-red-650';
    }
  } else {
    if (isCorrectDing) {
      playBtnClasses = 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/10';
    } else if (isWrongDing) {
      playBtnClasses = 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/10';
    } else {
      playBtnClasses = 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/10';
    }
  }

  return (
    <div
      id={`audio-card-${track.id}`}
      className={`border transition-all duration-300 rounded-2xl p-5 md:p-6 ${containerBgBorder} flex flex-col md:grid md:grid-cols-12 md:items-center gap-4 relative group`}
    >
      {/* Playback Indicator Accent line */}
      <div className={`absolute top-0 bottom-0 left-0 w-1.5 rounded-l-2xl transition-colors ${indicatorBg}`} />

      {/* Column 1: Index Number (grid col-span-1) */}
      <div className="hidden md:block col-span-1 select-none">
        <span className={`font-mono text-sm font-bold tracking-wider ${
          isPlaying ? 'text-indigo-400/80' : isCorrectDing ? 'text-emerald-650' : isWrongDing ? 'text-rose-650' : 'text-slate-300'
        }`}>
          {formattedIndex}
        </span>
      </div>

      {/* Column 2: Audio File Name & Category Meta (grid col-span-5) */}
      <div className="col-span-5 min-w-0 flex items-start gap-3">
        {/* Dynamic decorative icon */}
        <div className={`hidden sm:flex p-2.5 rounded-xl justify-center items-center shrink-0 border ${
          isPlaying 
            ? 'bg-white/10 border-white/10 text-white' 
            : 'bg-slate-50 border-slate-100 text-slate-400'
        }`}>
          {getStationIcon()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className={`text-base font-bold truncate tracking-tight transition-colors ${
              isPlaying ? 'text-white' : isCorrectDing ? 'text-emerald-900 font-extrabold' : isWrongDing ? 'text-rose-900 font-extrabold' : 'text-slate-800'
            }`} title={track.title}>
              {track.title}
            </h4>
            
            {track.isCustom && (
              <span className="shrink-0 text-red-550 font-bold bg-red-50 dark:bg-red-950/50 dark:text-red-400 px-1.5 py-0.2 rounded uppercase text-[8px] border border-red-100 animate-pulse">
                Custom
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs font-mono">
            <span className={`px-2 py-0.5 rounded font-sans font-medium hover:scale-102 transition-transform ${
              isPlaying 
                ? 'bg-white/15 text-indigo-200' 
                : isCorrectDing 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                  : isWrongDing 
                    ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                    : 'bg-slate-100 text-slate-600'
            }`}>
              {track.category}
            </span>
          </div>

          {/* Subtags listed beautifully */}
          {track.tags && track.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2.5">
              {track.tags.map((tag) => (
                <span 
                  key={tag} 
                  className={`text-[10px] px-2 py-0.5 font-sans font-medium rounded transition-colors ${
                    isPlaying 
                      ? 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-300' 
                      : isCorrectDing 
                        ? 'bg-emerald-100/50 hover:bg-emerald-100 text-emerald-800' 
                        : isWrongDing 
                          ? 'bg-rose-100/50 hover:bg-rose-100 text-rose-800' 
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700'
                  }`}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Column 3: Playback Length / Duration (grid col-span-2) */}
      <div className="col-span-2 select-none">
        <div className="flex items-center gap-1.5 text-xs font-mono md:text-sm">
          <span className={isPlaying ? 'text-slate-300' : 'text-slate-400'}>Length:</span>
          <span className={`font-semibold ${isPlaying ? 'text-slate-200 font-bold' : isCorrectDing ? 'text-emerald-900' : isWrongDing ? 'text-rose-900' : 'text-slate-700'}`}>
            {track.duration}
          </span>
        </div>
      </div>

      {/* Column 4: Playback Controls & Progress bar (grid col-span-4) */}
      <div className="col-span-4 flex items-center gap-4">
        
        {/* Play/Pause Button on the left of progress timeline slider in grid column */}
        <button
          id={`play-btn-${track.id}`}
          onClick={() => onPlayPauseToggle(track)}
          className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer ${playBtnClasses}`}
          title={isPlaying ? 'Pause sound' : 'Play sound'}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current animate-pulse" />
          ) : (
            <Play className="w-5 h-5 fill-current text-white translate-x-0.5" />
          )}
        </button>

        {/* Dynamic timeline scrubber track container */}
        <div className="flex-grow flex flex-col gap-1.5 min-w-0">
          <div className="flex-grow flex items-center gap-2">
            <span className={`text-[10px] font-mono select-none w-8 text-right shrink-0 ${
              isPlaying ? (isCorrectDing ? 'text-emerald-200' : isWrongDing ? 'text-rose-200' : 'text-indigo-300') : 'text-slate-400'
            }`}>
              {isPlaying ? formatTime(currentTime) : '00:00'}
            </span>

            {/* Slider track line */}
            <div className="flex-1 relative flex items-center">
              <input
                type="range"
                min="0"
                max={duration || track.durationSeconds}
                step="0.05"
                value={isPlaying ? currentTime : 0}
                onChange={handleSliderChange}
                className={`w-full cursor-pointer h-1 rounded-full outline-hidden transition-all ${
                  isPlaying ? 'accent-white' : isCorrectDing ? 'accent-emerald-655' : isWrongDing ? 'accent-rose-655' : 'accent-red-500'
                }`}
              />
            </div>

            <span className={`text-[10px] font-mono select-none w-8 shrink-0 ${
              isPlaying ? (isCorrectDing ? 'text-emerald-200' : isWrongDing ? 'text-rose-200' : 'text-indigo-350') : 'text-slate-400'
            }`}>
              {formatTime(duration || track.durationSeconds)}
            </span>
          </div>

          {/* Quick test control cluster */}
          {track.isCustom && onDeleteTrack && (
            <div className="flex items-center justify-end mt-0.5">
              {/* Delete button if dynamic custom upload */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteTrack(track.id);
                }}
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  isPlaying ? 'text-slate-400 hover:text-red-400 hover:bg-white/10' : 'text-slate-350 hover:text-red-650 hover:bg-red-50/50'
                }`}
                title="Delete custom trail"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

