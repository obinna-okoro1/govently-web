import {
  Component,
  OnInit,
  HostListener,
} from '@angular/core';

import {
  Observable
} from 'rxjs';

import { AuthService, UserProfile } from '../auth/auth-service';
import { Login } from '../../feature/login/login';
import { ModalService } from '../../shared/modal/modal.service';
import { Signup } from '../../feature/signup/signup';
import { ConfirmationModal } from '../../shared/confirmation-modal/confirmation-modal';
import { CommonModule } from '@angular/common';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { Router, RouterModule } from '@angular/router';
import { TherapistSignupComponent } from '../../feature/therapist-signup.component/therapist-signup.component';
;

@Component({
  selector: 'app-nav',
  imports: [CommonModule, RouterModule, NgbDropdownModule],
  templateUrl: './nav.html',
  styleUrls: ['./nav.scss']
})
export class NavComponent implements OnInit {
  public currentUser$!: Observable<UserProfile | null>;
  public sidebarOpen: boolean = false; // Start closed on mobile

  constructor(
    private router: Router,
    private auth: AuthService, 
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.currentUser$ = this.auth.getUserProfile();
    this.initializeSidebar();
  }

  initializeSidebar(): void {
    try {
      // Open sidebar by default only on larger screens
      if (window && window.innerWidth >= 768) {
        this.sidebarOpen = true;
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
      
      // Auto-close sidebar on mobile, auto-open on desktop
      if (width < 768 && this.sidebarOpen) {
        this.sidebarOpen = false;
        document.body.classList.remove('sidebar-open');
      } else if (width >= 768 && !this.sidebarOpen) {
        this.sidebarOpen = true;
        document.body.classList.remove('sidebar-open');
      }
    } catch (e) {
      // ignore in non-browser environments
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
    try {
      if (this.sidebarOpen) document.body.classList.add('sidebar-open');
      else document.body.classList.remove('sidebar-open');
    } catch (e) {
      // ignore in non-browser environments
    }
  }

  // Close sidebar when navigation happens on small screens
  closeOnMobile(): void {
    try {
      if (window && window.innerWidth < 768) {
        this.sidebarOpen = false;
        document.body.classList.remove('sidebar-open');
      }
    } catch (e) {
      // ignore in non-browser environments
    }
  }

  public openLoginModal() {
    this.modalService.open(Login, 'Login', {});
  }

  public logOut() {
    const modalRef = this.modalService.open(ConfirmationModal, 'Log Out', {});
    modalRef.componentInstance.message = 'Are you sure you want to log out?';

    modalRef.result.then(
      (result) => {
        if (result === 'confirm') {
          this.auth.signOut().subscribe({
            next: () => {
              this.router.navigate(['/']);
            },
            error: (error) => {
              console.error('Error deleting listing:', error);
            },
          });
        }
      },
      () => {}
    );
  }

  openTherapistSignup() {
    this.modalService.open(TherapistSignupComponent, 'Express your interest', {});
  }

  public openSignupModal() {
    this.modalService.open(Signup, 'Sign Up', {});
  }

  startJournaling() {
   this.router.navigate(['/journaling']);
   this.closeOnMobile();
  }

  chatWithAI() {
    this.router.navigate(['/ai-chat']);
    this.closeOnMobile();
  }
}
