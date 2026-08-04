import React from 'react';
import { Trophy, Shield, Award, Sparkles, Activity, Target, Zap, CircleDot } from 'lucide-react';

export default function HeroGraphic() {
  return (
    <div className="relative w-full aspect-square max-w-[540px] mx-auto flex items-center justify-center">
      {/* Outer Subtle Ambient Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#2563EB]/20 via-[#3B82F6]/15 to-transparent rounded-full blur-3xl animate-pulse-glow" />

      {/* Main SaaS Curved Card Backing with 18px rounded styling */}
      <div className="relative w-full h-full bg-gradient-to-br from-white via-blue-50/40 to-slate-50 border border-blue-100 rounded-[28px] p-6 shadow-2xl flex flex-col justify-between overflow-hidden">
        
        {/* Abstract Athletic Track Curved Graphic Lines in Background */}
        <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" viewBox="0 0 500 500" fill="none">
          <circle cx="250" cy="250" r="210" stroke="#2563EB" strokeWidth="12" strokeDasharray="16 12" />
          <circle cx="250" cy="250" r="170" stroke="#3B82F6" strokeWidth="10" />
          <circle cx="250" cy="250" r="130" stroke="#2563EB" strokeWidth="8" strokeDasharray="8 8" />
          <path d="M 50 250 Q 250 50 450 250" stroke="#1D4ED8" strokeWidth="6" strokeLinecap="round" />
          <path d="M 50 300 Q 250 100 450 300" stroke="#3B82F6" strokeWidth="4" />
        </svg>

        {/* Floating Geometric Shapes */}
        <div className="absolute top-8 left-8 w-12 h-12 bg-blue-500/10 rounded-2xl rotate-12 border border-blue-200 animate-float" />
        <div className="absolute bottom-12 right-10 w-16 h-16 bg-blue-600/10 rounded-full border border-blue-300 animate-float-delayed" />

        {/* Top Floating Badge - SJC Championship 2026 */}
        <div className="relative z-10 self-start glass-panel px-4 py-2 rounded-2xl shadow-lg border border-white flex items-center gap-3 animate-float">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">Annual Championship</div>
            <div className="text-[11px] font-semibold text-blue-600">St. Joseph's College</div>
          </div>
        </div>

        {/* Central Illustration Composition */}
        <div className="relative z-10 flex-1 flex items-center justify-center my-4">
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Blue Gradient Circle Backing */}
            <div className="w-52 h-52 rounded-full bg-gradient-to-tr from-[#1D4ED8] via-[#2563EB] to-[#3B82F6] shadow-xl flex items-center justify-center text-white relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-sm" />
              
              {/* Center Silhouette / Icon Visual */}
              <div className="flex flex-col items-center justify-center text-center p-4">
                <Trophy className="w-20 h-20 text-amber-300 drop-shadow-lg animate-bounce" style={{ animationDuration: '3s' }} />
                <span className="font-['Poppins'] font-extrabold text-white text-lg mt-1 tracking-wider uppercase">
                  VICTORY 2026
                </span>
                <span className="text-[11px] font-medium text-blue-100 bg-white/20 px-3 py-0.5 rounded-full mt-1">
                  27 Events • 31 Depts
                </span>
              </div>
            </div>

            {/* Orbiting Sports Equipment Badges */}
            <div className="absolute -top-3 left-4 glass-panel p-2.5 rounded-2xl shadow-lg border border-white flex items-center gap-2 animate-float">
              <span className="text-xl">🏃‍♂️</span>
              <span className="text-xs font-bold text-slate-700">Long Jump</span>
            </div>
            <div className="absolute top-1/2 -right-6 -translate-y-1/2 glass-panel p-2.5 rounded-2xl shadow-lg border border-white flex items-center gap-2 animate-float-delayed">
              <span className="text-xl">🏋️‍♀️</span>
              <span className="text-xs font-bold text-slate-700">Shot Put</span>
            </div>
            <div className="absolute -bottom-3 left-8 glass-panel p-2.5 rounded-2xl shadow-lg border border-white flex items-center gap-2 animate-float">
              <span className="text-xl">🏹</span>
              <span className="text-xs font-bold text-slate-700">Javelin Throw</span>
            </div>
          </div>
        </div>

        {/* Bottom Floating Stats Pill */}
        <div className="relative z-10 glass-panel p-3 rounded-2xl border border-white flex items-center justify-around text-center shadow-md">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#2563EB]" />
            <div className="text-left">
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Status</div>
              <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                Live Registration
              </div>
            </div>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#2563EB]" />
            <div className="text-left">
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Deadline</div>
              <div className="text-xs font-bold text-slate-800">08 Aug 2026</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
