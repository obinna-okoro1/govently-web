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
    },
    'MX': {
      countryCode: 'MX',
      countryName: 'Mexico',
      emergency: {
        name: 'Emergency Services',
        phone: '911',
        available24h: true,
        description: 'Police, Fire, Medical Emergency'
      },
      suicide: {
        name: 'Línea de la Vida',
        phone: '800-911-2000',
        website: 'https://www.gob.mx/salud/conadic/acciones-y-programas/linea-de-la-vida',
        available24h: true,
        description: 'Línea nacional de prevención del suicidio'
      },
      crisis: {
        name: 'Cruz Roja Mexicana',
        phone: '065',
        available24h: true,
        description: 'Apoyo psicológico de emergencia'
      }
    },
    'BR': {
      countryCode: 'BR',
      countryName: 'Brazil',
      emergency: {
        name: 'Emergency Services',
        phone: '190',
        available24h: true,
        description: 'Police Emergency'
      },
      suicide: {
        name: 'Centro de Valorização da Vida (CVV)',
        phone: '188',
        website: 'https://www.cvv.org.br',
        available24h: true,
        description: 'Apoio emocional e prevenção do suicídio'
      },
      crisis: {
        name: 'SAMU (Medical Emergency)',
        phone: '192',
        available24h: true,
        description: 'Serviço de Atendimento Móvel de Urgência'
      }
    },
    'IT': {
      countryCode: 'IT',
      countryName: 'Italy',
      emergency: {
        name: 'Emergency Services',
        phone: '112',
        available24h: true,
        description: 'European Emergency Number'
      },
      suicide: {
        name: 'Telefono Amico',
        phone: '02 2327 2327',
        website: 'https://www.telefonoamico.it',
        available24h: true,
        description: 'Servizio di ascolto e supporto emotivo'
      },
      crisis: {
        name: 'Samaritans Onlus',
        phone: '800 86 00 22',
        available24h: true,
        description: 'Supporto per persone in crisi suicidaria'
      }
    },
    'ES': {
      countryCode: 'ES',
      countryName: 'Spain',
      emergency: {
        name: 'Emergency Services',
        phone: '112',
        available24h: true,
        description: 'European Emergency Number'
      },
      suicide: {
        name: 'Teléfono de la Esperanza',
        phone: '717 003 717',
        website: 'https://www.telefonodelaesperanza.org',
        available24h: true,
        description: 'Orientación y apoyo en crisis vital'
      },
      crisis: {
        name: 'SAPTEL',
        phone: '91 459 00 50',
        available24h: true,
        description: 'Servicio de atención psicológica telefónica'
      }
    },
    'NL': {
      countryCode: 'NL',
      countryName: 'Netherlands',
      emergency: {
        name: 'Emergency Services',
        phone: '112',
        available24h: true,
        description: 'European Emergency Number'
      },
      suicide: {
        name: '113 Zelfmoordpreventie',
        phone: '0800-0113',
        text: '0900-0113',
        website: 'https://www.113.nl',
        available24h: true,
        description: 'Nederlandse hulplijn voor zelfmoordpreventie'
      },
      crisis: {
        name: 'De Luisterlijn',
        phone: '088 076 76 76',
        available24h: true,
        description: 'Anonieme hulplijn voor wie een luisterend oor nodig heeft'
      }
    },
    'BE': {
      countryCode: 'BE',
      countryName: 'Belgium',
      emergency: {
        name: 'Emergency Services',
        phone: '112',
        available24h: true,
        description: 'European Emergency Number'
      },
      suicide: {
        name: 'Centre de Prévention du Suicide',
        phone: '0800 32 123',
        website: 'https://www.preventionsuicide.be',
        available24h: true,
        description: 'Prévention du suicide et soutien en crise'
      },
      crisis: {
        name: 'Télé-Accueil',
        phone: '107',
        available24h: true,
        description: 'Service d\'écoute et de soutien'
      }
    },
    'SE': {
      countryCode: 'SE',
      countryName: 'Sweden',
      emergency: {
        name: 'Emergency Services',
        phone: '112',
        available24h: true,
        description: 'European Emergency Number'
      },
      suicide: {
        name: 'Mind Självmordslinjen',
        phone: '90101',
        website: 'https://mind.se',
        available24h: true,
        description: 'Stöd för personer med självmordstankar'
      },
      crisis: {
        name: 'BRIS (för barn)',
        phone: '116 111',
        available24h: true,
        description: 'Stöd för barn och unga i kris'
      }
    },
    'NO': {
      countryCode: 'NO',
      countryName: 'Norway',
      emergency: {
        name: 'Emergency Services',
        phone: '112',
        available24h: true,
        description: 'European Emergency Number'
      },
      suicide: {
        name: 'Mental Helse',
        phone: '116 123',
        website: 'https://www.mentalhelse.no',
        available24h: true,
        description: 'Hjelp ved selvmordstanker og kriser'
      },
      crisis: {
        name: 'Kirkens SOS',
        phone: '22 40 00 40',
        available24h: true,
        description: 'Krisetelefon for alle som trenger noen å snakke med'
      }
    },
    'DK': {
      countryCode: 'DK',
      countryName: 'Denmark',
      emergency: {
        name: 'Emergency Services',
        phone: '112',
        available24h: true,
        description: 'European Emergency Number'
      },
      suicide: {
        name: 'Livslinien',
        phone: '70 201 201',
        website: 'https://www.livslinien.dk',
        available24h: true,
        description: 'Rådgivning og støtte ved selvmordstanker'
      },
      crisis: {
        name: 'Børns Vilkår',
        phone: '116 111',
        available24h: true,
        description: 'Børnetelefonen - hjælp til børn og unge'
      }
    },
    'IN': {
      countryCode: 'IN',
      countryName: 'India',
      emergency: {
        name: 'Emergency Services',
        phone: '112',
        available24h: true,
        description: 'National Emergency Number'
      },
      suicide: {
        name: 'AASRA',
        phone: '91-9820466726',
        website: 'http://www.aasra.info',
        available24h: true,
        description: '24/7 suicide prevention helpline'
      },
      crisis: {
        name: 'Vandrevala Foundation',
        phone: '1860 2662 345',
        available24h: true,
        description: 'Mental health support and counseling'
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

    // Comprehensive timezone to country mapping
    if (timezone.includes('America/')) {
      if (timezone.includes('Toronto') || timezone.includes('Vancouver') || timezone.includes('Montreal')) {
        countryCode = 'CA';
      } else if (timezone.includes('Mexico') || timezone.includes('Cancun') || timezone.includes('Tijuana')) {
        countryCode = 'MX';
      } else if (timezone.includes('Sao_Paulo') || timezone.includes('Brasilia') || timezone.includes('Fortaleza')) {
        countryCode = 'BR';
      } else {
        countryCode = 'US';
      }
    } else if (timezone.includes('Europe/')) {
      if (timezone.includes('London')) {
        countryCode = 'GB';
      } else if (timezone.includes('Berlin') || timezone.includes('Munich')) {
        countryCode = 'DE';
      } else if (timezone.includes('Paris')) {
        countryCode = 'FR';
      } else if (timezone.includes('Rome') || timezone.includes('Milan')) {
        countryCode = 'IT';
      } else if (timezone.includes('Madrid') || timezone.includes('Barcelona')) {
        countryCode = 'ES';
      } else if (timezone.includes('Amsterdam')) {
        countryCode = 'NL';
      } else if (timezone.includes('Brussels')) {
        countryCode = 'BE';
      } else if (timezone.includes('Stockholm')) {
        countryCode = 'SE';
      } else if (timezone.includes('Oslo')) {
        countryCode = 'NO';
      } else if (timezone.includes('Copenhagen')) {
        countryCode = 'DK';
      } else {
        countryCode = 'GB'; // Default to UK for Europe
      }
    } else if (timezone.includes('Australia/')) {
      countryCode = 'AU';
    } else if (timezone.includes('Asia/')) {
      if (timezone.includes('Tokyo')) {
        countryCode = 'JP';
      } else if (timezone.includes('Kolkata') || timezone.includes('Delhi') || timezone.includes('Mumbai')) {
        countryCode = 'IN';
      } else {
        countryCode = 'US'; // Default for other Asian countries
      }
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
    this.logCrisisSupport('call', 'emergency');
    window.open(`tel:${phone}`, '_self');
  }

  /**
   * Call suicide hotline for current country
   */
  public callSuicideHotline(): void {
    const phone = this.getSuicideHotline();
    this.logCrisisSupport('call', 'suicide');
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

  /**
   * Get culturally appropriate crisis messaging for current country
   */
  public getCulturallyAppropriateMessage(): Observable<string> {
    return this.getCurrentSupport().pipe(
      map(support => {
        const messages: { [key: string]: string } = {
          'US': 'If you\'re having thoughts of suicide or are in emotional distress, help is available.',
          'CA': 'If you\'re having thoughts of suicide or are in emotional distress, help is available.',
          'GB': 'If you\'re struggling with your mental health or having suicidal thoughts, support is here.',
          'AU': 'If you\'re going through a tough time or having suicidal thoughts, you\'re not alone.',
          'DE': 'Wenn Sie Selbstmordgedanken haben oder sich in einer Krise befinden, ist Hilfe verfügbar.',
          'FR': 'Si vous avez des pensées suicidaires ou traversez une crise, de l\'aide est disponible.',
          'IT': 'Se hai pensieri suicidi o stai attraversando una crisi, l\'aiuto è disponibile.',
          'ES': 'Si tienes pensamientos suicidas o estás en crisis, la ayuda está disponible.',
          'NL': 'Als je zelfmoordgedachten hebt of in crisis bent, is er hulp beschikbaar.',
          'BE': 'Si vous avez des pensées suicidaires ou êtes en crise, de l\'aide est disponible.',
          'SE': 'Om du har självmordstankar eller är i kris, finns hjälp tillgänglig.',
          'NO': 'Hvis du har selvmordstanker eller er i krise, er hjelp tilgjengelig.',
          'DK': 'Hvis du har selvmordstanker eller er i krise, er der hjælp tilgængelig.',
          'MX': 'Si tienes pensamientos suicidas o estás en crisis, la ayuda está disponible.',
          'BR': 'Se você tem pensamentos suicidas ou está em crise, a ajuda está disponível.',
          'IN': 'If you\'re having thoughts of suicide or are in emotional distress, help is available.',
          'JP': 'If you\'re having thoughts of suicide or are in emotional distress, help is available.'
        };
        
        return messages[support.countryCode] || messages['US'];
      })
    );
  }

  /**
   * Get priority resources based on risk level
   */
  public getPriorityResources(riskLevel?: 'low' | 'medium' | 'high' | 'severe'): Observable<CrisisResource[]> {
    return this.getCurrentSupport().pipe(
      map(support => {
        const resources: CrisisResource[] = [];
        
        // For high/severe risk, prioritize emergency and suicide hotlines
        if (riskLevel === 'high' || riskLevel === 'severe') {
          resources.push(support.emergency);
          resources.push(support.suicide);
          resources.push(support.crisis);
        } else {
          // For lower risk, prioritize support lines over emergency
          resources.push(support.suicide);
          resources.push(support.crisis);
          if (riskLevel === 'medium') {
            resources.push(support.emergency);
          }
        }
        
        if (support.additional) {
          resources.push(...support.additional);
        }
        
        return resources.filter(resource => resource !== undefined);
      })
    );
  }

  /**
   * Log crisis support usage for analytics (anonymized)
   */
  public logCrisisSupport(action: 'view' | 'call' | 'text', resourceType: 'emergency' | 'suicide' | 'crisis'): void {
    const country = this.userCountry$.value;
    const timestamp = new Date().toISOString();
    
    // Log for analytics (ensure this is anonymized in production)
    console.log(`Crisis Support Usage: ${action} ${resourceType} in ${country} at ${timestamp}`);
    
    // In production, this would send to analytics service
    // this.analyticsService.track('crisis_support_usage', {
    //   action,
    //   resourceType,
    //   country,
    //   timestamp
    // });
  }
}