import React, { useState, useEffect } from 'react';
import { Bus, Hospital, Ticket, ArrowRight, ShieldCheck, Clock, MapPin, Sparkles, Filter, AlertCircle, Info, Calendar, Activity, Zap, CheckCircle2 } from 'lucide-react';
import { TripSchedule, Student } from '../types/database';
import { appStore, CURRENT_STUDENT } from '../lib/storage';
import { BookingCard } from '../components/BookingCard';
import { ShuttleBookingModal } from '../components/ShuttleBookingModal';

interface HomePageProps {
  onNavigate: (tab: string) => void;
  isAdmin?: boolean;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, isAdmin = false }) => {
  const [schedules, setSchedules] = useState<TripSchedule[]>(appStore.getSchedules());
  const [selectedSchedule, setSelectedSchedule] = useState<TripSchedule | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'market' | 'training'>('all');

  useEffect(() => {
    const unsubscribe = appStore.subscribe(() => {
      setSchedules(appStore.getSchedules());
    });
    return () => unsubscribe();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredSchedules = schedules.filter((s) => {
    if (activeFilter === 'today') return s.departure_date === todayStr;
    if (activeFilter === 'market') return s.route_id?.includes('market') || s.destination.includes('ตลาด');
    if (activeFilter === 'training') return s.route_id?.includes('training') || s.destination.includes('รพ');
    return true;
  });

  const totalSeats = schedules.reduce((acc, s) => acc + s.total_seats, 0);
  const totalBookedSeats = schedules.reduce((acc, s) => acc + s.booked_seats, 0);
  const totalAvailableSeats = Math.max(0, totalSeats - totalBookedSeats);
  const waitingLists = appStore.getWaitingLists();
  const trainingReqs = appStore.getTrainingRequests();

  const studentBookings = appStore.getStudentBookings(CURRENT_STUDENT.id);
  const activeConfirmedBooking = studentBookings.find(
    (b) => b.status === 'confirmed' || b.status === 'checked_in'
  );

  return (
    <div className="space-y-5 pb-16">
      
      {/* High Density Header Bar */}
      <div className="bg-white rounded-xl border border-slate-200 px-4 sm:px-6 py-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2 font-heading">
              <span>แดชบอร์ดระบบงานยานพาหนะ</span>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded border border-emerald-200 uppercase tracking-tighter">
                Live Sync Active
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              วิทยาลัยพยาบาลบรมราชชนนี จักรีรัช • ตารางเดินรถและระบบจองที่นั่งอัตโนมัติ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('shuttle')}
            className="bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
          >
            <Bus className="w-3.5 h-3.5" />
            <span>จองรถตลาดริมน้ำ</span>
          </button>
          <button
            onClick={() => onNavigate('training')}
            className="bg-slate-800 hover:bg-slate-900 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
          >
            <Hospital className="w-3.5 h-3.5 text-teal-400" />
            <span>ขอรถไปแหล่งฝึก</span>
          </button>
        </div>
      </div>

      {/* 4 High-Density Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Card 1: Today's Bookings */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            ที่นั่งจองทั้งหมด
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono">
            {totalBookedSeats}
          </p>
          <div className="mt-2 flex items-center text-xs text-emerald-600 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
            <span>อัตราครองที่นั่ง {totalSeats > 0 ? Math.round((totalBookedSeats / totalSeats) * 100) : 0}%</span>
          </div>
        </div>

        {/* Card 2: Available Seats */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            ที่นั่งว่างคงเหลือ
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono">
            {totalAvailableSeats} <span className="text-sm font-normal text-slate-400">/ {totalSeats}</span>
          </p>
          <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full ${totalAvailableSeats <= 5 ? 'bg-rose-500' : 'bg-teal-500'}`}
              style={{ width: `${totalSeats > 0 ? (totalAvailableSeats / totalSeats) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Card 3: Waiting List */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            คิวสำรองรอเรียก
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono">
            {waitingLists.filter(w => w.status === 'pending').length}
          </p>
          <p className="mt-2 text-xs text-amber-600 font-medium truncate">
            {waitingLists.length > 0 ? 'เลื่อนอัตโนมัติเมื่อมีสละสิทธิ์' : 'ไม่มีคิวค้างในระบบ'}
          </p>
        </div>

        {/* Card 4: Training Requests */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            คำขอรถไปแหล่งฝึก
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-teal-600 font-mono">
            {trainingReqs.filter(r => r.status === 'pending').length.toString().padStart(2, '0')}
          </p>
          <p className="mt-2 text-xs text-slate-400 truncate">
            รอการอนุมัติ / จัดสรรรถ
          </p>
        </div>

      </div>

      {/* Active Ticket Notification if Student has confirmed trip */}
      {activeConfirmedBooking && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900 text-white border border-slate-800 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wide">
                  ตั๋วพร้อมเดินทางของคุณ
                </span>
                <span className="font-mono text-xs bg-slate-800 text-teal-300 px-2 py-0.5 rounded border border-slate-700 font-bold">
                  {activeConfirmedBooking.booking_no}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {activeConfirmedBooking.schedule?.destination} • วันที่ {activeConfirmedBooking.schedule?.departure_date} เวลา {activeConfirmedBooking.schedule?.departure_time} น. (จุดขึ้นรถ: {activeConfirmedBooking.pickup_point})
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('student-dashboard')}
            className="py-1.5 px-3 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg text-xs font-bold shrink-0 transition-colors shadow-xs"
          >
            แสดง QR Code
          </button>
        </div>
      )}

      {/* 3 Quick Action High-Density Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        
        {/* Card 1: Shuttle to Ban Pong Market */}
        <div
          onClick={() => onNavigate('shuttle')}
          className="group cursor-pointer bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs hover:border-teal-500 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                <Bus className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                ศุกร์ - อาทิตย์
              </span>
            </div>
            <h3 className="font-heading font-bold text-slate-900 text-base group-hover:text-teal-700 transition-colors">
              1. 🚌 จองรถไปตลาดริมน้ำบ้านโป่ง
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              รถบัสรับ-ส่ง ซื้อของ พักผ่อน ตลาดโต้รุ่งริมน้ำ และสถานีรถไฟบ้านโป่ง
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-700">
            <span>เลือกรอบและจองที่นั่ง</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Training Trip Request */}
        <div
          onClick={() => onNavigate('training')}
          className="group cursor-pointer bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs hover:border-sky-500 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
                <Hospital className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                ฝึกปฏิบัติคลินิก
              </span>
            </div>
            <h3 className="font-heading font-bold text-slate-900 text-base group-hover:text-sky-700 transition-colors">
              2. 🏥 จองรถไปแหล่งฝึก
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              ยื่นคำขอรถตู้/มินิบัสล่วงหน้า สำหรับกลุ่มนักศึกษาพยาบาลขึ้นฝึกปฏิบัติงาน ณ รพ.ศูนย์/รพช./รพ.สต.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-700">
            <span>ยื่นคำขอเดินทาง</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: My Bookings & Boarding Pass */}
        <div
          onClick={() => onNavigate('student-dashboard')}
          className="group cursor-pointer bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-400 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
                <Ticket className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                QR PASS
              </span>
            </div>
            <h3 className="font-heading font-bold text-slate-900 text-base group-hover:text-slate-900 transition-colors">
              3. 🎟️ การจองของฉัน
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              ดูตั๋วโดยสารดิจิทัล QR Code สำหรับขึ้นรถ ตรวจสอบลำดับคิวสำรอง และยกเลิกตั๋ว
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800">
            <span>ตรวจสอบตั๋วของฉัน</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>

      {/* Active Trip Monitors (Live) Table - High Density Pattern */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
        <div className="p-3.5 sm:p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-800 text-sm font-heading">
              ตารางตรวจการเดินรถสด (Active Trip Monitors)
            </h3>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live Sync</span>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition-all whitespace-nowrap ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              ทั้งหมด ({schedules.length})
            </button>
            <button
              onClick={() => setActiveFilter('today')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition-all whitespace-nowrap ${
                activeFilter === 'today'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              วันนี้ ({schedules.filter((s) => s.departure_date === todayStr).length})
            </button>
            <button
              onClick={() => setActiveFilter('market')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition-all whitespace-nowrap ${
                activeFilter === 'market'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              ตลาดริมน้ำ
            </button>
            <button
              onClick={() => setActiveFilter('training')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition-all whitespace-nowrap ${
                activeFilter === 'training'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              แหล่งฝึก
            </button>
          </div>
        </div>

        {/* High Density Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Route ID</th>
                <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Destination</th>
                <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Departure</th>
                <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Occupancy</th>
                <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSchedules.map((s, idx) => {
                const available = Math.max(0, s.total_seats - s.booked_seats);
                const percent = Math.min(100, Math.round((s.booked_seats / s.total_seats) * 100));
                const isFull = s.status === 'full' || available === 0;
                const isClosed = !s.is_active || s.status === 'closed';

                return (
                  <tr key={s.id} className={idx % 2 === 1 ? 'bg-slate-50/50 hover:bg-slate-100/70' : 'hover:bg-slate-50'}>
                    <td className="p-3 font-mono text-xs font-bold text-teal-800">
                      {s.route_id ? s.route_id.toUpperCase() : `CKR-R${idx + 1}`}
                    </td>
                    <td className="p-3">
                      <p className="text-xs sm:text-sm font-bold text-slate-800">{s.destination}</p>
                      <p className="text-[11px] text-slate-400 truncate">{s.route_name || s.origin}</p>
                    </td>
                    <td className="p-3 text-slate-600 font-mono">
                      <span className="font-semibold text-slate-800">{s.departure_date}</span>
                      <span className="text-teal-700 font-bold ml-1.5">{s.departure_time} น.</span>
                    </td>
                    <td className="p-3 min-w-[140px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              isFull
                                ? 'bg-rose-500'
                                : percent >= 80
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className={`text-xs font-bold font-mono ${
                          isFull
                            ? 'text-rose-600'
                            : percent >= 80
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}>
                          {isFull ? 'FULL' : `${s.booked_seats}/${s.total_seats}`}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      {isClosed ? (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded uppercase">
                          Closed
                        </span>
                      ) : isFull ? (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded uppercase">
                          Full (Waiting)
                        </span>
                      ) : percent >= 80 ? (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded uppercase">
                          Almost Full
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded uppercase">
                          Available
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedSchedule(s)}
                        className={`px-3 py-1 rounded text-xs font-bold uppercase transition-all ${
                          isClosed
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : isFull
                            ? 'bg-amber-600 hover:bg-amber-700 text-white'
                            : 'bg-teal-600 hover:bg-teal-700 text-white'
                        }`}
                      >
                        {isFull ? 'เข้าคิว' : 'จอง'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Detail Grid Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-bold text-slate-900 text-base">
            รายละเอียดเที่ยวรถทั้งหมด ({filteredSchedules.length})
          </h2>
          <span className="text-[11px] text-slate-500">เลือกดูและจองแบบละเอียด</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSchedules.map((schedule) => (
            <BookingCard
              key={schedule.id}
              schedule={schedule}
              onBookClick={(sch) => setSelectedSchedule(sch)}
              isAdmin={isAdmin}
              onEditClick={() => onNavigate('admin-dashboard')}
            />
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      {selectedSchedule && (
        <ShuttleBookingModal
          schedule={selectedSchedule}
          onClose={() => setSelectedSchedule(null)}
          onBookingSuccess={() => {
            setSchedules(appStore.getSchedules());
          }}
        />
      )}

    </div>
  );
};
