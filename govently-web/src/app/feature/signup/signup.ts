import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LocationService } from '../../shared/location-service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-signup',
  imports: [HttpClientModule, ReactiveFormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.scss'
})
export class Signup {
 signupForm!: FormGroup;
  countries: string[] = [];
  cities: string[] = [];

  constructor(
    private fb: FormBuilder,
    private locationService: LocationService
  ) {}

  ngOnInit(): void {
    // Initialize form
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      gender: ['', Validators.required],
      country: ['', Validators.required],
      city: ['', Validators.required]
    });

    // Load countries
    this.locationService.getCountries().subscribe((res: any) => {
      if (res?.data) {
        this.countries = res.data.map((c: any) => c.country);
      }
    });

    // Watch for country changes
    this.signupForm.get('country')?.valueChanges.subscribe(country => {
      if (country) {
        this.locationService.getCities(country).subscribe((res: any) => {
          if (res?.data) {
            this.cities = res.data;
            this.signupForm.patchValue({ city: '' });
          }
        });
      } else {
        this.cities = [];
        this.signupForm.patchValue({ city: '' });
      }
    });
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      console.log('Form data:', this.signupForm.value);
      // TODO: Integrate with Supabase Auth here
    }
  }

}
