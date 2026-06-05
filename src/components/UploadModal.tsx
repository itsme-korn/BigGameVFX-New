/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Station, SoundCategory, AudioTrack } from '../types';
import { X, Upload, Plus, Link, Check, FileAudio } from 'lucide-react';

interface UploadModalProps {
  onClose: () => void;
  onSaveTrack: (track: AudioTrack) => void;
  defaultStation: Station;
}

export default function UploadModal({ onClose, onSaveTrack, defaultStation }: UploadModalProps) {
  const [title, setTitle] = useState('');
  const [station, setStation] = useState<Station>(defaultStation === 'all' ? 'Stacking Blocks' : defaultStation);
  const [category, setCategory] = useState<SoundCategory>('Morning Game');
  const [tagsInput, setTagsInput] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('audio/')) {
        setAudioFile(file);
        // Pre-fill title if empty
        if (!title) {
          const cleanName = file.name.replace(/\.[^/.]+$/, ""); // remove extension
          setTitle(cleanName);
        }
      } else {
        alert('Please drop valid audio files (MP3, WAV, OGG, etc.)');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAudioFile(file);
      if (!title) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "");
        setTitle(cleanName);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let playUrl = '';
    let displayDuration = '00:15';
    let durationSeconds = 15;

    if (audioFile) {
      playUrl = URL.createObjectURL(audioFile);
    } else if (customUrl) {
      playUrl = customUrl;
    } else {
      alert('Please select a local audio file or provide a valid stream link.');
      return;
    }

    if (!title.trim()) {
      alert('Please provide a descriptive title for the audio track.');
      return;
    }

    // Split tag inputs by comma
    const tagList = tagsInput
      ? tagsInput.split(',').map((t) => t.trim().toLowerCase()).filter((t) => t.length > 0)
      : ['uploaded', 'staff-sfx'];

    const newTrack: AudioTrack = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      fileName: audioFile ? audioFile.name : 'Web Stream URL',
      duration: displayDuration,
      durationSeconds: durationSeconds,
      url: playUrl,
      station: station,
      category: category,
      tags: tagList,
      isCustom: true
    };

    onSaveTrack(newTrack);
    setUploadSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Title */}
        <div className="flex justify-between items-center bg-slate-50 px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Upload Staff Game SFX</h3>
            <p className="text-xs text-slate-400 mt-0.5">Attach custom local audio files to test bases live</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-150 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {uploadSuccess ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4 animate-bounce">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Audio Registered Successfully!</h4>
            <p className="text-sm text-slate-500 mt-1">Ready for playback inside your station portal.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {/* Audio Sourcing Choice */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 tracking-wide uppercase mb-2">
                AUDIO FILE SOURCE
              </label>

              {/* Drag & Drop File Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-indigo-500 bg-indigo-50/50'
                    : audioFile
                    ? 'border-emerald-300 bg-emerald-50/10'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="audio/*"
                  className="hidden"
                />
                
                {audioFile ? (
                  <div className="flex flex-col items-center justify-center text-emerald-600">
                    <FileAudio className="w-10 h-10 mb-2 animate-pulse" />
                    <span className="text-xs font-semibold max-w-xs truncate">
                      {audioFile.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {(audioFile.size / (1024 * 1024)).toFixed(2)} MB • Audio Format Loaded
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <Upload className="w-10 h-10 mb-2 text-indigo-400" />
                    <span className="text-xs font-semibold text-slate-700">
                      Drag &amp; drop file here, or <span className="text-indigo-600">browse</span>
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Supports MP3, WAV, OGG track audio
                    </span>
                  </div>
                )}
              </div>

              {/* URL stream input alternative */}
              <div className="relative flex items-center mt-3">
                <div className="absolute left-3 text-slate-400 pointer-events-none">
                  <Link className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  placeholder="Or paste streaming audio URL link..."
                  value={customUrl}
                  onChange={(e) => {
                    setCustomUrl(e.target.value);
                    if (e.target.value.trim() !== '') {
                      setAudioFile(null); // Clear file if stream is used
                    }
                  }}
                  className="pl-10 w-full text-xs rounded-xl border border-slate-200 py-2.5 px-3.5 focus:border-indigo-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Title Info */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 tracking-wide uppercase mb-1.5">
                AUDIO SFX NAME
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 5-Second Warning Buzz, Fast Round countdown"
                className="w-full text-xs rounded-xl border border-slate-200 py-3 px-3.5 focus:border-indigo-400 focus:outline-none"
              />
            </div>

            {/* Target Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 tracking-wide uppercase mb-1.5">
                  TARGET STATION
                </label>
                <select
                  value={station}
                  onChange={(e) => setStation(e.target.value as Station)}
                  className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2.5 focus:border-indigo-400 focus:bg-white"
                >
                  <option value="Stacking Blocks">Stacking Blocks</option>
                  <option value="The Money Drop">The Money Drop</option>
                  <option value="เกมบันไดงู">เกมบันไดงู</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 tracking-wide uppercase mb-1.5">
                  GAME CHANNEL
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SoundCategory)}
                  className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2.5 focus:border-indigo-400 focus:bg-white"
                >
                  <option value="Morning Game">Morning Game Channel</option>
                  <option value="Afternoon Game">Afternoon Game Channel</option>
                  <option value="System FX">System FX Channel</option>
                </select>
              </div>
            </div>

            {/* Custom tags */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 tracking-wide uppercase mb-1.5">
                TAGS (COMMA SEPARATED)
              </label>
              <input
                type="text"
                placeholder="alert, custom, final-clash, loud"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 py-2.5 px-3.5 focus:border-indigo-400 focus:outline-none"
              />
            </div>

            {/* Interactive submit footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Sound to Portal</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
