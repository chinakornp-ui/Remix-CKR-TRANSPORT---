export type UserRole = 'student' | 'admin' | 'driver';

export type RouteType = 'market' | 'training';

export type ScheduleStatus = 'open' | 'almost_full' | 'full' | 'closed';

export type BookingStatus = 'confirmed' | 'waiting' | 'cancelled' | 'checked_in';

export type WaitingListStatus = 'pending' | 'promoted' | 'cancelled';

export type TrainingRequestStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Student {
  id: string;
  user_id: string;
  student_code: string;
  full_name: string;
  student_year: number; // 1, 2, 3, 4
  phone: string;
  dormitory?: string;
  created_at: string;
}

export interface Route {
  id: string;
  name: string;
  type: RouteType;
  description: string;
  estimated_duration_mins?: number;
  pickup_points: string[];
  dropoff_points: string[];
}

export interface TripSchedule {
  id: string;
  route_id: string;
  route_name?: string;
  vehicle_number?: string;
  driver_name?: string;
  departure_date: string; // YYYY-MM-DD
  departure_time: string; // HH:mm
  return_time: string; // HH:mm
  origin: string;
  destination: string;
  total_seats: number;
  booked_seats: number;
  is_active: boolean;
  status: ScheduleStatus;
  booking_deadline: string; // ISO datetime or HH:mm
  notes?: string;
  created_at?: string;
}

export interface Booking {
  id: string;
  booking_no: string; // e.g. CKR-2026-00001
  student_id: string;
  student_name: string;
  student_code: string;
  student_year: number;
  student_phone: string;
  schedule_id: string;
  status: BookingStatus;
  pass_count: number;
  pickup_point: string;
  note?: string;
  qr_payload?: string;
  created_at: string;
  schedule?: TripSchedule;
}

export interface WaitingList {
  id: string;
  schedule_id: string;
  student_id: string;
  student_name: string;
  student_code: string;
  student_year: number;
  student_phone: string;
  position: number;
  status: WaitingListStatus;
  created_at: string;
  schedule?: TripSchedule;
}

export interface TrainingRequest {
  id: string;
  request_no: string; // e.g. TR-2026-00042
  student_id: string;
  student_name: string;
  student_code: string;
  student_year: number;
  start_date: string;
  end_date: string;
  training_place: string;
  province: string;
  origin: string;
  departure_time: string;
  return_time: string;
  passenger_count: number;
  luggage_details: string;
  coordinator_name: string;
  coordinator_phone: string;
  advisor_name?: string;
  department_ward?: string;
  status: TrainingRequestStatus;
  admin_notes?: string;
  assigned_driver?: string;
  assigned_vehicle?: string;
  created_at: string;
}

export interface CheckIn {
  id: string;
  booking_id: string;
  booking_no: string;
  student_name: string;
  schedule_id: string;
  scanned_by: string;
  scanned_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  target_table: string;
  details: string;
  timestamp: string;
}

export interface BookTripAtomicResult {
  success: boolean;
  type: 'confirmed' | 'waiting' | 'error';
  booking?: Booking;
  waiting?: WaitingList;
  message: string;
}
