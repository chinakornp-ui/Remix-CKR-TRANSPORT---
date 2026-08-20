import { TripSchedule, Booking, TrainingRequest, CheckIn } from '../types/database';

export interface ExportSheetData {
  title: string;
  schedules: TripSchedule[];
  bookings: Booking[];
  trainingRequests: TrainingRequest[];
  checkIns: CheckIn[];
}

export interface GoogleSheetsSyncResult {
  success: boolean;
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  message: string;
  timestamp: string;
}

/**
 * Builds structured 2D arrays for Google Sheets tabs
 */
export function buildSheetsData(data: ExportSheetData) {
  // 1. Schedules Sheet
  const schedulesHeaders = [
    'รหัสเที่ยวรถ',
    'ชื่อเส้นทาง/รอบ',
    'ทะเบียนรถ/ยานพาหนะ',
    'พนักงานขับรถ',
    'วันที่เดินทาง',
    'เวลาออก',
    'เวลากลับ',
    'จุดขึ้นรถ',
    'จุดหมายปลายทาง',
    'ที่นั่งทั้งหมด',
    'ที่นั่งจองแล้ว',
    'ที่นั่งว่าง',
    'สถานะรอบรถ',
    'กำหนดเวลาปิดรับจอง',
    'หมายเหตุ'
  ];

  const schedulesRows = data.schedules.map((s) => [
    s.id,
    s.route_name || '-',
    s.vehicle_number || '-',
    s.driver_name || '-',
    s.departure_date,
    s.departure_time,
    s.return_time,
    s.origin,
    s.destination,
    s.total_seats,
    s.booked_seats,
    Math.max(0, s.total_seats - s.booked_seats),
    s.status === 'open' ? 'เปิดรับการจอง' : s.status === 'almost_full' ? 'ใกล้เต็ม' : s.status === 'full' ? 'เต็ม' : 'ปิดการจอง',
    s.booking_deadline,
    s.notes || '-'
  ]);

  // 2. Bookings & Check-in Manifest Sheet
  const bookingsHeaders = [
    'รหัสตั๋วการจอง (Booking No)',
    'รหัสนักศึกษา',
    'ชื่อ-นามสกุล นักศึกษา',
    'ชั้นปี',
    'เบอร์โทรศัพท์',
    'เที่ยวรถ / ปลายทาง',
    'วันที่เดินทาง',
    'เวลาออก',
    'จำนวนที่นั่ง',
    'จุดขึ้นรถ',
    'สถานะตั๋ว',
    'สถานะเช็คอิน',
    'เวลาที่บันทึกการจอง',
    'หมายเหตุ'
  ];

  const bookingsRows = data.bookings.map((b) => {
    const isCheckedIn = b.status === 'checked_in' || data.checkIns.some((c) => c.booking_id === b.id || c.booking_no === b.booking_no);
    const scheduleInfo = data.schedules.find((s) => s.id === b.schedule_id);

    return [
      b.booking_no,
      b.student_code,
      b.student_name,
      `ปี ${b.student_year}`,
      b.student_phone,
      scheduleInfo ? `${scheduleInfo.route_name || scheduleInfo.destination} (${scheduleInfo.departure_time} น.)` : b.schedule_id,
      scheduleInfo?.departure_date || '-',
      scheduleInfo?.departure_time || '-',
      b.pass_count,
      b.pickup_point,
      b.status === 'confirmed' ? 'ยืนยันแล้ว' : b.status === 'checked_in' ? 'เช็คอินแล้ว' : 'ยกเลิก',
      isCheckedIn ? '✅ เช็คอินแล้ว' : '⏳ ยังไม่เช็คอิน',
      new Date(b.created_at).toLocaleString('th-TH'),
      b.note || '-'
    ];
  });

  // 3. Clinical Training Requests Sheet
  const trainingHeaders = [
    'เลขที่คำขอ',
    'ผู้ยื่นคำขอ / รหัสนักศึกษา',
    'ชั้นปี',
    'สถานที่ฝึกปฏิบัติการ / โรงพยาบาล',
    'กลุ่มงาน / วอร์ด',
    'จังหวัด',
    'วันที่เริ่มฝึก',
    'วันที่สิ้นสุดฝึก',
    'เวลาออกเดินทาง',
    'เวลากลับ',
    'จำนวนนักศึกษา (คน)',
    'อาจารย์นิเทศก์',
    'ผู้ประสานงานกลุ่ม & เบอร์โทร',
    'รายละเอียดสัมภาระ/อุปกรณ์การแพทย์',
    'สถานะคำขอ',
    'รถและคนขับที่จัดสรร',
    'บันทึกจากเจ้าหน้าที่'
  ];

  const trainingRows = data.trainingRequests.map((t) => [
    t.request_no,
    `${t.student_name} (${t.student_code})`,
    `ปี ${t.student_year}`,
    t.training_place,
    t.department_ward || '-',
    t.province,
    t.start_date,
    t.end_date,
    t.departure_time,
    t.return_time,
    t.passenger_count,
    t.advisor_name || '-',
    `${t.coordinator_name} (${t.coordinator_phone})`,
    t.luggage_details || '-',
    t.status === 'approved' ? 'อนุมัติแล้ว' : t.status === 'pending' ? 'รออนุมัติ' : t.status === 'rejected' ? 'ไม่อนุมัติ' : 'เสร็จสิ้น',
    t.assigned_vehicle ? `${t.assigned_vehicle} (${t.assigned_driver || '-'})` : '-',
    t.admin_notes || '-'
  ]);

  return {
    schedules: [schedulesHeaders, ...schedulesRows],
    bookings: [bookingsHeaders, ...bookingsRows],
    training: [trainingHeaders, ...trainingRows]
  };
}

/**
 * Generates CSV content for direct download or Sheets import
 */
export function generateCSV(rows: (string | number)[][]): string {
  return '\uFEFF' + rows
    .map((row) =>
      row
        .map((cell) => {
          const str = String(cell ?? '');
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(',')
    )
    .join('\n');
}

/**
 * Direct file download helper
 */
export function downloadCSV(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
