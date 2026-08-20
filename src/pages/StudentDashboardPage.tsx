import React, { useState, useEffect } from 'react';
import { User, Ticket, Clock, CheckCircle2, AlertCircle, X, QrCode, Trash2, Calendar, MapPin, Bus, Share2 } from 'lucide-react';
import { Booking, WaitingList } from '../types/database';
import { appStore, CURRENT_STUDENT } from '../lib/storage';
import { QRCodeDisplay } from '../components/QRCodeDisplay';

export const StudentDashboardPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>(
    appStore.getStudentBookings(CURRENT_STUDENT.id)
  );
  const [waitingLists, setWaitingLists] = useState<WaitingList[]>(
    appStore.getStudentWaitingLists(CURRENT_STUDENT.id)
  );
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history' | 'waiting'>('upcoming');
  const [selectedBookingForQR, setSelectedBookingForQR] = useState<Booking | null>(null);
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);
  const [cancelResultNotice, setCancelResultNotice] = useState<string | null>(null);

  const refreshData = () => {
    setBookings(appStore.getStudentBookings(CURRENT_STUDENT.id));
    setWaitingLists(appStore.getStudentWaitingLists(CURRENT_STUDENT.id));
  };

  useEffect(() => {
    const unsubscribe = appStore.subscribe(refreshData);
    return () => unsubscribe();
  }, []);

  const upcomingBookings = bookings.filter((b) => b.status === 'confirmed' || b.status === 'checked_in');
  const historyBookings = bookings.filter((b) => b.status === 'cancelled');

  const handleConfirmCancel = () => {
    if (!cancelModalBooking) return;
    const res = appStore.cancelBooking(cancelModalBooking.id);
    setCancelModalBooking(null);
    setCancelResultNotice(res.message);
    refreshData();

    setTimeout(() => {
      setCancelResultNotice(null);
    }, 5000);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Student Greeting Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-teal-700 flex items-center justify-center text-white text-lg font-bold font-heading shadow-xs">
              ช
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 uppercase">
                  NURSING STUDENT
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  ID: {CURRENT_STUDENT.student_code}
                </span>
              </div>
              <h1 className="font-heading font-bold text-base sm:text-lg text-slate-900 mt-0.5">
                {CURRENT_STUDENT.full_name}
              </h1>
              <p className="text-xs text-slate-500">
                ชั้นปีที่ {CURRENT_STUDENT.student_year} • {CURRENT_STUDENT.dormitory}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ACTIVE TICKETS</span>
              <span className="font-heading font-bold text-teal-700 text-base font-mono">{upcomingBookings.length} ใบ</span>
            </div>
            <div className="w-px h-6 bg-slate-200" />
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">WAITLIST</span>
              <span className="font-heading font-bold text-amber-600 text-base font-mono">{waitingLists.length} คิว</span>
            </div>
          </div>
        </div>
      </div>

      {cancelResultNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3 rounded-lg flex items-start gap-2.5 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-xs text-emerald-950 uppercase tracking-wider">SYSTEM NOTICE</p>
            <p className="text-xs text-emerald-800 mt-0.5">{cancelResultNotice}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div>
        <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2.5">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 uppercase ${
              activeTab === 'upcoming'
                ? 'bg-teal-700 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>ตั๋วที่กำลังจะเดินทาง ({upcomingBookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('waiting')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 uppercase ${
              activeTab === 'waiting'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>คิวสำรอง ({waitingLists.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 uppercase ${
              activeTab === 'history'
                ? 'bg-slate-800 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>ประวัติที่ยกเลิก ({historyBookings.length})</span>
          </button>
        </div>

        {/* Tab 1: Upcoming Bookings */}
        {activeTab === 'upcoming' && (
          <div className="mt-4 space-y-3">
            {upcomingBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-teal-500/70 transition-all p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {booking.booking_no}
                    </span>
                    {booking.status === 'checked_in' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded uppercase border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> BOARDED (เช็คอินแล้ว)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded uppercase border border-sky-200">
                        <Clock className="w-3 h-3" /> CONFIRMED (รอเช็คอิน)
                      </span>
                    )}
                  </div>

                  <h3 className="font-heading font-bold text-slate-900 text-base">
                    {booking.schedule?.destination || 'ตลาดริมน้ำบ้านโป่ง'}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>วันที่: <strong className="text-slate-800">{booking.schedule?.departure_date}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>เวลา: <strong className="text-teal-700 font-mono">{booking.schedule?.departure_time} - {booking.schedule?.return_time} น.</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>จุดขึ้นรถ: <strong className="text-slate-800">{booking.pickup_point}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Bus className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>รถ: <strong className="text-slate-800">{booking.schedule?.vehicle_number || 'รถบัสวิทยาลัยฯ'}</strong></span>
                    </div>
                  </div>
                </div>

                {/* QR Code Trigger & Actions */}
                <div className="flex sm:flex-row md:flex-col items-stretch gap-1.5 shrink-0 md:w-36">
                  <button
                    onClick={() => setSelectedBookingForQR(booking)}
                    className="flex-1 py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>ตั๋ว QR</span>
                  </button>

                  {booking.status !== 'checked_in' && (
                    <button
                      onClick={() => setCancelModalBooking(booking)}
                      className="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>ยกเลิก</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {upcomingBookings.length === 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 space-y-1.5">
                <Ticket className="w-8 h-8 mx-auto text-slate-300" />
                <p className="font-bold text-slate-700 text-sm">คุณยังไม่มีตั๋วที่กำลังจะเดินทาง</p>
                <p className="text-xs text-slate-400">เลือกดูรอบรถและจองที่นั่งได้จากหน้าแรกหรือเมนูรถไปตลาดริมน้ำ</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Waiting List */}
        {activeTab === 'waiting' && (
          <div className="mt-6 space-y-4">
            {waitingLists.map((wait) => (
              <div
                key={wait.id}
                className="bg-white rounded-3xl border border-amber-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs rounded-full">
                      ลำดับคิวสำรองที่ {wait.position}
                    </span>
                    <span className="text-xs text-slate-500">
                      ลงทะเบียนเมื่อ: {new Date(wait.created_at).toLocaleTimeString('th-TH')} น.
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-slate-900 text-base sm:text-lg">
                    {wait.schedule?.route_name || wait.schedule?.destination}
                  </h3>

                  <div className="text-xs text-slate-600 space-y-1">
                    <p>รอบวันที่: <span className="font-semibold text-slate-800">{wait.schedule?.departure_date}</span></p>
                    <p>เวลาเดินทาง: <span className="font-semibold text-teal-700">{wait.schedule?.departure_time} น.</span></p>
                  </div>
                </div>

                <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-xs text-amber-900 max-w-xs">
                  <p className="font-semibold">ระบบคิวอัตโนมัติ:</p>
                  <p>หากมีผู้โดยสารสละสิทธิ์ ระบบจะเลื่อนให้คุณทันทีโดยไม่ต้องลงทะเบียนใหม่</p>
                </div>
              </div>
            ))}

            {waitingLists.length === 0 && (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500">
                <Clock className="w-12 h-12 mx-auto text-slate-300 mb-1" />
                <p className="font-heading font-bold text-slate-700 text-base">ไม่มีรายการคิวสำรองในขณะนี้</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Cancelled History */}
        {activeTab === 'history' && (
          <div className="mt-6 space-y-4">
            {historyBookings.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 opacity-70 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-500 font-bold">{b.booking_no}</span>
                    <span className="text-[11px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-semibold">
                      ยกเลิกแล้ว
                    </span>
                  </div>
                  <p className="font-semibold text-slate-800 text-sm mt-1">{b.schedule?.destination}</p>
                  <p className="text-xs text-slate-400">{b.schedule?.departure_date} เวลา {b.schedule?.departure_time} น.</p>
                </div>
              </div>
            ))}

            {historyBookings.length === 0 && (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500">
                <p className="font-semibold text-slate-600">ไม่มีประวัติรายการที่ยกเลิก</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* QR Code Full Modal */}
      {selectedBookingForQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="relative max-w-md w-full">
            <button
              onClick={() => setSelectedBookingForQR(null)}
              className="absolute -top-12 right-0 w-9 h-9 rounded-full bg-white/20 text-white hover:bg-white/40 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <QRCodeDisplay
              booking={selectedBookingForQR}
              onClose={() => setSelectedBookingForQR(null)}
              onCancelBooking={(id) => {
                setSelectedBookingForQR(null);
                setCancelModalBooking(selectedBookingForQR);
              }}
            />
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Dialog */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-heading font-bold text-lg text-slate-900">
                ยืนยันการยกเลิกการจอง?
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                รหัสตั๋ว <strong className="font-mono text-slate-900">{cancelModalBooking.booking_no}</strong><br />
                เมื่อยกเลิกแล้ว ที่นั่งจะถูกส่งต่อให้เพื่อนในลำดับคิวสำรองโดยอัตโนมัติ
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setCancelModalBooking(null)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                ไม่ยกเลิก
              </button>
              <button
                onClick={handleConfirmCancel}
                className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                ยืนยันยกเลิกตั๋ว
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
