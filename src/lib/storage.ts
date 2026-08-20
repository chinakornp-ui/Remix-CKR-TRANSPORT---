import {
  TripSchedule,
  Booking,
  WaitingList,
  TrainingRequest,
  CheckIn,
  Student,
  BookTripAtomicResult,
  Route,
  ScheduleStatus
} from '../types/database';

const STORAGE_KEYS = {
  SCHEDULES: 'ckr_schedules_v2',
  BOOKINGS: 'ckr_bookings_v2',
  WAITING_LISTS: 'ckr_waiting_lists_v2',
  TRAINING_REQUESTS: 'ckr_training_requests_v2',
  CHECK_INS: 'ckr_check_ins_v2',
  STUDENTS: 'ckr_students_v2',
  ACTIVE_USER: 'ckr_active_user_v2',
  SHEETS_SYNC: 'ckr_sheets_sync_v2'
};

// Initial Routes
export const INITIAL_ROUTES: Route[] = [
  {
    id: 'route-market-1',
    name: 'สายตลาดริมน้ำบ้านโป่ง (รถบัสวิทยาลัยฯ)',
    type: 'market',
    description: 'รับ-ส่งนักศึกษาไปซื้อของและพักผ่อนตลาดริมน้ำและตัวอำเภอบ้านโป่ง',
    estimated_duration_mins: 25,
    pickup_points: ['หน้าหอพักพยาบาล 1-2', 'ลานเสาธงหน้าอาคารเรียน', 'ป้อมยามหน้าวิทยาลัยฯ'],
    dropoff_points: ['ตลาดโต้รุ่งริมน้ำบ้านโป่ง', 'หอนาฬิกาบ้านโป่ง', 'สถานีรถไฟบ้านโป่ง', 'โลตัสบ้านโป่ง']
  },
  {
    id: 'route-training-1',
    name: 'สายรถรับ-ส่งแหล่งฝึกปฏิบัติการพยาบาล',
    type: 'training',
    description: 'รถตู้/รถมินิบัสรับ-ส่งนักศึกษาพยาบาลชั้นปีที่ 2-4 ไปฝึกปฏิบัติงานคลินิก',
    estimated_duration_mins: 40,
    pickup_points: ['หน้าอาคารอำนวยการ วิทยาลัยฯ', 'หน้าหอพักพยาบาล'],
    dropoff_points: ['รพ.บ้านโป่ง', 'รพ.ราชบุรี', 'รพ.โพธาราม', 'รพ.สต.เบิกไพร', 'รพ.ดำเนินสะดวก', 'รพ.นครปฐม']
  }
];

// Current logged in demo student profile (Nursing student at Chakriraj)
export const CURRENT_STUDENT: Student = {
  id: 'std-2026-001',
  user_id: 'usr-std-001',
  student_code: '661010042',
  full_name: 'ชินากร โพธิ์วงศ์',
  student_year: 3,
  phone: '081-987-6543',
  dormitory: 'หอพักพยาบาล 2 ห้อง 314',
  created_at: new Date().toISOString()
};

