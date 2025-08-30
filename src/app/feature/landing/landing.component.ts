import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalService } from '../../shared/modal/modal.service';
import { DailyPromptService } from '../../shared/daily-prompt.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { GoventlyLegalComponent } from '../govently-legal.component/govently-legal.component';

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
    private dailyPromptService: DailyPromptService
  ) {
    this.todayPrompt = this.dailyPromptService.getPrompt();
  }

  startJournaling() {
    this.router.navigate(['/journaling']);
  }

  chatWithAI() {
    this.router.navigate(['/ai-chat']);
  }

openLegalModal() {
  this.modalService.open(GoventlyLegalComponent, 'Privacy & Terms', {});
}
}
