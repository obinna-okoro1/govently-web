import { Routes } from '@angular/router';
import { LandingComponent } from './feature/landing/landing.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { 
    path: 'journaling', 
    loadComponent: () => import('./feature/journaling-component/journaling-component').then(m => m.JournalingComponent)
  },
  { 
    path: 'ai-chat', 
    loadComponent: () => import('./feature/ai-chat-component/ai-chat-component').then(m => m.AiChatComponent)
  },
  { 
    path: 'new-password', 
    loadComponent: () => import('./feature/password-reset.component/password-reset.component').then(m => m.PasswordResetComponent),
    canActivate: [authGuard]
  }
];