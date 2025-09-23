import { Routes } from '@angular/router';
import { LandingComponent } from './feature/landing/landing.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  {
    path: 'about',
    loadComponent: () => import('./feature/about-us/about-us.component').then(m => m.AboutUsComponent)
  },
  { 
    path: 'journaling', 
    loadComponent: () => import('./feature/journaling-component/journaling-component').then(m => m.JournalingComponent)
  },
  { 
    path: 'ai-chat', 
    loadComponent: () => import('./feature/ai-chat-component/ai-chat-component').then(m => m.AiChatComponent)
  },
  { 
    path: 'assessment', 
    loadComponent: () => import('./feature/mental-health-assessment/mental-health-assessment.component').then(m => m.MentalHealthAssessmentComponent)
  },
  { 
    path: 'therapist-matching', 
    loadComponent: () => import('./feature/therapist-listing/therapist-listing.component').then(m => m.TherapistListingComponent)
  },
  { 
    path: 'new-password', 
    loadComponent: () => import('./feature/password-reset.component/password-reset.component').then(m => m.PasswordResetComponent),
    canActivate: [authGuard]
  }
];