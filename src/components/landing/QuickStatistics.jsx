import React, { useState, useEffect } from 'react';
import { Award, Building2, Users, CheckCircle2, TrendingUp } from 'lucide-react';

export default function QuickStatistics() {
  const [counts, setCounts] = useState({
    events: 0,
    departments: 0,
    participants: 0
  });

  useEffect(() => {
    // Smooth animated counter effect up to target values
    const duration = 1500; // 1.5 seconds
    const steps = 40;
    const intervalTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easeOut = (t) => 1 - Math.pow(1 - t, 3); // Cubic ease out
      const easedProgress = easeOut(progress);

      setCounts({
        events: Math.floor(easedProgress * 27),
        departments: Math.floor(easedProgress * 31),
        participants: Math.floor(easedProgress * 1600)
      });

      if (step >= steps) {
        clearInterval(timer);
        setCounts({
          events: 27,
          departments: 31,
          participants: 1600
        });
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  const stats = [
    {
      title: "Events",
      value: counts.events,
      suffix: "",
      subtext: "Athletics, Team & Indoor",
      icon: Award,
      color: "text-[#2563EB]",
      bg: "bg-blue-50"
    },
    {
      title: "Departments",
      value: counts.departments,
      suffix: "",
      subtext: "Arts, Science & Commerce",
      icon: Building2,
      color: "text-indigo-600",
      bg: "bg-indigo-50"
    },
    {
      title: "Expected Participants",
      value: counts.participants.toLocaleString(),
      suffix: "+",
      subtext: "Student Athletes Registered",
      icon: Users,
      color: "text-[#1D4ED8]",
      bg: "bg-[#EFF6FF]"
    },
    {
      title: "Registration Status",
      value: "Open",
      isStatus: true,
      subtext: "Submissions Accepting",
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    }
  ];

  return (
    <section className="py-12 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="section-title-tag">Portal Overview</span>
          <h2 className="section-heading">Quick Statistics</h2>
          <p className="section-subheading mx-auto">
            Live numbers from the St. Joseph's College Sports Day portal database.
          </p>
        </div>

        {/* 4 Equal Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const IconComponent = stat.icon;
            return (
              <div 
                key={idx}
                className="saas-card saas-card-glow p-6 flex flex-col justify-between relative overflow-hidden group"
              >
                {/* Subtle Hover Gradient Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2563EB] to-[#3B82F6] opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-slate-500 font-['Inter']">
                    {stat.title}
                  </span>
                  <div className={`w-11 h-11 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-1">
                  {stat.isStatus ? (
                    <div className="flex items-center gap-2">
                      <span className="font-['Poppins'] text-3xl font-extrabold text-emerald-600">
                        {stat.value}
                      </span>
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                    </div>
                  ) : (
                    <div className="font-['Poppins'] text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                      {stat.value}<span className="text-[#2563EB]">{stat.suffix}</span>
                    </div>
                  )}
                  
                  <div className="text-xs text-slate-500 font-medium flex items-center gap-1 pt-1">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                    <span>{stat.subtext}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
