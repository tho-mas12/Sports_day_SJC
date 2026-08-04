import React from 'react';
import { Bell, ChevronRight } from 'lucide-react';

const announcements = [
  "📢 Registration closes on 08 August 2026",
  "📢 Football fixtures updated",
  "📢 Relay event rules revised",
  "📢 Dashboard maintenance on Sunday",
  "📢 Department login credentials dispatched to HODs",
  "📢 Athletic track inspection scheduled for August 5th"
];

export default function TopAnnouncementBar() {
  return (
    <div className="top-announcement-bar fixed top-0 left-0 right-0 z-50 bg-[#2563EB] text-white text-xs sm:text-sm font-medium py-2.5 shadow-sm border-b border-blue-600 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4">
        {/* Left Badge Indicator */}
        <div className="hidden sm:flex items-center gap-2 bg-blue-700/80 px-3 py-1 rounded-full text-xs font-semibold shrink-0 tracking-wide text-blue-100 uppercase">
          <Bell className="w-3.5 h-3.5 animate-bounce text-amber-300" />
          <span>Latest Updates</span>
        </div>

        {/* Marquee Ticker Track Container */}
        <div className="ticker-container flex-1 overflow-hidden relative py-0.5">
          <div className="ticker-track flex items-center gap-12 whitespace-nowrap">
            {/* Duplicated list to create seamless infinite loop */}
            {[...announcements, ...announcements, ...announcements].map((item, idx) => (
              <span 
                key={idx} 
                className="inline-flex items-center gap-2 cursor-pointer hover:text-blue-100 transition-colors"
              >
                <span>{item}</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-300 opacity-60 ml-4"></span>
              </span>
            ))}
          </div>
        </div>

        {/* Action Link */}
        <div className="hidden md:flex items-center gap-1 text-xs text-blue-100 hover:text-white shrink-0 cursor-pointer font-medium">
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}
