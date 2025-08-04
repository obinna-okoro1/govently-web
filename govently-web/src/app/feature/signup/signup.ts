import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http'; // ✅ Import here
import { LocationService } from '../../shared/location-service';
import { ModalService } from '../../shared/modal/modal.service';
import { Login } from '../login/login';

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
  gender = '';
  country = '';
  city = '';
  countries: string[] = [];
  cities: string[] = [];

  constructor(
    private locationService: LocationService,
    private modalService: ModalService
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
    console.log('Signup form data:', {
      name: this.name,
      email: this.email,
      password: this.password,
      gender: this.gender,
      country: this.country,
      city: this.city
    });
    // TODO: integrate Supabase signup
  }

  goToLogin(): void {
    this.modalService.close();
    this.modalService.open(Login, 'Login', {});
  }
}
