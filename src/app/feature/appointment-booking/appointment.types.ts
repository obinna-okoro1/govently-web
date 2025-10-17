// Appointment Booking Types and Interfaces

export interface Therapist {
  id: string;
  user_id: string;
  full_name: string;
  specializations: string[];
  bio?: string;
  profile_picture_url?: string;
  hourly_rate?: number;
  credentials?: string[];
  languages?: string[];
}

export interface TimeSlot {
  id: string;
  therapist_id: string;
  start_time: Date;
  end_time: Date;
  is_available: boolean;
  is_booked: boolean;
}

export interface Appointment {
  id?: string;
  client_user_id: string;
  therapist_user_id: string;
  therapist_id: string;
  scheduled_start: Date;
  scheduled_end: Date;
  status: AppointmentStatus;
  type: AppointmentType;
  notes?: string;
  assessment_id?: string;
  meeting_link?: string;
  created_at?: Date;
  updated_at?: Date;
}

export type AppointmentStatus = 
  | 'scheduled'
  | 'confirmed'
  | 'in-progress'
  | 'completed'
  | 'cancelled'
  | 'no-show';

export type AppointmentType = 
  | 'initial-consultation'
  | 'follow-up'
  | 'assessment-review'
  | 'therapy-session';

export interface AppointmentBookingRequest {
  therapist_id: string;
  therapist_user_id: string;
  scheduled_start: Date;
  scheduled_end: Date;
  type: AppointmentType;
  notes?: string;
  assessment_id?: string;
}

export interface TherapistAvailability {
  id?: string;
  therapist_id: string;
  day_of_week: number; // 0-6 (Sunday-Saturday)
  start_time: string; // HH:mm format
  end_time: string; // HH:mm format
  is_recurring: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface AvailabilityException {
  id?: string;
  therapist_id: string;
  date: Date;
  is_available: boolean;
  start_time?: string;
  end_time?: string;
  reason?: string;
}
