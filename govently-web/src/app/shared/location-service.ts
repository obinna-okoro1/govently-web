import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
   private baseUrl = 'https://countriesnow.space/api/v0.1/countries';

  constructor(private http: HttpClient) {}

  getCountries(): Observable<any> {
    return this.http.get(`${this.baseUrl}`);
  }

  getCities(country: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/cities`, { country });
  } 
}
