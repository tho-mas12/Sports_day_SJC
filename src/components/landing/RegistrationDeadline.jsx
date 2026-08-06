import React, { useState, useEffect } from 'react';
import { Clock, Calendar, AlertCircle, ArrowRight, ShieldAlert } from 'lucide-react';

export default function RegistrationDeadline({ onOpenLogin }) {
  // Target deadline: August 8, 2026 at 23:59:59
  const targetDate = new Date('2026-08-15T23:59:59').getTime();

  const [timeLeft, setTimeLeft] = useState({
    days: 5,
    hours: 9,
    minutes: 32,
    seconds: 47
  });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section id="deadline" className="py-12 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Main Large Countdown Card with 18px rounded styling */}
        <div className="relative bg-white border border-gray-200 rounded-[18px] p-6 sm:p-10 shadow-lg overflow-hidden">
          
          {/* Subtle Accent Background Gradient */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-100/60 via-blue-50/30 to-transparent rounded-bl-full pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            
            {/* Left Header */}
            <div className="space-y-3 text-center lg:text-left max-w-lg">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
                <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin-slow" />
                <span>Strict Deadline Notice</span>
              </div>
              <h3 className="font-['Poppins'] text-2xl sm:text-3xl font-bold text-slate-900">
                Registration Deadline
              </h3>
              <p className="text-slate-600 text-sm sm:text-base font-normal">
                Department Secretary and In-Charge Students must submit final participant lists by <span className="font-semibold text-slate-800">10 August 2026</span>. Late entries will not be accepted.
              </p>
              
              <div className="flex items-center justify-center lg:justify-start gap-2 text-xs text-slate-500 pt-1">
                <Calendar className="w-4 h-4 text-[#2563EB]" />
                <span>Official Date: <strong>Monday, 10 August 2026 (11:59 PM IST)</strong></span>
              </div>
            </div>

            {/* Right Live Countdown Grid */}
            <div className="flex flex-col items-center gap-4 w-full lg:w-auto">
              <div className="grid grid-cols-4 gap-3 sm:gap-4 w-full max-w-md">
                
                {/* Days */}
                <div className="bg-slate-50 border border-blue-100 rounded-2xl p-3 sm:p-4 text-center shadow-sm hover:border-[#2563EB] transition-colors">
                  <div className="font-['Poppins'] text-3xl sm:text-4xl font-extrabold text-[#2563EB]">
                    {String(timeLeft.days).padStart(2, '0')}
                  </div>
                  <div className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
                    Days
                  </div>
                </div>

                {/* Hours */}
                <div className="bg-slate-50 border border-blue-100 rounded-2xl p-3 sm:p-4 text-center shadow-sm hover:border-[#2563EB] transition-colors">
                  <div className="font-['Poppins'] text-3xl sm:text-4xl font-extrabold text-[#2563EB]">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </div>
                  <div className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
                    Hours
                  </div>
                </div>

                {/* Minutes */}
                <div className="bg-slate-50 border border-blue-100 rounded-2xl p-3 sm:p-4 text-center shadow-sm hover:border-[#2563EB] transition-colors">
                  <div className="font-['Poppins'] text-3xl sm:text-4xl font-extrabold text-[#2563EB]">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </div>
                  <div className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
                    Minutes
                  </div>
                </div>

                {/* Seconds */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 sm:p-4 text-center shadow-sm hover:border-[#2563EB] transition-colors">
                  <div className="font-['Poppins'] text-3xl sm:text-4xl font-extrabold text-[#1D4ED8] animate-pulse">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </div>
                  <div className="text-[11px] sm:text-xs font-semibold text-blue-600 uppercase tracking-wider mt-1">
                    Seconds
                  </div>
                </div>

              </div>

              {/* Action Prompt */}
              <button
                onClick={onOpenLogin}
                className="btn-primary py-2.5 px-6 text-sm rounded-[18px] w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <span>Submit Department List Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