// Initial Schedules for CKR
const getInitialSchedules = (): TripSchedule[] => {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const dayAfter = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];

  return [
    {
      id: 'sch-today-01',
      route_id: 'route-market-1',
      route_name: 'สายตลาดริมน้ำบ้านโป่ง (เที่ยวเย็นรอบที่ 1)',
      vehicle_number: 'ฮร-4421 ราชบุรี (รถบัสปรับอากาศ CKR 01)',
      driver_name: 'นายสมศักดิ์ ขับปลอดภัย',
      departure_date: today,
      departure_time: '16:30',
      return_time: '19:30',
      origin: 'หน้าหอพักพยาบาล วพบ.จักรีรัช',
      destination: 'ตลาดโต้รุ่งริมน้ำบ้านโป่ง',
      total_seats: 40,
      booked_seats: 38,
      is_active: true,
      status: 'almost_full',
      booking_deadline: `${today}T15:30:00`,
      notes: 'รถออกตรงเวลา 16:30 น. จุดนัดรับขากลับ: ลานจอดหน้าตลาดริมน้ำ'
    },
    {
      id: 'sch-today-02',
      route_id: 'route-market-1',
      route_name: 'สายตลาดริมน้ำบ้านโป่ง (เที่ยวค่ำรอบที่ 2)',
      vehicle_number: 'ฮร-4422 ราชบุรี (รถบัส CKR 02)',
      driver_name: 'นายประเสริฐ ชำนาญทาง',
      departure_date: today,
      departure_time: '17:30',
      return_time: '20:30',
      origin: 'หน้าหอพักพยาบาล วพบ.จักรีรัช',
      destination: 'ตลาดโต้รุ่งริมน้ำบ้านโป่ง',
      total_seats: 40,
      booked_seats: 40,
      is_active: true,
      status: 'full',
      booking_deadline: `${today}T16:30:00`,
      notes: 'รอบยอดนิยม มีคิวสำรองรออยู่ กรุณาเช็คอินก่อนเวลา 10 นาที'
    },
    {
      id: 'sch-tmrw-01',
      route_id: 'route-market-1',
      route_name: 'สายตลาดริมน้ำบ้านโป่ง (วันหยุดเสาร์)',
      vehicle_number: 'ฮร-4421 ราชบุรี',
      driver_name: 'นายสมศักดิ์ ขับปลอดภัย',
      departure_date: tomorrow,
      departure_time: '16:00',
      return_time: '20:00',
      origin: 'ลานเสาธงหน้าอาคารเรียน วพบ.จักรีรัช',
      destination: 'ตลาดโต้รุ่งริมน้ำบ้านโป่ง / โลตัสบ้านโป่ง',
      total_seats: 40,
      booked_seats: 22,
      is_active: true,
      status: 'open',
      booking_deadline: `${tomorrow}T15:00:00`,
      notes: 'วันเสาร์ รถแวะส่งโลตัสบ้านโป่งและตลาดริมน้ำ'
    },
    {
      id: 'sch-dayafter-01',
      route_id: 'route-market-1',
      route_name: 'สายตลาดริมน้ำบ้านโป่ง (วันหยุดอาทิตย์)',
      vehicle_number: 'ฮร-4422 ราชบุรี',
      driver_name: 'นายประเสริฐ ชำนาญทาง',
      departure_date: dayAfter,
      departure_time: '16:00',
      return_time: '19:45',
      origin: 'หน้าหอพักพยาบาล วพบ.จักรีรัช',
      destination: 'ตลาดโต้รุ่งริมน้ำบ้านโป่ง',
      total_seats: 40,
      booked_seats: 15,
      is_active: true,
      status: 'open',
      booking_deadline: `${dayAfter}T15:00:00`,
      notes: 'กลับหอพักทันเวลาตรวจเวร 20:00 น.'
    },
    {
      id: 'sch-training-mon',
      route_id: 'route-training-1',
      route_name: 'สายแหล่งฝึก รพ.บ้านโป่ง (หอผู้ป่วยอายุรกรรม/ศัลยกรรม)',
      vehicle_number: 'นข-8921 ราชบุรี (รถตู้ปรับอากาศ 1)',
      driver_name: 'นายวิชัย ใจบริการ',
      departure_date: tomorrow,
      departure_time: '07:00',
      return_time: '16:30',
      origin: 'หน้าอาคารอำนวยการ วพบ.จักรีรัช',
      destination: 'โรงพยาบาลบ้านโป่ง (ตึกอุบัติเหตุ/ผู้ป่วยใน)',
      total_seats: 14,
      booked_seats: 12,
      is_active: true,
      status: 'almost_full',
      booking_deadline: `${today}T18:00:00`,
      notes: 'สำหรับนักศึกษาพยาบาลชั้นปีที่ 3 ขึ้นฝึกปฏิบัติการวิชาการพยาบาลผู้ใหญ่'
    }
  ];
};

