import React from 'react';
import { LogIn, Download } from 'lucide-react';

export default function HeroSection({ onOpenLogin, onOpenRules }) {
  return (
    <section id="home" className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden bg-transparent">
      {/* Background Decorative Grid Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center">
        
        {/* Left-Aligned Header Block (corresponds to the green boxes in the prompt image) */}
        <div className="w-full flex items-center gap-4 mb-12 justify-start border-b border-gray-200/50 pb-6">
          <div className="hover:scale-105 transition-transform duration-300">
            <img 
              src="/Img/logo.jpeg" 
              alt="SJC Logo" 
              className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover shadow-saas-md border border-white/50"
            />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-extrabold font-['Poppins'] text-slate-900 text-2xl md:text-3xl tracking-tight leading-tight">
              SJC SPORTS DAY 2026
            </span>
            <span className="text-xs md:text-sm text-slate-500 font-semibold font-['Inter'] mt-1">
              St. Joseph's College (Autonomous), Tiruchirappalli
            </span>
          </div>
        </div>

        {/* Main Headings */}
        <div className="space-y-4 mb-8 text-center">
          <h1 className="font-['Poppins'] text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            183rd Sports Day <span className="text-[#2563EB] relative inline-block">2026</span>
          </h1>
          <h2 className="font-['Poppins'] text-xl sm:text-2xl lg:text-3xl font-semibold text-slate-700">
            Official Sports Registration Portal
          </h2>
        </div>

        {/* Buttons Row */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-12 justify-center">
          <button 
            onClick={onOpenLogin}
            className="btn-primary py-3.5 px-8 text-base rounded-[18px] flex items-center justify-center gap-2.5 shadow-saas-md hover:shadow-saas-glow transition-all"
          >
            <LogIn className="w-5 h-5" />
            <span>Department Login</span>
          </button>

          <button 
            onClick={onOpenRules}
            className="btn-secondary py-3.5 px-8 text-base rounded-[18px] flex items-center justify-center gap-2.5 border border-slate-200"
          >
            <Download className="w-5 h-5" />
            <span>Download Rule Book</span>
          </button>
        </div>

        {/* Micro Metadata Banner */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-slate-500 border-t border-gray-200/80 w-full max-w-2xl">
          <div className="text-center px-4">
            <span className="block font-semibold text-slate-800 text-sm">Shift I & II + Girls</span>
            <span>3 Category Track Meets</span>
          </div>
          <div className="hidden sm:block h-7 w-px bg-gray-200" />
          <div className="text-center px-4">
            <span className="block font-semibold text-slate-800 text-sm">Mahe Ground</span>
            <span>Official Track Venue</span>
          </div>
          <div className="hidden sm:block h-7 w-px bg-gray-200" />
          <div className="text-center px-4">
            <span className="block font-semibold font-['Poppins'] text-[#2563EB] text-sm">18 – 21 Aug 2026</span>
            <span>Sports Meet Dates</span>
          </div>
        </div>

      </div>
    </section>
  );
}
