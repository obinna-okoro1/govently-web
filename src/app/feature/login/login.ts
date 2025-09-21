import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalService } from '../../shared/modal/modal.service';
import { Signup } from '../signup/signup';
import { AuthService } from '../../core/auth/auth-service';
import { ConfettiService } from '../../shared/confetti-service';
import { Router } from '@angular/router';
import { take } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  public email = '';
  public password = '';

  public errorMessage = '';

  constructor(
    private router: Router,
    private modalService: ModalService,
    private authService: AuthService,
    private confettiService: ConfettiService
   ) {}

  public onSubmit() {
  this.authService.signIn({ email: this.email, password: this.password })
    .pipe(take(1))
    .subscribe({
      next: (response) => {
        if (response.error) {
          if (response.error.code === 'email_not_confirmed') {
            this.errorMessage = 'Please confirm your email before logging in.';
          } else {
            this.errorMessage = response.error.message || 'Login failed. Please try again.';
          }
          return;
        }
        if (response.data) {
          this.modalService.close();
          this.confettiService.launchConfetti();
          this.router.navigate(['/journaling']);
        }
      },
      error: (error) => {
        // Handles true HTTP/network errors
        this.errorMessage = error.error?.message || 'Login failed. Please try again.';
      }
    });
}


  public onForgotPassword() {
    this.authService.passwordReset(this.email).subscribe({
      next: (response) => {
        if (response.error) {
          this.errorMessage = response.error.message;
        } else {
          this.modalService.close();
        }
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Password reset failed. Please try again.';
      }
    });
  }

  public goToSignup() {
  // Close the current modal
  this.modalService.close();

  this.modalService.open(Signup, 'Sign Up', {});
}
}
