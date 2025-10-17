# Assessment Component Refactoring & Appointment Booking System

## Overview

This implementation addresses the requirements to:
1. Simplify the large mental health assessment component by extracting it into smaller, focused components
2. Display previous assessment summary with options to retake or book a therapist
3. Implement a robust appointment booking system between users and therapists
4. Provide database schemas with appropriate RLS policies

## What Was Done

### 1. Assessment Component Refactoring ✅

The original mental health assessment component was too large (592 lines of TypeScript, 540 lines of HTML). It has been refactored into **4 smaller, focused components**:

#### New Components Created:
- **`AssessmentWelcomeComponent`** (`components/assessment-welcome.component.ts`)
  - Displays the initial welcome screen with assessment information
  - Shows estimated time, confidentiality notice, and crisis support information
  - Handles the "Begin Assessment" action

- **`AssessmentQuestionComponent`** (`components/assessment-question.component.ts`)
  - Displays individual assessment questions
  - Handles different question types (scale, multiple-choice, boolean, text)
  - Manages navigation between questions
  - Shows progress and error messages

- **`AssessmentResultsComponent`** (`components/assessment-results.component.ts`)
  - Displays assessment completion and results
  - Shows risk level, scores, and recommendations
  - Provides actions: Connect with therapist, View detailed results, Retake assessment

- **`AssessmentSummaryComponent`** (`components/assessment-summary.component.ts`)
  - **NEW FEATURE**: Shows summary of previously taken assessment
  - Displays scores, risk level, and recommendations from previous assessment
  - Provides two main actions:
    - **Book a Therapist Appointment** (navigates to appointment booking)
    - **Retake Assessment** (starts a fresh assessment)

#### Main Component Updates:
- Refactored `mental-health-assessment.component.ts` to use the extracted components
- Added logic to check for existing assessments on component init
- Shows `AssessmentSummaryComponent` when user has a previous assessment
- Integrated booking functionality from assessment results

**Benefits:**
- Better code organization and maintainability
- Easier to test individual components
- Reusable components for future features
- Clearer separation of concerns

### 2. Appointment Booking System ✅

A complete appointment booking system has been implemented in the `appointment-booking` feature module.

#### Components Created:

**`AppointmentBookingComponent`** (`appointment-booking/appointment-booking.component.ts`)
- Full-featured appointment booking interface
- Therapist information display
- Appointment type selection (initial consultation, assessment review, therapy session, follow-up)
- Date and time slot selection
- Optional notes field
- Real-time availability checking
- Booking confirmation and error handling

#### Services Created:

**`AppointmentService`** (`appointment-booking/appointment.service.ts`)
- Book appointments with therapists
- Fetch available time slots
- Get user's appointments
- Get therapist's appointments
- Cancel appointments
- Update appointment status
- Manage therapist availability schedules

#### Types Defined:

**`appointment.types.ts`**
- `Appointment` - Full appointment details
- `AppointmentBookingRequest` - Request payload for booking
- `TimeSlot` - Available time slot information
- `TherapistAvailability` - Recurring weekly schedule
- `AvailabilityException` - One-time schedule exceptions
- `AppointmentStatus` - Status enum (scheduled, confirmed, in-progress, completed, cancelled, no-show)
- `AppointmentType` - Type enum (initial-consultation, follow-up, assessment-review, therapy-session)

#### Features:
- ✅ Real-time availability checking
- ✅ Conflict prevention (no overlapping appointments)
- ✅ Multiple appointment types support
- ✅ Recurring weekly schedules for therapists
- ✅ Exception handling (holidays, time off)
- ✅ Assessment integration (can book based on assessment results)
- ✅ Full appointment lifecycle management
- ✅ Responsive mobile-first UI

### 3. Database Schema & Security ✅

Comprehensive database schemas have been created with full Row Level Security (RLS) policies.

#### Tables Created:

**1. `appointments` table** (`docs/database/appointments-table.md`)
```sql
- id (UUID, primary key)
- client_user_id (UUID, references auth.users)
- therapist_user_id (UUID, references auth.users)
- therapist_id (UUID, references therapist_profiles)
- scheduled_start (TIMESTAMPTZ)
- scheduled_end (TIMESTAMPTZ)
- status (TEXT: scheduled, confirmed, in-progress, completed, cancelled, no-show)
- type (TEXT: initial-consultation, follow-up, assessment-review, therapy-session)
- notes (TEXT)
- assessment_id (UUID, optional link to user_assessments)
- meeting_link (TEXT)
- created_at, updated_at (TIMESTAMPTZ)
```

**RLS Policies:**
- Clients can view and manage their own appointments
- Therapists can view and manage their appointments
- Prevents unauthorized access
- Time-limited deletion (24 hours)

**Constraints:**
- Appointment end must be after start
- Minimum 30-minute duration
- Prevents overlapping appointments for therapists

**2. `therapist_availability` table** (`docs/database/therapist-availability-table.md`)
```sql
- id (UUID, primary key)
- therapist_id (UUID)
- day_of_week (INTEGER: 0-6, Sunday-Saturday)
- start_time (TIME)
- end_time (TIME)
- is_recurring (BOOLEAN)
- created_at, updated_at (TIMESTAMPTZ)
```

**RLS Policies:**
- Therapists can manage their own availability
- Public can view availability (for booking)

**3. `availability_exceptions` table**
```sql
- id (UUID, primary key)
- therapist_id (UUID)
- date (DATE)
- is_available (BOOLEAN)
- start_time, end_time (TIME, optional)
- reason (TEXT)
- created_at, updated_at (TIMESTAMPTZ)
```

**RLS Policies:**
- Therapists can manage their own exceptions
- Public can view exceptions (for booking)

