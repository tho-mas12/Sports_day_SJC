import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Search, Filter, Trophy, Sparkles, ChevronRight, Award, ShieldCheck } from 'lucide-react';

export default function SportsEventsSection({ onOpenLogin }) {
  const [activeShift, setActiveShift] = useState('SHIFT_I');
  const [selectedDate, setSelectedDate] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const shiftsData = {
    SHIFT_I: {
      title: "ORDER OF EVENTS – SHIFT – I",
      subtitle: "",
      venue: "Mahe Ground",
      dates: [
        {
          dateStr: "18th August 2026",
          dayLabel: "Day 1 - 18 Aug 2026",
          items: [
            { time: "06.30 A.M", name: "5000 Mts. Race", stage: "Finals", category: "Distance" },
            { time: "06.45 A.M", name: "Hammer Throw", stage: "Trials & Finals", category: "Field Throw" },
            { time: "07.00 A.M", name: "400 Mts. Dash", stage: "Heats", category: "Sprint" },
            { time: "07.00 A.M", name: "Triple Jump", stage: "Trials & Finals", category: "Field Jump" },
            { time: "07.45 A.M", name: "110 Mts. Hurdles", stage: "Heats", category: "Hurdles" },
            { time: "10.00 A.M", name: "100 Mts. Dash", stage: "Heats", category: "Sprint" },
            { time: "11.15 A.M", name: "110 Mts. Hurdles", stage: "Finals", category: "Hurdles" },
          ]
        },
        {
          dateStr: "19th August 2026",
          dayLabel: "Day 2 - 19 Aug 2026",
          items: [
            { time: "06.30 A.M", name: "High Jump", stage: "Trials & Finals", category: "Field Jump" },
            { time: "07.00 A.M", name: "4 x 100 Mts. Relay", stage: "Heats", category: "Relay" },
            { time: "09.00 A.M", name: "Long Jump", stage: "Trials & Finals", category: "Field Jump" },
            { time: "10.00 A.M", name: "Javelin Throw", stage: "Trials & Finals", category: "Field Throw" },
            { time: "10.15 A.M", name: "Pole Vault", stage: "Trials & Finals", category: "Field Jump" },
            { time: "11.00 A.M", name: "400 Mts. Dash", stage: "Finals", category: "Sprint" },
            { time: "11.15 A.M", name: "Shot Put", stage: "Trials & Finals", category: "Field Throw" },
            { time: "11.15 A.M", name: "200 Mts. Dash", stage: "Heats", category: "Sprint" },
          ]
        },
        {
          dateStr: "20th August 2026",
          dayLabel: "Day 3 - 20 Aug 2026",
          items: [
            { time: "06.30 A.M", name: "10,000 Mts. Race", stage: "Finals", category: "Distance" },
            { time: "07.30 A.M", name: "4 x 400 Mts. Relay", stage: "Heats", category: "Relay" },
            { time: "10.00 A.M", name: "1500 Mts. Race", stage: "Finals", category: "Distance" },
            { time: "10.45 A.M", name: "Discus Throw", stage: "Trials & Finals", category: "Field Throw" },
            { time: "11.00 A.M", name: "200 Mts. Dash", stage: "Finals", category: "Sprint" },
            { time: "11.30 A.M", name: "4 x 400 Mts. Relay", stage: "Finals", category: "Relay" },
          ]
        },
        {
          dateStr: "21st August 2026",
          dayLabel: "Day 4 - 21 Aug 2026",
          items: [
            { time: "06.30 A.M", name: "20 Km. Walk", stage: "Trials & Finals", category: "Race Walk" },
            { time: "02.30 P.M", name: "800 Mts. Race", stage: "Finals", category: "Middle Distance" },
            { time: "03.15 P.M", name: "100 Mts. Dash", stage: "Finals", category: "Sprint" },
            { time: "04.15 P.M", name: "4 x 100 Mts. Relay", stage: "Finals", category: "Relay" },
          ]
        }
      ]
    },
    SHIFT_II: {
      title: "ORDER OF EVENTS – SHIFT – II",
      subtitle: "",
      venue: "Mahe Ground",
      dates: [
        {
          dateStr: "18th August 2026",
          dayLabel: "Day 1 - 18 Aug 2026",
          items: [
            { time: "06.30 A.M", name: "5000 Mts. Race", stage: "Finals", category: "Distance" },
            { time: "03.00 P.M", name: "Hammer Throw", stage: "Trials & Finals", category: "Field Throw" },
            { time: "03.00 P.M", name: "400 Mts. Dash", stage: "Heats", category: "Sprint" },
            { time: "03.30 P.M", name: "Triple Jump", stage: "Trials & Finals", category: "Field Jump" },
            { time: "04.00 P.M", name: "100 Mts. Dash", stage: "Heats", category: "Sprint" },
            { time: "07.45 A.M", name: "110 Mts. Hurdles", stage: "Heats", category: "Hurdles" },
            { time: "11.15 A.M", name: "110 Mts. Hurdles", stage: "Finals", category: "Hurdles" },
          ]
        },
        {
          dateStr: "19th August 2026",
          dayLabel: "Day 2 - 19 Aug 2026",
          items: [
            { time: "06.30 A.M", name: "High Jump", stage: "Trials & Finals", category: "Field Jump" },
            { time: "03.00 P.M", name: "4 x 100 Mts. Relay", stage: "Heats", category: "Relay" },
            { time: "03.15 P.M", name: "Long Jump", stage: "Trials & Finals", category: "Field Jump" },
            { time: "03.15 P.M", name: "Javelin Throw", stage: "Trials & Finals", category: "Field Throw" },
            { time: "03.30 P.M", name: "Pole Vault", stage: "Trials & Finals", category: "Field Jump" },
            { time: "03.30 P.M", name: "400 Mts. Dash", stage: "Finals", category: "Sprint" },
            { time: "03.30 P.M", name: "Shot Put", stage: "Trials & Finals", category: "Field Throw" },
            { time: "04.00 P.M", name: "200 Mts. Dash", stage: "Heats", category: "Sprint" },
          ]
        },
        {
          dateStr: "20th August 2026",
          dayLabel: "Day 3 - 20 Aug 2026",
          items: [
            { time: "06.30 A.M", name: "10,000 Mts. Race", stage: "Finals", category: "Distance" },
            { time: "02.00 P.M", name: "4 x 400 Mts. Relay", stage: "Heats", category: "Relay" },
            { time: "02.15 P.M", name: "1500 Mts. Race", stage: "Finals", category: "Distance" },
            { time: "02.30 P.M", name: "Discus Throw", stage: "Trials & Finals", category: "Field Throw" },
            { time: "02.30 P.M", name: "200 Mts. Dash", stage: "Finals", category: "Sprint" },
            { time: "02.45 P.M", name: "4 x 400 Mts. Relay", stage: "Finals", category: "Relay" },
          ]
        },
        {
          dateStr: "21st August 2026",
          dayLabel: "Day 4 - 21 Aug 2026",
          items: [
            { time: "06.30 A.M", name: "20 KM Walk", stage: "Trials & Finals", category: "Race Walk" },
            { time: "02.30 P.M", name: "800 Mts. Race", stage: "Finals", category: "Middle Distance" },
            { time: "03.15 P.M", name: "100 Mts. Dash", stage: "Finals", category: "Sprint" },
            { time: "04.15 P.M", name: "4 x 100 Mts. Relay", stage: "Finals", category: "Relay" },
          ]
        }
      ]
    },
    GIRLS: {
      title: "ORDER OF EVENTS – Girls",
      subtitle: "",
      venue: "Mahe Ground",
      dates: [
        {
          dateStr: "18th August 2026",
          dayLabel: "Day 1 - 18 Aug 2026",
          items: [
            { time: "08.00 A.M", name: "400 Mts. Dash", stage: "Heats", category: "Sprint" },
            { time: "08.15 A.M", name: "Shot Put", stage: "Trials & Finals", category: "Field Throw" },
            { time: "11.30 A.M", name: "400 Mts. Dash", stage: "Finals", category: "Sprint" },
          ]
        },
        {
          dateStr: "19th August 2026",
          dayLabel: "Day 2 - 19 Aug 2026",
          items: [
            { time: "08.00 A.M", name: "Discus Throw", stage: "Trials & Finals", category: "Field Throw" },
            { time: "08.00 A.M", name: "200 Mts. Dash", stage: "Heats", category: "Sprint" },
            { time: "09.00 A.M", name: "200 Mts. Dash", stage: "Finals", category: "Sprint" },
          ]
        },
        {
          dateStr: "20th August 2026",
          dayLabel: "Day 3 - 20 Aug 2026",
          items: [
            { time: "08.00 A.M", name: "Long Jump", stage: "Trials & Finals", category: "Field Jump" },
            { time: "08.30 A.M", name: "800 Mts. Race", stage: "Trials & Finals", category: "Middle Distance" },
            { time: "09.00 A.M", name: "100 Mts. Dash", stage: "Heats", category: "Sprint" },
            { time: "09.45 A.M", name: "4 x 100 Mts. Relay", stage: "Heats", category: "Relay" },
          ]
        },
        {
          dateStr: "21st August 2026",
          dayLabel: "Day 4 - 21 Aug 2026",
          items: [
            { time: "03.00 P.M", name: "100 Mts. Dash", stage: "Finals", category: "Sprint" },
            { time: "03.30 P.M", name: "4 x 100 Mts. Relay", stage: "Finals", category: "Relay" },
          ]
        }
      ]
    }
  };

  const currentShift = shiftsData[activeShift];

  // Date Filter Chips
  const dateOptions = [
    { key: 'ALL', label: 'All Days (18–21 Aug)' },
    { key: '18th August 2026', label: '18th Aug' },
    { key: '19th August 2026', label: '19th Aug' },
    { key: '20th August 2026', label: '20th Aug' },
    { key: '21st August 2026', label: '21st Aug' },
  ];

  // Stage Badge Colors
  const getStageBadge = (stage) => {
    if (stage.includes('Finals') && !stage.includes('Trials')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    } else if (stage.includes('Heats')) {
      return 'bg-blue-100 text-blue-800 border-blue-300';
    } else {
      return 'bg-purple-100 text-purple-800 border-purple-300';
    }
  };

  return (
    <section id="events" className="py-16 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div>
            <span className="section-title-tag">Official Schedule</span>
            <h2 className="section-heading mb-2">Order of Events</h2>
            <p className="section-subheading">
              Official day-by-day timetable for Shift-I, Shift-II, and Girls athletic competitions at Mahe Ground.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search event (e.g. 100m, Relay, Finals)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-[18px] text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 shadow-xs transition-all"
            />
          </div>
        </div>

        {/* Shift Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 bg-white p-2 rounded-[22px] border border-gray-200 shadow-sm">
          <button
            onClick={() => { setActiveShift('SHIFT_I'); setSelectedDate('ALL'); }}
            className={`py-3 px-4 rounded-[18px] text-xs sm:text-sm font-bold transition-all duration-200 flex flex-col items-center gap-1 cursor-pointer ${
              activeShift === 'SHIFT_I'
                ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 hover:bg-blue-50/60 hover:text-[#2563EB]'
            }`}
          >
            <span>SHIFT – I</span>
            <span className="text-[10px] font-normal opacity-90">Men's Shift 1 • Mahe Ground</span>
          </button>

          <button
            onClick={() => { setActiveShift('SHIFT_II'); setSelectedDate('ALL'); }}
            className={`py-3 px-4 rounded-[18px] text-xs sm:text-sm font-bold transition-all duration-200 flex flex-col items-center gap-1 cursor-pointer ${
              activeShift === 'SHIFT_II'
                ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 hover:bg-blue-50/60 hover:text-[#2563EB]'
            }`}
          >
            <span>SHIFT – II</span>
            <span className="text-[10px] font-normal opacity-90">Men's Shift 2 • Mahe Ground</span>
          </button>

          <button
            onClick={() => { setActiveShift('GIRLS'); setSelectedDate('ALL'); }}
            className={`py-3 px-4 rounded-[18px] text-xs sm:text-sm font-bold transition-all duration-200 flex flex-col items-center gap-1 cursor-pointer ${
              activeShift === 'GIRLS'
                ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 hover:bg-blue-50/60 hover:text-[#2563EB]'
            }`}
          >
            <span>GIRLS (SHIFT I & II)</span>
            <span className="text-[10px] font-normal opacity-90">Women's Combined • Mahe Ground</span>
          </button>
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {dateOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSelectedDate(opt.key)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap border cursor-pointer ${
                selectedDate === opt.key
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-600 border-gray-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Venue Badge & Card Header */}
        <div className="bg-white border border-gray-200 rounded-[18px] p-6 shadow-md mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="badge badge-blue">
                  {currentShift.title}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-0.5 rounded-full border border-slate-200">
                  <MapPin className="w-3 h-3 text-[#2563EB]" />
                  Venue: {currentShift.venue}
                </span>
              </div>
              <h3 className="font-['Poppins'] text-xl font-bold text-slate-900">
                {currentShift.subtitle}
              </h3>
            </div>

            <button
              onClick={onOpenLogin}
              className="btn-primary py-2.5 px-5 text-xs rounded-xl self-start sm:self-center"
            >
              <span>Register Department List</span>
            </button>
          </div>

          {/* Timetable Cards by Date */}
          <div className="space-y-8 pt-6">
            {currentShift.dates
              .filter(d => selectedDate === 'ALL' || d.dateStr === selectedDate)
              .map((dateGroup, dIdx) => {
                // Filter items by search query
                const filteredItems = dateGroup.items.filter(item => 
                  item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  item.stage.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  item.time.toLowerCase().includes(searchQuery.toLowerCase())
                );

                if (filteredItems.length === 0 && searchQuery !== '') return null;

                return (
                  <div key={dIdx} className="space-y-3">
                    {/* Date Subheader */}
                    <div className="flex items-center gap-3 bg-blue-50/70 p-3 rounded-xl border border-blue-100">
                      <Calendar className="w-4 h-4 text-[#2563EB]" />
                      <h4 className="font-['Poppins'] text-sm font-bold text-slate-900">
                        {dateGroup.dayLabel}
                      </h4>
                      <span className="text-xs text-slate-500 font-medium ml-auto">
                        {filteredItems.length} Events Scheduled
                      </span>
                    </div>

                    {/* Events Table Grid */}
                    <div className="divide-y divide-gray-100 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
                      {filteredItems.map((item, iIdx) => (
                        <div 
                          key={iIdx}
                          className="p-4 hover:bg-blue-50/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                        >
                          {/* Time & Event Name */}
                          <div className="flex items-center gap-4">
                            <div className="w-24 px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold text-center flex items-center justify-center gap-1 shrink-0 border border-slate-200 group-hover:border-blue-300 group-hover:bg-blue-100 group-hover:text-[#2563EB] transition-colors">
                              <Clock className="w-3 h-3 text-[#2563EB]" />
                              <span>{item.time}</span>
                            </div>

                            <div>
                              <h5 className="font-['Poppins'] text-sm font-bold text-slate-900 group-hover:text-[#2563EB] transition-colors">
                                {item.name}
                              </h5>
                              <span className="text-[11px] text-slate-500 font-medium">
                                Track Discipline: {item.category}
                              </span>
                            </div>
                          </div>

                          {/* Stage Badge */}
                          <div className="flex items-center gap-3 self-end sm:self-center">
                            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStageBadge(item.stage)}`}>
                              {item.stage}
                            </span>
                            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>

        </div>

      </div>
    </section>
  );
}
