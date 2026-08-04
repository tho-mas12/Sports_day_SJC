import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-6 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Brand & Title */}
        <div className="flex items-center gap-3">
          <img 
            src="/Img/logo.jpeg" 
            alt="SJC Logo" 
            className="w-8 h-8 rounded-lg object-contain bg-white p-0.5 border border-slate-700 shadow-xs"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <span className="font-['Poppins'] font-bold text-white text-base tracking-tight">
            SJC Sports Registration
          </span>
        </div>

        {/* Center: Quick Access for Home, Rules and Events */}
        <nav className="flex items-center gap-6 text-sm font-medium">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider hidden sm:inline">
            Quick Access:
          </span>
          <a 
            href="#home" 
            className="text-slate-300 hover:text-[#3B82F6] transition-colors text-decoration-none"
          >
            Home
          </a>
          <a 
            href="#rules" 
            className="text-slate-300 hover:text-[#3B82F6] transition-colors text-decoration-none"
          >
            Rules
          </a>
          <a 
            href="#events" 
            className="text-slate-300 hover:text-[#3B82F6] transition-colors text-decoration-none"
          >
            Events
          </a>
        </nav>

        {/* Right: Copyright & FWT Redirect Logo */}
        <div className="flex flex-col sm:flex-row items-center gap-3 text-xs text-slate-400">
          <span>© 2026 SJC, Tiruchirappalli-02. All Rights Reserved</span>

          <a 
            href="https://frontierwox.in/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block transition-transform hover:scale-105"
            title="Frontier Wox Technologies"
          >
            <img 
              src="/Img/FWT_FT.png" 
              alt="Frontier Wox" 
              className="h-18 w-auto object-contain" 
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </a>
        </div>

      </div>
    </footer>
  );
}
