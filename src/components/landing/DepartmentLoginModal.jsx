import React, { useState } from 'react';
import { X, LogIn, Lock, Building2, ShieldCheck, CheckCircle, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DepartmentLoginModal({ isOpen, onClose }) {
  const [department, setDepartment] = useState('Computer Science');
  const [deptCode, setDeptCode] = useState('CS-2026');
  const [password, setPassword] = useState('••••••••');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const departmentsList = [
    "Computer Science",
    "Commerce & Management",
    "Physics & Electronics",
    "Chemistry & Biochemistry",
    "Mathematics & Statistics",
    "English & Humanities",
    "Economics",
    "Psychology & Social Work",
    "Biotechnology & Botany",
    "Journalism & Communication"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!deptCode || !password) {
      setErrorMsg('Please enter both Department Code and Password');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    // Simulate enterprise login check
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      
      // Trigger confetti celebrate effect
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // Fallback
      }
    }, 1000);
  };

  const handleReset = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-up">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white border border-gray-200 rounded-[24px] shadow-2xl overflow-hidden"
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
              <LogIn className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
                St. Joseph's College Portal
              </div>
              <h3 className="font-['Poppins'] text-xl font-bold text-white">
                Department Login
              </h3>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {isSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center animate-bounce">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h4 className="font-['Poppins'] text-xl font-bold text-slate-900">
                Authentication Successful!
              </h4>
              <p className="text-sm text-slate-600">
                Welcome HOD of <strong>{department}</strong>. Redirecting to the Sports Day Admin Dashboard...
              </p>
              <div className="pt-4">
                <button
                  onClick={handleReset}
                  className="btn-primary w-full py-3 text-sm rounded-xl"
                >
                  Proceed to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Select Department */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Department
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select 
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                  >
                    {departmentsList.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Department Code */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Department Code / HOD ID
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text"
                    value={deptCode}
                    onChange={(e) => setDeptCode(e.target.value)}
                    placeholder="e.g. CS-2026"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Access Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter security password"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Remember Login */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input type="checkbox" defaultChecked className="rounded text-[#2563EB]" />
                  <span>Remember session</span>
                </label>
                <a href="#rules" onClick={onClose} className="text-[#2563EB] font-semibold hover:underline">
                  Need access code?
                </a>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Login to Department Portal</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Note */}
        <div className="p-4 bg-slate-50 border-t border-gray-100 text-center text-xs text-slate-500">
          Official St. Joseph's College Autonomous Portal • Secure SSL Encrypted
        </div>
      </div>
    </div>
  );
}
