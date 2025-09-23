import { Injectable } from '@angular/core';
import { Observable, from, of, combineLatest } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { SupabaseService } from '../../core/auth/supabase-client';
import { AuthService } from '../../core/auth/auth-service';
import { AssessmentService } from '../mental-health-assessment/assessment.service';
import { TherapistMatchingService, TherapistProfile, ClientAssessment, MatchScore } from '../therapist-signup.component/therapist-matching.service';

export interface TherapistListing extends TherapistProfile {
  bio?: string;
  professional_photo_url?: string;
  years_private_practice?: number;
  verification_status?: string;
  rating?: number; // Future enhancement
  review_count?: number; // Future enhancement
  next_available?: string; // Future enhancement
}

export interface TherapistSearchFilters {
  specializations?: string[];
  languages?: string[];
  priceRange?: { min: number; max: number };
  sessionType?: 'individual' | 'couples' | 'family' | 'group';
  availability?: string[]; // days of week
  insuranceAccepted?: string[];
  servicesOffered?: Array<'in_person' | 'online'>;
  gender?: string;
  searchQuery?: string; // name or specialization search
}

export interface TherapistListingResults {
  recommended: TherapistListing[];
  other: TherapistListing[];
  totalCount: number;
  matchScores?: { [therapistId: string]: MatchScore };
}

@Injectable({
  providedIn: 'root'
})
export class TherapistListingService {

  constructor(
    private supabase: SupabaseService,
    private authService: AuthService,
    private assessmentService: AssessmentService,
    private matchingService: TherapistMatchingService
  ) {}

  /**
   * Get therapists with recommendations based on user assessment
   * Returns recommended therapists first, then others
   */
  public getTherapistsWithRecommendations(
    filters: TherapistSearchFilters = {},
    limit: number = 50
  ): Observable<TherapistListingResults> {
    return this.authService.getSession().pipe(
      switchMap(session => {
        if (!session?.user) {
          // No user session - just return all therapists
          return this.getAllTherapists(filters, limit).pipe(
            map(therapists => ({
              recommended: [],
              other: therapists,
              totalCount: therapists.length
            }))
          );
        }

        // Get user assessment and therapists concurrently
        return combineLatest([
          this.assessmentService.getCurrentAssessment(),
          this.getAllTherapists(filters, limit)
        ]).pipe(
          map(([assessment, therapists]) => {
            if (!assessment || therapists.length === 0) {
              return {
                recommended: [],
                other: therapists,
                totalCount: therapists.length
              };
            }

            // Convert assessment to ClientAssessment format
            const clientAssessment = this.convertToClientAssessment(assessment);
            
            // Get match scores for all therapists
            const matchScores = this.matchingService.findMatches(clientAssessment, therapists);
            const matchScoreMap: { [key: string]: MatchScore } = {};
            matchScores.forEach(score => {
              matchScoreMap[score.therapist_id] = score;
            });

            // Separate recommended vs others (70%+ match = recommended)
            const recommended: TherapistListing[] = [];
            const other: TherapistListing[] = [];

            therapists.forEach((therapist: TherapistListing) => {
              const matchScore = matchScoreMap[therapist.id];
              if (matchScore && matchScore.total_score >= 0.7) {
                recommended.push(therapist);
              } else {
                other.push(therapist);
              }
            });

            // Sort recommended by match score (highest first)
            recommended.sort((a, b) => {
              const scoreA = matchScoreMap[a.id]?.total_score || 0;
              const scoreB = matchScoreMap[b.id]?.total_score || 0;
              return scoreB - scoreA;
            });

            return {
              recommended,
              other,
              totalCount: therapists.length,
              matchScores: matchScoreMap
            };
          })
        );
      }),
      catchError(error => {
        console.error('Error fetching therapists with recommendations:', error);
        return of({
          recommended: [],
          other: [],
          totalCount: 0
        });
      })
    );
  }

