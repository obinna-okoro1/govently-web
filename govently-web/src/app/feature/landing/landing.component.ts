import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalService } from '../../shared/modal/modal.service';
import { Login } from '../login/login';
import { AuthService } from '../../core/auth/auth-service';
import { DailyPromptService } from '../../shared/daily-prompt.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,       // if using standalone components
  imports: [CommonModule, NgbCarouselModule],            // list any components/modules you import here
  templateUrl: './landing.html',
  styleUrls: ['./landing.scss']
})
export class LandingComponent {
  todayPrompt: Observable<string>;
   constructor(
    private router: Router,
    private modalService: ModalService,
    private authService: AuthService,
    private dailyPromptService: DailyPromptService
  ) {
    this.todayPrompt = this.dailyPromptService.getPrompt();
  }

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