// Initial Bookings
const getInitialBookings = (): Booking[] => {
  const today = new Date().toISOString().split('T')[0];
  return [
    {
      id: 'bkg-001',
      booking_no: 'CKR-2026-00042',
      student_id: CURRENT_STUDENT.id,
      student_name: CURRENT_STUDENT.full_name,
      student_code: CURRENT_STUDENT.student_code,
      student_year: CURRENT_STUDENT.student_year,
      student_phone: CURRENT_STUDENT.phone,
      schedule_id: 'sch-today-01',
      status: 'confirmed',
      pass_count: 1,
      pickup_point: 'หน้าหอพักพยาบาล 1-2',
      note: 'มีกระเป๋าสะพาย 1 ใบ',
      created_at: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
      id: 'bkg-002',
      booking_no: 'CKR-2026-00043',
      student_id: 'std-2026-002',
      student_name: 'กานดา สุขสวัสดิ์',
      student_code: '661010018',
      student_year: 3,
      student_phone: '089-111-2233',
      schedule_id: 'sch-today-01',
      status: 'checked_in',
      pass_count: 1,
      pickup_point: 'หน้าหอพักพยาบาล 1-2',
      note: '',
      created_at: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    {
      id: 'bkg-003',
      booking_no: 'CKR-2026-00030',
      student_id: CURRENT_STUDENT.id,
      student_name: CURRENT_STUDENT.full_name,
      student_code: CURRENT_STUDENT.student_code,
      student_year: CURRENT_STUDENT.student_year,
      student_phone: CURRENT_STUDENT.phone,
      schedule_id: 'sch-training-mon',
      status: 'confirmed',
      pass_count: 1,
      pickup_point: 'หน้าอาคารอำนวยการ วิทยาลัยฯ',
      note: 'ชุดฝึกปฏิบัติงานพยาบาลสีขาว พร้อมกล่องอุปกรณ์หูฟัง/BP',
      created_at: new Date(Date.now() - 86400000).toISOString()
    }
  ];
};

// Initial Waiting Lists
const getInitialWaitingLists = (): WaitingList[] => {
  return [
    {
      id: 'wl-001',
      schedule_id: 'sch-today-02',
      student_id: 'std-2026-005',
      student_name: 'พิมพ์ชนก รักษ์ไทย',
      student_code: '671010091',
      student_year: 2,
      student_phone: '084-555-7890',
      position: 1,
      status: 'pending',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'wl-002',
      schedule_id: 'sch-today-02',
      student_id: 'std-2026-006',
      student_name: 'อภิสิทธิ์ วงศ์วิจิตต์',
      student_code: '671010105',
      student_year: 2,
      student_phone: '086-444-1234',
      position: 2,
      status: 'pending',
      created_at: new Date(Date.now() - 3600000 * 1.5).toISOString()
    }
  ];
};

// Initial Training Requests
const getInitialTrainingRequests = (): TrainingRequest[] => {
  const tomorrow = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0];
  return [
    {
      id: 'tr-001',
      request_no: 'TR-2026-00012',
      student_id: CURRENT_STUDENT.id,
      student_name: CURRENT_STUDENT.full_name,
      student_code: CURRENT_STUDENT.student_code,
      student_year: CURRENT_STUDENT.student_year,
      start_date: tomorrow,
      end_date: nextWeek,
      training_place: 'โรงพยาบาลราชบุรี',
      province: 'ราชบุรี',
      origin: 'วิทยาลัยพยาบาลบรมราชชนนี จักรีรัช',
      departure_time: '06:45',
      return_time: '17:00',
      passenger_count: 8,
      luggage_details: 'กล่องโมเดลและอุปกรณ์สาธิตทางการพยาบาล 2 ลัง + กระเป๋าเอกสาร',
      coordinator_name: 'ชินากร โพธิ์วงศ์ (หัวหน้ากลุ่มฝึก 3B)',
      coordinator_phone: '081-987-6543',
      advisor_name: 'อาจารย์ ดร.ศิริพร บุญส่ง',
      department_ward: 'หอผู้ป่วยวิกฤตอายุรกรรม (ICU Med)',
      status: 'approved',
      admin_notes: 'จัดสรรรถตู้ CKR 03 พร้อมพนักงานขับรถนายวิชัย ออกเดินทางตรงเวลา',
      assigned_driver: 'นายวิชัย ใจบริการ',
      assigned_vehicle: 'นข-8921 ราชบุรี (รถตู้ปรับอากาศ)',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'tr-002',
      request_no: 'TR-2026-00013',
      student_id: 'std-2026-009',
      student_name: 'นภาพร แก้วมณี',
      student_code: '651010012',
      student_year: 4,
      start_date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
      end_date: new Date(Date.now() + 86400000 * 12).toISOString().split('T')[0],
      training_place: 'รพ.สต.เบิกไพร อ.บ้านโป่ง',
      province: 'ราชบุรี',
      origin: 'วิทยาลัยพยาบาลบรมราชชนนี จักรีรัช',
      departure_time: '07:30',
      return_time: '16:30',
      passenger_count: 6,
      luggage_details: 'ชุดตรวจสุขภาพชุมชน กระเป๋าเวชภัณฑ์ชุมชน',
      coordinator_name: 'นภาพร แก้วมณี',
      coordinator_phone: '090-333-8899',
      advisor_name: 'อาจารย์สุดารัตน์ พุ่มจันทร์',
      department_ward: 'งานอนามัยชุมชนและเวชกรรมป้องกัน',
      status: 'pending',
      admin_notes: 'รอการตรวจสอบตารางเวรรถประจำสัปดาห์',
      created_at: new Date(Date.now() - 3600000 * 10).toISOString()
    }
  ];
};

