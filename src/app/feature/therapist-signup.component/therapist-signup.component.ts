import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ModalService } from '../../shared/modal/modal.service';
import { TherapistSignupService, EducationInfo, CertificationInfo, AvailabilitySlot, ProfessionalReference } from './therapist-signup.service';
import { ConfirmationModal } from '../../shared/confirmation-modal/confirmation-modal';

@Component({
  selector: 'app-therapist-signup.component',
  imports: [ CommonModule, FormsModule],
  providers: [TherapistSignupService],
  templateUrl: './therapist-signup.component.html',
  styleUrl: './therapist-signup.component.scss'
})
export class TherapistSignupComponent {
  // Multi-step form management
  currentStep: number = 1;
  totalSteps: number = 6;
  
  // Basic Information
  full_name: string = '';
  email: string = '';
  phone: string = '';
  country: string = '';
  state_province: string = '';
  city: string = '';
  timezone: string = '';

  // Professional Credentials
  license_number: string = '';
  license_region: string = '';
  license_type: string = '';
  license_expiry_date: string = '';
  years_experience: number | null = null;
  years_private_practice: number | null = null;
  education: EducationInfo[] = [{ degree: '', institution: '', graduation_year: new Date().getFullYear() }];
  certifications: CertificationInfo[] = [];
  therapy_approaches: { [key: string]: boolean } = {};

  // Specializations & Client Matching
  specializations: { [key: string]: boolean } = {};
  client_demographics: { [key: string]: boolean } = {};
  severity_levels: { [key: string]: boolean } = {};
  crisis_intervention_trained: boolean = false;
  trauma_informed_certified: boolean = false;
  languages: { [key: string]: boolean } = {};

  // Availability & Booking
  availability_slots: AvailabilitySlot[] = [];
  session_durations: { [key: number]: boolean } = {};
  advance_booking_required: number = 24;
  max_clients_per_week: number | null = null;
  emergency_availability: boolean = false;

  // Pricing & Insurance
  hourly_rates = {
    individual: null as number | null,
    couples: null as number | null,
    family: null as number | null,
    group: null as number | null
  };
  sliding_scale_available: boolean = false;
  sliding_scale_min_rate: number | null = null;
  insurance_accepted: { [key: string]: boolean } = {};
  payment_methods: { [key: string]: boolean } = {};
  cancellation_policy: string = '';

  // Professional Profile
  professional_photo_url: string = '';
  bio: string = '';
  treatment_philosophy: string = '';
  linkedin_url: string = '';
  website_url: string = '';
  professional_references: ProfessionalReference[] = [];

  // Verification Documents
  license_document_url: string = '';
  diploma_document_url: string = '';
  certification_documents: string[] = [];

  // Consent
  consent: boolean = false;
  background_check_consent: boolean = false;

