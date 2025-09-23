import {
  Component,
  OnInit,
  HostListener,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import {
  Observable,
  Subject,
  filter,
  takeUntil,
  BehaviorSubject
} from 'rxjs';

import { AuthService, UserProfile } from '../auth/auth-service';
import { Login } from '../../feature/login/login';
import { ModalService } from '../../shared/modal/modal.service';
import { Signup } from '../../feature/signup/signup';
import { ConfirmationModal } from '../../shared/confirmation-modal/confirmation-modal';
import { CommonModule } from '@angular/common';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TherapistSignupComponent } from '../../feature/therapist-signup.component/therapist-signup.component';
import { JournalingService } from '../../feature/journaling-component/journaling.service';

@Component({
  selector: 'app-nav',
  imports: [CommonModule, RouterModule, NgbDropdownModule],
  providers: [JournalingService],
  templateUrl: './nav.html',
  styleUrls: ['./nav-enhanced.scss'],
  animations: [
    // Add smooth animations for better UX
  ]
})
export class NavComponent implements OnInit, OnDestroy {
  public currentUser$!: Observable<UserProfile | null>;
  public sidebarOpen: boolean = false;
  public isMobile: boolean = false;
  
  // Real engagement data from Supabase
  public currentStreak: number = 0;
  public totalJournalEntries: number = 0;
  public todayMood: string = '';
  public weeklyProgress: number = 0;
  public unreadAiMessages: number = 0; // TODO: Replace with real data when AI chat messages are stored in backend
  public journalProgress: number = 0;
  public circumference: number = 2 * Math.PI * 8; // For progress ring
  public dashOffset: number = this.circumference;
  
  private destroy$ = new Subject<void>();
  private routeChange$ = new BehaviorSubject<string>('');

  constructor(
    private router: Router,
    private auth: AuthService, 
    private modalService: ModalService,
    private cdr: ChangeDetectorRef,
    private journalingService: JournalingService
  ) {}

  ngOnInit(): void {
    this.currentUser$ = this.auth.getUserProfile();
    this.initializeSidebar();
    this.checkMobileStatus();
    this.setupRouteTracking();
    this.loadUserEngagementData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupRouteTracking(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.routeChange$.next(event.url);
        // Auto-close mobile nav on route change
        if (this.isMobile && this.sidebarOpen) {
          this.closeSidebar();
        }
      });
  }

  private loadUserEngagementData(): void {
    // Load real user engagement metrics from Supabase
    this.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      if (user) {
        // Load real journal data from Supabase
        this.journalingService.getEntries(user.userId).subscribe(entries => {
          this.totalJournalEntries = entries.length;
          this.calculateStreakFromEntries(entries);
          this.getTodayMood(entries);
          this.calculateWeeklyProgress(entries);
        });
        
        // TODO: Replace with real data when AI chat service exists
        // For now using static placeholder
        this.unreadAiMessages = 0; // Static until AI chat backend is implemented
      }
    });
  }

  private calculateStreakFromEntries(entries: any[]): void {
    if (entries.length === 0) {
      this.currentStreak = 0;
      return;
    }

    let streak = 0;
    const today = new Date();
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
    );

    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].created_at!);
      const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 3600 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else {
        break;
      }
    }
    
    this.currentStreak = streak;
  }

  private getTodayMood(entries: any[]): void {
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = entries.filter(entry => {
      const entryDate = new Date(entry.created_at!).toISOString().split('T')[0];
      return entryDate === today;
    });
    
    // Get the most recent mood from today
    if (todayEntries.length > 0 && todayEntries[0].mood) {
      this.todayMood = todayEntries[0].mood;
    } else {
      this.todayMood = ''; // No mood recorded today
    }
  }

  private calculateWeeklyProgress(entries: any[]): void {
    const today = new Date();
    const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    
    const thisWeekEntries = entries.filter(entry => {
      const entryDate = new Date(entry.created_at!);
      return entryDate >= weekStart && entryDate <= today;
    });
    
    this.weeklyProgress = Math.round((thisWeekEntries.length / 7) * 100);
    this.journalProgress = this.weeklyProgress;
    this.updateProgressRing();
  }

  private updateProgressRing(): void {
    const progress = this.journalProgress / 100;
    this.dashOffset = this.circumference - (progress * this.circumference);
  }

  private checkMobileStatus(): void {
    try {
      this.isMobile = window.innerWidth < 768;
    } catch (e) {
      this.isMobile = false;
    }
  }

  initializeSidebar(): void {
    try {
      // Open sidebar by default only on larger screens
      if (window && window.innerWidth >= 768) {
        this.sidebarOpen = true;
        document.body.classList.remove('sidebar-open');
      } else {
        this.sidebarOpen = false;
      }
    } catch (e) {
      // Default to closed in non-browser environments
      this.sidebarOpen = false;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    try {
      const width = event.target.innerWidth;
      const wasMobile = this.isMobile;
      this.isMobile = width < 768;
      
      // Handle mobile/desktop transitions
      if (wasMobile !== this.isMobile) {
        if (this.isMobile) {
          // Switched to mobile
          this.closeSidebar();
        } else {
          // Switched to desktop
          this.sidebarOpen = true;
          document.body.classList.remove('sidebar-open');
        }
        this.cdr.detectChanges();
      }
    } catch (e) {
      // ignore in non-browser environments
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
    this.updateBodyClass();
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
    this.updateBodyClass();
  }

  private updateBodyClass(): void {
    try {
      if (this.sidebarOpen && this.isMobile) {
        document.body.classList.add('sidebar-open');
      } else {
        document.body.classList.remove('sidebar-open');
      }
    } catch (e) {
      // ignore in non-browser environments
    }
  }

  // Close sidebar when navigation happens on small screens
  closeOnMobile(): void {
    if (this.isMobile) {
      this.closeSidebar();
    }
  }

  // Navigation methods with better UX
  public openLoginModal(): void {
    this.modalService.open(Login, 'Welcome Back to Govently', {
      subtitle: 'Continue your mental wellness journey'
    });
  }

  public openSignupModal(): void {
    this.modalService.open(Signup, 'Start Your Mental Wellness Journey', {
      subtitle: 'Join thousands who are already improving their mental health',
      showBenefits: true
    });
  }

  public logOut(): void {
    const modalRef = this.modalService.open(ConfirmationModal, 'Sign Out', {});
    modalRef.componentInstance.message = 'Are you sure you want to sign out? Your progress will be saved.';

    modalRef.result.then(
      (result) => {
        if (result === 'confirm') {
          this.auth.signOut().subscribe({
            next: () => {
              this.router.navigate(['/']);
              // Reset engagement data
              this.unreadAiMessages = 0;
              this.journalProgress = 0;
            },
            error: (error) => {
              console.error('Error signing out:', error);
            },
          });
        }
      },
      () => {}
    );
  }

  openTherapistSignup(): void {
    this.modalService.open(TherapistSignupComponent, 'Join Our Therapist Network', {
      subtitle: 'Help more people while growing your practice'
    });
  }

  startJournaling(): void {
    this.router.navigate(['/journaling']);
    this.closeOnMobile();
  }

  chatWithAI(): void {
    this.router.navigate(['/ai-chat']);
    this.closeOnMobile();
    // Reset unread messages when user engages
    this.unreadAiMessages = 0;
  }

  connectToTherapist(): void {
    this.router.navigate(['/assessment']);
    this.closeOnMobile();
  }
}
