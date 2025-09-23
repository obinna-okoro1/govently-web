import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TherapistListingService, TherapistListing, TherapistSearchFilters, TherapistListingResults } from './therapist-listing.service';

@Component({
  selector: 'app-therapist-listing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './therapist-listing.component.html',
  styleUrl: './therapist-listing.component.scss'
})
export class TherapistListingComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // Data
  therapists: TherapistListingResults = {
    recommended: [],
    other: [],
    totalCount: 0
  };
  
  filterOptions = {
    specializations: [] as string[],
    languages: [] as string[],
    insuranceProviders: [] as string[],
    locations: [] as Array<{ city: string; state: string; country: string }>
  };

  // UI State
  loading = true;
  error: string | null = null;
  showFilters = false;

  // Search and Filters
  searchQuery = '';
  filters: TherapistSearchFilters = {
    specializations: [],
    languages: [],
    priceRange: { min: 0, max: 500 },
    sessionType: undefined,
    availability: [],
    insuranceAccepted: [],
    servicesOffered: [],
    gender: undefined
  };

  // Display options
  viewMode: 'grid' | 'list' = 'grid';
  sortBy: 'relevance' | 'price-low' | 'price-high' | 'experience' | 'rating' = 'relevance';

  constructor(
    private therapistListingService: TherapistListingService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeSearchDebounce();
    this.loadFilterOptions();
    this.checkQueryParams();
    this.loadTherapists();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.filters.searchQuery = query;
      this.loadTherapists();
    });
  }

  private checkQueryParams(): void {
    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      if (params['assessment']) {
        // User came from assessment - show recommendations prominently
        this.sortBy = 'relevance';
      }
    });
  }

  private loadFilterOptions(): void {
    this.therapistListingService.getFilterOptions().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (options) => {
        this.filterOptions = options;
      },
      error: (error) => {
        console.error('Error loading filter options:', error);
      }
    });
  }

  public loadTherapists(): void {
    this.loading = true;
    this.error = null;

    this.therapistListingService.getTherapistsWithRecommendations(this.filters, 50).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (results) => {
        this.therapists = results;
        this.applySorting();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading therapists:', error);
        this.error = 'Failed to load therapists. Please try again.';
        this.loading = false;
      }
    });
  }

  public onSearchChange(query: string): void {
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  public toggleFilter(filterType: keyof TherapistSearchFilters, value: any): void {
    if (filterType === 'specializations' || filterType === 'languages' || 
        filterType === 'insuranceAccepted' || filterType === 'availability' || 
        filterType === 'servicesOffered') {
      
      const filterArray = this.filters[filterType] as string[];
      if (!filterArray) {
        this.filters[filterType] = [value];
      } else {
        const index = filterArray.indexOf(value);
        if (index > -1) {
          filterArray.splice(index, 1);
        } else {
          filterArray.push(value);
        }
      }
    } else {
      (this.filters as any)[filterType] = value;
    }

    this.loadTherapists();
  }

  public clearFilters(): void {
    this.filters = {
      specializations: [],
      languages: [],
      priceRange: { min: 0, max: 500 },
      sessionType: undefined,
      availability: [],
      insuranceAccepted: [],
      servicesOffered: [],
      gender: undefined
    };
    this.searchQuery = '';
    this.loadTherapists();
  }

  public onSortChange(): void {
    this.applySorting();
  }

  private applySorting(): void {
    const sortFunctions = {
      'relevance': () => {
        // Recommended therapists are already sorted by match score
        // Keep order as-is for recommended, sort others by experience
        this.therapists.other.sort((a, b) => (b.years_experience || 0) - (a.years_experience || 0));
      },
      'price-low': () => {
        const sortByPrice = (a: TherapistListing, b: TherapistListing) => 
          (a.hourly_rates.individual || 0) - (b.hourly_rates.individual || 0);
        this.therapists.recommended.sort(sortByPrice);
        this.therapists.other.sort(sortByPrice);
      },
      'price-high': () => {
        const sortByPrice = (a: TherapistListing, b: TherapistListing) => 
          (b.hourly_rates.individual || 0) - (a.hourly_rates.individual || 0);
        this.therapists.recommended.sort(sortByPrice);
        this.therapists.other.sort(sortByPrice);
      },
      'experience': () => {
        const sortByExp = (a: TherapistListing, b: TherapistListing) => 
          (b.years_experience || 0) - (a.years_experience || 0);
        this.therapists.recommended.sort(sortByExp);
        this.therapists.other.sort(sortByExp);
      },
      'rating': () => {
        // Placeholder for future rating system
        const sortByRating = (a: TherapistListing, b: TherapistListing) => 
          (b.rating || 0) - (a.rating || 0);
        this.therapists.recommended.sort(sortByRating);
        this.therapists.other.sort(sortByRating);
      }
    };

    sortFunctions[this.sortBy]();
  }

  public bookTherapist(therapist: TherapistListing): void {
    // Navigate to booking page (to be implemented)
    this.router.navigate(['/book-therapist', therapist.id]);
  }

  public viewTherapistProfile(therapist: TherapistListing): void {
    // Navigate to detailed therapist profile (to be implemented)
    this.router.navigate(['/therapist-profile', therapist.id]);
  }

  public getMatchScore(therapistId: string): number | null {
    return this.therapists.matchScores?.[therapistId]?.total_score || null;
  }

  public getMatchScorePercentage(therapistId: string): number {
    const score = this.getMatchScore(therapistId);
    return score ? Math.round(score * 100) : 0;
  }

  public getCompatibilityReasons(therapistId: string): string[] {
    return this.therapists.matchScores?.[therapistId]?.compatibility_reasons || [];
  }

  public formatPrice(price: number | null): string {
    if (!price) return 'Contact for pricing';
    return `$${price}/session`;
  }

  public formatAvailability(slots: Array<{day: string; start_time: string; end_time: string}>): string {
    if (!slots || slots.length === 0) return 'Contact for availability';
    
    const days = slots.map(slot => slot.day.substring(0, 3)).join(', ');
    return `Available: ${days}`;
  }

  public getSpecializationDisplay(specializations: string[]): string {
    if (!specializations || specializations.length === 0) return 'General therapy';
    
    if (specializations.length <= 3) {
      return specializations.join(', ');
    }
    
    return `${specializations.slice(0, 2).join(', ')}, +${specializations.length - 2} more`;
  }

  public isFilterActive(): boolean {
    return !!(
      this.searchQuery ||
      this.filters.specializations?.length ||
      this.filters.languages?.length ||
      this.filters.insuranceAccepted?.length ||
      this.filters.gender ||
      this.filters.sessionType ||
      this.filters.servicesOffered?.length ||
      (this.filters.priceRange?.min && this.filters.priceRange.min > 0) ||
      (this.filters.priceRange?.max && this.filters.priceRange.max < 500)
    );
  }

  public getActiveFilterCount(): number {
    let count = 0;
    if (this.searchQuery) count++;
    if (this.filters.specializations?.length) count++;
    if (this.filters.languages?.length) count++;
    if (this.filters.insuranceAccepted?.length) count++;
    if (this.filters.gender) count++;
    if (this.filters.sessionType) count++;
    if (this.filters.servicesOffered?.length) count++;
    if (this.filters.priceRange?.min && this.filters.priceRange.min > 0) count++;
    if (this.filters.priceRange?.max && this.filters.priceRange.max < 500) count++;
    return count;
  }

  public hasRecommendedTherapists(): boolean {
    return this.therapists.recommended.length > 0;
  }

  public getPlaceholderImage(therapist: TherapistListing): string {
    const initial = therapist.full_name.charAt(0).toUpperCase();
    return `https://via.placeholder.com/80x80/667eea/ffffff?text=${initial}`;
  }
}