  // Available options
  countries: string[] = ['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'Other'];
  
  timezones: string[] = [
    'Eastern Time (ET)', 'Central Time (CT)', 'Mountain Time (MT)', 'Pacific Time (PT)',
    'Alaska Time (AT)', 'Hawaii Time (HT)', 'GMT', 'CET', 'AEST', 'Other'
  ];

  licenseTypes: string[] = [
    'Licensed Professional Counselor (LPC)',
    'Licensed Clinical Social Worker (LCSW)',
    'Licensed Marriage and Family Therapist (LMFT)',
    'Licensed Mental Health Counselor (LMHC)',
    'Psychologist (PhD/PsyD)',
    'Psychiatrist (MD)',
    'Licensed Professional Clinical Counselor (LPCC)',
    'Other'
  ];

  availableTherapyApproaches: string[] = [
    'Cognitive Behavioral Therapy (CBT)',
    'Dialectical Behavior Therapy (DBT)',
    'Eye Movement Desensitization and Reprocessing (EMDR)',
    'Psychodynamic Therapy',
    'Humanistic Therapy',
    'Solution-Focused Brief Therapy (SFBT)',
    'Acceptance and Commitment Therapy (ACT)',
    'Mindfulness-Based Therapy',
    'Family Systems Therapy',
    'Gestalt Therapy',
    'Narrative Therapy',
    'Play Therapy'
  ];

  availableSpecializations: string[] = [
    'Anxiety Disorders',
    'Depression',
    'Trauma and PTSD',
    'Relationship Issues',
    'Family Therapy',
    'Couples Counseling',
    'Addiction and Substance Abuse',
    'Eating Disorders',
    'OCD',
    'ADHD',
    'Autism Spectrum Disorders',
    'Grief and Loss',
    'Life Transitions',
    'Career Counseling',
    'LGBTQ+ Issues',
    'Cultural and Identity Issues'
  ];

  clientDemographics: string[] = [
    'Children (5-12)', 'Adolescents (13-17)', 'Young Adults (18-25)',
    'Adults (26-64)', 'Seniors (65+)', 'Couples', 'Families',
    'LGBTQ+ Individuals', 'Veterans', 'First Responders'
  ];

  severityLevels: string[] = [
    'Mild symptoms', 'Moderate symptoms', 'Severe symptoms',
    'Crisis intervention', 'Chronic conditions', 'Acute episodes'
  ];

  availableLanguages: string[] = [
    'English', 'Spanish', 'French', 'German', 'Mandarin', 'Arabic',
    'Hindi', 'Portuguese', 'Russian', 'Japanese', 'Korean', 'Other'
  ];

  sessionDurationOptions: number[] = [30, 45, 60, 90, 120];

  insuranceProviders: string[] = [
    'Aetna', 'Anthem', 'Blue Cross Blue Shield', 'Cigna', 'Humana',
    'Kaiser Permanente', 'Medicare', 'Medicaid', 'UnitedHealth',
    'Self-Pay Only'
  ];

  paymentMethodOptions: string[] = [
    'Credit/Debit Card', 'Bank Transfer', 'PayPal', 'HSA/FSA',
    'Insurance Direct Billing', 'Cash', 'Check'
  ];

  daysOfWeek: string[] = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  errorMessage: string | null = null;

  constructor(
    private modalService: ModalService,
    private therapistSignupService: TherapistSignupService
  ) {
    this.initializeCheckboxes();
    this.initializeAvailabilitySlots();
  }

  private initializeCheckboxes(): void {
    // Initialize therapy approaches
    this.availableTherapyApproaches.forEach(approach => {
      this.therapy_approaches[approach] = false;
    });

    // Initialize specializations
    this.availableSpecializations.forEach(spec => {
      this.specializations[spec] = false;
    });

    // Initialize client demographics
    this.clientDemographics.forEach(demo => {
      this.client_demographics[demo] = false;
    });

    // Initialize severity levels
    this.severityLevels.forEach(level => {
      this.severity_levels[level] = false;
    });

    // Initialize languages
    this.availableLanguages.forEach(lang => {
      this.languages[lang] = false;
    });

    // Initialize session durations
    this.sessionDurationOptions.forEach(duration => {
      this.session_durations[duration] = false;
    });

    // Initialize insurance providers
    this.insuranceProviders.forEach(provider => {
      this.insurance_accepted[provider] = false;
    });

    // Initialize payment methods
    this.paymentMethodOptions.forEach(method => {
      this.payment_methods[method] = false;
    });
  }

  private initializeAvailabilitySlots(): void {
    this.daysOfWeek.forEach(day => {
      this.availability_slots.push({
        day: day,
        start_time: '',
        end_time: ''
      });
    });
  }

  // Form navigation
  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number): void {
    if (step >= 1 && step <= this.totalSteps) {
      this.currentStep = step;
    }
  }

  // Dynamic field management
  addEducation(): void {
    this.education.push({
      degree: '',
      institution: '',
      graduation_year: new Date().getFullYear()
    });
  }

  removeEducation(index: number): void {
    if (this.education.length > 1) {
      this.education.splice(index, 1);
    }
  }

  addCertification(): void {
    this.certifications.push({
      name: '',
      issuing_organization: '',
      issue_date: '',
      expiry_date: ''
    });
  }

  removeCertification(index: number): void {
    this.certifications.splice(index, 1);
  }

  addReference(): void {
    this.professional_references.push({
      name: '',
      position: '',
      organization: '',
      email: '',
      phone: '',
      relationship: ''
    });
  }

  removeReference(index: number): void {
    this.professional_references.splice(index, 1);
  }

  // Form validation
  isStepValid(step: number): boolean {
    switch (step) {
      case 1: // Basic Information
        return !!(this.full_name && this.email && this.country && this.state_province && this.city && this.timezone);
      case 2: // Professional Credentials
        return !!(this.license_type && this.years_experience !== null && this.education[0].degree);
      case 3: // Specializations
        return this.getSelectedItems(this.specializations).length > 0 && 
               this.getSelectedItems(this.languages).length > 0;
      case 4: // Availability
        return this.availability_slots.some(slot => slot.start_time && slot.end_time) &&
               this.getSelectedItems(this.session_durations).length > 0;
      case 5: // Pricing & Profile
        return !!(this.hourly_rates.individual && this.bio && this.treatment_philosophy);
      case 6: // Verification
        return this.consent && this.background_check_consent;
      default:
        return false;
    }
  }

