import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http'; // ✅ Import here
import { LocationService } from '../../shared/location-service';
import { ModalService } from '../../shared/modal/modal.service';
import { Login } from '../login/login';
import { AuthService, Gender } from '../../core/auth/auth-service';
import { ConfettiService } from '../../shared/confetti-service';
import { Router } from '@angular/router';
import { take } from 'rxjs';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule], // ✅ Include it
  templateUrl: './signup.html',
  styleUrl: './signup.scss'
})
export class Signup {
  name = '';
  email = '';
  password = '';
  age = 18; // Placeholder, you might want to add an input for age
  gender: Gender = 'other';
  country = '';
  city = '';
  countries: string[] = [];
  cities: string[] = [];
  errorMessage = '';

  constructor(
    private locationService: LocationService,
    private modalService: ModalService,
    private authService: AuthService,
    private confettiService: ConfettiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.locationService.getCountries().subscribe((res: any) => {
      if (res?.data) {
        this.countries = res.data.map((c: any) => c.country);
      }
    });
  }

  onCountryChange(country: string): void {
    if (country) {
      this.locationService.getCities(country).subscribe((res: any) => {
        if (res?.data) {
          this.cities = res.data;
          this.city = '';
        }
      });
    } else {
      this.cities = [];
      this.city = '';
    }
  }

 onSubmit(): void {
    
    this.authService.signUp({
      name: this.name,
      email: this.email,
      gender: this.gender,
      country: this.country,
      city: this.city,
      age: this.age
    }, this.password).pipe(take(1)).subscribe({
      next: (response) => {
        if (response) {
           this.confettiService.launchConfetti();
          this.modalService.close();
        }
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Signup failed. Please try again.';
      }
    });
}

  goToLogin(): void {
    this.modalService.close();
    this.modalService.open(Login, 'Login', {});
  }
}
