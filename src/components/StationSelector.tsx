/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Station } from '../types';
import { Layers, Coins, HelpCircle, Trophy, Sparkles, Volume2 } from 'lucide-react';
import { motion } from 'motion/react';

interface StationSelectorProps {
  onSelectStation: (station: Station) => void;
}

export default function StationSelector({ onSelectStation }: StationSelectorProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const options = [
    {
      id: 'Stacking Blocks' as Station,
      title: 'Stacking Blocks',
      thaiTitle: 'เกมต่อบล็อกบันลือโลก',
      subtitle: 'Click to open Stacking blocks channel',
      description: 'Audio library optimized for stacking timer ticking, tension, precision tower collapse & score multipliers.',
      icon: Layers,
      color: 'from-blue-500 to-indigo-600',
      badge: 'Timer & Ticking',
      particleEffect: '🧱'
    },
    {
      id: 'The Money Drop' as Station,
      title: 'The Money Drop',
      thaiTitle: 'ตอบคำถามถล่มทลาย',
      subtitle: 'Click to open The Money Drop channel',
      description: 'Sound effects for heavy heartbeats, incorrect answer trapdoors, high stakes cash cascades & buzzers.',
      icon: Coins,
      color: 'from-fuchsia-500 to-purple-600',
      badge: 'Tension & Heartbeats',
      particleEffect: '💰'
    },
    {
      id: 'เกมบันไดงู' as Station,
      title: 'เกมบันไดงู',
      thaiTitle: 'ลูกเต๋าปาฏิหาริย์',
      subtitle: 'Click to open Snack & Ladders channel',
      description: 'Custom sound effects for fast physics dice roll rattle, climbs, slithers, snake warning bites & victory fireworks.',
      icon: Trophy,
      color: 'from-emerald-500 to-teal-600',
      badge: 'Dice, Climb & Snakes',
      particleEffect: '🎲'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between overflow-hidden relative font-sans">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[80px]" />
      <div className="absolute bottom-1/4 right-1/4 translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[80px]" />

      {/* Decorative Top header pattern */}
      <div className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-[3px]" />

      {/* Main Content Container */}
      <div className="max-w-6xl mx-auto w-full px-6 py-12 flex-1 flex flex-col justify-center relative z-10">
        <div className="text-center mb-12">
          {/* Audio Brand Sparkle */}
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full mb-4 text-indigo-300 text-xs tracking-wider uppercase font-mono">
            <Volume2 className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span>BigGameVFX — Version 2026</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent font-display">
            คุณเป็น Staff ฐานไหนค้าบ?
          </h2>
          <p className="mt-3 text-slate-400 text-sm md:text-base max-w-xl mx-auto">
            โปรดเลือกฐานเกมของคุณเพื่อเปลี่ยนโหมดระบบเสียงให้เหมาะสมกับอุปกรณ์ของคุณ พร้อมเล่นเสียง Sound Effects คุณภาพสูงได้ทันทีในหน้าเดียว!
          </p>
        </div>

        {/* Station Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto w-full">
          {options.map((opt) => {
            const IconComponent = opt.icon;
            const isHovered = hoveredCard === opt.id;

            return (
              <div
                key={opt.id}
                id={`station-card-${opt.id.replace(/\s+/g, '-').toLowerCase()}`}
                className="relative group cursor-pointer"
                onMouseEnter={() => setHoveredCard(opt.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => onSelectStation(opt.id)}
              >
                {/* Neon Glow beneath active hovered card */}
                <div className={`absolute inset-0 bg-gradient-to-r ${opt.color} rounded-2xl blur-xl opacity-0 transition-opacity duration-300 ${isHovered ? 'opacity-20' : ''}`} />

                {/* Main Card Element */}
                <div className="relative h-full bg-slate-950/80 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col justify-between hover:border-slate-700 transition-all duration-300 transform group-hover:-translate-y-1">
                  <div>
                    {/* Header Icon Row */}
                    <div className="flex justify-between items-start mb-6">
                      <div className={`p-3 bg-gradient-to-r ${opt.color} rounded-xl text-white shadow-lg shadow-indigo-900/20`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-mono font-semibold px-2.5 py-1 bg-slate-800 rounded-full text-slate-400 border border-slate-700">
                        {opt.badge}
                      </span>
                    </div>

                    {/* Titles */}
                    <h3 className="text-xl font-bold text-slate-100 group-hover:text-white transition-colors">
                      {opt.title}
                    </h3>
                    <p className="text-sm font-semibold text-indigo-400 mt-1">
                      {opt.thaiTitle}
                    </p>
                  </div>

                  {/* Call to action arrow / action block */}
                  <div className="mt-8 pt-4 border-t border-slate-900 flex items-center justify-between text-xs text-slate-500 font-mono">
                    <span>LAUNCH PORTAL</span>
                    <span className="text-indigo-400 group-hover:translate-x-1.5 transition-transform duration-200">
                      →
                    </span>
                  </div>
                </div>

                {/* Floating particle easter-egg when hovering */}
                {isHovered && (
                  <span className="absolute -top-3 -right-3 text-2xl animate-bounce">
                    {opt.particleEffect}
                  </span>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* Humble Elegant Footer Footer info */}
      <footer className="footer-panel text-center py-6 border-t border-slate-800 relative z-20 text-slate-500 text-xs font-mono">
        <div>
          <span>© 2026 BigGameVFX. Built for ultimate high-performance sound effects sharing.</span>
        </div>
      </footer>
    </div>
  );
}
