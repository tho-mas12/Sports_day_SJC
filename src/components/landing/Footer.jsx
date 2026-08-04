import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white/70 backdrop-blur-xl border-t border-white/30 text-slate-600 py-3 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
        
        {/* Left: Brand & Title */}
        <div className="flex items-center gap-2.5">
          <img 
            src="/Img/logo.jpeg" 
            alt="SJC Logo" 
            className="w-7 h-7 rounded-md object-cover shadow-sm border border-white/20"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <span className="font-['Poppins'] font-bold text-slate-800 text-sm tracking-tight">
            SJC Sports Registration
          </span>
        </div>

        {/* Center: Quick Access for Home, Rules and Events */}
        <nav className="flex items-center gap-6 text-xs font-semibold">
          <a href="#home" className="text-slate-600 hover:text-[#2563EB] transition-colors text-decoration-none">
            Home
          </a>
          <a href="#rules" className="text-slate-600 hover:text-[#2563EB] transition-colors text-decoration-none">
            Rules
          </a>
          <a href="#events" className="text-slate-600 hover:text-[#2563EB] transition-colors text-decoration-none">
            Events
          </a>
        </nav>

        {/* Right: Copyright & FWT Redirect Logo */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-xs text-slate-500">
          <span>© 2026 SJC, Tiruchirappalli-02. All Rights Reserved</span>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-medium">Powered by</span>
            <a 
              href="https://frontierwox.in/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center transition-transform hover:scale-105"
              title="Frontier Wox Technologies"
            >
              <img 
                src="/Img/FWT_FT.png" 
                alt="Frontier Wox" 
                className="h-7 w-auto object-contain" 
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
