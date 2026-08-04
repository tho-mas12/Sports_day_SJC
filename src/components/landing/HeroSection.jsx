import React from 'react';
import { LogIn, Download, CheckCircle2, ShieldCheck } from 'lucide-react';
import HeroGraphic from './HeroGraphic';

export default function HeroSection({ onOpenLogin, onOpenRules }) {
  const highlights = [
    "Register department participants",
    "View complete sports event schedule",
    "Download official rule book & guidelines",
    "Track live registration deadlines & slots"
  ];

  return (
    <section id="home" className="relative pt-8 pb-16 md:pt-14 md:pb-24 overflow-hidden bg-[#F8FAFC]">
      {/* Background Decorative Grid Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT: Content Column */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            
            {/* Top Badge with College Logo */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs sm:text-sm font-semibold w-max shadow-xs">
              <img 
                src="/Img/logo.jpeg" 
                alt="SJC Logo" 
                className="w-5 h-5 rounded-full object-cover"
              />
              <span>St. Joseph's College (Autonomous), Tiruchirappalli</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
              <span className="text-slate-600 font-medium">Annual Sports Meet 2026</span>
            </div>

            {/* Main Headings */}
            <div className="space-y-2">
              <h1 className="font-['Poppins'] text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                183rd Sports Day <span className="text-[#2563EB] relative inline-block">2026</span>
              </h1>
              <h2 className="font-['Poppins'] text-xl sm:text-2xl lg:text-3xl font-semibold text-slate-700">
                Official Sports Registration Portal
              </h2>
            </div>

            {/* Bullet Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {highlights.map((item, index) => (
                <div key={index} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{item}</span>
                </div>
              ))}
            </div>

            {/* Buttons Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <button 
                onClick={onOpenLogin}
                className="btn-primary py-3.5 px-7 text-base rounded-[18px] flex items-center justify-center gap-2.5"
              >
                <LogIn className="w-5 h-5" />
                <span>Department Login</span>
              </button>

              <button 
                onClick={onOpenRules}
                className="btn-secondary py-3.5 px-7 text-base rounded-[18px] flex items-center justify-center gap-2.5"
              >
                <Download className="w-5 h-5" />
                <span>Download Rule Book</span>
              </button>
            </div>

            {/* Micro Metadata Banner */}
            <div className="flex items-center gap-6 pt-4 text-xs text-slate-500 border-t border-gray-200/80 max-w-lg">
              <div>
                <span className="block font-semibold text-slate-800 text-sm">Shift I & II + Girls</span>
                <span>3 Category Track Meets</span>
              </div>
              <div className="h-7 w-px bg-gray-200" />
              <div>
                <span className="block font-semibold text-slate-800 text-sm">Mahe Ground</span>
                <span>Official Track Venue</span>
              </div>
              <div className="h-7 w-px bg-gray-200" />
              <div>
                <span className="block font-semibold font-['Poppins'] text-[#2563EB] text-sm">18 – 21 Aug 2026</span>
                <span>Sports Meet Dates</span>
              </div>
            </div>

          </div>

          {/* RIGHT: Visual Graphic Column */}
          <div className="lg:col-span-5 flex justify-center">
            <HeroGraphic />
          </div>

        </div>
      </div>
    </section>
  );
}
