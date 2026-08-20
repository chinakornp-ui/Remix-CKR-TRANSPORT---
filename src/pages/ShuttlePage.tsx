import React, { useState, useEffect } from 'react';
import { Bus, MapPin, Clock, Users, ArrowRight, ShieldCheck, AlertCircle, Sparkles, Navigation } from 'lucide-react';
import { TripSchedule } from '../types/database';
import { appStore, INITIAL_ROUTES } from '../lib/storage';
import { BookingCard } from '../components/BookingCard';
import { ShuttleBookingModal } from '../components/ShuttleBookingModal';

export const ShuttlePage: React.FC = () => {
  const [schedules, setSchedules] = useState<TripSchedule[]>(appStore.getSchedules());
  const [selectedSchedule, setSelectedSchedule] = useState<TripSchedule | null>(null);

  useEffect(() => {
    const unsubscribe = appStore.subscribe(() => {
      setSchedules(appStore.getSchedules());
    });
    return () => unsubscribe();
  }, []);

  const marketSchedules = schedules.filter(
    (s) => s.route_id?.includes('market') || s.destination.includes('ตลาด') || s.destination.includes('บ้านโป่ง')
  );

  const marketRoute = INITIAL_ROUTES.find((r) => r.type === 'market');

  return (
    <div className="space-y-8 pb-16">
      
      {/* Route Header Banner */}
      <div className="bg-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-800 text-teal-200 text-xs font-semibold mb-3 border border-teal-700">
            <Bus className="w-3.5 h-3.5 text-teal-300" />
            <span>สายประจำ: วันศุกร์ - วันอาทิตย์</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            รถบัสรับ–ส่งตลาดริมน้ำบ้านโป่ง
          </h1>
          <p className="text-teal-100 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            บริการรถบัสปรับอากาศสำหรับนักศึกษาพยาบาล เดินทางไปซื้อของใช้ส่วนตัว รับประทานอาหาร และพักผ่อน ณ ตลาดโต้รุ่งริมน้ำบ้านโป่ง และหอนาฬิกา
          </p>

          {/* Route Stops Ribbon */}
          <div className="mt-5 bg-teal-950/70 p-3.5 rounded-2xl border border-teal-800/80">
            <div className="text-xs font-semibold text-teal-300 mb-2 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5" />
              <span>จุดจอดและเส้นทางเดินรถ:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="bg-teal-900/90 text-teal-100 px-2.5 py-1 rounded-lg border border-teal-700">
                1. หอพักพยาบาล 1-2
              </span>
              <span className="text-teal-400">➔</span>
              <span className="bg-teal-900/90 text-teal-100 px-2.5 py-1 rounded-lg border border-teal-700">
                2. เสาธงวิทยาลัยฯ
              </span>
              <span className="text-teal-400">➔</span>
              <span className="bg-teal-700 text-white font-medium px-2.5 py-1 rounded-lg border border-teal-600">
                3. ตลาดโต้รุ่งริมน้ำบ้านโป่ง
              </span>
              <span className="text-teal-400">➔</span>
              <span className="bg-teal-900/90 text-teal-100 px-2.5 py-1 rounded-lg border border-teal-700">
                4. หอนาฬิกา / โลตัสบ้านโป่ง
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Available Schedules List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-heading font-bold text-slate-900 text-lg sm:text-xl">
              รอบรถที่เปิดให้จองในสัปดาห์นี้
            </h2>
            <p className="text-xs text-slate-500">
              จองล่วงหน้าได้ทันที ระบบจะยืนยันที่นั่งพร้อมสร้าง QR Code สำหรับขึ้นรถ
            </p>
          </div>
          <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
            {marketSchedules.length} รอบรถ
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {marketSchedules.map((schedule) => (
            <BookingCard
              key={schedule.id}
              schedule={schedule}
              onBookClick={(sch) => setSelectedSchedule(sch)}
            />
          ))}

          {marketSchedules.length === 0 && (
            <div className="col-span-full bg-white rounded-3xl border border-slate-200 p-10 text-center text-slate-500">
              <Bus className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-700">ไม่มีรอบรถไปตลาดในขณะนี้</p>
              <p className="text-xs text-slate-400 mt-1">รอบรถจะเปิดให้จองทุกวันพฤหัสบดี - วันอาทิตย์</p>
            </div>
          )}
        </div>
      </div>

      {/* FAQs and Boarding Guide */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="font-heading font-bold text-slate-900 text-base flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-600" />
          คำแนะนำและข้อกำหนดการขึ้นรถ
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="font-semibold text-slate-800 mb-1">การเตรียมตัวขึ้นรถ</p>
            <p>กรุณามารอที่จุดนัดพบก่อนเวลาออกเดินทางอย่างน้อย 10 นาที และเปิดหน้า QR Code บนมือถือให้พร้อมสำหรับให้พนักงานขับรถสแกน</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="font-semibold text-slate-800 mb-1">เวลารถรับกลับวิทยาลัยฯ</p>
            <p>ขากลับรถจะจอดรอบริเวณลานจอดข้างตลาดริมน้ำบ้านโป่ง ตรงตามเวลาที่ระบุในตั๋ว หากนักศึกษาไม่มาตามเวลารถจะออกเดินทางตามกำหนด</p>
          </div>
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
