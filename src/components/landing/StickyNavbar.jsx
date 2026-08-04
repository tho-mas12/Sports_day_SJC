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
        {/* Left: Brand block (visible on all screens) */}
        <a href="#home" className="flex items-center gap-3 group text-decoration-none shrink-0">
          <img 
            src="/Img/logo.jpeg" 
            alt="SJC Logo" 
            className="w-11 h-11 rounded object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="flex flex-col text-left">
            <span className="font-bold font-['Poppins'] text-slate-900 text-xs sm:text-sm tracking-tight">
              St. Joseph's College (Autonomous), Tiruchirappalli
            </span>
          </div>
        </a>

        {/* Center Nav Links - Desktop (Centered absolutely) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
          <nav className="flex items-center gap-1 bg-white/80 p-1.5 rounded-full border border-gray-200/80 shadow-sm">
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
        </div>

        {/* Right: Department Login Button */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
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