  onSubmit(form: NgForm) {
    if (form.valid && this.isStepValid(6)) {
      try {
        const formData = {
          // Basic Information
          full_name: this.full_name,
          email: this.email,
          phone: this.phone || null,
          country: this.country,
          state_province: this.state_province,
          city: this.city,
          timezone: this.timezone,

          // Professional Credentials
          license_number: this.license_number || null,
          license_region: this.license_region || null,
          license_type: this.license_type,
          license_expiry_date: this.license_expiry_date || null,
          years_experience: this.years_experience,
          years_private_practice: this.years_private_practice,
          education: this.education.filter(edu => edu.degree && edu.institution),
          certifications: this.certifications.filter(cert => cert.name && cert.issuing_organization),
          therapy_approaches: this.getSelectedItems(this.therapy_approaches),

          // Specializations & Client Matching
          specializations: this.getSelectedItems(this.specializations),
          client_demographics: this.getSelectedItems(this.client_demographics),
          severity_levels: this.getSelectedItems(this.severity_levels),
          crisis_intervention_trained: this.crisis_intervention_trained,
          trauma_informed_certified: this.trauma_informed_certified,
          languages: this.getSelectedItems(this.languages),

          // Availability & Booking
          availability_slots: this.availability_slots.filter(slot => slot.start_time && slot.end_time),
          session_durations: this.getSelectedNumbers(this.session_durations),
          advance_booking_required: this.advance_booking_required,
          max_clients_per_week: this.max_clients_per_week,
          emergency_availability: this.emergency_availability,

          // Pricing & Insurance
          hourly_rates: this.hourly_rates,
          sliding_scale_available: this.sliding_scale_available,
          sliding_scale_min_rate: this.sliding_scale_min_rate,
          insurance_accepted: this.getSelectedItems(this.insurance_accepted),
          payment_methods: this.getSelectedItems(this.payment_methods),
          cancellation_policy: this.cancellation_policy,

          // Professional Profile
          professional_photo_url: this.professional_photo_url || null,
          bio: this.bio || null,
          treatment_philosophy: this.treatment_philosophy || null,
          linkedin_url: this.linkedin_url || null,
          website_url: this.website_url || null,
          professional_references: this.professional_references.filter(ref => ref.name && ref.email),

          // Verification Documents
          license_document_url: this.license_document_url || null,
          diploma_document_url: this.diploma_document_url || null,
          certification_documents: this.certification_documents.filter(doc => doc),

          // Consent
          consent: this.consent,
          background_check_consent: this.background_check_consent
        };

        this.therapistSignupService.submitApplication(formData).subscribe({
          next: (response) => {
            this.errorMessage = null;
            this.modalService.close();
            this.modalService.open(ConfirmationModal, 'Application Submitted Successfully', {
              inputs: {
                message: 'Thank you for your comprehensive application! We will review your credentials and get back to you within 3-5 business days. Check your email for next steps in the verification process.',
                hideButton: true
              }
            });
          },
          error: (error) => {
            console.error('Error submitting application:', error);
            this.errorMessage = 'An error occurred while submitting your application. Please try again.';
          }
        });
      } catch (error) {
        console.error('Submission error:', error);
        this.errorMessage = 'An error occurred while submitting your application. Please try again.';
      }
    } else {
      this.errorMessage = 'Please complete all required fields in the current section.';
    }
  }

  // Helper methods
  private getSelectedItems(items: { [key: string]: boolean }): string[] {
    return Object.keys(items).filter(key => items[key]);
  }

  private getSelectedNumbers(items: { [key: number]: boolean }): number[] {
    return Object.keys(items)
      .filter(key => items[parseInt(key)])
      .map(key => parseInt(key));
  }

  getProgressPercentage(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }

  getStepTitle(step: number): string {
    const titles = {
      1: 'Basic Information',
      2: 'Professional Credentials',
      3: 'Specializations & Expertise',
      4: 'Availability & Booking',
      5: 'Pricing & Profile',
      6: 'Verification & Consent'
    };
    return titles[step as keyof typeof titles] || '';
  }
}

