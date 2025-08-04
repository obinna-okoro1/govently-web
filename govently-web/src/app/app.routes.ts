import { Routes } from '@angular/router';
import { LandingComponent } from './feature/landing/landing.component'
import { Signup } from './feature/signup/signup';
import { JournalingComponent } from './feature/journaling-component/journaling-component';
import { AiChatComponent } from './feature/ai-chat-component/ai-chat-component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'journaling', component: JournalingComponent },
  { path: 'ai-chat', component: AiChatComponent }
];