  /**
   * Get all approved therapists from therapist_interest table
   */
  private getAllTherapists(
    filters: TherapistSearchFilters = {},
    limit: number = 50
  ): Observable<TherapistListing[]> {
    let query = this.supabase.client
      .from('therapist_interest')
      .select(`
        id,
        full_name,
        gender,
        license_type,
        years_experience,
        years_private_practice,
        specializations,
        therapy_approaches,
        client_demographics,
        severity_levels,
        crisis_intervention_trained,
        trauma_informed_certified,
        languages,
        availability_slots,
        session_durations,
        hourly_rates,
        sliding_scale_available,
        insurance_accepted,
        city,
        state_province,
        country,
        bio,
        professional_photo_url,
        verification_status,
        emergency_availability
      `)
      .eq('status', 'approved') // Only show approved therapists
      .limit(limit);

    // Apply filters
    if (filters.specializations && filters.specializations.length > 0) {
      // Use JSONB contains operator for array overlap
      filters.specializations.forEach(spec => {
        query = query.contains('specializations', [spec]);
      });
    }

    if (filters.languages && filters.languages.length > 0) {
      // Use JSONB contains operator for array overlap  
      filters.languages.forEach(lang => {
        query = query.contains('languages', [lang]);
      });
    }

    if (filters.insuranceAccepted && filters.insuranceAccepted.length > 0) {
      filters.insuranceAccepted.forEach(insurance => {
        query = query.contains('insurance_accepted', [insurance]);
      });
    }

    if (filters.gender && filters.gender !== 'any') {
      query = query.eq('gender', filters.gender);
    }

    if (filters.searchQuery) {
      query = query.or(`full_name.ilike.%${filters.searchQuery}%,specializations.cs.["${filters.searchQuery}"]`);
    }

    return from(query).pipe(
      map((response: any) => {
        if (response.error) {
          throw new Error(`Failed to fetch therapists: ${response.error.message}`);
        }

        return response.data.map((therapist: any) => this.mapToTherapistListing(therapist));
      }),
      catchError(error => {
        console.error('Error fetching therapists:', error);
        return of([]);
      })
    );
  }

  /**
   * Get a specific therapist by ID
   */
  public getTherapistById(id: string): Observable<TherapistListing | null> {
    return from(
      this.supabase.client
        .from('therapist_interest')
        .select('*')
        .eq('id', id)
        .eq('status', 'approved')
        .single()
    ).pipe(
      map((response: any) => {
        if (response.error || !response.data) {
          return null;
        }
        return this.mapToTherapistListing(response.data);
      }),
      catchError(error => {
        console.error('Error fetching therapist by ID:', error);
        return of(null);
      })
    );
  }

  /**
   * Search therapists by query (name or specialization)
   */
  public searchTherapists(query: string, limit: number = 20): Observable<TherapistListing[]> {
    const filters: TherapistSearchFilters = { searchQuery: query };
    return this.getAllTherapists(filters, limit);
  }

  /**
   * Get unique filter options from all therapists (for UI filters)
   */
  public getFilterOptions(): Observable<{
    specializations: string[];
    languages: string[];
    insuranceProviders: string[];
    locations: Array<{ city: string; state: string; country: string }>;
  }> {
    return from(
      this.supabase.client
        .from('therapist_interest')
        .select('specializations, languages, insurance_accepted, city, state_province, country')
        .eq('status', 'approved')
    ).pipe(
      map((response: any) => {
        if (response.error) {
          throw new Error(`Failed to fetch filter options: ${response.error.message}`);
        }

        const specializations = new Set<string>();
        const languages = new Set<string>();
        const insuranceProviders = new Set<string>();
        const locations = new Set<string>();

        response.data.forEach((therapist: any) => {
          // Extract specializations
          if (therapist.specializations) {
            therapist.specializations.forEach((spec: string) => specializations.add(spec));
          }

          // Extract languages
          if (therapist.languages) {
            therapist.languages.forEach((lang: string) => languages.add(lang));
          }

          // Extract insurance providers
          if (therapist.insurance_accepted) {
            therapist.insurance_accepted.forEach((ins: string) => insuranceProviders.add(ins));
          }

          // Extract locations
          if (therapist.city && therapist.state_province && therapist.country) {
            locations.add(JSON.stringify({
              city: therapist.city,
              state: therapist.state_province,
              country: therapist.country
            }));
          }
        });

        return {
          specializations: Array.from(specializations).sort(),
          languages: Array.from(languages).sort(),
          insuranceProviders: Array.from(insuranceProviders).sort(),
          locations: Array.from(locations).map(loc => JSON.parse(loc))
        };
      }),
      catchError(error => {
        console.error('Error fetching filter options:', error);
        return of({
          specializations: [],
          languages: [],
          insuranceProviders: [],
          locations: []
        });
      })
    );
  }

