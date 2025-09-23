import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { SupabaseService } from '../../core/auth/supabase-client';

export interface EducationInfo {
  degree: string;
  institution: string;
  graduation_year: number;
}

export interface CertificationInfo {
  name: string;
  issuing_organization: string;
  issue_date: string;
  expiry_date?: string;
}

export interface AvailabilitySlot {
  day: string;
  start_time: string;
  end_time: string;
}

export interface ProfessionalReference {
  name: string;
  position: string;
  organization: string;
  email: string;
  phone: string;
  relationship: string;
}

export interface TherapistSignupData {
  // Basic Information
  full_name: string;
  email: string;
  phone: string | null;
  country: string;
  state_province: string;
  city: string;
  timezone: string;
  
  // Professional Credentials
  license_number: string | null;
  license_region: string | null;
  license_type: string;
  license_expiry_date: string | null;
  years_experience: number | null;
  years_private_practice: number | null;
  education: EducationInfo[];
  certifications: CertificationInfo[];
  therapy_approaches: string[];
  
  // Specializations & Matching
  specializations: string[];
  client_demographics: string[];
  severity_levels: string[];
  crisis_intervention_trained: boolean;
  trauma_informed_certified: boolean;
  languages: string[];
  
  // Availability & Booking
  availability_slots: AvailabilitySlot[];
  session_durations: number[];
  advance_booking_required: number; // hours
  max_clients_per_week: number | null;
  emergency_availability: boolean;
  
  // Pricing & Insurance
  hourly_rates: {
    individual: number | null;
    couples: number | null;
    family: number | null;
    group: number | null;
  };
  sliding_scale_available: boolean;
  sliding_scale_min_rate: number | null;
  insurance_accepted: string[];
  payment_methods: string[];
  cancellation_policy: string;
  
  // Professional Profile
  professional_photo_url: string | null;
  bio: string | null;
  treatment_philosophy: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  professional_references: ProfessionalReference[];
  
  // Verification Documents
  license_document_url: string | null;
  diploma_document_url: string | null;
  certification_documents: string[];
  
  // Consent & Status
  consent: boolean;
  background_check_consent: boolean;
  status?: string;
  created_at?: string;
  verification_status?: 'pending' | 'documents_required' | 'under_review' | 'approved' | 'rejected';
}

@Injectable()
export class TherapistSignupService {
  constructor(private supabase: SupabaseService) {}

  submitApplication(data: TherapistSignupData): Observable<any> {
    return from(
      this.supabase.client
        .from('therapist_interest')
        .insert([
          {
            ...data,
            created_at: new Date().toISOString()
          }
        ])
        .select()
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw new Error(error.message);
        }
        return data;
      })
    );
  }
}