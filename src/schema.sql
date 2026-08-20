-- ============================================================================
-- CKR TRANSPORT - Vehicle Reservation System
-- Boromarajonani College of Nursing, Chakriraj (วิทยาลัยพยาบาลบรมราชชนนี จักรีรัช)
-- Complete PostgreSQL Schema, RLS Policies, Atomic RPC Functions & Trigger
-- ============================================================================

-- 1. EXTENSIONS & ENUMS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'admin', 'driver');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE route_type AS ENUM ('market', 'training');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE schedule_status AS ENUM ('open', 'almost_full', 'full', 'closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('confirmed', 'waiting', 'cancelled', 'checked_in');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE waiting_status AS ENUM ('pending', 'promoted', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE training_request_status AS ENUM ('pending', 'approved', 'rejected', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABLES

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Students Profile table
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_code VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    student_year SMALLINT NOT NULL CHECK (student_year BETWEEN 1 AND 4),
    phone VARCHAR(20) NOT NULL,
    dormitory VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Routes table
CREATE TABLE IF NOT EXISTS routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type route_type NOT NULL,
    description TEXT,
    estimated_duration_mins INT DEFAULT 30,
    pickup_points JSONB DEFAULT '[]'::jsonb,
    dropoff_points JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trip Schedules table
CREATE TABLE IF NOT EXISTS trip_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID REFERENCES routes(id) ON DELETE SET NULL,
    vehicle_number VARCHAR(50),
    driver_name VARCHAR(100),
    departure_date DATE NOT NULL,
    departure_time TIME NOT NULL,
    return_time TIME NOT NULL,
    origin VARCHAR(255) NOT NULL DEFAULT 'วิทยาลัยพยาบาลบรมราชชนนี จักรีรัช',
    destination VARCHAR(255) NOT NULL,
    total_seats INT NOT NULL CHECK (total_seats > 0),
    booked_seats INT NOT NULL DEFAULT 0 CHECK (booked_seats >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    status schedule_status NOT NULL DEFAULT 'open',
    booking_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_no VARCHAR(50) UNIQUE NOT NULL, -- e.g. CKR-2026-00001
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    schedule_id UUID NOT NULL REFERENCES trip_schedules(id) ON DELETE CASCADE,
    status booking_status NOT NULL DEFAULT 'confirmed',
    pass_count INT NOT NULL DEFAULT 1 CHECK (pass_count > 0),
    pickup_point VARCHAR(255) NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Waiting Lists table
CREATE TABLE IF NOT EXISTS waiting_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID NOT NULL REFERENCES trip_schedules(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    position INT NOT NULL CHECK (position > 0),
    status waiting_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(schedule_id, student_id)
);

-- Clinical Training Transport Requests table
CREATE TABLE IF NOT EXISTS training_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_no VARCHAR(50) UNIQUE NOT NULL,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    training_place VARCHAR(255) NOT NULL,
    province VARCHAR(100) NOT NULL,
    origin VARCHAR(255) NOT NULL DEFAULT 'วิทยาลัยพยาบาลบรมราชชนนี จักรีรัช',
    departure_time TIME NOT NULL,
    return_time TIME NOT NULL,
    passenger_count INT NOT NULL CHECK (passenger_count > 0),
    luggage_details TEXT,
    coordinator_name VARCHAR(255) NOT NULL,
    coordinator_phone VARCHAR(20) NOT NULL,
    advisor_name VARCHAR(255),
    department_ward VARCHAR(255),
    status training_request_status NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    assigned_driver VARCHAR(100),
    assigned_vehicle VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Check-ins table (for Driver / Admin QR Scanning)
CREATE TABLE IF NOT EXISTS check_ins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    scanned_by UUID REFERENCES users(id),
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    target_table VARCHAR(100) NOT NULL,
    details JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. SEQUENCE FOR BOOKING NUMBER FORMATTING
CREATE SEQUENCE IF NOT EXISTS booking_no_seq START 1;
CREATE SEQUENCE IF NOT EXISTS training_request_no_seq START 1;

-- 4. ATOMIC BOOKING STORED PROCEDURE (CONCURRENCY & RACE-CONDITION PROTECTION)
-- Uses SELECT ... FOR UPDATE to lock the schedule row and strictly prevent overbooking.
CREATE OR REPLACE FUNCTION book_trip_atomic(
    p_schedule_id UUID,
    p_student_id UUID,
    p_pass_count INT DEFAULT 1,
    p_pickup_point TEXT DEFAULT 'หน้าอาคารเรียนรวม',
    p_note TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_schedule trip_schedules%ROWTYPE;
    v_existing_booking bookings%ROWTYPE;
    v_new_booking_id UUID;
    v_booking_no VARCHAR(50);
    v_next_waiting_pos INT;
    v_waiting_id UUID;
    v_student students%ROWTYPE;
    v_new_status schedule_status;
BEGIN
    -- 1. Verify student exists
    SELECT * INTO v_student FROM students WHERE id = p_student_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'type', 'error', 'message', 'ไม่พบข้อมูลนักศึกษาในระบบ');
    END IF;

    -- 2. Lock the target trip schedule row strictly FOR UPDATE
    SELECT * INTO v_schedule 
    FROM trip_schedules 
    WHERE id = p_schedule_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'type', 'error', 'message', 'ไม่พบเที่ยวรถที่ระบุ');
    END IF;

    -- 3. Check if booking is active & open
    IF NOT v_schedule.is_active OR v_schedule.status = 'closed' THEN
        RETURN jsonb_build_object('success', false, 'type', 'error', 'message', 'รอบรถนี้ปิดรับการจองแล้ว');
    END IF;

    -- 4. Check if deadline has passed
    IF now() > v_schedule.booking_deadline THEN
        RETURN jsonb_build_object('success', false, 'type', 'error', 'message', 'หมดเวลาการจองสำหรับเที่ยวรถนี้แล้ว');
    END IF;

    -- 5. Prevent double booking for the same student on this schedule
    SELECT * INTO v_existing_booking 
    FROM bookings 
    WHERE schedule_id = p_schedule_id 
      AND student_id = p_student_id 
      AND status IN ('confirmed', 'checked_in');

    IF FOUND THEN
        RETURN jsonb_build_object('success', false, 'type', 'error', 'message', 'คุณได้จองที่นั่งในเที่ยวรถนี้แล้ว');
    END IF;

    -- 6. Evaluate Seat Availability
    IF (v_schedule.booked_seats + p_pass_count) <= v_schedule.total_seats THEN
        -- SEAT AVAILABLE: Generate booking number e.g. CKR-2026-00001
        v_booking_no := 'CKR-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('booking_no_seq')::text, 5, '0');
        
        INSERT INTO bookings (
            booking_no,
            student_id,
            schedule_id,
            status,
            pass_count,
            pickup_point,
            note
        ) VALUES (
            v_booking_no,
            p_student_id,
            p_schedule_id,
            'confirmed',
            p_pass_count,
            p_pickup_point,
            p_note
        ) RETURNING id INTO v_new_booking_id;

        -- Update schedule seats
        v_schedule.booked_seats := v_schedule.booked_seats + p_pass_count;
        
        -- Compute new schedule status
        IF v_schedule.booked_seats >= v_schedule.total_seats THEN
            v_new_status := 'full';
        ELSIF (v_schedule.total_seats - v_schedule.booked_seats) <= 5 THEN
            v_new_status := 'almost_full';
        ELSE
            v_new_status := 'open';
        END IF;

        UPDATE trip_schedules
        SET booked_seats = v_schedule.booked_seats,
            status = v_new_status
        WHERE id = p_schedule_id;

        -- Audit Log
        INSERT INTO audit_logs (user_id, action, target_table, details)
        VALUES (
            v_student.user_id,
            'BOOKING_CONFIRMED',
            'bookings',
            jsonb_build_object('booking_no', v_booking_no, 'schedule_id', p_schedule_id, 'seats', p_pass_count)
        );

        RETURN jsonb_build_object(
            'success', true,
            'type', 'confirmed',
            'booking_id', v_new_booking_id,
            'booking_no', v_booking_no,
            'status', 'confirmed',
            'message', 'จองที่นั่งสำเร็จ! กรุณาแสดง QR Code ให้พนักงานขับรถก่อนขึ้นรถ'
        );
    ELSE
        -- SEATS FULL: Place student in Waiting List with calculated queue position
        SELECT COALESCE(MAX(position), 0) + 1 INTO v_next_waiting_pos
        FROM waiting_lists
        WHERE schedule_id = p_schedule_id AND status = 'pending';

        INSERT INTO waiting_lists (
            schedule_id,
            student_id,
            position,
            status
        ) VALUES (
            p_schedule_id,
            p_student_id,
            v_next_waiting_pos,
            'pending'
        )
        ON CONFLICT (schedule_id, student_id) 
        DO UPDATE SET status = 'pending', position = v_next_waiting_pos
        RETURNING id INTO v_waiting_id;

        -- Ensure schedule status is marked full
        UPDATE trip_schedules SET status = 'full' WHERE id = p_schedule_id;

        -- Audit Log
        INSERT INTO audit_logs (user_id, action, target_table, details)
        VALUES (
            v_student.user_id,
            'WAITING_LIST_JOINED',
            'waiting_lists',
            jsonb_build_object('schedule_id', p_schedule_id, 'queue_position', v_next_waiting_pos)
        );

        RETURN jsonb_build_object(
            'success', true,
            'type', 'waiting',
            'waiting_id', v_waiting_id,
            'queue_position', v_next_waiting_pos,
            'status', 'waiting',
            'message', 'ที่นั่งเต็มแล้ว คุณอยู่ในลำดับคิวสำรองที่ ' || v_next_waiting_pos || ' ระบบจะเลื่อนเป็นที่นั่งจริงให้อัตโนมัติเมื่อมีคนยกเลิก'
        );
    END IF;
END;
$$;

-- 5. AUTO-PROMOTION TRIGGER ON CANCELLATION
-- When a booking is cancelled, automatically promote the top student from waiting list
CREATE OR REPLACE FUNCTION handle_booking_cancellation_and_promote()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_top_waitlist waiting_lists%ROWTYPE;
    v_new_booking_no VARCHAR(50);
    v_schedule trip_schedules%ROWTYPE;
BEGIN
    -- Check if booking was changed to cancelled
    IF NEW.status = 'cancelled' AND OLD.status IN ('confirmed', 'checked_in') THEN
        
        -- Lock schedule row
        SELECT * INTO v_schedule 
        FROM trip_schedules 
        WHERE id = NEW.schedule_id 
        FOR UPDATE;

        -- Decrement booked_seats
        v_schedule.booked_seats := GREATEST(0, v_schedule.booked_seats - OLD.pass_count);
        
        -- Look for top pending waiting list candidate
        SELECT * INTO v_top_waitlist
        FROM waiting_lists
        WHERE schedule_id = NEW.schedule_id AND status = 'pending'
        ORDER BY position ASC
        LIMIT 1
        FOR UPDATE;

        IF FOUND THEN
            -- Promote waiting candidate to confirmed booking
            v_new_booking_no := 'CKR-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('booking_no_seq')::text, 5, '0');
            
            INSERT INTO bookings (
                booking_no,
                student_id,
                schedule_id,
                status,
                pass_count,
                pickup_point,
                note
            ) VALUES (
                v_new_booking_no,
                v_top_waitlist.student_id,
                NEW.schedule_id,
                'confirmed',
                1,
                'หน้าอาคารเรียนรวม (เลื่อนจากคิวสำรอง)',
                'Auto-promoted from waiting list queue #' || v_top_waitlist.position
            );

            -- Update waitlist entry
            UPDATE waiting_lists
            SET status = 'promoted'
            WHERE id = v_top_waitlist.id;

            -- Seat is occupied by promoted candidate
            v_schedule.booked_seats := v_schedule.booked_seats + 1;
        END IF;

        -- Update schedule status
        UPDATE trip_schedules
        SET booked_seats = v_schedule.booked_seats,
            status = CASE 
                WHEN v_schedule.booked_seats >= v_schedule.total_seats THEN 'full'::schedule_status
                WHEN (v_schedule.total_seats - v_schedule.booked_seats) <= 5 THEN 'almost_full'::schedule_status
                ELSE 'open'::schedule_status
            END
        WHERE id = NEW.schedule_id;

    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_booking_cancellation ON bookings;
CREATE TRIGGER trg_booking_cancellation
AFTER UPDATE OF status ON bookings
FOR EACH ROW
WHEN (NEW.status = 'cancelled')
EXECUTE FUNCTION handle_booking_cancellation_and_promote();

-- 6. ROW LEVEL SECURITY (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE waiting_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Public/Student read access for routes and active schedules
CREATE POLICY "Anyone can view routes" ON routes FOR SELECT USING (true);
CREATE POLICY "Anyone can view schedules" ON trip_schedules FOR SELECT USING (true);

-- Students can read & insert their own bookings
CREATE POLICY "Students view own bookings" ON bookings FOR SELECT 
USING (auth.uid() IN (SELECT user_id FROM students WHERE id = bookings.student_id));

-- Admin full access
CREATE POLICY "Admins full access on schedules" ON trip_schedules FOR ALL 
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins full access on bookings" ON bookings FOR ALL 
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'driver')));

