import React from 'react';
import { Home, Bus, Hospital, Ticket, Shield, QrCode } from 'lucide-react';
import { UserRole } from '../types/database';

interface BottomNavProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  userRole: UserRole;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onNavigate, userRole }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 text-slate-600 px-2 py-1 shadow-sm">
      <div className="flex items-center justify-around">
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
            currentTab === 'home' ? 'text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className="w-4 h-4" />
          <span className="text-[10px] mt-0.5 whitespace-nowrap uppercase font-semibold">หน้าแรก</span>
        </button>

        <button
          onClick={() => onNavigate('shuttle')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
            currentTab === 'shuttle' ? 'text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bus className="w-4 h-4" />
          <span className="text-[10px] mt-0.5 whitespace-nowrap uppercase font-semibold">รถตลาด</span>
        </button>

        <button
          onClick={() => onNavigate('training')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
            currentTab === 'training' ? 'text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Hospital className="w-4 h-4" />
          <span className="text-[10px] mt-0.5 whitespace-nowrap uppercase font-semibold">แหล่งฝึก</span>
        </button>

        <button
          onClick={() => onNavigate('student-dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
            currentTab === 'student-dashboard' ? 'text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span className="text-[10px] mt-0.5 whitespace-nowrap uppercase font-semibold">ตั๋วของฉัน</span>
        </button>

        {userRole === 'admin' && (
          <button
            onClick={() => onNavigate('admin-scan')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
              currentTab === 'admin-scan' ? 'text-amber-600 font-bold' : 'text-amber-700 hover:text-amber-900'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span className="text-[10px] mt-0.5 whitespace-nowrap uppercase font-bold">สแกนตั๋ว</span>
          </button>
        )}
      </div>
    </div>
  );
};