// Initial Check-ins
const getInitialCheckIns = (): CheckIn[] => {
  return [
    {
      id: 'chk-001',
      booking_id: 'bkg-002',
      booking_no: 'CKR-2026-00043',
      student_name: 'กานดา สุขสวัสดิ์',
      schedule_id: 'sch-today-01',
      scanned_by: 'นายสมศักดิ์ ขับปลอดภัย (พนักงานขับรถ)',
      scanned_at: new Date(Date.now() - 3600000 * 1).toISOString()
    }
  ];
};

// ==========================================
// STORE IMPLEMENTATION WITH CONCURRENCY MUTEX
// ==========================================

class AppStateStore {
  private schedules: TripSchedule[] = [];
  private bookings: Booking[] = [];
  private waitingLists: WaitingList[] = [];
  private trainingRequests: TrainingRequest[] = [];
  private checkIns: CheckIn[] = [];
  private listeners: Set<() => void> = new Set();
  private bookingCounter = 44;
  private isProcessingLock = false;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedSchedules = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
      const storedBookings = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      const storedWaiting = localStorage.getItem(STORAGE_KEYS.WAITING_LISTS);
      const storedRequests = localStorage.getItem(STORAGE_KEYS.TRAINING_REQUESTS);
      const storedCheckIns = localStorage.getItem(STORAGE_KEYS.CHECK_INS);

