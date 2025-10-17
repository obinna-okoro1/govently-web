import { Injectable } from '@angular/core';
import { Observable, from, of, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

import { SupabaseService } from '../../core/auth/supabase-client';
import { AuthService } from '../../core/auth/auth-service';
import {
  Appointment,
  AppointmentBookingRequest,
  TimeSlot,
  TherapistAvailability,
  AvailabilityException
} from './appointment.types';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  
  constructor(
    private supabase: SupabaseService,
    private authService: AuthService
  ) {}

  /**
   * Book an appointment with a therapist
   */
  public bookAppointment(request: AppointmentBookingRequest): Observable<Appointment> {
    return this.authService.getSession().pipe(
      switchMap(session => {
        if (!session?.user) {
          return throwError(() => new Error('User must be authenticated to book an appointment'));
        }

        const appointment = {
          client_user_id: session.user.id,
          therapist_user_id: request.therapist_user_id,
          therapist_id: request.therapist_id,
          scheduled_start: request.scheduled_start.toISOString(),
          scheduled_end: request.scheduled_end.toISOString(),
          status: 'scheduled' as const,
          type: request.type,
          notes: request.notes,
          assessment_id: request.assessment_id
        };

        return from(
          this.supabase.client
            .from('appointments')
            .insert(appointment)
            .select()
            .single()
        );
      }),
      map((response: any) => {
        if (response.error) {
          throw new Error(`Failed to book appointment: ${response.error.message}`);
        }
        
        return this.mapRecordToAppointment(response.data);
      }),
      catchError(error => {
        console.error('Error booking appointment:', error);
        return throwError(() => new Error('Failed to book appointment. Please try again.'));
      })
    );
  }

  /**
   * Get available time slots for a therapist
   */
  public getAvailableTimeSlots(therapistId: string, startDate: Date, endDate: Date): Observable<TimeSlot[]> {
    return from(
      this.supabase.client
        .rpc('get_available_time_slots', {
          p_therapist_id: therapistId,
          p_start_date: startDate.toISOString(),
          p_end_date: endDate.toISOString()
        })
    ).pipe(
      map((response: any) => {
        if (response.error) {
          throw new Error(`Failed to fetch time slots: ${response.error.message}`);
        }

        return (response.data || []).map((slot: any) => ({
          id: slot.id,
          therapist_id: slot.therapist_id,
          start_time: new Date(slot.start_time),
          end_time: new Date(slot.end_time),
          is_available: slot.is_available,
          is_booked: slot.is_booked
        }));
      }),
      catchError(error => {
        console.error('Error fetching time slots:', error);
        return of([]);
      })
    );
  }

  /**
   * Get user's appointments
   */
  public getUserAppointments(includeCompleted: boolean = false): Observable<Appointment[]> {
    return this.authService.getSession().pipe(
      switchMap(session => {
        if (!session?.user) {
          return of([]);
        }

        let query = this.supabase.client
          .from('appointments')
          .select('*')
          .eq('client_user_id', session.user.id)
          .order('scheduled_start', { ascending: true });

        if (!includeCompleted) {
          query = query.in('status', ['scheduled', 'confirmed', 'in-progress']);
        }

        return from(query);
      }),
      map((response: any) => {
        if (response.error) {
          throw new Error(`Failed to fetch appointments: ${response.error.message}`);
        }

        return response.data.map((record: any) => this.mapRecordToAppointment(record));
      }),
      catchError(error => {
        console.error('Error fetching user appointments:', error);
        return of([]);
      })
    );
  }

  /**
   * Get therapist's appointments
   */
  public getTherapistAppointments(includeCompleted: boolean = false): Observable<Appointment[]> {
    return this.authService.getSession().pipe(
      switchMap(session => {
        if (!session?.user) {
          return of([]);
        }

        let query = this.supabase.client
          .from('appointments')
          .select('*')
          .eq('therapist_user_id', session.user.id)
          .order('scheduled_start', { ascending: true });

        if (!includeCompleted) {
          query = query.in('status', ['scheduled', 'confirmed', 'in-progress']);
        }

        return from(query);
      }),
      map((response: any) => {
        if (response.error) {
          throw new Error(`Failed to fetch appointments: ${response.error.message}`);
        }

        return response.data.map((record: any) => this.mapRecordToAppointment(record));
      }),
      catchError(error => {
        console.error('Error fetching therapist appointments:', error);
        return of([]);
      })
    );
  }

  /**
   * Cancel an appointment
   */
  public cancelAppointment(appointmentId: string): Observable<void> {
    return from(
      this.supabase.client
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId)
    ).pipe(
      map((response: any) => {
        if (response.error) {
          throw new Error(`Failed to cancel appointment: ${response.error.message}`);
        }
      }),
      catchError(error => {
        console.error('Error cancelling appointment:', error);
        return throwError(() => new Error('Failed to cancel appointment. Please try again.'));
      })
    );
  }

  /**
   * Update appointment status
   */
  public updateAppointmentStatus(appointmentId: string, status: string): Observable<void> {
    return from(
      this.supabase.client
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId)
    ).pipe(
      map((response: any) => {
        if (response.error) {
          throw new Error(`Failed to update appointment: ${response.error.message}`);
        }
      }),
      catchError(error => {
        console.error('Error updating appointment status:', error);
        return throwError(() => new Error('Failed to update appointment status. Please try again.'));
      })
    );
  }

  /**
   * Get therapist availability schedule
   */
  public getTherapistAvailability(therapistId: string): Observable<TherapistAvailability[]> {
    return from(
      this.supabase.client
        .from('therapist_availability')
        .select('*')
        .eq('therapist_id', therapistId)
        .order('day_of_week', { ascending: true })
    ).pipe(
      map((response: any) => {
        if (response.error) {
          throw new Error(`Failed to fetch availability: ${response.error.message}`);
        }

        return response.data || [];
      }),
      catchError(error => {
        console.error('Error fetching therapist availability:', error);
        return of([]);
      })
    );
  }

  /**
   * Set therapist availability
   */
  public setTherapistAvailability(availability: TherapistAvailability[]): Observable<void> {
    return this.authService.getSession().pipe(
      switchMap(session => {
        if (!session?.user) {
          return throwError(() => new Error('User must be authenticated'));
        }

        return from(
          this.supabase.client
            .from('therapist_availability')
            .upsert(availability)
        );
      }),
      map((response: any) => {
        if (response.error) {
          throw new Error(`Failed to set availability: ${response.error.message}`);
        }
      }),
      catchError(error => {
        console.error('Error setting therapist availability:', error);
        return throwError(() => new Error('Failed to set availability. Please try again.'));
      })
    );
  }

  // ===== Private Helper Methods =====

  /**
   * Map database record to Appointment
   */
  private mapRecordToAppointment(record: any): Appointment {
    return {
      id: record.id,
      client_user_id: record.client_user_id,
      therapist_user_id: record.therapist_user_id,
      therapist_id: record.therapist_id,
      scheduled_start: new Date(record.scheduled_start),
      scheduled_end: new Date(record.scheduled_end),
      status: record.status,
      type: record.type,
      notes: record.notes,
      assessment_id: record.assessment_id,
      meeting_link: record.meeting_link,
      created_at: record.created_at ? new Date(record.created_at) : undefined,
      updated_at: record.updated_at ? new Date(record.updated_at) : undefined
    };
  }
}
