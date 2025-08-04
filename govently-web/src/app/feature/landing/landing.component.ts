import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalService } from '../../shared/modal/modal.service';
import { Login } from '../login/login';
import { AuthService } from '../../core/auth/auth-service';

@Component({
  selector: 'app-landing',
  standalone: true,       // if using standalone components
  imports: [NgbCarouselModule],            // list any components/modules you import here
  templateUrl: './landing.html',
  styleUrls: ['./landing.scss']
})
export class LandingComponent {
   constructor(
    private router: Router,
    private modalService: ModalService,
    private authService: AuthService
   ) {}

  startJournaling() {
    // your checks here, e.g. authentication or form validation
    if (this.canNavigate()) {
      this.router.navigate(['/journaling']);
    }
  }

  chatWithAI() {
    if (this.canNavigate()) {
      this.router.navigate(['/ai-chat']);
    }
  }

  private canNavigate(): boolean {
  if (this.authService.isAuthenticated()) {
    return true;
  }

  this.modalService.open(Login, 'Login', {});
  return false;
}
}
