# Appointment Booking System - Database Schema

## Appointments Table

This table stores all appointment bookings between clients and therapists.

**Note:** This schema references the `therapist_interest` table for therapist profiles. The `therapist_interest` table links to `auth.users` via the `email` field.

```sql
-- Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    therapist_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    therapist_id UUID NOT NULL REFERENCES public.therapist_interest(id) ON DELETE CASCADE,
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show')),
    type TEXT NOT NULL CHECK (type IN ('initial-consultation', 'follow-up', 'assessment-review', 'therapy-session')),
    notes TEXT,
    assessment_id UUID REFERENCES public.user_assessments(id),
    meeting_link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_appointments_client ON public.appointments(client_user_id);
CREATE INDEX idx_appointments_therapist ON public.appointments(therapist_user_id);
CREATE INDEX idx_appointments_scheduled_start ON public.appointments(scheduled_start);
CREATE INDEX idx_appointments_status ON public.appointments(status);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table
COMMENT ON TABLE public.appointments IS 'Stores all appointment bookings between clients and therapists';
```

## Row Level Security (RLS) Policies

```sql
-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Policy: Clients can view their own appointments
CREATE POLICY "Clients can view own appointments"
    ON public.appointments
    FOR SELECT
    USING (auth.uid() = client_user_id);

-- Policy: Therapists can view their appointments
CREATE POLICY "Therapists can view their appointments"
    ON public.appointments
    FOR SELECT
    USING (auth.uid() = therapist_user_id);

-- Policy: Clients can create appointments
CREATE POLICY "Clients can create appointments"
    ON public.appointments
    FOR INSERT
    WITH CHECK (auth.uid() = client_user_id);

-- Policy: Clients can update their own appointments (cancel)
CREATE POLICY "Clients can update own appointments"
    ON public.appointments
    FOR UPDATE
    USING (auth.uid() = client_user_id)
    WITH CHECK (auth.uid() = client_user_id);

-- Policy: Therapists can update their appointments (confirm, complete, etc.)
CREATE POLICY "Therapists can update their appointments"
    ON public.appointments
    FOR UPDATE
    USING (auth.uid() = therapist_user_id)
    WITH CHECK (auth.uid() = therapist_user_id);

-- Policy: Only allow deletion by the creator within 24 hours
CREATE POLICY "Users can delete recent appointments"
    ON public.appointments
    FOR DELETE
    USING (
        (auth.uid() = client_user_id OR auth.uid() = therapist_user_id)
        AND created_at > NOW() - INTERVAL '24 hours'
    );
```

## Validation Constraints

```sql
-- Add constraint to ensure appointment end time is after start time
ALTER TABLE public.appointments
ADD CONSTRAINT check_appointment_times
CHECK (scheduled_end > scheduled_start);

-- Add constraint to ensure appointments are at least 30 minutes
ALTER TABLE public.appointments
ADD CONSTRAINT check_appointment_duration
CHECK (scheduled_end >= scheduled_start + INTERVAL '30 minutes');

-- Add constraint to prevent overlapping appointments for the same therapist
CREATE UNIQUE INDEX idx_therapist_no_overlap ON public.appointments (
    therapist_user_id,
    tstzrange(scheduled_start, scheduled_end)
)
WHERE status NOT IN ('cancelled', 'no-show');
```
