import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalService } from '../../shared/modal/modal.service';
import { Signup } from '../signup/signup';
import { AuthService } from '../../core/auth/auth-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
    @Output() loginSuccess = new EventEmitter<{ email: string; password: string }>();

  email = '';
  password = '';

  constructor(
    private modalService: ModalService,
    private authService: AuthService,
   ) {}

  onSubmit() {
    this.authService.signIn({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.loginSuccess.emit({ email: this.email, password: this.password });
      },
      error: (error) => {
        console.error('Login failed:', error);
      }
    });
  }

  goToSignup() {
  // Close the current modal
  this.modalService.close();

  this.modalService.open(Signup, 'Sign Up', {});
}
}
