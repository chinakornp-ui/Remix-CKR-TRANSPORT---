import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Booking } from '../types/database';
import { CheckCircle2, Clock, MapPin, User, Calendar, Share2, Download, AlertCircle } from 'lucide-react';

interface QRCodeDisplayProps {
  booking: Booking;
  onClose?: () => void;
  onCancelBooking?: (bookingId: string) => void;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  booking,
  onClose,
  onCancelBooking
}) => {
  const isCheckedIn = booking.status === 'checked_in';
  const isCancelled = booking.status === 'cancelled';

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `ตั๋วรถ CKR - ${booking.booking_no}`,
        text: `ตั๋วรถ CKR TRANSPORT หมายเลข ${booking.booking_no} วันที่ ${booking.schedule?.departure_date} เวลา ${booking.schedule?.departure_time} น.`
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(booking.booking_no);
      alert(`คัดลอกรหัสตั๋ว ${booking.booking_no} เรียบร้อยแล้ว`);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden max-w-md mx-auto relative">
      
      {/* Header Ticket Pattern */}
      <div className="bg-slate-900 text-white p-5 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-28 h-28 bg-teal-500/10 rounded-full blur-2xl" />
        
        <p className="text-[11px] font-semibold text-teal-400 tracking-wider uppercase mb-1">
          บัตรโดยสารดิจิทัล / BOARDING PASS
        </p>
        <h2 className="font-heading font-bold text-xl sm:text-2xl text-white tracking-tight">
          CKR TRANSPORT
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          วิทยาลัยพยาบาลบรมราชชนนี จักรีรัช
        </p>

        {/* Status Pill on Header */}
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 border border-slate-700">
          {isCancelled ? (
            <span className="text-rose-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> ยกเลิกแล้ว
            </span>
          ) : isCheckedIn ? (
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> เช็คอินแล้ว (ขึ้นรถได้)
            </span>
          ) : (
            <span className="text-teal-300 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> ยืนยันแล้ว (รอเช็คอิน)
            </span>
          )}
        </div>
      </div>

      {/* QR Code Section */}
      <div className="p-6 text-center bg-gradient-to-b from-slate-50 to-white flex flex-col items-center justify-center border-b border-dashed border-slate-300 relative">
        
        {/* Ticket Notch Cutouts */}
        <div className="absolute -left-3.5 -bottom-3.5 w-7 h-7 bg-slate-900 rounded-full border border-slate-800" />
        <div className="absolute -right-3.5 -bottom-3.5 w-7 h-7 bg-slate-900 rounded-full border border-slate-800" />

        <div className="bg-white p-3.5 rounded-2xl shadow-inner border border-slate-200 inline-block mb-3">
          <QRCodeSVG
            value={booking.booking_no}
            size={180}
            level="H"
            includeMargin={true}
          />
        </div>

        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          รหัสตั๋วเดินทาง
        </p>
        <p className="text-xl sm:text-2xl font-mono font-bold text-slate-900 tracking-wider">
          {booking.booking_no}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          แสดง QR Code นี้แก่พนักงานขับรถก่อนขึ้นรถ
        </p>
      </div>

      {/* Trip & Student Details */}
      <div className="p-5 space-y-4 text-sm bg-white">
        
        {/* Destination & Time info */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
            <span className="text-xs text-slate-500">ปลายทาง</span>
            <span className="font-semibold text-slate-800 text-right">
              {booking.schedule?.destination || 'ตลาดริมน้ำบ้านโป่ง'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500 block">วันที่เดินทาง</span>
              <span className="font-semibold text-slate-800 font-mono">
                {booking.schedule?.departure_date || 'วันนี้'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">เวลาออก / ขากลับ</span>
              <span className="font-semibold text-teal-700 font-mono">
                {booking.schedule?.departure_time} - {booking.schedule?.return_time} น.
              </span>
            </div>
          </div>

          <div className="text-xs">
            <span className="text-slate-500 block">จุดขึ้นรถ</span>
            <span className="font-medium text-slate-800">{booking.pickup_point}</span>
          </div>
        </div>

        {/* Passenger Info */}
        <div className="flex items-center justify-between text-xs px-1 text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              น
            </div>
            <div>
              <p className="font-semibold text-slate-900">{booking.student_name}</p>
              <p className="text-slate-500">รหัส {booking.student_code} (ปี {booking.student_year})</p>
            </div>
          </div>
          <div className="text-right font-mono">
            <span className="text-slate-500 block">จำนวนที่นั่ง</span>
            <span className="font-bold text-slate-800">{booking.pass_count} ที่นั่ง</span>
          </div>
        </div>

        {booking.note && (
          <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-xs text-amber-900">
            <span className="font-semibold">หมายเหตุ: </span>{booking.note}
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            แชร์ตั๋ว / คัดลอกรหัส
          </button>

          {!isCheckedIn && !isCancelled && onCancelBooking && (
            <button
              onClick={() => onCancelBooking(booking.id)}
              className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-medium text-xs sm:text-sm transition-colors"
            >
              ยกเลิกการจอง
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
