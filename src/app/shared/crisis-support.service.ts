import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

export interface CrisisResource {
  name: string;
  phone: string;
  text?: string;
  website?: string;
  available24h: boolean;
  description: string;
}

export interface CountryCrisisSupport {
  countryCode: string;
  countryName: string;
  emergency: CrisisResource;
  suicide: CrisisResource;
  crisis: CrisisResource;
  additional?: CrisisResource[];
}

@Injectable({
  providedIn: 'root'
})
export class CrisisSupportService {
  private http = inject(HttpClient);
  private currentSupport$ = new BehaviorSubject<CountryCrisisSupport>(this.getDefaultSupport());
  private userCountry$ = new BehaviorSubject<string>('US');

  /**
   * Default crisis support (US-based)
   */
  private getDefaultSupport(): CountryCrisisSupport {
    return {
      countryCode: 'US',
      countryName: 'United States',
      emergency: {
        name: 'Emergency Services',
        phone: '911',
        available24h: true,
        description: 'Police, Fire, Medical Emergency'
      },
      suicide: {
        name: 'Suicide & Crisis Lifeline',
        phone: '988',
        text: '741741',
        website: 'https://suicidepreventionlifeline.org',
        available24h: true,
        description: 'Free and confidential emotional support'
      },
      crisis: {
        name: 'Crisis Text Line',
        phone: '741741',
        text: '741741',
        website: 'https://crisistextline.org',
        available24h: true,
        description: 'Text HOME to 741741 for crisis support'
      }
    };
  }

  /**
   * Crisis support data for different countries
   */
  private crisisSupportData: { [key: string]: CountryCrisisSupport } = {
    'US': this.getDefaultSupport(),
    'CA': {
      countryCode: 'CA',
      countryName: 'Canada',
      emergency: {
        name: 'Emergency Services',
        phone: '911',
        available24h: true,
        description: 'Police, Fire, Medical Emergency'
      },
      suicide: {
        name: 'Talk Suicide Canada',
        phone: '833-456-4566',
        text: '45645',
        website: 'https://talksuicide.ca',
        available24h: true,
        description: 'Free, confidential suicide prevention service'
      },
      crisis: {
        name: 'Canada Suicide Prevention Service',
        phone: '1-833-456-4566',
        available24h: true,
        description: 'National suicide prevention hotline'
      }
    },
    'GB': {
      countryCode: 'GB',
      countryName: 'United Kingdom',
      emergency: {
        name: 'Emergency Services',
        phone: '999',
        available24h: true,
        description: 'Police, Fire, Ambulance'
      },
      suicide: {
        name: 'Samaritans',
        phone: '116123',
        website: 'https://www.samaritans.org',
        available24h: true,
        description: 'Free support for anyone in emotional distress'
      },
      crisis: {
        name: 'Crisis Text Line UK',
        phone: '85258',
        text: '85258',
        website: 'https://www.crisistextline.uk',
        available24h: true,
        description: 'Text SHOUT to 85258 for crisis support'
      }
    },
    'AU': {
      countryCode: 'AU',
      countryName: 'Australia',
      emergency: {
        name: 'Emergency Services',
        phone: '000',
        available24h: true,
        description: 'Police, Fire, Ambulance'
      },
      suicide: {
        name: 'Lifeline Australia',
        phone: '13 11 14',
        text: '0477 13 11 14',
        website: 'https://www.lifeline.org.au',
        available24h: true,
        description: 'Crisis support and suicide prevention'
      },
      crisis: {
        name: 'Beyond Blue',
        phone: '1300 22 4636',
        website: 'https://www.beyondblue.org.au',
        available24h: true,
        description: 'Support for anxiety, depression and suicide'
      }
    },
    'DE': {
      countryCode: 'DE',
      countryName: 'Germany',
      emergency: {
        name: 'Emergency Services',
        phone: '112',
        available24h: true,
        description: 'Police, Fire, Medical Emergency'
      },
      suicide: {
        name: 'Telefonseelsorge',
        phone: '0800 111 0 111',
        website: 'https://www.telefonseelsorge.de',
        available24h: true,
        description: 'Free anonymous counseling and crisis intervention'
      },
      crisis: {
        name: 'Nummer gegen Kummer',
        phone: '116 111',
        available24h: false,
        description: 'Crisis support for children and teens'
      }
    },
    'FR': {
      countryCode: 'FR',
      countryName: 'France',
      emergency: {
        name: 'Emergency Services',
        phone: '112',
        available24h: true,
        description: 'European Emergency Number'
      },
      suicide: {
        name: 'Suicide Écoute',
        phone: '01 45 39 40 00',
        website: 'https://www.suicide-ecoute.fr',
        available24h: true,
        description: 'Free, anonymous suicide prevention hotline'
      },
      crisis: {
        name: 'SOS Amitié',
        phone: '09 72 39 40 50',
        website: 'https://www.sos-amitie.com',
        available24h: true,
        description: 'Emotional support and listening service'
      }
    },
    'JP': {
      countryCode: 'JP',
      countryName: 'Japan',
      emergency: {
        name: 'Emergency Services',
        phone: '119',
        available24h: true,
        description: 'Fire and Ambulance Services'
      },
      suicide: {
        name: 'TELL Lifeline',
        phone: '03-5774-0992',
        website: 'https://telljp.com',
        available24h: false,
        description: 'English-language crisis hotline in Japan'
      },
      crisis: {
        name: 'Japan Suicide Prevention Center',
        phone: '03-5286-9090',
        available24h: false,
        description: 'Suicide prevention and crisis support'
      }
    }
  };

