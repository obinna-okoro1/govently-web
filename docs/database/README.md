# Database Schema Documentation - Appointment Booking System

This directory contains the SQL scripts and documentation for the appointment booking system database schema.

## Overview

The appointment booking system consists of three main tables:

1. **appointments** - Stores all appointment bookings between clients and therapists
2. **therapist_availability** - Stores recurring weekly availability schedules
3. **availability_exceptions** - Stores one-time exceptions to regular availability

## Quick Setup

Execute the SQL scripts in the following order:

### 1. Create Appointments Table
See: [appointments-table.md](./appointments-table.md)

This creates the core appointments table with:
- Appointment details (date, time, type, status)
- Client and therapist references
- Assessment linkage
- Meeting link storage
- Comprehensive RLS policies
- Validation constraints

### 2. Create Availability Tables
See: [therapist-availability-table.md](./therapist-availability-table.md)

This creates:
- Therapist availability schedule table
- Availability exceptions table
- Helper function to generate available time slots
- RLS policies for both tables

## Table Relationships

```
auth.users (Supabase Auth)
    ├── therapist_profiles (existing)
    │   ├── therapist_availability (new)
    │   ├── availability_exceptions (new)
    │   └── appointments (new) [as therapist]
    │
    ├── user_assessments (existing)
    │   └── appointments (new) [optional link]
    │
    └── appointments (new) [as client]
```

## Key Features

### Appointments Table
- ✅ Multiple appointment types (initial, follow-up, assessment review, therapy session)
- ✅ Status tracking (scheduled, confirmed, in-progress, completed, cancelled, no-show)
- ✅ Optional link to user assessments
- ✅ Meeting link storage for virtual sessions
- ✅ Client and therapist notes
- ✅ Automatic updated_at timestamp
- ✅ Prevents overlapping appointments for therapists
- ✅ Ensures minimum 30-minute appointment duration

### Availability System
- ✅ Recurring weekly schedules
- ✅ One-time exceptions (holidays, time off)
- ✅ Automatic time slot generation
- ✅ Conflict detection with existing appointments
- ✅ Flexible slot duration configuration

### Security (RLS Policies)
- ✅ Clients can only view/modify their own appointments
- ✅ Therapists can only view/modify their appointments
- ✅ Therapists can manage their own availability
- ✅ Public can view therapist availability (for booking)
- ✅ Time-limited deletion (24 hours)

## Usage Examples

### For Clients

**Book an appointment:**
```sql
INSERT INTO appointments (
    client_user_id,
    therapist_user_id,
    therapist_id,
    scheduled_start,
    scheduled_end,
    type,
    notes,
    assessment_id
)
VALUES (
    auth.uid(),
    '<therapist_user_id>',
    '<therapist_id>',
    '2025-10-20 10:00:00+00',
    '2025-10-20 11:00:00+00',
    'initial-consultation',
    'First time seeking therapy for anxiety',
    '<assessment_id>'
);
```

**View my appointments:**
```sql
SELECT * FROM appointments
WHERE client_user_id = auth.uid()
ORDER BY scheduled_start DESC;
```

**Cancel an appointment:**
```sql
UPDATE appointments
SET status = 'cancelled'
WHERE id = '<appointment_id>'
AND client_user_id = auth.uid();
```

### For Therapists

**Set weekly availability:**
```sql
-- Monday to Friday, 9 AM to 5 PM
INSERT INTO therapist_availability (therapist_id, day_of_week, start_time, end_time)
SELECT 
    '<therapist_id>',
    day,
    '09:00:00'::TIME,
    '17:00:00'::TIME
FROM generate_series(1, 5) AS day;
```

**Add time off:**
```sql
INSERT INTO availability_exceptions (therapist_id, date, is_available, reason)
VALUES (
    '<therapist_id>',
    '2025-12-25',
    false,
    'Christmas Holiday'
);
```

**View upcoming appointments:**
```sql
SELECT * FROM appointments
WHERE therapist_user_id = auth.uid()
AND scheduled_start >= NOW()
AND status NOT IN ('cancelled', 'no-show')
ORDER BY scheduled_start ASC;
```

### Get Available Time Slots

```sql
SELECT * FROM get_available_time_slots(
    '<therapist_id>'::UUID,
    NOW(),
    NOW() + INTERVAL '7 days',
    60  -- 60-minute slots
)
WHERE is_available = true
ORDER BY start_time;
```

## Migration Notes

### Prerequisites
- Supabase project with authentication enabled
- Existing `therapist_profiles` table
- Existing `user_assessments` table (optional, for assessment linking)

### Installation Steps

1. **Run appointments table creation script** (from appointments-table.md)
2. **Run availability tables creation script** (from therapist-availability-table.md)
3. **Verify RLS policies are enabled** on all tables
4. **Test with sample data** to ensure everything works correctly

### Rollback

If you need to remove the appointment system:

```sql
-- Drop tables (in reverse order due to foreign keys)
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.availability_exceptions CASCADE;
DROP TABLE IF EXISTS public.therapist_availability CASCADE;

-- Drop function
DROP FUNCTION IF EXISTS get_available_time_slots;
```

## Additional Considerations

### Performance
- All tables have appropriate indexes for common queries
- The `get_available_time_slots` function is marked as STABLE for query optimization
- Partial index on appointments prevents overlap only for active appointments

### Scalability
- Consider partitioning appointments table by date for large-scale deployments
- Add caching layer for frequently accessed availability data
- Implement rate limiting on appointment booking to prevent abuse

### Future Enhancements
- Add notification system for appointment reminders
- Implement waitlist functionality for fully booked therapists
- Add recurring appointment support
- Integrate video conferencing link generation
- Add billing/payment integration
