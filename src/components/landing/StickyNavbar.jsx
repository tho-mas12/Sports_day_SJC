import React, { useState, useEffect } from 'react';
import { LogIn, Menu, X, ShieldCheck } from 'lucide-react';

export default function StickyNavbar({ onOpenLogin }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Track active section for nav indicator
      const sections = ['home', 'rules', 'events', 'deadline'];
      const scrollPos = window.scrollY + 200;
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#home', id: 'home' },
    { label: 'Rules', href: '#rules', id: 'rules' },
    { label: 'Events', href: '#events', id: 'events' },
  ];

  return (
    <header 
      className={`sticky top-[37px] z-40 transition-all duration-300 ${
        isScrolled 
          ? 'glass-panel shadow-md py-3 border-b border-gray-200/80' 
          : 'bg-[#F8FAFC]/90 backdrop-blur-md py-4 border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Left: College Logo & Brand */}
        <a href="#home" className="flex items-center gap-3 group text-decoration-none">
          <div className="w-10 h-10 rounded-xl bg-white p-0.5 border border-gray-200 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-300 overflow-hidden">
            <img 
              src="/Img/logo.jpeg" 
              alt="SJC Logo" 
              className="w-full h-full object-contain rounded-lg"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold font-['Poppins'] text-slate-900 text-lg tracking-tight group-hover:text-[#2563EB] transition-colors">
                SJC SPORTS DAY 2026
              </span>
            </div>
            <span className="text-xs text-slate-500 font-medium -mt-1 hidden sm:block">
              St. Joseph's College (Autonomous), Tiruchirappalli
            </span>
          </div>
        </a>

        {/* Center Nav Links - Desktop (Home, Rules, Events) */}
        <nav className="hidden md:flex items-center gap-1 bg-white/80 p-1.5 rounded-full border border-gray-200/80 shadow-sm">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              className={`px-6 py-1.5 rounded-full text-sm font-medium transition-all duration-200 text-decoration-none ${
                activeSection === link.id
                  ? 'bg-[#2563EB] text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-[#2563EB] hover:bg-blue-50/60'
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right: Department Login Button */}
        <div className="hidden sm:flex items-center gap-3">
          <button 
            onClick={onOpenLogin}
            className="btn-primary py-2.5 px-5 text-sm rounded-[18px] flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Department Login</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-gray-200 px-4 pt-3 pb-6 space-y-3 animate-fade-up">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  activeSection === link.id
                    ? 'bg-[#2563EB] text-white'
                    : 'text-slate-700 hover:bg-blue-50 hover:text-[#2563EB]'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="pt-2 border-t border-gray-100">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLogin();
              }}
              className="w-full btn-primary py-3 rounded-[18px] text-sm flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Department Login</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
