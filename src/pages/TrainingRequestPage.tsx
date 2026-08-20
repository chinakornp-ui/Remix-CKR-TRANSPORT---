import React, { useState, useEffect } from 'react';
import { Hospital, Calendar, Users, Clock, MapPin, Send, CheckCircle2, AlertCircle, FileText, Phone, User, Package, ChevronRight } from 'lucide-react';
import { TrainingRequest, Student } from '../types/database';
import { appStore, CURRENT_STUDENT } from '../lib/storage';
import confetti from 'canvas-confetti';

export const TrainingRequestPage: React.FC = () => {
  const [requests, setRequests] = useState<TrainingRequest[]>(
    appStore.getStudentTrainingRequests(CURRENT_STUDENT.id)
  );

  const [trainingPlace, setTrainingPlace] = useState('โรงพยาบาลบ้านโป่ง');
  const [customPlace, setCustomPlace] = useState('');
  const [province, setProvince] = useState('ราชบุรี');
  const [departmentWard, setDepartmentWard] = useState('หอผู้ป่วยอายุรกรรมหญิง');
  const [startDate, setStartDate] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0]
  );
  const [origin, setOrigin] = useState('วิทยาลัยพยาบาลบรมราชชนนี จักรีรัช');
  const [departureTime, setDepartureTime] = useState('06:45');
  const [returnTime, setReturnTime] = useState('16:45');
  const [passengerCount, setPassengerCount] = useState<number>(8);
  const [luggageDetails, setLuggageDetails] = useState('กระเป๋าเวชภัณฑ์ประจำกลุ่ม 2 ใบ + กล่องโมเดลกายวิภาคศาสตร์ 1 กล่อง');
  const [coordinatorName, setCoordinatorName] = useState(CURRENT_STUDENT.full_name);
  const [coordinatorPhone, setCoordinatorPhone] = useState(CURRENT_STUDENT.phone);
  const [advisorName, setAdvisorName] = useState('อาจารย์ ดร.ศิริพร บุญส่ง');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = appStore.subscribe(() => {
      setRequests(appStore.getStudentTrainingRequests(CURRENT_STUDENT.id));
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await new Promise((r) => setTimeout(r, 600));

      const placeName = trainingPlace === 'other' ? customPlace : trainingPlace;

      appStore.submitTrainingRequest({
        student_id: CURRENT_STUDENT.id,
        student_name: CURRENT_STUDENT.full_name,
        student_code: CURRENT_STUDENT.student_code,
        student_year: CURRENT_STUDENT.student_year,
        start_date: startDate,
        end_date: endDate,
        training_place: placeName,
        province,
        origin,
        departure_time: departureTime,
        return_time: returnTime,
        passenger_count: passengerCount,
        luggage_details: luggageDetails,
        coordinator_name: coordinatorName,
        coordinator_phone: coordinatorPhone,
        advisor_name: advisorName,
        department_ward: departmentWard
      });

      confetti({
        particleCount: 70,
        spread: 50,
        origin: { y: 0.7 }
      });

      setSuccessMessage('ส่งคำขอรับ-ส่งไปแหล่งฝึกปฏิบัติการเรียบร้อยแล้ว! เจ้าหน้าที่จะตรวจสอบและจัดสรรรถให้ล่วงหน้า');
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 6000);
    } catch {
      alert('เกิดข้อผิดพลาดในการส่งคำขอ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStatusBadge = (status: TrainingRequest['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> อนุมัติแล้ว (จัดสรรรถเรียบร้อย)
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5" /> ไม่อนุมัติ
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            เสร็จสิ้นการเดินทาง
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200 animate-pulse-gentle">
            <Clock className="w-3.5 h-3.5" /> รอตรวจสอบและอนุมัติ
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Banner */}
      <div className="bg-sky-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-800 text-sky-200 text-xs font-semibold mb-3 border border-sky-700">
            <Hospital className="w-3.5 h-3.5 text-sky-300" />
            <span>กลุ่มงานฝึกปฏิบัติการคลินิก & งานยานพาหนะ</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            แบบคำขอรถไปแหล่งฝึกปฏิบัติการพยาบาล
          </h1>
          <p className="text-sky-200 text-xs sm:text-sm mt-1 leading-relaxed">
            สำหรับนักศึกษาพยาบาลชั้นปีที่ 2 - 4 ยื่นคำขอยานพาหนะรับ-ส่งกลุ่มฝึกปฏิบัติงาน ณ โรงพยาบาลศูนย์ โรงพยาบาลทั่วไป และ รพ.สต.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl flex items-start gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm text-emerald-950">ดำเนินการสำเร็จ</p>
            <p className="text-xs text-emerald-800 mt-0.5">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Main Grid: Form (Left) & Request Tracker (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Request Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs">
          <h2 className="font-heading font-bold text-slate-900 text-lg sm:text-xl mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-600" />
            กรอกข้อมูลคำขอเดินทาง
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            
            {/* Hospital / Training Site */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                แหล่งฝึก / โรงพยาบาลปลายทาง
              </label>
              <select
                value={trainingPlace}
                onChange={(e) => setTrainingPlace(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              >
                <option value="โรงพยาบาลบ้านโป่ง">โรงพยาบาลบ้านโป่ง (อ.บ้านโป่ง จ.ราชบุรี)</option>
                <option value="โรงพยาบาลราชบุรี">โรงพยาบาลราชบุรี (ศูนย์การแพทย์)</option>
                <option value="โรงพยาบาลโพธาราม">โรงพยาบาลโพธาราม</option>
                <option value="รพ.สต.เบิกไพร">รพ.สต.เบิกไพร (อ.บ้านโป่ง)</option>
                <option value="โรงพยาบาลดำเนินสะดวก">โรงพยาบาลดำเนินสะดวก</option>
                <option value="โรงพยาบาลนครปฐม">โรงพยาบาลนครปฐม</option>
                <option value="other">แหล่งฝึกอื่นๆ (ระบุเอง)</option>
              </select>
            </div>

            {trainingPlace === 'other' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ระบุชื่อแหล่งฝึก / หน่วยงาน
                </label>
                <input
                  type="text"
                  required
                  value={customPlace}
                  onChange={(e) => setCustomPlace(e.target.value)}
                  placeholder="เช่น โรงพยาบาลส่งเสริมสุขภาพตำบลเขางู"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  หอผู้ป่วย / วอร์ด / แผนก
                </label>
                <input
                  type="text"
                  value={departmentWard}
                  onChange={(e) => setDepartmentWard(e.target.value)}
                  placeholder="เช่น หอผู้ป่วยศัลยกรรมหญิง 1"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  จังหวัด
                </label>
                <input
                  type="text"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  วันที่เริ่มฝึก
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  วันที่สิ้นสุดการฝึก
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Time of Day & Passengers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  เวลาออกเดินทาง
                </label>
                <input
                  type="time"
                  required
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  เวลารับกลับ
                </label>
                <input
                  type="time"
                  required
                  value={returnTime}
                  onChange={(e) => setReturnTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  จำนวนนักศึกษา (คน)
                </label>
                <input
                  type="number"
                  min={1}
                  max={45}
                  required
                  value={passengerCount}
                  onChange={(e) => setPassengerCount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Coordinator & Advisor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  หัวหน้ากลุ่ม / ผู้ประสานงาน
                </label>
                <input
                  type="text"
                  required
                  value={coordinatorName}
                  onChange={(e) => setCoordinatorName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  เบอร์โทรศัพท์ผู้ประสานงาน
                </label>
                <input
                  type="tel"
                  required
                  value={coordinatorPhone}
                  onChange={(e) => setCoordinatorPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                อาจารย์นิเทศก์ประจำกลุ่ม
              </label>
              <input
                type="text"
                value={advisorName}
                onChange={(e) => setAdvisorName(e.target.value)}
                placeholder="เช่น อาจารย์ ดร.ศิริพร บุญส่ง"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Luggage / Equipment */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                รายละเอียดอุปกรณ์การแพทย์และสัมภาระ
              </label>
              <textarea
                rows={2}
                value={luggageDetails}
                onChange={(e) => setLuggageDetails(e.target.value)}
                placeholder="เช่น กล่องกระเป๋ายา, โมเดลสาธิต, ลังอุปกรณ์ประเมินพัฒนาการ"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Submit */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-sky-700 hover:bg-sky-800 disabled:bg-sky-400 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md transition-all"
              >
                {isSubmitting ? (
                  <span>กำลังส่งข้อมูลคำขอ...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>ส่งคำขอยานพาหนะไปแหล่งฝึก</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Status Tracker (Right) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-slate-900 text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-sky-700" />
              สถานะคำขอของกลุ่มคุณ ({requests.length})
            </h2>
          </div>

          <div className="space-y-3.5">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs text-sky-700 font-bold bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                      {req.request_no}
                    </span>
                    <h3 className="font-heading font-bold text-slate-900 text-base mt-1">
                      {req.training_place}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {req.department_ward} • {req.province}
                    </p>
                  </div>
                  <div className="shrink-0">{renderStatusBadge(req.status)}</div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1.5 border border-slate-100">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>ช่วงวันที่:</span>
                    <span className="font-semibold text-slate-800">
                      {req.start_date} ถึง {req.end_date}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>เวลาไป-กลับ:</span>
                    <span className="font-semibold text-teal-700 font-mono">
                      {req.departure_time} - {req.return_time} น.
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>จำนวนนักศึกษา:</span>
                    <span className="font-semibold text-slate-800">{req.passenger_count} คน</span>
                  </div>
                </div>

                {req.assigned_vehicle && (
                  <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                    <p className="font-semibold">รถที่จัดสรร:</p>
                    <p>{req.assigned_vehicle} (คนขับ: {req.assigned_driver || '-'})</p>
                  </div>
                )}

                {req.admin_notes && (
                  <div className="bg-slate-100 p-2.5 rounded-xl text-xs text-slate-700">
                    <p className="font-semibold text-slate-800">บันทึกจากเจ้าหน้าที่:</p>
                    <p>{req.admin_notes}</p>
                  </div>
                )}
              </div>
            ))}

            {requests.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
                <Hospital className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="font-semibold text-slate-700">ยังไม่มีประวัติคำขอยานพาหนะ</p>
                <p className="text-xs text-slate-400 mt-1">
                  กรอกแบบฟอร์มด้านซ้ายเพื่อยื่นคำขอรถไปแหล่งฝึก
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
