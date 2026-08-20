import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  CheckCircle2,
  AlertCircle,
  Clock,
  Camera,
  Search,
  User,
  Bus,
  MapPin,
  Volume2,
  RefreshCw,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Booking, TripSchedule } from '../types/database';
import { appStore } from '../lib/storage';
import confetti from 'canvas-confetti';

export const AdminScannerPage: React.FC = () => {
  const [bookingNoInput, setBookingNoInput] = useState('');
  const [scannedResult, setScannedResult] = useState<{
    success: boolean;
    alreadyCheckedIn?: boolean;
    booking?: Booking;
    message: string;
  } | null>(null);

  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('all');
  const [schedules, setSchedules] = useState<TripSchedule[]>(appStore.getSchedules());
  const [recentCheckIns, setRecentCheckIns] = useState<Booking[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const refreshData = () => {
    setSchedules(appStore.getSchedules());
    const checked = appStore.getBookings().filter((b) => b.status === 'checked_in');
    setRecentCheckIns(checked);
  };

  useEffect(() => {
    refreshData();
    const unsubscribe = appStore.subscribe(refreshData);
    return () => unsubscribe();
  }, []);

  const handleScanOrSubmit = (codeToScan?: string) => {
    const code = (codeToScan || bookingNoInput).trim();
    if (!code) return;

    const result = appStore.checkInTicket(code, 'พนักงานขับรถ / เจ้าหน้าที่ CKR');
    setScannedResult(result);

    if (result.success && !result.alreadyCheckedIn) {
      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.6 }
      });
      // Play soft beep audio synthesis if available
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880; // A5
        gain.gain.value = 0.1;
        osc.start();
        setTimeout(() => osc.stop(), 150);
      } catch {}
    }

    setBookingNoInput('');
    if (inputRef.current) inputRef.current.focus();
  };

  const handleQuickTestScan = (sampleBookingNo: string) => {
    setBookingNoInput(sampleBookingNo);
    handleScanOrSubmit(sampleBookingNo);
  };

  const activeBookings = appStore.getBookings();
  const confirmedSample = activeBookings.find((b) => b.status === 'confirmed');

  return (
    <div className="space-y-4 pb-20 max-w-4xl mx-auto">
      
      {/* Scanner Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 px-4 sm:px-6 py-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
            <QrCode className="w-3 h-3" />
            <span>GATE PASS TERMINAL</span>
          </div>
          <h1 className="font-heading font-bold text-lg text-slate-900 mt-1">
            เครื่องสแกนและตรวจสอบบัตรโดยสาร QR Code
          </h1>
          <p className="text-xs text-slate-500">
            สแกนตั๋วดิจิทัลจากสมาร์ตโฟนของนักศึกษาเพื่อบันทึกเช็คอินขึ้นรถอัตโนมัติ
          </p>
        </div>

        <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-center sm:text-right shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">CHECKED IN</span>
          <span className="font-heading font-bold text-xl text-teal-700 font-mono">
            {recentCheckIns.length} PASSENGERS
          </span>
        </div>
      </div>

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Scanner Viewfinder / Input Box (Left 7 Cols) */}
        <div className="md:col-span-7 bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
          
          {/* Simulated Scanner Viewfinder */}
          <div className="relative bg-slate-950 rounded-lg overflow-hidden aspect-video flex flex-col items-center justify-center text-white border border-slate-800 p-4">
            
            {/* Viewfinder Target Reticle */}
            <div className="w-40 h-40 border border-teal-500/80 rounded-lg relative flex items-center justify-center animate-pulse">
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-teal-400" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-teal-400" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-teal-400" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-teal-400" />
              <QrCode className="w-12 h-12 text-teal-400/50" />
            </div>

            <p className="text-[11px] text-slate-400 mt-2 font-mono flex items-center gap-1.5 uppercase tracking-wider">
              <Zap className="w-3 h-3 text-amber-400" />
              OPTICAL QR SENSOR READY
            </p>
          </div>

          {/* Quick Input Bar */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              กรอกรหัสตั๋ว หรือใช้เครื่องยิงบาร์โค้ด
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  ref={inputRef}
                  type="text"
                  value={bookingNoInput}
                  onChange={(e) => setBookingNoInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleScanOrSubmit()}
                  placeholder="เช่น CKR-2026-00042"
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono uppercase focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <button
                onClick={() => handleScanOrSubmit()}
                className="py-1.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs shrink-0 uppercase"
              >
                ตรวจตั๋ว
              </button>
            </div>
          </div>

          {/* Sample quick buttons for instant demo */}
          {confirmedSample && (
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
              <span className="text-[11px] text-slate-500">ทดสอบสแกนตั๋วจริง:</span>
              <button
                onClick={() => handleQuickTestScan(confirmedSample.booking_no)}
                className="font-mono text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded border border-teal-200 transition-colors"
              >
                {confirmedSample.booking_no} ({confirmedSample.student_name})
              </button>
            </div>
          )}

        </div>

        {/* Scan Result Feedback Card (Right 5 Cols) */}
        <div className="md:col-span-5 space-y-3">
          <h2 className="font-heading font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-teal-700" />
            ข้อมูลผู้โดยสารที่สแกนล่าสุด
          </h2>

          {scannedResult ? (
            <div
              className={`rounded-xl border p-4 space-y-3 transition-all shadow-xs ${
                scannedResult.success && !scannedResult.alreadyCheckedIn
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : scannedResult.alreadyCheckedIn
                  ? 'bg-amber-50 border-amber-300 text-amber-950'
                  : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0 ${
                    scannedResult.success && !scannedResult.alreadyCheckedIn
                      ? 'bg-emerald-600'
                      : scannedResult.alreadyCheckedIn
                      ? 'bg-amber-600'
                      : 'bg-rose-600'
                  }`}
                >
                  {scannedResult.success && !scannedResult.alreadyCheckedIn ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : scannedResult.alreadyCheckedIn ? (
                    <Clock className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm">
                    {scannedResult.success && !scannedResult.alreadyCheckedIn
                      ? '✅ ผ่าน! เช็คอินเรียบร้อย'
                      : scannedResult.alreadyCheckedIn
                      ? '⚠️ เช็คอินไปแล้ว'
                      : '❌ ไม่อนุมัติ / ไม่พบข้อมูล'}
                  </h3>
                  <p className="text-[11px] opacity-90">{scannedResult.message}</p>
                </div>
              </div>

              {scannedResult.booking && (
                <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1.5 text-slate-800">
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500 text-[11px]">รหัสตั๋ว:</span>
                    <span className="font-mono font-bold text-slate-900">{scannedResult.booking.booking_no}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500 text-[11px]">ชื่อนักศึกษา:</span>
                    <span className="font-bold text-slate-900">{scannedResult.booking.student_name}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500 text-[11px]">รหัส / ชั้นปี:</span>
                    <span>{scannedResult.booking.student_code} (ปี {scannedResult.booking.student_year})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-[11px]">จุดขึ้นรถ:</span>
                    <span className="font-medium text-teal-800">{scannedResult.booking.pickup_point}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-slate-400 space-y-1.5">
              <QrCode className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-bold text-slate-600 text-xs">ยังไม่มีการสแกน</p>
              <p className="text-[11px] text-slate-400">
                สแกน QR Code เพื่อตรวจสอบสถานะและยืนยันการขึ้นรถ
              </p>
            </div>
          )}

          {/* Recent Checked In List */}
          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs">
            <h3 className="font-bold text-slate-900 text-[11px] uppercase tracking-wider mb-2">
              ผู้โดยสารที่เช็คอินแล้ว ({recentCheckIns.length})
            </h3>
            <div className="space-y-1 max-h-44 overflow-y-auto">
              {recentCheckIns.slice(0, 5).map((b) => (
                <div key={b.id} className="flex items-center justify-between text-xs p-1.5 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-slate-900">{b.student_name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{b.booking_no}</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded uppercase">
                    BOARDED
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
