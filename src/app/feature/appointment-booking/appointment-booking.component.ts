import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { AppointmentService } from './appointment.service';
import { Therapist, TimeSlot, AppointmentBookingRequest, AppointmentType } from './appointment.types';

@Component({
  selector: 'app-appointment-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointment-booking.component.html',
  styleUrls: ['./appointment-booking.component.scss']
})
export class AppointmentBookingComponent implements OnInit {
  @Input() therapist!: Therapist;
  @Input() assessmentId?: string;

  public selectedDate: Date = new Date();
  public availableSlots: TimeSlot[] = [];
  public selectedSlot: TimeSlot | null = null;
  public appointmentType: AppointmentType = 'initial-consultation';
  public notes: string = '';
  public isLoading: boolean = false;
  public errorMessage: string = '';
  public successMessage: string = '';

  // Date range for slot fetching (current week)
  private startDate: Date = new Date();
  private endDate: Date = new Date();

  constructor(
    private appointmentService: AppointmentService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Set date range to current week
    this.startDate.setHours(0, 0, 0, 0);
    this.endDate.setDate(this.startDate.getDate() + 7);
  }

  public ngOnInit(): void {
    // Get query params if any
    this.route.queryParams.subscribe(params => {
      if (params['assessment']) {
        this.assessmentId = params['assessment'];
        this.appointmentType = 'assessment-review';
      }
    });

    if (this.therapist) {
      this.loadAvailableSlots();
    }
  }

  /**
   * Load available time slots for the therapist
   */
  private loadAvailableSlots(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.appointmentService.getAvailableTimeSlots(
      this.therapist.id,
      this.startDate,
      this.endDate
    ).subscribe({
      next: (slots) => {
        this.availableSlots = slots;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load available slots. Please try again.';
        this.isLoading = false;
        console.error('Error loading slots:', error);
      }
    });
  }

  /**
   * Select a time slot
   */
  public selectSlot(slot: TimeSlot): void {
    this.selectedSlot = slot;
    this.errorMessage = '';
  }

  /**
   * Book the appointment
   */
  public bookAppointment(): void {
    if (!this.selectedSlot) {
      this.errorMessage = 'Please select a time slot.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request: AppointmentBookingRequest = {
      therapist_id: this.therapist.id,
      therapist_user_id: this.therapist.user_id,
      scheduled_start: this.selectedSlot.start_time,
      scheduled_end: this.selectedSlot.end_time,
      type: this.appointmentType,
      notes: this.notes,
      assessment_id: this.assessmentId
    };

    this.appointmentService.bookAppointment(request).subscribe({
      next: (appointment) => {
        this.successMessage = 'Appointment booked successfully!';
        this.isLoading = false;
        
        // Redirect to appointments page after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/appointments']);
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to book appointment. Please try again.';
        this.isLoading = false;
        console.error('Error booking appointment:', error);
      }
    });
  }

  /**
   * Get slots for a specific date
   */
  public getSlotsForDate(date: Date): TimeSlot[] {
    return this.availableSlots.filter(slot => {
      const slotDate = new Date(slot.start_time);
      return slotDate.toDateString() === date.toDateString();
    });
  }

  /**
   * Get unique dates with available slots
   */
  public get availableDates(): Date[] {
    const dates = new Set<string>();
    this.availableSlots.forEach(slot => {
      const slotDate = new Date(slot.start_time);
      dates.add(slotDate.toDateString());
    });
    return Array.from(dates).map(dateStr => new Date(dateStr));
  }

  /**
   * Format time for display
   */
  public formatTime(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  }

  /**
   * Format date for display
   */
  public formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  /**
   * Cancel booking
   */
  public cancelBooking(): void {
    this.router.navigate(['/therapist-listing']);
  }
}
