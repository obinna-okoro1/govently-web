import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
    @Output() loginSuccess = new EventEmitter<{ email: string; password: string }>();
  @Output() openSignup = new EventEmitter<void>();

  email = '';
  password = '';

  onSubmit() {
    // TODO: Replace with real authentication logic
    console.log('Login submitted:', this.email, this.password);
    this.loginSuccess.emit({ email: this.email, password: this.password });
  }

  goToSignup() {
    this.openSignup.emit();
  }

}