-- 7. SEED DATA FOR CKR TRANSPORT (วิทยาลัยพยาบาลบรมราชชนนี จักรีรัช)
INSERT INTO routes (id, name, type, description, estimated_duration_mins, pickup_points, dropoff_points)
VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    'สายตลาดริมน้ำบ้านโป่ง (วันหยุดศุกร์-อาทิตย์)',
    'market',
    'รถรับ-ส่งนักศึกษาไปซื้อของและพักผ่อนตลาดริมน้ำและตัวอำเภอบ้านโป่ง',
    25,
    '["หน้าหอพักพยาบาล 1-2", "ลานจอดรถหน้าเสาธง วิทยาลัย", "ป้อมยามหน้าวิทยาลัย"]'::jsonb,
    '["ตลาดโต้รุ่งริมน้ำบ้านโป่ง", "หอนาฬิกาบ้านโป่ง", "สถานีรถไฟบ้านโป่ง", "โลตัสบ้านโป่ง"]'::jsonb
),
(
    '00000000-0000-0000-0000-000000000002',
    'สายแหล่งฝึกปฏิบัติการพยาบาล (โรงพยาบาลศูนย์และชุมชน)',
    'training',
    'รถบัส/รถตู้รับ-ส่งนักศึกษาพยาบาลไปฝึกปฏิบัติงาน ณ แหล่งฝึกคลินิก',
    45,
    '["หน้าอาคารอำนวยการ วิทยาลัย", "หน้าหอพักพยาบาล"]'::jsonb,
    '["รพ.บ้านโป่ง", "รพ.ราชบุรี", "รพ.โพธาราม", "รพ.สต.เบิกไพร", "รพ.ดำเนินสะดวก", "รพ.นครปฐม"]'::jsonb
)
ON CONFLICT DO NOTHING;
