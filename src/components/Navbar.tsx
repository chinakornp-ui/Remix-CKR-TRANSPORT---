import React, { useState, useEffect } from 'react';
import { Bus, Shield, User as UserIcon, Calendar, CheckSquare, FileText, Sparkles, RefreshCw, Activity, Terminal } from 'lucide-react';
import { UserRole } from '../types/database';
import { CURRENT_STUDENT } from '../lib/storage';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  userRole: UserRole;
  onToggleRole: (role: UserRole) => void;
  onOpenSheetsModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  userRole,
  onToggleRole,
  onOpenSheetsModal
}) => {
  const [serverTime, setServerTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      setServerTime(timeStr);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          
          {/* Brand Zone */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer select-none group shrink-0"
            onClick={() => onNavigate('home')}
          >
            <div className="w-9 h-9 bg-teal-500 rounded-lg flex items-center justify-center font-bold text-base text-slate-950 shadow-xs group-hover:bg-teal-400 transition-colors">
              CKR
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-base sm:text-lg tracking-tight text-white leading-none">
                  TRANSPORT
                </span>
                <span className="px-1.5 py-0.5 bg-slate-800 text-teal-400 text-[10px] font-bold rounded border border-slate-700 uppercase tracking-wider">
                  Chakriraj
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-widest hidden sm:block">
                College Fleet Control
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onNavigate('home')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
                currentTab === 'home'
                  ? 'bg-slate-800 text-teal-400 border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              หน้าแรก
            </button>
            <button
              onClick={() => onNavigate('shuttle')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
                currentTab === 'shuttle'
                  ? 'bg-slate-800 text-teal-400 border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              รถตลาดริมน้ำ
            </button>
            <button
              onClick={() => onNavigate('training')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
                currentTab === 'training'
                  ? 'bg-slate-800 text-teal-400 border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              ขอรถแหล่งฝึก
            </button>
            <button
              onClick={() => onNavigate('student-dashboard')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                currentTab === 'student-dashboard'
                  ? 'bg-slate-800 text-teal-400 border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-teal-400" />
              ตั๋วของฉัน
            </button>

            {userRole === 'admin' && (
              <>
                <button
                  onClick={() => onNavigate('admin-dashboard')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    currentTab === 'admin-dashboard'
                      ? 'bg-teal-950 text-teal-300 border border-teal-800'
                      : 'text-teal-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-teal-400" />
                  จัดการระบบ
                </button>
                <button
                  onClick={() => onNavigate('admin-scan')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    currentTab === 'admin-scan'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'text-amber-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                  สแกนตั๋ว QR
                </button>
              </>
            )}
          </nav>

          {/* Right Action Zone: Live Indicator, Clock & Role Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Live Sync Status Pill */}
            <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 bg-slate-800 rounded-md border border-slate-700">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                LIVE SYNC
              </span>
            </div>

            {/* Server Clock */}
            <div className="hidden lg:block text-right border-l border-slate-800 pl-3">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">
                SERVER TIME
              </p>
              <p className="text-xs font-mono text-slate-300 leading-none">
                {serverTime}
              </p>
            </div>

            {/* Google Sheets Direct Sync button */}
            <button
              onClick={onOpenSheetsModal}
              title="ส่งออกข้อมูลไปยัง Google Sheets"
              className="px-2 sm:px-2.5 py-1 bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-800 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
            >
              <svg className="w-3.5 h-3.5 fill-current text-emerald-400 shrink-0" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h10v2H7zm0-3h10v2H7zm0 6h7v2H7z" />
              </svg>
              <span className="hidden sm:inline">Sheets Sync</span>
            </button>

            {/* Role Switcher Pill */}
            <div className="bg-slate-800 p-0.5 rounded-lg border border-slate-700 flex items-center">
              <button
                type="button"
                onClick={() => onToggleRole('student')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                  userRole === 'student'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                นักศึกษา
              </button>
              <button
                type="button"
                onClick={() => onToggleRole('admin')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                  userRole === 'admin'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                แอดมิน
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
