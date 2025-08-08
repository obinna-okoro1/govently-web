import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-therapist-signup.component',
  imports: [ CommonModule, FormsModule],
  templateUrl: './therapist-signup.component.html',
  styleUrl: './therapist-signup.component.scss'
})
export class TherapistSignupComponent {
 // Form fields
  full_name: string = '';
  email: string = '';
  phone: string = '';
  country: string = '';
  license_number: string = '';
  license_region: string = '';
  years_experience: number | null = null;
  specializations: { [key: string]: boolean } = {};
  languages: { [key: string]: boolean } = {};
  availability_hours_per_week: number | null = null;
  preferred_session_type: string = '';
  expected_hourly_rate: number | null = null;
  bio: string = '';
  linkedin_url: string = '';
  consent: boolean = true;

  // Available options
  countries: string[] = ['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'Other'];
  availableSpecializations: string[] = [
    'Anxiety',
    'Depression',
    'Relationship Issues',
    'Trauma',
    'PTSD',
    'OCD',
    'Eating Disorders',
    'Addiction',
    'Child Therapy',
    'Family Therapy',
    'Couples Therapy',
    'Grief Counseling'
  ];
  availableLanguages: string[] = [
    'English',
    'Spanish',
    'French',
    'German',
    'Mandarin',
    'Arabic',
    'Hindi',
    'Portuguese',
    'Russian',
    'Other'
  ];

  errorMessage: string | null = null;

  constructor() {
    // Initialize checkboxes
    this.availableSpecializations.forEach(spec => {
      this.specializations[spec] = false;
    });
    this.availableLanguages.forEach(lang => {
      this.languages[lang] = false;
    });
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      try {
        // Prepare the data for submission
        const formData = {
          full_name: this.full_name,
          email: this.email,
          phone: this.phone || null,
          country: this.country,
          license_number: this.license_number || null,
          license_region: this.license_region || null,
          years_experience: this.years_experience || null,
          specializations: this.getSelectedItems(this.specializations),
          languages: this.getSelectedItems(this.languages),
          availability_hours_per_week: this.availability_hours_per_week || null,
          preferred_session_type: this.preferred_session_type || null,
          expected_hourly_rate: this.expected_hourly_rate || null,
          bio: this.bio || null,
          linkedin_url: this.linkedin_url || null,
          consent: this.consent
        };

        // Here you would typically send the data to your backend service
        console.log('Form submitted:', formData);
        
        // Reset form after submission if needed
        // form.resetForm();
        // this.resetCheckboxes();

        // Show success message or redirect
        this.errorMessage = null;
        alert('Thank you for your application! We will review your information and get back to you soon.');
      } catch (error) {
        console.error('Submission error:', error);
        this.errorMessage = 'An error occurred while submitting your application. Please try again.';
      }
    } else {
      this.errorMessage = 'Please fill in all required fields correctly.';
    }
  }

  // Helper method to get selected checkboxes
  private getSelectedItems(items: { [key: string]: boolean }): string[] {
    return Object.keys(items).filter(key => items[key]);
  }

  // Helper method to reset checkboxes if needed
  private resetCheckboxes(): void {
    this.availableSpecializations.forEach(spec => {
      this.specializations[spec] = false;
    });
    this.availableLanguages.forEach(lang => {
      this.languages[lang] = false;
    });
  }
}

