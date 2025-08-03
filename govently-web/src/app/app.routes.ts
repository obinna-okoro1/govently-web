import { Routes } from '@angular/router';
import { LandingComponent } from './feature/landing/landing.component'
import { Signup } from './feature/signup/signup';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'signup', component: Signup }
];
