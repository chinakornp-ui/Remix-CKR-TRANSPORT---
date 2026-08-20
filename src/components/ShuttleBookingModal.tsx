import React, { useState } from 'react';
import { X, CheckCircle2, Clock, MapPin, User, Phone, AlertCircle, Sparkles, Bus } from 'lucide-react';
import { TripSchedule, Student, BookTripAtomicResult } from '../types/database';
import { appStore, CURRENT_STUDENT } from '../lib/storage';
import { QRCodeDisplay } from './QRCodeDisplay';
import confetti from 'canvas-confetti';

interface ShuttleBookingModalProps {
  schedule: TripSchedule;
  onClose: () => void;
  onBookingSuccess: () => void;
}

export const ShuttleBookingModal: React.FC<ShuttleBookingModalProps> = ({
  schedule,
  onClose,
  onBookingSuccess
}) => {
  const [student, setStudent] = useState<Student>(CURRENT_STUDENT);
  const [pickupPoint, setPickupPoint] = useState<string>('หน้าหอพักพยาบาล 1-2');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookingResult, setBookingResult] = useState<BookTripAtomicResult | null>(null);

  const availableSeats = Math.max(0, schedule.total_seats - schedule.booked_seats);
  const isFull = schedule.status === 'full' || availableSeats === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student.full_name || !student.phone || !student.student_code) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate network jitter & atomic concurrency locking
      await new Promise((r) => setTimeout(r, 600));

      const result = await appStore.bookTripAtomic({
        scheduleId: schedule.id,
        student,
        passCount: 1,
        pickupPoint,
        note
      });

      setBookingResult(result);

      if (result.success && result.type === 'confirmed') {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
      }

      onBookingSuccess();
    } catch (err) {
      setBookingResult({
        success: false,
        type: 'error',
        message: 'เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden my-6 transition-all">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">
                {isFull ? 'ลงชื่อเข้าคิวสำรอง' : 'ยืนยันการจองที่นั่ง'}
              </h3>
              <p className="text-xs text-slate-400">
                {schedule.route_name || schedule.destination}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6">
          {bookingResult ? (
            // Result View
            <div>
              {bookingResult.type === 'confirmed' && bookingResult.booking ? (
                <div className="space-y-4">
                  <div className="text-center py-2">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h4 className="font-heading font-bold text-lg text-slate-900">
                      จองที่นั่งเรียบร้อยแล้ว!
                    </h4>
                    <p className="text-xs text-slate-500">
                      {bookingResult.message}
                    </p>
                  </div>

                  <QRCodeDisplay booking={bookingResult.booking} />

                  <button
                    onClick={onClose}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium text-sm transition-colors mt-4"
                  >
                    ปิดหน้าต่าง / กลับสู่หน้าหลัก
                  </button>
                </div>
              ) : bookingResult.type === 'waiting' && bookingResult.waiting ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
                    <Clock className="w-8 h-8" />
                  </div>
                  <h4 className="font-heading font-bold text-xl text-slate-900">
                    คุณอยู่ในลำดับคิวสำรองที่ {bookingResult.waiting.position}
                  </h4>
                  <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                    ระบบได้ลงทะเบียนคิวสำรองของคุณเรียบร้อยแล้ว เมื่อมีผู้โดยสารที่นั่งยืนยันกดยกเลิก ระบบจะเลื่อนสถานะเป็นตั๋วยืนยันให้อัตโนมัติทันที
                  </p>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-left space-y-1">
                    <p className="text-slate-500">ชื่อนักศึกษา: <span className="font-medium text-slate-800">{student.full_name}</span></p>
                    <p className="text-slate-500">รหัสนักศึกษา: <span className="font-medium text-slate-800">{student.student_code} (ปี {student.student_year})</span></p>
                    <p className="text-slate-500">เที่ยวรถ: <span className="font-medium text-slate-800">{schedule.destination} เวลา {schedule.departure_time} น.</span></p>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium text-sm transition-colors"
                  >
                    รับทราบและปิดหน้าต่าง
                  </button>
                </div>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <h4 className="font-heading font-bold text-lg text-slate-900">
                    ไม่สามารถดำเนินการได้
                  </h4>
                  <p className="text-sm text-slate-600">{bookingResult.message}</p>
                  <button
                    onClick={() => setBookingResult(null)}
                    className="w-full py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-medium text-sm transition-colors mt-3"
                  >
                    ลองใหม่อีกครั้ง
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Booking Form
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Trip Summary Card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span>รอบการเดินทาง</span>
                  <span className="font-mono text-teal-700 font-semibold">{schedule.departure_date}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">
                      {schedule.origin}
                    </p>
                    <p className="text-xs text-slate-500">เวลาออก: {schedule.departure_time} น.</p>
                  </div>
                  <span className="text-slate-400 font-bold">➔</span>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900 text-sm">
                      {schedule.destination}
                    </p>
                    <p className="text-xs text-slate-500">เวลารับกลับ: {schedule.return_time} น.</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="text-slate-600">สถานะที่นั่ง:</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    จองแล้ว {schedule.booked_seats}/{schedule.total_seats} ที่นั่ง
                  </span>
                </div>
              </div>

              {/* Student Details Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อ-นามสกุล นักศึกษา
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={student.full_name}
                      onChange={(e) => setStudent({ ...student, full_name: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      รหัสนักศึกษา
                    </label>
                    <input
                      type="text"
                      required
                      value={student.student_code}
                      onChange={(e) => setStudent({ ...student, student_code: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ชั้นปีการศึกษา
                    </label>
                    <select
                      value={student.student_year}
                      onChange={(e) => setStudent({ ...student, student_year: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value={1}>ปี 1 (พยาบาลศาสตรบัณฑิต)</option>
                      <option value={2}>ปี 2 (พยาบาลศาสตรบัณฑิต)</option>
                      <option value={3}>ปี 3 (พยาบาลศาสตรบัณฑิต)</option>
                      <option value={4}>ปี 4 (พยาบาลศาสตรบัณฑิต)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เบอร์โทรศัพท์ที่ติดต่อได้
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      value={student.phone}
                      onChange={(e) => setStudent({ ...student, phone: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="08X-XXX-XXXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    จุดขึ้นรถ
                  </label>
                  <select
                    value={pickupPoint}
                    onChange={(e) => setPickupPoint(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="หน้าหอพักพยาบาล 1-2">หน้าหอพักพยาบาล 1-2</option>
                    <option value="ลานจอดรถหน้าเสาธง วิทยาลัย">ลานจอดรถหน้าเสาธง วิทยาลัย</option>
                    <option value="ป้อมยามหน้าวิทยาลัยฯ">ป้อมยามหน้าวิทยาลัยฯ</option>
                    <option value="หน้าอาคารอำนวยการ">หน้าอาคารอำนวยการ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    หมายเหตุเพิ่มเติม (ถ้ามี)
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="เช่น มีสัมภาระขนาดใหญ่, กลับรถเที่ยวเดียว"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 rounded-xl font-medium text-sm text-white transition-all duration-150 flex items-center justify-center gap-2 shadow-md ${
                    isFull
                      ? 'bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400'
                      : 'bg-teal-700 hover:bg-teal-800 disabled:bg-teal-400'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      กำลังประมวลผลการจอง...
                    </span>
                  ) : isFull ? (
                    <span>ยืนยันลงชื่อเข้าคิวสำรอง</span>
                  ) : (
                    <span>ยืนยันการจองที่นั่งทันที</span>
                  )}
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
