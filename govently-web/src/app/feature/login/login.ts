import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalService } from '../../shared/modal/modal.service';
import { Signup } from '../signup/signup';

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
    private modalService: ModalService
   ) {}

  onSubmit() {
    // TODO: Replace with real authentication logic
    console.log('Login submitted:', this.email, this.password);
    this.loginSuccess.emit({ email: this.email, password: this.password });
  }

  goToSignup() {
  // Close the current modal
  this.modalService.close();

  this.modalService.open(Signup, 'Sign Up', {});
}
}
