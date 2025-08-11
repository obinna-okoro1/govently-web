import { Component } from '@angular/core';
import { AuthService, ResetPasswordError, ResetPasswordResponse } from '../../core/auth/auth-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalService } from '../../shared/modal/modal.service';
import { Login } from '../login/login';
import { take } from 'rxjs/internal/operators/take';

@Component({
  selector: 'app-password-reset.component',
  imports: [CommonModule, FormsModule],
  templateUrl: './password-reset.component.html',
  styleUrl: './password-reset.component.scss'
})
export class PasswordResetComponent {
  newPassword = '';
  confirmPassword = '';
  errorMessage = '';
  successMessage = '';
  resetToken: string | null = null;

   constructor(
    private authService: AuthService,
    private router: Router,
    private modalService: ModalService,
    private route: ActivatedRoute
  ) {}

    ngOnInit() {
    // Get the reset token from URL if present
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        // Store token or handle it in your auth service
        this.resetToken = params['token'];
      }
    });
  }

  onSubmit() {
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      this.successMessage = '';
      return;
    }

    // Check if we have a reset token (coming from email link)
    if (this.resetToken) {
      this.authService.updatePassword(this.newPassword)
        .pipe(take(1))
        .subscribe({
          next: (response: ResetPasswordResponse) => {
            if (response.error) {
              this.errorMessage = response.error.message;
              this.successMessage = '';
              return;
            }
            this.successMessage = 'Password reset successful! Please login with your new password.';
            this.errorMessage = '';
            this.router.navigate(['/']);
            this.modalService.open(Login, 'Login', {});
          },
          error: (error: ResetPasswordError) => {
            this.errorMessage = error.message;
            this.successMessage = '';
          }
        });
    } else {
      this.errorMessage = 'No reset token provided.';
      this.successMessage = '';
    }
  }
}