  /**
   * Convert database record to TherapistListing interface
   */
  private mapToTherapistListing(data: any): TherapistListing {
    return {
      id: data.id,
      full_name: data.full_name,
      gender: data.gender || 'not_specified',
      license_type: data.license_type || '',
      years_experience: data.years_experience || 0,
      years_private_practice: data.years_private_practice,
      specializations: data.specializations || [],
      therapy_approaches: data.therapy_approaches || [],
      client_demographics: data.client_demographics || [],
      severity_levels: data.severity_levels || [],
      crisis_intervention_trained: data.crisis_intervention_trained || false,
      trauma_informed_certified: data.trauma_informed_certified || false,
      languages: data.languages || [],
      availability_slots: data.availability_slots || [],
      session_durations: data.session_durations || [],
      hourly_rates: data.hourly_rates || { individual: 0, couples: 0, family: 0, group: 0 },
      sliding_scale_available: data.sliding_scale_available || false,
      insurance_accepted: data.insurance_accepted || [],
      location: `${data.city || ''}, ${data.state_province || ''}, ${data.country || ''}`.replace(/^,\s*|,\s*$/g, ''),
      services_offered: this.determineServicesOffered(data),
      emergency_availability: data.emergency_availability || false,
      bio: data.bio,
      professional_photo_url: data.professional_photo_url,
      verification_status: data.verification_status || 'pending'
    };
  }

  /**
   * Determine services offered based on available data
   */
  private determineServicesOffered(data: any): Array<'in_person' | 'online'> {
    // This could be enhanced based on actual data structure
    // For now, assume both are offered unless specified otherwise
    return ['in_person', 'online'];
  }

  /**
   * Convert AssessmentResult to ClientAssessment for matching service
   */
  private convertToClientAssessment(assessment: any): ClientAssessment {
    // Extract primary concern from individual responses
    const responses = assessment.individual_responses || {};
    const primaryConcernResponse = Object.values(responses)
      .flat()
      .find((r: any) => r.question?.includes('primary concern') || r.question?.includes('main concern')) as any;

    const primaryConcern = (primaryConcernResponse as any)?.value || 'general';

    // Determine severity based on scores
    let severityLevel: 'mild' | 'moderate' | 'severe' | 'crisis' = 'mild';
    if (assessment.scores) {
      const { phq9Score = 0, gad7Score = 0, pss10Score = 0 } = assessment.scores;
      const maxScore = Math.max(phq9Score, gad7Score, pss10Score * 0.4); // Normalize PSS-10
      
      if (maxScore >= 20) severityLevel = 'crisis';
      else if (maxScore >= 15) severityLevel = 'severe';
      else if (maxScore >= 10) severityLevel = 'moderate';
    }

    return {
      age_group: 'adult', // Default, could be extracted from assessment
      relationship_status: 'unknown',
      therapy_experience: 'first-time',
      therapy_preference: 'any',
      primary_concern: primaryConcern,
      severity_level: severityLevel,
      preferred_session_type: 'individual',
      preferred_languages: ['English'], // Default, could be extracted
      preferred_schedule: [],
      location_preference: 'hybrid',
      crisis_history: assessment.riskLevel === 'high' || severityLevel === 'crisis',
      trauma_history: primaryConcern.includes('trauma') || primaryConcern.includes('ptsd')
    };
  }
}