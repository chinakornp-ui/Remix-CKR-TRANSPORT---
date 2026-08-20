import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { HomePage } from './pages/HomePage';
import { ShuttlePage } from './pages/ShuttlePage';
import { TrainingRequestPage } from './pages/TrainingRequestPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminScannerPage } from './pages/AdminScannerPage';
import { GoogleSheetsExportModal } from './components/GoogleSheetsExportModal';
import { UserRole } from './types/database';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [userRole, setUserRole] = useState<UserRole>('student');
  const [sheetsModalOpen, setSheetsModalOpen] = useState<boolean>(false);

  const handleToggleRole = (role: UserRole) => {
    setUserRole(role);
    if (role === 'admin' && (currentTab === 'student-dashboard')) {
      setCurrentTab('admin-dashboard');
    } else if (role === 'student' && (currentTab === 'admin-dashboard' || currentTab === 'admin-scan')) {
      setCurrentTab('home');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-teal-500 selection:text-white">
      
      {/* Institutional Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={(tab) => setCurrentTab(tab)}
        userRole={userRole}
        onToggleRole={handleToggleRole}
        onOpenSheetsModal={() => setSheetsModalOpen(true)}
      />

      {/* Main Page Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentTab === 'home' && (
          <HomePage
            onNavigate={(tab) => setCurrentTab(tab)}
            isAdmin={userRole === 'admin'}
          />
        )}

        {currentTab === 'shuttle' && <ShuttlePage />}

        {currentTab === 'training' && <TrainingRequestPage />}

        {currentTab === 'student-dashboard' && <StudentDashboardPage />}

        {currentTab === 'admin-dashboard' && (
          <AdminDashboardPage
            onOpenScanner={() => setCurrentTab('admin-scan')}
            onOpenSheetsModal={() => setSheetsModalOpen(true)}
          />
        )}

        {currentTab === 'admin-scan' && <AdminScannerPage />}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onNavigate={(tab) => setCurrentTab(tab)}
        userRole={userRole}
      />

      {/* Google Sheets Sync & Export Modal */}
      {sheetsModalOpen && (
        <GoogleSheetsExportModal onClose={() => setSheetsModalOpen(false)} />
      )}

      {/* High Density Technical Footer */}
      <footer className="h-10 bg-slate-900 border-t border-slate-800 text-slate-400 flex items-center justify-between px-4 sm:px-8 text-[10px] uppercase tracking-widest font-medium mt-auto">
        <div className="flex items-center gap-2 overflow-hidden truncate">
          <span className="text-teal-400 font-bold">CKR TRANSPORT V2.4.1</span>
          <span className="text-slate-600">//</span>
          <span className="text-slate-400 truncate hidden sm:inline">BOROMARAJONANI COLLEGE OF NURSING, CHAKRIRAJ</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400 shrink-0 font-mono text-[9px] sm:text-[10px]">
          <span className="hidden md:inline">LATENCY: 38MS</span>
          <span className="flex items-center gap-1.5 text-teal-400">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            <span>REALTIME: CONNECTED</span>
          </span>
        </div>
      </footer>

    </div>
  );
}
