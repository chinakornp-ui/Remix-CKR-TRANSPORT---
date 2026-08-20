import React, { useState, useEffect } from 'react';
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  Users,
  CheckCircle2,
  Clock,
  Bus,
  Hospital,
  Search,
  FileSpreadsheet,
  AlertCircle,
  TrendingUp,
  RotateCcw,
  CheckSquare,
  QrCode,
  X
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TripSchedule, Booking, TrainingRequest, CheckIn, WaitingList } from '../types/database';
import { appStore } from '../lib/storage';

interface AdminDashboardPageProps {
  onOpenScanner: () => void;
  onOpenSheetsModal: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onOpenScanner,
  onOpenSheetsModal
}) => {
  const [schedules, setSchedules] = useState<TripSchedule[]>(appStore.getSchedules());
  const [bookings, setBookings] = useState<Booking[]>(appStore.getBookings());
  const [trainingRequests, setTrainingRequests] = useState<TrainingRequest[]>(appStore.getTrainingRequests());
  const [checkIns, setCheckIns] = useState<CheckIn[]>(appStore.getCheckIns());
  const [waitingLists, setWaitingLists] = useState<WaitingList[]>(appStore.getWaitingLists());

  const [activeSection, setActiveSection] = useState<'schedules' | 'manifest' | 'training' | 'analytics'>('schedules');
  const [searchManifest, setSearchManifest] = useState('');
  const [filterScheduleId, setFilterScheduleId] = useState<string>('all');

  // Schedule Modal State
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<TripSchedule | null>(null);
  const [formData, setFormData] = useState({
    route_name: '',
    vehicle_number: 'ฮร-4421 ราชบุรี (รถบัส CKR 01)',
    driver_name: 'นายสมศักดิ์ ขับปลอดภัย',
    departure_date: new Date().toISOString().split('T')[0],
    departure_time: '16:30',
    return_time: '19:30',
    origin: 'หน้าหอพักพยาบาล วพบ.จักรีรัช',
    destination: 'ตลาดโต้รุ่งริมน้ำบ้านโป่ง',
    total_seats: 40,
    is_active: true,
    status: 'open' as TripSchedule['status'],
    booking_deadline: `${new Date().toISOString().split('T')[0]}T15:30:00`,
    notes: ''
  });

  // Training Request Review Modal
  const [selectedTrainingReq, setSelectedTrainingReq] = useState<TrainingRequest | null>(null);
  const [assignDriver, setAssignDriver] = useState('นายวิชัย ใจบริการ');
  const [assignVehicle, setAssignVehicle] = useState('นข-8921 ราชบุรี (รถตู้ปรับอากาศ 1)');
  const [adminNote, setAdminNote] = useState('');

  const refreshAll = () => {
    setSchedules(appStore.getSchedules());
    setBookings(appStore.getBookings());
    setTrainingRequests(appStore.getTrainingRequests());
    setCheckIns(appStore.getCheckIns());
    setWaitingLists(appStore.getWaitingLists());
  };

  useEffect(() => {
    const unsubscribe = appStore.subscribe(refreshAll);
    return () => unsubscribe();
  }, []);

  // Stats Calculations
  const totalSeats = schedules.reduce((acc, s) => acc + s.total_seats, 0);
  const totalBookedSeats = schedules.reduce((acc, s) => acc + s.booked_seats, 0);
  const totalAvailableSeats = Math.max(0, totalSeats - totalBookedSeats);
  const pendingTrainingCount = trainingRequests.filter((r) => r.status === 'pending').length;
  const checkedInBookingsCount = bookings.filter((b) => b.status === 'checked_in').length;
  const totalConfirmedBookings = bookings.filter((b) => b.status === 'confirmed' || b.status === 'checked_in').length;

  // Analytics Chart Data
  const chartData = schedules.map((s) => ({
    name: s.departure_time + ' น.',
    booked: s.booked_seats,
    available: Math.max(0, s.total_seats - s.booked_seats),
    total: s.total_seats
  }));

  const handleOpenAddModal = () => {
    setEditingSchedule(null);
    setFormData({
      route_name: 'สายตลาดริมน้ำบ้านโป่ง (รอบพิเศษ)',
      vehicle_number: 'ฮร-4422 ราชบุรี (รถบัส CKR 02)',
      driver_name: 'นายประเสริฐ ชำนาญทาง',
      departure_date: new Date().toISOString().split('T')[0],
      departure_time: '18:00',
      return_time: '21:00',
      origin: 'หน้าหอพักพยาบาล วพบ.จักรีรัช',
      destination: 'ตลาดโต้รุ่งริมน้ำบ้านโป่ง',
      total_seats: 40,
      is_active: true,
      status: 'open',
      booking_deadline: `${new Date().toISOString().split('T')[0]}T17:00:00`,
      notes: 'เพิ่มรอบพิเศษรองรับนักศึกษา'
    });
    setScheduleModalOpen(true);
  };

  const handleOpenEditModal = (sch: TripSchedule) => {
    setEditingSchedule(sch);
    setFormData({
      route_name: sch.route_name || '',
      vehicle_number: sch.vehicle_number || '',
      driver_name: sch.driver_name || '',
      departure_date: sch.departure_date,
      departure_time: sch.departure_time,
      return_time: sch.return_time,
      origin: sch.origin,
      destination: sch.destination,
      total_seats: sch.total_seats,
      is_active: sch.is_active,
      status: sch.status,
      booking_deadline: sch.booking_deadline,
      notes: sch.notes || ''
    });
    setScheduleModalOpen(true);
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSchedule) {
      appStore.updateSchedule(editingSchedule.id, {
        route_name: formData.route_name,
        vehicle_number: formData.vehicle_number,
        driver_name: formData.driver_name,
        departure_date: formData.departure_date,
        departure_time: formData.departure_time,
        return_time: formData.return_time,
        origin: formData.origin,
        destination: formData.destination,
        total_seats: formData.total_seats,
        is_active: formData.is_active,
        status: formData.status,
        booking_deadline: formData.booking_deadline,
        notes: formData.notes
      });
    } else {
      appStore.addSchedule({
        route_id: 'route-market-1',
        route_name: formData.route_name,
        vehicle_number: formData.vehicle_number,
        driver_name: formData.driver_name,
        departure_date: formData.departure_date,
        departure_time: formData.departure_time,
        return_time: formData.return_time,
        origin: formData.origin,
        destination: formData.destination,
        total_seats: formData.total_seats,
        is_active: formData.is_active,
        booking_deadline: formData.booking_deadline,
        notes: formData.notes
      });
    }
    setScheduleModalOpen(false);
    refreshAll();
  };

  const handleDeleteSchedule = (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรอบรถนี้?')) {
      appStore.deleteSchedule(id);
      refreshAll();
    }
  };

  const handleApproveTraining = (status: 'approved' | 'rejected') => {
    if (!selectedTrainingReq) return;
    appStore.updateTrainingRequestStatus(
      selectedTrainingReq.id,
      status,
      adminNote,
      assignDriver,
      assignVehicle
    );
    setSelectedTrainingReq(null);
    refreshAll();
  };

  // Filtered Passenger Manifest
  const filteredBookings = bookings.filter((b) => {
    const matchSchedule = filterScheduleId === 'all' || b.schedule_id === filterScheduleId;
    const matchSearch =
      searchManifest === '' ||
      b.student_name.toLowerCase().includes(searchManifest.toLowerCase()) ||
      b.student_code.includes(searchManifest) ||
      b.booking_no.toLowerCase().includes(searchManifest.toLowerCase());
    return matchSchedule && matchSearch;
  });

  return (
    <div className="space-y-8 pb-20">
      
      {/* Admin Top Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 px-4 sm:px-6 py-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-slate-900 text-teal-400 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
              ADMIN COCKPIT
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              SYSTEM CONTROL // CKR FLEET
            </span>
          </div>
          <h1 className="font-heading font-bold text-lg sm:text-xl text-slate-900 mt-1">
            แผงควบคุมและบริหารงานยานพาหนะ
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            จัดการรอบรถโดยสาร รายชื่อผู้โดยสาร คำขอรถแหล่งฝึก และระบบสแกนตั๋ว QR
          </p>
        </div>

        {/* Top Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenScanner}
            className="py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>สแกนตั๋ว QR</span>
          </button>

          <button
            onClick={onOpenSheetsModal}
            className="py-1.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Google Sheets</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="py-1.5 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เพิ่มรอบรถ</span>
          </button>
        </div>
      </div>

      {/* 6 Key Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-2.5 sm:gap-3">
        
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">รอบรถทั้งหมด</span>
          <p className="font-heading font-bold text-xl sm:text-2xl text-slate-900 mt-0.5 font-mono">
            {schedules.length}
          </p>
          <span className="text-[10px] text-teal-600 font-semibold uppercase">ACTIVE ROUTES</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">ที่นั่งจองแล้ว</span>
          <p className="font-heading font-bold text-xl sm:text-2xl text-teal-700 mt-0.5 font-mono">
            {totalBookedSeats}/{totalSeats}
          </p>
          <span className="text-[10px] text-slate-500 font-semibold">{totalSeats > 0 ? Math.round((totalBookedSeats / totalSeats) * 100) : 0}% OCCUPIED</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">ที่นั่งว่างคงเหลือ</span>
          <p className="font-heading font-bold text-xl sm:text-2xl text-emerald-700 mt-0.5 font-mono">
            {totalAvailableSeats}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold uppercase">SEATS LEFT</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">เช็คอินแล้ว</span>
          <p className="font-heading font-bold text-xl sm:text-2xl text-slate-800 mt-0.5 font-mono">
            {checkedInBookingsCount}/{totalConfirmedBookings}
          </p>
          <span className="text-[10px] text-teal-600 font-semibold uppercase">BOARDED</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">คิวสำรองรอเรียก</span>
          <p className="font-heading font-bold text-xl sm:text-2xl text-amber-700 mt-0.5 font-mono">
            {waitingLists.filter((w) => w.status === 'pending').length}
          </p>
          <span className="text-[10px] text-amber-600 font-semibold uppercase">WAITLIST</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">คำขอรถแหล่งฝึก</span>
          <p className="font-heading font-bold text-xl sm:text-2xl text-sky-700 mt-0.5 font-mono">
            {pendingTrainingCount}
          </p>
          <span className="text-[10px] text-sky-600 font-semibold uppercase">PENDING</span>
        </div>

      </div>

      {/* Main Section Navigation Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveSection('schedules')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap uppercase ${
              activeSection === 'schedules'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Bus className="w-3.5 h-3.5" />
            <span>จัดการรอบรถ ({schedules.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('manifest')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap uppercase ${
              activeSection === 'manifest'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>รายชื่อผู้โดยสาร & เช็คอิน ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('training')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap uppercase ${
              activeSection === 'training'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Hospital className="w-3.5 h-3.5" />
            <span>คำขอรถแหล่งฝึก ({trainingRequests.length})</span>
            {pendingTrainingCount > 0 && (
              <span className="bg-sky-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {pendingTrainingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSection('analytics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap uppercase ${
              activeSection === 'analytics'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>สถิติการใช้งาน</span>
          </button>
        </div>

        <button
          onClick={() => {
            if (confirm('ต้องการรีเซ็ตข้อมูลตัวอย่างกลับเป็นค่าเริ่มต้นหรือไม่?')) {
              appStore.resetToDefaults();
              refreshAll();
            }
          }}
          className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>รีเซ็ตเดโม่</span>
        </button>
      </div>

      {/* SECTION 1: SCHEDULES MANAGEMENT */}
      {activeSection === 'schedules' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-900 text-slate-200">
                  <tr>
                    <th className="p-3.5 font-semibold">ชื่อเที่ยวรถ / ปลายทาง</th>
                    <th className="p-3.5 font-semibold">วันที่ & เวลาออก-กลับ</th>
                    <th className="p-3.5 font-semibold">ยานพาหนะ / คนขับ</th>
                    <th className="p-3.5 font-semibold text-center">ที่นั่งจอง / ทั้งหมด</th>
                    <th className="p-3.5 font-semibold text-center">สถานะ</th>
                    <th className="p-3.5 font-semibold text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {schedules.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="p-3.5">
                        <p className="font-semibold text-slate-900 text-sm">
                          {s.route_name || s.destination}
                        </p>
                        <p className="text-slate-400 text-[11px]">ขึ้นที่: {s.origin}</p>
                      </td>
                      <td className="p-3.5 font-mono">
                        <p className="font-semibold text-slate-800">{s.departure_date}</p>
                        <p className="text-teal-700 font-bold">{s.departure_time} - {s.return_time} น.</p>
                      </td>
                      <td className="p-3.5">
                        <p className="font-medium text-slate-800">{s.vehicle_number || '-'}</p>
                        <p className="text-slate-500 text-[11px]">{s.driver_name || '-'}</p>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="font-mono font-bold text-sm text-slate-800">
                          {s.booked_seats} / {s.total_seats}
                        </span>
                        <div className="w-20 bg-slate-200 rounded-full h-1.5 mx-auto mt-1 overflow-hidden">
                          <div
                            className="bg-teal-600 h-full rounded-full"
                            style={{ width: `${Math.min(100, (s.booked_seats / s.total_seats) * 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            s.status === 'open'
                              ? 'bg-emerald-100 text-emerald-800'
                              : s.status === 'almost_full'
                              ? 'bg-amber-100 text-amber-800'
                              : s.status === 'full'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {s.status === 'open'
                            ? 'เปิดจอง'
                            : s.status === 'almost_full'
                            ? 'ใกล้เต็ม'
                            : s.status === 'full'
                            ? 'เต็ม'
                            : 'ปิดจอง'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEditModal(s)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                          title="แก้ไขรอบรถ"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(s.id)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                          title="ลบรอบรถ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: PASSENGER MANIFEST & LIVE CHECK-IN */}
      {activeSection === 'manifest' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchManifest}
                onChange={(e) => setSearchManifest(e.target.value)}
                placeholder="ค้นหาด้วยชื่อนักศึกษา, รหัส 66xxxxxxx หรือรหัสตั๋ว CKR-2026-..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterScheduleId}
                onChange={(e) => setFilterScheduleId(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">แสดงทุกลำดับเที่ยวรถ</option>
                {schedules.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.departure_date} - {s.destination} ({s.departure_time} น.)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-900 text-slate-200">
                  <tr>
                    <th className="p-3.5 font-semibold">รหัสตั๋ว / วันเวลาจอง</th>
                    <th className="p-3.5 font-semibold">นักศึกษา</th>
                    <th className="p-3.5 font-semibold">เที่ยวรถ</th>
                    <th className="p-3.5 font-semibold">จุดขึ้นรถ</th>
                    <th className="p-3.5 font-semibold text-center">สถานะเช็คอิน</th>
                    <th className="p-3.5 font-semibold text-right">ดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.map((b) => {
                    const sch = schedules.find((s) => s.id === b.schedule_id);
                    const isCheckedIn = b.status === 'checked_in';
                    return (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="p-3.5">
                          <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                            {b.booking_no}
                          </span>
                          <p className="text-[11px] text-slate-400 mt-1">
                            {new Date(b.created_at).toLocaleTimeString('th-TH')} น.
                          </p>
                        </td>
                        <td className="p-3.5">
                          <p className="font-semibold text-slate-900">{b.student_name}</p>
                          <p className="text-slate-500 text-[11px]">
                            รหัส {b.student_code} (ปี {b.student_year}) • {b.student_phone}
                          </p>
                        </td>
                        <td className="p-3.5">
                          <p className="font-medium text-slate-800">{sch?.destination || b.schedule_id}</p>
                          <p className="text-teal-700 font-mono text-[11px]">{sch?.departure_time} น.</p>
                        </td>
                        <td className="p-3.5 text-slate-700">
                          {b.pickup_point}
                        </td>
                        <td className="p-3.5 text-center">
                          {isCheckedIn ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5" /> เช็คอินแล้ว
                            </span>
                          ) : b.status === 'cancelled' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800">
                              ยกเลิกแล้ว
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                              <Clock className="w-3.5 h-3.5" /> รอเช็คอิน
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          {!isCheckedIn && b.status === 'confirmed' && (
                            <button
                              onClick={() => {
                                appStore.checkInTicket(b.booking_no, 'เจ้าหน้าที่ Admin');
                                refreshAll();
                              }}
                              className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                            >
                              เช็คอินให้
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {filteredBookings.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        ไม่พบรายการผู้โดยสารตามเงื่อนไขการค้นหา
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: TRAINING TRIP REQUESTS APPROVAL */}
      {activeSection === 'training' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-900 text-slate-200">
                  <tr>
                    <th className="p-3.5 font-semibold">เลขที่คำขอ</th>
                    <th className="p-3.5 font-semibold">แหล่งฝึก / โรงพยาบาล</th>
                    <th className="p-3.5 font-semibold">ช่วงวันที่ & เวลา</th>
                    <th className="p-3.5 font-semibold">ผู้ประสานงาน & จำนวนคน</th>
                    <th className="p-3.5 font-semibold text-center">สถานะ</th>
                    <th className="p-3.5 font-semibold text-right">การพิจารณา</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {trainingRequests.map((tr) => (
                    <tr key={tr.id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-mono font-bold text-sky-800">
                        {tr.request_no}
                      </td>
                      <td className="p-3.5">
                        <p className="font-semibold text-slate-900 text-sm">{tr.training_place}</p>
                        <p className="text-slate-500 text-[11px]">
                          {tr.department_ward} • {tr.province}
                        </p>
                      </td>
                      <td className="p-3.5">
                        <p className="font-medium text-slate-800">{tr.start_date} ถึง {tr.end_date}</p>
                        <p className="text-teal-700 font-mono text-[11px]">{tr.departure_time} - {tr.return_time} น.</p>
                      </td>
                      <td className="p-3.5">
                        <p className="font-medium text-slate-800">{tr.coordinator_name}</p>
                        <p className="text-slate-500 text-[11px]">
                          {tr.passenger_count} คน • โทร {tr.coordinator_phone}
                        </p>
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            tr.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : tr.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-sky-100 text-sky-800'
                          }`}
                        >
                          {tr.status === 'approved'
                            ? 'อนุมัติแล้ว'
                            : tr.status === 'rejected'
                            ? 'ไม่อนุมัติ'
                            : 'รอพิจารณา'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedTrainingReq(tr);
                            setAdminNote(tr.admin_notes || '');
                          }}
                          className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                        >
                          ตรวจสอบ / จัดสรรรถ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: ANALYTICS */}
      {activeSection === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <h3 className="font-heading font-bold text-slate-900 text-base mb-1">
              สถิติจำนวนที่นั่งตามรอบรถ (Seat Utilization)
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              เปรียบเทียบที่นั่งที่จองแล้ว (สีเขียวอมฟ้า) กับที่นั่งคงเหลือ (สีเทา)
            </p>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      `${value} ที่นั่ง`,
                      name === 'booked' ? 'จองแล้ว' : 'ว่าง'
                    ]}
                  />
                  <Bar dataKey="booked" stackId="a" fill="#0f766e" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="available" stackId="a" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE CRUD MODAL */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden my-6">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg text-white">
                {editingSchedule ? 'แก้ไขข้อมูลรอบรถ' : 'เพิ่มรอบรถใหม่'}
              </h3>
              <button
                onClick={() => setScheduleModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="p-6 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">ชื่อเส้นทาง / รอบรถ</label>
                <input
                  type="text"
                  required
                  value={formData.route_name}
                  onChange={(e) => setFormData({ ...formData, route_name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">วันที่เดินทาง</label>
                  <input
                    type="date"
                    required
                    value={formData.departure_date}
                    onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">จำนวนที่นั่งทั้งหมด</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    required
                    value={formData.total_seats}
                    onChange={(e) => setFormData({ ...formData, total_seats: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">เวลาออกเดินทาง</label>
                  <input
                    type="time"
                    required
                    value={formData.departure_time}
                    onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">เวลารับกลับ</label>
                  <input
                    type="time"
                    required
                    value={formData.return_time}
                    onChange={(e) => setFormData({ ...formData, return_time: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ทะเบียนรถ / ยานพาหนะ</label>
                  <input
                    type="text"
                    value={formData.vehicle_number}
                    onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">พนักงานขับรถ</label>
                  <input
                    type="text"
                    value={formData.driver_name}
                    onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">จุดหมายปลายทาง</label>
                  <input
                    type="text"
                    required
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">สถานะรอบรถ</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  >
                    <option value="open">เปิดรับการจอง (Open)</option>
                    <option value="almost_full">ใกล้เต็ม (Almost Full)</option>
                    <option value="full">เต็ม (Full)</option>
                    <option value="closed">ปิดรับการจอง (Closed)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">หมายเหตุ</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="เช่น รถปรับอากาศ พร้อม Wi-Fi"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-teal-600 rounded"
                />
                <label htmlFor="isActive" className="text-xs font-semibold text-slate-700">
                  เปิดใช้งานเที่ยวรถนี้ (Active)
                </label>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-semibold transition-colors shadow-md"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TRAINING APPROVAL MODAL */}
      {selectedTrainingReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg text-slate-900">
                พิจารณาคำขอรถไปแหล่งฝึก
              </h3>
              <button
                onClick={() => setSelectedTrainingReq(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <p><strong className="text-slate-900">ปลายทาง:</strong> {selectedTrainingReq.training_place} ({selectedTrainingReq.province})</p>
              <p><strong className="text-slate-900">ช่วงวันที่:</strong> {selectedTrainingReq.start_date} ถึง {selectedTrainingReq.end_date}</p>
              <p><strong className="text-slate-900">เวลาไป-กลับ:</strong> {selectedTrainingReq.departure_time} - {selectedTrainingReq.return_time} น.</p>
              <p><strong className="text-slate-900">ผู้ประสานงาน:</strong> {selectedTrainingReq.coordinator_name} (โทร {selectedTrainingReq.coordinator_phone})</p>
              <p><strong className="text-slate-900">จำนวนนักศึกษา:</strong> {selectedTrainingReq.passenger_count} คน</p>
              {selectedTrainingReq.luggage_details && (
                <p><strong className="text-slate-900">สัมภาระ:</strong> {selectedTrainingReq.luggage_details}</p>
              )}
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">จัดสรรยานพาหนะ</label>
                <input
                  type="text"
                  value={assignVehicle}
                  onChange={(e) => setAssignVehicle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">มอบหมายพนักงานขับรถ</label>
                <input
                  type="text"
                  value={assignDriver}
                  onChange={(e) => setAssignDriver(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">บันทึกข้อความถึงกลุ่มนักศึกษา</label>
                <textarea
                  rows={2}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="เช่น ให้พร้อมขึ้นรถหน้าอาคารอำนวยการเวลา 06:30 น."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => handleApproveTraining('rejected')}
                className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold transition-colors border border-rose-200"
              >
                ไม่อนุมัติ
              </button>
              <button
                onClick={() => handleApproveTraining('approved')}
                className="py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-md"
              >
                อนุมัติและจัดสรรรถ
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
