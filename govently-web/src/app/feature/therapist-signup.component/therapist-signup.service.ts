import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { SupabaseService } from '../../core/auth/supabase-client';

export interface TherapistSignupData {
  full_name: string;
  email: string;
  phone: string | null;
  country: string;
  license_number: string | null;
  license_region: string | null;
  years_experience: number | null;
  specializations: string[];
  languages: string[];
  availability_hours_per_week: number | null;
  preferred_session_type: string | null;
  expected_hourly_rate: number | null;
  bio: string | null;
  linkedin_url: string | null;
  consent: boolean;
  status?: string;
  created_at?: string;
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