  constructor() {
    this.detectUserLocation();
  }

  /**
   * Detect user's location and set appropriate crisis support
   */
  private detectUserLocation(): void {
    // Try IP-based geolocation first
    this.getCountryFromIP().subscribe({
      next: (country) => {
        this.setCountrySupport(country);
      },
      error: () => {
        // Fallback: Try browser geolocation
        this.getCountryFromBrowser().subscribe({
          next: (country) => {
            this.setCountrySupport(country);
          },
          error: () => {
            // Final fallback: Use timezone to guess country
            this.getCountryFromTimezone();
          }
        });
      }
    });
  }

  /**
   * Get country from IP address using a free geolocation service
   */
  private getCountryFromIP(): Observable<string> {
    return this.http.get<any>('https://ipapi.co/json/').pipe(
      map(response => response.country_code || 'US'),
      catchError(() => {
        // Fallback API
        return this.http.get<any>('https://api.country.is/').pipe(
          map(response => response.country || 'US'),
          catchError(() => of('US'))
        );
      })
    );
  }

  /**
   * Get country from browser geolocation API
   */
  private getCountryFromBrowser(): Observable<string> {
    return new Observable(observer => {
      if (!navigator.geolocation) {
        observer.error('Geolocation not supported');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Use reverse geocoding service
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          
          this.http.get<any>(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`)
            .subscribe({
              next: (response) => {
                observer.next(response.countryCode || 'US');
                observer.complete();
              },
              error: () => {
                observer.error('Geocoding failed');
              }
            });
        },
        (error) => {
          observer.error('Geolocation permission denied');
        },
        {
          timeout: 10000,
          enableHighAccuracy: false
        }
      );
    });
  }

  /**
   * Guess country from timezone (less accurate but works offline)
   */
  private getCountryFromTimezone(): void {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let countryCode = 'US'; // Default

    // Simple timezone to country mapping
    if (timezone.includes('America/')) {
      if (timezone.includes('Toronto') || timezone.includes('Vancouver') || timezone.includes('Montreal')) {
        countryCode = 'CA';
      } else {
        countryCode = 'US';
      }
    } else if (timezone.includes('Europe/London')) {
      countryCode = 'GB';
    } else if (timezone.includes('Europe/Berlin') || timezone.includes('Europe/Munich')) {
      countryCode = 'DE';
    } else if (timezone.includes('Europe/Paris')) {
      countryCode = 'FR';
    } else if (timezone.includes('Australia/')) {
      countryCode = 'AU';
    } else if (timezone.includes('Asia/Tokyo')) {
      countryCode = 'JP';
    }

    this.setCountrySupport(countryCode);
  }

  /**
   * Set crisis support for specific country
   */
  public setCountrySupport(countryCode: string): void {
    const support = this.crisisSupportData[countryCode] || this.getDefaultSupport();
    this.currentSupport$.next(support);
    this.userCountry$.next(countryCode);
    
    console.log(`Crisis support set for: ${support.countryName} (${countryCode})`);
  }

  /**
   * Get current crisis support observable
   */
  public getCurrentSupport(): Observable<CountryCrisisSupport> {
    return this.currentSupport$.asObservable();
  }

  /**
   * Get current user country
   */
  public getUserCountry(): Observable<string> {
    return this.userCountry$.asObservable();
  }

  /**
   * Get emergency phone number for current country
   */
  public getEmergencyNumber(): string {
    return this.currentSupport$.value.emergency.phone;
  }

  /**
   * Get suicide prevention hotline for current country
   */
  public getSuicideHotline(): string {
    return this.currentSupport$.value.suicide.phone;
  }

  /**
   * Get crisis text line for current country
   */
  public getCrisisTextNumber(): string {
    const crisis = this.currentSupport$.value.crisis;
    return crisis.text || crisis.phone;
  }

  /**
   * Call emergency services for current country
   */
  public callEmergency(): void {
    const phone = this.getEmergencyNumber();
    window.open(`tel:${phone}`, '_self');
  }

  /**
   * Call suicide hotline for current country
   */
  public callSuicideHotline(): void {
    const phone = this.getSuicideHotline();
    window.open(`tel:${phone}`, '_self');
  }

  /**
   * Get formatted crisis message for current country
   */
  public getCrisisMessage(): Observable<string> {
    return this.getCurrentSupport().pipe(
      map(support => {
        const suicide = support.suicide;
        let message = `If you're in crisis, call ${suicide.phone} (${suicide.name})`;
        
        if (suicide.text) {
          message += ` or text ${suicide.text}`;
        }
        
        return message;
      })
    );
  }

  /**
   * Get all available crisis resources for current country
   */
  public getAllResources(): Observable<CrisisResource[]> {
    return this.getCurrentSupport().pipe(
      map(support => {
        const resources = [support.emergency, support.suicide, support.crisis];
        if (support.additional) {
          resources.push(...support.additional);
        }
        return resources.filter(resource => resource !== undefined);
      })
    );
  }

  /**
   * Manually add or update crisis support for a country
   */
  public addCountrySupport(countryCode: string, support: CountryCrisisSupport): void {
    this.crisisSupportData[countryCode] = support;
  }

  /**
   * Check if country is supported
   */
  public isCountrySupported(countryCode: string): boolean {
    return countryCode in this.crisisSupportData;
  }
}