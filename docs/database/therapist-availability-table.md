# Therapist Availability & Scheduling - Database Schema

## Therapist Availability Table

This table stores the recurring weekly availability schedule for therapists.

**Note:** This schema references the `therapist_interest` table for therapist profiles. The `therapist_interest` table links to `auth.users` via the `email` field (not `user_id`).

```sql
-- Create therapist_availability table
CREATE TABLE IF NOT EXISTS public.therapist_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    therapist_id UUID NOT NULL REFERENCES public.therapist_interest(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_recurring BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT check_time_order CHECK (end_time > start_time)
);

-- Create indexes
CREATE INDEX idx_therapist_availability_therapist ON public.therapist_availability(therapist_id);
CREATE INDEX idx_therapist_availability_day ON public.therapist_availability(day_of_week);

-- Create updated_at trigger
CREATE TRIGGER update_therapist_availability_updated_at
    BEFORE UPDATE ON public.therapist_availability
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE public.therapist_availability IS 'Stores recurring weekly availability schedules for therapists';
COMMENT ON COLUMN public.therapist_availability.day_of_week IS '0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday';
```

## Availability Exceptions Table

This table stores one-time exceptions to the regular availability schedule (holidays, time off, etc.).

```sql
-- Create availability_exceptions table
CREATE TABLE IF NOT EXISTS public.availability_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    therapist_id UUID NOT NULL REFERENCES public.therapist_interest(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT false,
    start_time TIME,
    end_time TIME,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT check_exception_time_order CHECK (
        (is_available = false) OR (end_time > start_time)
    )
);

-- Create indexes
CREATE INDEX idx_availability_exceptions_therapist ON public.availability_exceptions(therapist_id);
CREATE INDEX idx_availability_exceptions_date ON public.availability_exceptions(date);

-- Create unique constraint to prevent duplicate exceptions for same date
CREATE UNIQUE INDEX idx_therapist_date_unique ON public.availability_exceptions(therapist_id, date);

-- Create updated_at trigger
CREATE TRIGGER update_availability_exceptions_updated_at
    BEFORE UPDATE ON public.availability_exceptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE public.availability_exceptions IS 'Stores one-time exceptions to therapist regular availability (holidays, time off, special hours)';
```

## Row Level Security Policies

```sql
-- Enable RLS on therapist_availability
ALTER TABLE public.therapist_availability ENABLE ROW LEVEL SECURITY;

-- Policy: Therapists can manage their own availability
CREATE POLICY "Therapists can manage own availability"
    ON public.therapist_availability
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.therapist_interest
            WHERE therapist_interest.id = therapist_availability.therapist_id
            AND therapist_interest.email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.therapist_interest
            WHERE therapist_interest.id = therapist_availability.therapist_id
            AND therapist_interest.email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );

-- Policy: Everyone can view therapist availability (for booking)
CREATE POLICY "Everyone can view therapist availability"
    ON public.therapist_availability
    FOR SELECT
    USING (true);

-- Enable RLS on availability_exceptions
ALTER TABLE public.availability_exceptions ENABLE ROW LEVEL SECURITY;

-- Policy: Therapists can manage their own exceptions
CREATE POLICY "Therapists can manage own exceptions"
    ON public.availability_exceptions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.therapist_interest
            WHERE therapist_interest.id = availability_exceptions.therapist_id
            AND therapist_interest.email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.therapist_interest
            WHERE therapist_interest.id = availability_exceptions.therapist_id
            AND therapist_interest.email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );

-- Policy: Everyone can view exceptions (for booking)
CREATE POLICY "Everyone can view availability exceptions"
    ON public.availability_exceptions
    FOR SELECT
    USING (true);
```

## Helper Function: Get Available Time Slots

This function generates available time slots for a therapist within a date range.

```sql
-- Function to get available time slots for a therapist
CREATE OR REPLACE FUNCTION get_available_time_slots(
    p_therapist_id UUID,
    p_start_date TIMESTAMPTZ,
    p_end_date TIMESTAMPTZ,
    p_slot_duration_minutes INTEGER DEFAULT 60
)
RETURNS TABLE (
    id TEXT,
    therapist_id UUID,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    is_available BOOLEAN,
    is_booked BOOLEAN
) AS $$
DECLARE
    v_current_date DATE;
    v_day_of_week INTEGER;
    v_availability RECORD;
    v_slot_start TIMESTAMPTZ;
    v_slot_end TIMESTAMPTZ;
    v_is_exception BOOLEAN;
    v_is_booked BOOLEAN;
BEGIN
    -- Loop through each date in the range
    FOR v_current_date IN 
        SELECT generate_series(
            p_start_date::DATE,
            p_end_date::DATE,
            '1 day'::INTERVAL
        )::DATE
    LOOP
        v_day_of_week := EXTRACT(DOW FROM v_current_date);
        
        -- Check if there's an exception for this date
        SELECT EXISTS (
            SELECT 1 FROM public.availability_exceptions
            WHERE therapist_id = p_therapist_id
            AND date = v_current_date
            AND is_available = false
        ) INTO v_is_exception;
        
        -- Skip if therapist is not available on this date
        CONTINUE WHEN v_is_exception;
        
        -- Get regular availability for this day of week
        FOR v_availability IN
            SELECT start_time, end_time
            FROM public.therapist_availability
            WHERE therapist_id = p_therapist_id
            AND day_of_week = v_day_of_week
            AND is_recurring = true
        LOOP
            -- Generate time slots for this availability window
            v_slot_start := v_current_date + v_availability.start_time;
            
            WHILE v_slot_start + (p_slot_duration_minutes || ' minutes')::INTERVAL <= v_current_date + v_availability.end_time LOOP
                v_slot_end := v_slot_start + (p_slot_duration_minutes || ' minutes')::INTERVAL;
                
                -- Check if slot is already booked
                SELECT EXISTS (
                    SELECT 1 FROM public.appointments
                    WHERE therapist_id = p_therapist_id
                    AND status NOT IN ('cancelled', 'no-show')
                    AND tstzrange(scheduled_start, scheduled_end) && tstzrange(v_slot_start, v_slot_end)
                ) INTO v_is_booked;
                
                -- Return the slot
                RETURN QUERY SELECT
                    gen_random_uuid()::TEXT,
                    p_therapist_id,
                    v_slot_start,
                    v_slot_end,
                    NOT v_is_booked,
                    v_is_booked;
                
                -- Move to next slot
                v_slot_start := v_slot_end;
            END LOOP;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql STABLE;

-- Add comment
COMMENT ON FUNCTION get_available_time_slots IS 'Generates available time slots for a therapist within a date range, excluding booked slots and exceptions';
```

## Sample Data

```sql
-- Example: Set availability for a therapist (Monday-Friday, 9 AM - 5 PM)
INSERT INTO public.therapist_availability (therapist_id, day_of_week, start_time, end_time)
SELECT 
    '<therapist_id>'::UUID,
    day,
    '09:00:00'::TIME,
    '17:00:00'::TIME
FROM generate_series(1, 5) AS day;

-- Example: Add a holiday exception (therapist unavailable on specific date)
INSERT INTO public.availability_exceptions (therapist_id, date, is_available, reason)
VALUES (
    '<therapist_id>'::UUID,
    '2025-12-25'::DATE,
    false,
    'Christmas Holiday'
);
```