      this.schedules = storedSchedules ? JSON.parse(storedSchedules) : getInitialSchedules();
      this.bookings = storedBookings ? JSON.parse(storedBookings) : getInitialBookings();
      this.waitingLists = storedWaiting ? JSON.parse(storedWaiting) : getInitialWaitingLists();
      this.trainingRequests = storedRequests ? JSON.parse(storedRequests) : getInitialTrainingRequests();
      this.checkIns = storedCheckIns ? JSON.parse(storedCheckIns) : getInitialCheckIns();
    } catch {
      this.schedules = getInitialSchedules();
      this.bookings = getInitialBookings();
      this.waitingLists = getInitialWaitingLists();
      this.trainingRequests = getInitialTrainingRequests();
      this.checkIns = getInitialCheckIns();
    }
    this.saveToStorage();
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(this.schedules));
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(this.bookings));
      localStorage.setItem(STORAGE_KEYS.WAITING_LISTS, JSON.stringify(this.waitingLists));
      localStorage.setItem(STORAGE_KEYS.TRAINING_REQUESTS, JSON.stringify(this.trainingRequests));
      localStorage.setItem(STORAGE_KEYS.CHECK_INS, JSON.stringify(this.checkIns));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  // Getters
  public getSchedules(): TripSchedule[] {
    return [...this.schedules];
  }

  public getScheduleById(id: string): TripSchedule | undefined {
    return this.schedules.find((s) => s.id === id);
  }

  public getBookings(): Booking[] {
    return [...this.bookings];
  }

  public getStudentBookings(studentId: string): Booking[] {
    return this.bookings
      .filter((b) => b.student_id === studentId)
      .map((b) => ({
        ...b,
        schedule: this.getScheduleById(b.schedule_id)
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getWaitingLists(): WaitingList[] {
    return [...this.waitingLists];
  }

  public getStudentWaitingLists(studentId: string): WaitingList[] {
    return this.waitingLists
      .filter((w) => w.student_id === studentId && w.status === 'pending')
      .map((w) => ({
        ...w,
        schedule: this.getScheduleById(w.schedule_id)
      }));
  }

  public getTrainingRequests(): TrainingRequest[] {
    return [...this.trainingRequests].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public getStudentTrainingRequests(studentId: string): TrainingRequest[] {
    return this.trainingRequests
      .filter((t) => t.student_id === studentId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getCheckIns(): CheckIn[] {
    return [...this.checkIns];
  }

  // ----------------------------------------------------
  // ATOMIC BOOKING FUNCTION (Simulates PostgreSQL FOR UPDATE lock)
  // ----------------------------------------------------
  public async bookTripAtomic(params: {
    scheduleId: string;
    student: Student;
    passCount?: number;
    pickupPoint: string;
    note?: string;
  }): Promise<BookTripAtomicResult> {
    // Acquire mutex
    while (this.isProcessingLock) {
      await new Promise((r) => setTimeout(r, 40));
    }
    this.isProcessingLock = true;

    try {
      const schedule = this.schedules.find((s) => s.id === params.scheduleId);
      if (!schedule) {
        return { success: false, type: 'error', message: 'ไม่พบข้อมูลเที่ยวรถที่เลือก' };
      }

      if (!schedule.is_active || schedule.status === 'closed') {
        return { success: false, type: 'error', message: 'เที่ยวรถนี้ปิดรับการจองแล้ว' };
      }

      // Check if student already booked
      const existing = this.bookings.find(
        (b) =>
          b.schedule_id === params.scheduleId &&
          b.student_id === params.student.id &&
          (b.status === 'confirmed' || b.status === 'checked_in')
      );
      if (existing) {
        return {
          success: false,
          type: 'error',
          message: 'คุณได้ทำการจองที่นั่งในเที่ยวรถนี้แล้ว (รหัส: ' + existing.booking_no + ')'
        };
      }

      const passCount = params.passCount || 1;

      // Check seat availability
      if (schedule.booked_seats + passCount <= schedule.total_seats) {
        // CONFIRMED BOOKING
        this.bookingCounter += 1;
        const currentYear = new Date().getFullYear();
        const bookingNo = `CKR-${currentYear}-${String(this.bookingCounter).padStart(5, '0')}`;

        const newBooking: Booking = {
          id: `bkg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          booking_no: bookingNo,
          student_id: params.student.id,
          student_name: params.student.full_name,
          student_code: params.student.student_code,
          student_year: params.student.student_year,
          student_phone: params.student.phone,
          schedule_id: params.scheduleId,
          status: 'confirmed',
          pass_count: passCount,
          pickup_point: params.pickupPoint,
          note: params.note,
          qr_payload: JSON.stringify({
            booking_no: bookingNo,
            student_code: params.student.student_code,
            schedule_id: params.scheduleId,
            time: schedule.departure_time,
            date: schedule.departure_date
          }),
          created_at: new Date().toISOString(),
          schedule
        };

        schedule.booked_seats += passCount;
        if (schedule.booked_seats >= schedule.total_seats) {
          schedule.status = 'full';
        } else if (schedule.total_seats - schedule.booked_seats <= 5) {
          schedule.status = 'almost_full';
        } else {
          schedule.status = 'open';
        }

        this.bookings.unshift(newBooking);
        this.saveToStorage();

        return {
          success: true,
          type: 'confirmed',
          booking: newBooking,
          message: `จองที่นั่งสำเร็จ! รหัสการจองของคุณคือ ${bookingNo} กรุณาแสดง QR Code ให้พนักงานขับรถก่อนขึ้นรถ`
        };
      } else {
        // FULL -> ENTER WAITING LIST
        const existingWaiters = this.waitingLists.filter(
          (w) => w.schedule_id === params.scheduleId && w.status === 'pending'
        );
        const position = existingWaiters.length + 1;

        const newWaitList: WaitingList = {
          id: `wl-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          schedule_id: params.scheduleId,
          student_id: params.student.id,
          student_name: params.student.full_name,
          student_code: params.student.student_code,
          student_year: params.student.student_year,
          student_phone: params.student.phone,
          position,
          status: 'pending',
          created_at: new Date().toISOString(),
          schedule
        };

        schedule.status = 'full';
        this.waitingLists.push(newWaitList);
        this.saveToStorage();

        return {
          success: true,
          type: 'waiting',
          waiting: newWaitList,
          message: `ที่นั่งเต็มแล้ว! คุณถูกจัดอยู่ในลำดับคิวสำรองที่ ${position} ระบบจะเลื่อนเป็นที่นั่งจริงให้อัตโนมัติหากมีผู้โดยสารท่านอื่นยกเลิก`
        };
      }
    } finally {
      this.isProcessingLock = false;
    }
  }

  // ----------------------------------------------------
  // CANCEL BOOKING & AUTO-PROMOTE NEXT WAITING CANDIDATE
  // ----------------------------------------------------
  public cancelBooking(bookingId: string): { success: boolean; message: string; promotedStudentName?: string } {
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (!booking) return { success: false, message: 'ไม่พบรายการจอง' };

    booking.status = 'cancelled';
    const schedule = this.schedules.find((s) => s.id === booking.schedule_id);

    let promotedStudentName: string | undefined;

    if (schedule) {
      schedule.booked_seats = Math.max(0, schedule.booked_seats - booking.pass_count);

      // Check if there is someone in the waiting list
      const topWaitlist = this.waitingLists
        .filter((w) => w.schedule_id === booking.schedule_id && w.status === 'pending')
        .sort((a, b) => a.position - b.position)[0];

      if (topWaitlist) {
        topWaitlist.status = 'promoted';
        this.bookingCounter += 1;
        const currentYear = new Date().getFullYear();
        const newBookingNo = `CKR-${currentYear}-${String(this.bookingCounter).padStart(5, '0')}`;

        const promotedBooking: Booking = {
          id: `bkg-promoted-${Date.now()}`,
          booking_no: newBookingNo,
          student_id: topWaitlist.student_id,
          student_name: topWaitlist.student_name,
          student_code: topWaitlist.student_code,
          student_year: topWaitlist.student_year,
          student_phone: topWaitlist.student_phone,
          schedule_id: topWaitlist.schedule_id,
          status: 'confirmed',
          pass_count: 1,
          pickup_point: 'หน้าหอพักพยาบาล 1-2 (เลื่อนจากคิวสำรองอัตโนมัติ)',
          note: `เลื่อนจากคิวสำรองอันดับที่ ${topWaitlist.position}`,
          created_at: new Date().toISOString(),
          schedule
        };

        this.bookings.unshift(promotedBooking);
        schedule.booked_seats += 1;
        promotedStudentName = topWaitlist.student_name;
      }

      // Update schedule status
      if (schedule.booked_seats >= schedule.total_seats) {
        schedule.status = 'full';
      } else if (schedule.total_seats - schedule.booked_seats <= 5) {
        schedule.status = 'almost_full';
      } else {
        schedule.status = 'open';
      }
    }

    this.saveToStorage();
    return {
      success: true,
      message: 'ยกเลิกการจองเรียบร้อยแล้ว' + (promotedStudentName ? ` (ระบบเลื่อนคิวสำรองให้คุณ ${promotedStudentName} เรียบร้อย)` : ''),
      promotedStudentName
    };
  }

  // ----------------------------------------------------
  // QR CODE CHECK-IN SCANNER
  // ----------------------------------------------------
  public checkInTicket(bookingNoOrId: string, scannedBy: string): {
    success: boolean;
    booking?: Booking;
    message: string;
    alreadyCheckedIn?: boolean;
  } {
    const cleanKey = bookingNoOrId.trim().toUpperCase();
    const booking = this.bookings.find(
      (b) => b.booking_no.toUpperCase() === cleanKey || b.id === bookingNoOrId
    );

    if (!booking) {
      return { success: false, message: `ไม่พบตั๋วรหัส "${bookingNoOrId}" ในระบบ กรุณาตรวจสอบอีกครั้ง` };
    }

    if (booking.status === 'cancelled') {
      return { success: false, message: `ตั๋วรหัส "${booking.booking_no}" ถูกยกเลิกไปแล้ว ไม่อนุญาตให้ขึ้นรถ`, booking };
    }

    if (booking.status === 'checked_in') {
      return {
        success: true,
        alreadyCheckedIn: true,
        booking,
        message: `ตั๋วรหัส "${booking.booking_no}" ของคุณ ${booking.student_name} ได้รับการเช็คอินไปแล้ว`
      };
    }

    booking.status = 'checked_in';

    const checkInRecord: CheckIn = {
      id: `chk-${Date.now()}`,
      booking_id: booking.id,
      booking_no: booking.booking_no,
      student_name: booking.student_name,
      schedule_id: booking.schedule_id,
      scanned_by: scannedBy,
      scanned_at: new Date().toISOString()
    };

    this.checkIns.unshift(checkInRecord);
    this.saveToStorage();

    return {
      success: true,
      alreadyCheckedIn: false,
      booking,
      message: `เช็คอินสำเร็จ! ต้อนรับคุณ ${booking.student_name} (ชั้นปีที่ ${booking.student_year})`
    };
  }

  // ----------------------------------------------------
  // ADMIN SCHEDULE MANAGEMENT (CRUD)
  // ----------------------------------------------------
  public addSchedule(schedule: Omit<TripSchedule, 'id' | 'booked_seats' | 'status' | 'created_at'>): TripSchedule {
    const newSchedule: TripSchedule = {
      ...schedule,
      id: `sch-${Date.now()}`,
      booked_seats: 0,
      status: 'open',
      created_at: new Date().toISOString()
    };
    this.schedules.unshift(newSchedule);
    this.saveToStorage();
    return newSchedule;
  }

  public updateSchedule(id: string, updates: Partial<TripSchedule>): boolean {
    const schedule = this.schedules.find((s) => s.id === id);
    if (!schedule) return false;

    Object.assign(schedule, updates);

    // Recompute status
    if (!schedule.is_active) {
      schedule.status = 'closed';
    } else if (schedule.booked_seats >= schedule.total_seats) {
      schedule.status = 'full';
    } else if (schedule.total_seats - schedule.booked_seats <= 5) {
      schedule.status = 'almost_full';
    } else {
      schedule.status = updates.status || 'open';
    }

    this.saveToStorage();
    return true;
  }

  public deleteSchedule(id: string): boolean {
    this.schedules = this.schedules.filter((s) => s.id !== id);
    this.saveToStorage();
    return true;
  }

  // ----------------------------------------------------
  // TRAINING TRIP REQUESTS
  // ----------------------------------------------------
  public submitTrainingRequest(
    data: Omit<TrainingRequest, 'id' | 'request_no' | 'status' | 'created_at'>
  ): TrainingRequest {
    const count = this.trainingRequests.length + 14;
    const reqNo = `TR-2026-${String(count).padStart(5, '0')}`;
    const newReq: TrainingRequest = {
      ...data,
      id: `tr-${Date.now()}`,
      request_no: reqNo,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    this.trainingRequests.unshift(newReq);
    this.saveToStorage();
    return newReq;
  }

  public updateTrainingRequestStatus(
    id: string,
    status: 'approved' | 'rejected' | 'completed',
    adminNotes?: string,
    driver?: string,
    vehicle?: string
  ): boolean {
    const req = this.trainingRequests.find((r) => r.id === id);
    if (!req) return false;
    req.status = status;
    if (adminNotes) req.admin_notes = adminNotes;
    if (driver) req.assigned_driver = driver;
    if (vehicle) req.assigned_vehicle = vehicle;
    this.saveToStorage();
    return true;
  }

  // Reset to initial demo data
  public resetToDefaults() {
    this.schedules = getInitialSchedules();
    this.bookings = getInitialBookings();
    this.waitingLists = getInitialWaitingLists();
    this.trainingRequests = getInitialTrainingRequests();
    this.checkIns = getInitialCheckIns();
    this.saveToStorage();
  }
}

export const appStore = new AppStateStore();
