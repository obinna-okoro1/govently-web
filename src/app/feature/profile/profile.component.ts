import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService, UserProfile, Gender } from '../../core/auth/auth-service';
import { BackButtonComponent } from '../../shared/back-button-component/back-button-component';
import { ModalService } from '../../shared/modal/modal.service';
import { ConfirmationModal } from '../../shared/confirmation-modal/confirmation-modal';
import { SupabaseService } from '../../core/auth/supabase-client';

interface Companion {
  name: string;
  value: string;
  emoji: string;
  description: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, BackButtonComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  public userProfile: UserProfile | null = null;
  public isEditing = false;
  public isSaving = false;
  public errorMessage = '';
  public successMessage = '';
  
  // Editable fields
  public editName = '';
  public editEmail = '';
  public editGender: Gender = 'other';
  public editAge = 18;
  public editCity = '';
  public editCountry = '';
  public editAiPersona = 'tired_therapist';
  
  // AI Personas
  public companions: Companion[] = [
    { 
      name: 'Gentle Therapist', 
      value: 'tired_therapist', 
      emoji: '😌',
      description: 'Calm, professional support with therapeutic techniques'
    },
    { 
      name: 'Caring Friend', 
      value: 'empathetic_friend', 
      emoji: '💜',
      description: 'Warm, understanding conversation like a close friend'
    },
    { 
      name: 'Mindful Listener', 
      value: 'chill_listener', 
      emoji: '🎧',
      description: 'Patient, non-judgmental space for you to process thoughts'
    }
  ];
  
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private modalService: ModalService,
    private supabase: SupabaseService
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUserProfile(): void {
    this.authService.getUserProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe(profile => {
        if (profile) {
          this.userProfile = profile;
          this.editName = profile.name;
          this.editEmail = profile.email;
          this.editGender = profile.gender;
          this.editAge = profile.age;
          this.editCity = profile.city;
          this.editCountry = profile.country;
          
          // Load AI persona preference if exists
          this.loadAiPersona();
        } else {
          // Redirect to home if not authenticated
          this.router.navigate(['/']);
        }
      });
  }

  private async loadAiPersona(): Promise<void> {
    if (!this.userProfile) return;
    
    try {
      const { data, error } = await this.supabase.client
        .from('profiles')
        .select('ai_chat_persona')
        .eq('user_id', this.userProfile.userId)
        .single();
      
      if (!error && data?.ai_chat_persona) {
        this.editAiPersona = data.ai_chat_persona;
      }
    } catch (error) {
      console.error('Error loading AI persona:', error);
    }
  }

  public enableEdit(): void {
    this.isEditing = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  public cancelEdit(): void {
    if (this.userProfile) {
      this.editName = this.userProfile.name;
      this.editEmail = this.userProfile.email;
      this.editGender = this.userProfile.gender;
      this.editAge = this.userProfile.age;
      this.editCity = this.userProfile.city;
      this.editCountry = this.userProfile.country;
      this.loadAiPersona();
    }
    this.isEditing = false;
    this.errorMessage = '';
    this.successMessage = '';
  }

  public async saveProfile(): Promise<void> {
    if (!this.userProfile) return;
    
    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const { error } = await this.supabase.client
        .from('profiles')
        .update({
          name: this.editName,
          email: this.editEmail,
          gender: this.editGender,
          age: this.editAge,
          city: this.editCity,
          country: this.editCountry,
          ai_chat_persona: this.editAiPersona
        })
        .eq('user_id', this.userProfile.userId);

      if (error) {
        throw error;
      }

      // Update local profile
      this.userProfile = {
        ...this.userProfile,
        name: this.editName,
        email: this.editEmail,
        gender: this.editGender,
        age: this.editAge,
        city: this.editCity,
        country: this.editCountry
      };

      this.successMessage = 'Profile updated successfully!';
      this.isEditing = false;
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to update profile. Please try again.';
    } finally {
      this.isSaving = false;
    }
  }

  public deleteAccount(): void {
    const modalRef = this.modalService.open(ConfirmationModal, 'Delete Account', {});
    modalRef.componentInstance.message = 
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.';

    modalRef.result.then(
      async (result) => {
        if (result === 'confirm') {
          await this.performAccountDeletion();
        }
      },
      () => {}
    );
  }

  private async performAccountDeletion(): Promise<void> {
    if (!this.userProfile) return;

    try {
      // Delete user profile data
      const { error: profileError } = await this.supabase.client
        .from('profiles')
        .delete()
        .eq('user_id', this.userProfile.userId);

      if (profileError) {
        throw profileError;
      }

      // Sign out and redirect
      this.authService.signOut().subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Error during sign out:', error);
          this.router.navigate(['/']);
        }
      });
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to delete account. Please try again.';
    }
  }

  public getSelectedCompanion(): Companion {
    return this.companions.find(c => c.value === this.editAiPersona) || this.companions[0];
  }
}
