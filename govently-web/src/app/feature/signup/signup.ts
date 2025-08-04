import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http'; // ✅ Import here
import { LocationService } from '../../shared/location-service';
import { ModalService } from '../../shared/modal/modal.service';
import { Login } from '../login/login';
import { AuthService, Gender } from '../../core/auth/auth-service';

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
  age = 0; // Placeholder, you might want to add an input for age
  gender: Gender = 'other';
  country = '';
  city = '';
  countries: string[] = [];
  cities: string[] = [];

  constructor(
    private locationService: LocationService,
    private modalService: ModalService,
    private authService: AuthService
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
    }, this.password).subscribe({
      next: (response) => {
        // Handle successful signup
        console.log('Signup successful:', response);
        this.modalService.close();
        // Optionally open login modal or redirect
        this.modalService.open(Login, 'Login', {});
      },
      error: (error) => {
        // Handle signup error
        console.error('Signup failed:', error);
        // You might want to show an error message to the user here
      }
    });
}

  goToLogin(): void {
    this.modalService.close();
    this.modalService.open(Login, 'Login', {});
  }
}
