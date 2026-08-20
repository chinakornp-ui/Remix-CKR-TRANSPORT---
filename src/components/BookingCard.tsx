import React from 'react';
import { Clock, MapPin, Users, ArrowRight, Bus } from 'lucide-react';
import { TripSchedule } from '../types/database';

interface BookingCardProps {
  schedule: TripSchedule;
  onBookClick: (schedule: TripSchedule) => void;
  isAdmin?: boolean;
  onEditClick?: (schedule: TripSchedule) => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  schedule,
  onBookClick,
  isAdmin = false,
  onEditClick
}) => {
  const availableSeats = Math.max(0, schedule.total_seats - schedule.booked_seats);
  const occupancyPercent = Math.min(100, Math.round((schedule.booked_seats / schedule.total_seats) * 100));

  // Status Badge Rendering
  const renderStatusBadge = () => {
    if (!schedule.is_active || schedule.status === 'closed') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 uppercase border border-slate-200">
          CLOSED
        </span>
      );
    }
    if (schedule.status === 'full' || availableSeats === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 uppercase border border-rose-200">
          FULL (WAITLIST)
        </span>
      );
    }
    if (schedule.status === 'almost_full' || availableSeats <= 5) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 uppercase border border-amber-200">
          ALMOST FULL ({availableSeats} LEFT)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase border border-emerald-200">
        AVAILABLE ({availableSeats})
      </span>
    );
  };

  const formatDateThai = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('th-TH', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const isClosed = !schedule.is_active || schedule.status === 'closed';
  const isFull = schedule.status === 'full' || availableSeats === 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-teal-500/80 transition-all flex flex-col justify-between overflow-hidden">
      
      {/* Header Band */}
      <div className="p-3.5 sm:p-4 border-b border-slate-100">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 uppercase">
                {schedule.route_id ? schedule.route_id.toUpperCase() : 'CKR-SHUTTLE'}
              </span>
              <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                {formatDateThai(schedule.departure_date)}
              </span>
              {schedule.vehicle_number && (
                <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                  {schedule.vehicle_number.split(' ')[0]}
                </span>
              )}
            </div>
            <h3 className="font-heading font-bold text-slate-900 text-sm sm:text-base leading-snug">
              {schedule.route_name || schedule.destination}
            </h3>
          </div>
          <div className="shrink-0">{renderStatusBadge()}</div>
        </div>

        {/* Departure & Return Timing Box */}
        <div className="mt-3 bg-slate-50 rounded-lg p-2.5 border border-slate-200/70">
          <div className="grid grid-cols-2 gap-2 text-left">
            <div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                <Clock className="w-3 h-3 text-teal-600" />
                <span>ขาไป</span>
              </div>
              <p className="font-heading font-bold text-slate-900 text-base text-teal-900 font-mono">
                {schedule.departure_time} <span className="text-[10px] font-normal text-slate-500">น.</span>
              </p>
            </div>
            <div className="border-l border-slate-200 pl-2.5">
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>ขากลับ</span>
              </div>
              <p className="font-heading font-bold text-slate-800 text-base font-mono">
                {schedule.return_time} <span className="text-[10px] font-normal text-slate-500">น.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Origin & Destination */}
        <div className="mt-2.5 space-y-1 text-xs">
          <div className="flex items-start gap-1.5 text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="truncate">
              <span className="text-slate-400 text-[10px] mr-1">ขึ้นรถ:</span>
              <span className="font-medium">{schedule.origin}</span>
            </div>
          </div>
          <div className="flex items-start gap-1.5 text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
            <div className="truncate">
              <span className="text-slate-400 text-[10px] mr-1">ปลายทาง:</span>
              <span className="font-medium">{schedule.destination}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Seat Meter & Action Section */}
      <div className="p-3 sm:p-3.5 bg-slate-50/60 border-t border-slate-100 flex flex-col justify-between">
        
        {/* Seat Count Progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs font-medium mb-1">
            <span className="text-slate-500 text-[11px] flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-400" />
              ครองที่นั่ง
            </span>
            <span className="font-bold text-slate-800 font-mono text-xs">
              {schedule.booked_seats} / {schedule.total_seats} ({occupancyPercent}%)
            </span>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all rounded-full ${
                isFull
                  ? 'bg-rose-500'
                  : occupancyPercent > 80
                  ? 'bg-amber-500'
                  : 'bg-teal-600'
              }`}
              style={{ width: `${occupancyPercent}%` }}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-1.5">
          {isAdmin && onEditClick ? (
            <button
              onClick={() => onEditClick(schedule)}
              className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              แก้ไขเที่ยวรถ
            </button>
          ) : isClosed ? (
            <button
              disabled
              className="w-full py-1.5 px-3 bg-slate-200 text-slate-500 rounded-lg text-xs font-bold cursor-not-allowed text-center"
            >
              ปิดรับการจอง
            </button>
          ) : isFull ? (
            <button
              onClick={() => onBookClick(schedule)}
              className="w-full py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>ลงชื่อคิวสำรอง</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => onBookClick(schedule)}
              className="w-full py-1.5 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>จองที่นั่ง</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
