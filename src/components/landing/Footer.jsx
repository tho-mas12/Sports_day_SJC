import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[#0f1b2d] text-slate-400 py-6 border-t border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
        
        {/* Left: Copyright */}
        <div className="text-xs sm:text-sm text-slate-500 font-medium">
          © 2026 SJC, Tiruchirappalli-02. All Rights Reserved
        </div>

        {/* Right: Frontier Wox Branding Only */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
            Powered by
          </span>
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
              className="h-14 md:h-16 w-auto object-contain" 
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </a>
        </div>

      </div>
    </footer>
  );
}