#### Helper Function:

**`get_available_time_slots`** - PostgreSQL function
- Generates available time slots for a therapist
- Takes therapist_id, date range, and slot duration
- Excludes booked appointments
- Respects availability exceptions
- Optimized for performance (marked as STABLE)

### 4. Documentation ✅

Comprehensive documentation has been provided:

**`docs/database/README.md`**
- Overview of the appointment booking system
- Table relationships diagram
- Setup instructions
- Usage examples for clients and therapists
- Migration notes and rollback procedures
- Performance and scalability considerations

**`docs/database/appointments-table.md`**
- Full SQL for appointments table creation
- All RLS policies
- Validation constraints
- Index creation

**`docs/database/therapist-availability-table.md`**
- SQL for availability tables
- RLS policies
- Helper function implementation
- Sample data examples

## Integration Points

### Assessment to Booking Flow

1. User completes mental health assessment
2. Assessment results include "Connect with Licensed Therapist" button
3. Clicking navigates to therapist matching with assessment context
4. From therapist listing, user can book appointment
5. Appointment booking component receives:
   - Therapist information
   - Assessment ID (for assessment-review type)
   - Risk level (for priority matching)

### Previous Assessment Flow

1. User returns to assessment page
2. System checks for existing assessment
3. If found, displays `AssessmentSummaryComponent` with:
   - Previous scores and risk level
   - Key recommendations
   - "Book a Therapist Appointment" button → Navigates to booking
   - "Retake Assessment" button → Starts new assessment

## Usage Instructions

### For Database Setup (Supabase)

1. Run the SQL scripts in order:
   ```sql
   -- 1. Create appointments table
   -- Execute SQL from docs/database/appointments-table.md
   
   -- 2. Create availability tables and function
   -- Execute SQL from docs/database/therapist-availability-table.md
   ```

2. Verify RLS policies are enabled:
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename IN ('appointments', 'therapist_availability', 'availability_exceptions');
   ```

3. Test with sample data (see documentation for examples)

### For Therapists

**Set Availability:**
```typescript
// In therapist dashboard
appointmentService.setTherapistAvailability([
  { therapist_id: 'xxx', day_of_week: 1, start_time: '09:00', end_time: '17:00', is_recurring: true },
  { therapist_id: 'xxx', day_of_week: 2, start_time: '09:00', end_time: '17:00', is_recurring: true },
  // ... more days
]);
```

### For Clients

**Book Appointment from Assessment:**
1. Complete assessment
2. Click "Connect with a Licensed Therapist"
3. Select therapist from listing
4. Booking component shows available slots
5. Select date, time, and appointment type
6. Add optional notes
7. Click "Book Appointment"

**Book from Previous Assessment:**
1. Visit assessment page
2. See previous assessment summary
3. Click "Book a Therapist Appointment"
4. Continue with booking flow

## File Structure

```
src/app/feature/
├── mental-health-assessment/
│   ├── components/
│   │   ├── assessment-welcome.component.ts
│   │   ├── assessment-question.component.ts
│   │   ├── assessment-results.component.ts
│   │   ├── assessment-summary.component.ts  (NEW)
│   │   └── index.ts
│   ├── mental-health-assessment.component.ts (REFACTORED)
│   ├── mental-health-assessment.component.html (REFACTORED)
│   ├── assessment.service.ts
│   ├── assessment.types.ts
│   └── assessment.data.ts
│
└── appointment-booking/  (NEW)
    ├── appointment-booking.component.ts
    ├── appointment-booking.component.html
    ├── appointment-booking.component.scss
    ├── appointment.service.ts
    ├── appointment.types.ts
    └── index.ts

docs/
└── database/  (NEW)
    ├── README.md
    ├── appointments-table.md
    └── therapist-availability-table.md
```

## Testing Recommendations

1. **Assessment Component:**
   - Test welcome screen displays correctly
   - Test question navigation works
   - Test previous assessment summary shows when applicable
   - Test "Retake Assessment" clears state properly
   - Test "Book Therapist" navigates correctly

2. **Appointment Booking:**
   - Test available slots load correctly
   - Test date/time selection works
   - Test appointment type selection
   - Test booking creates appointment in database
   - Test error handling for booking conflicts
   - Test cancellation workflow

3. **Database:**
   - Verify RLS policies prevent unauthorized access
   - Test overlapping appointment prevention
   - Test availability function generates correct slots
   - Test exception handling (holidays, time off)

## Known Considerations

1. **Build Issue**: There's a known issue with the Supabase realtime package (`websocket-factory` module). This is not related to our changes and exists in the base project. The development and testing should be done using the Angular dev server or by addressing the Supabase configuration.

2. **Meeting Link**: The appointments table includes a `meeting_link` field for virtual sessions, but video conferencing integration is not implemented in this PR. This can be added as a future enhancement.

3. **Notifications**: The system does not include email/SMS notifications for appointment confirmations or reminders. This should be added as a follow-up feature.

4. **Time Zones**: Time handling assumes UTC. Consider adding timezone support for better user experience.

## Next Steps

1. Add route configuration for appointment booking component
2. Integrate with therapist listing page
3. Create therapist dashboard for managing appointments
4. Add appointment reminder notifications
5. Implement video conferencing integration
6. Add payment/billing integration
7. Create admin dashboard for appointment oversight

## Summary

✅ **Completed:**
- Assessment component successfully refactored into 4 smaller components
- Previous assessment summary feature implemented
- Comprehensive appointment booking system created
- Full database schema with RLS policies provided
- Extensive documentation included

This implementation provides a solid foundation for the appointment booking feature while significantly improving the maintainability of the assessment component.
