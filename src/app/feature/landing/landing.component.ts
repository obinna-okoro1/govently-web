import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { ModalService } from '../../shared/modal/modal.service';
import { DailyPromptService } from '../../shared/daily-prompt.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { GoventlyLegalComponent } from '../govently-legal.component/govently-legal.component';
import { AiChatComponent } from '../ai-chat-component/ai-chat-component';

@Component({
  selector: 'app-landing',
  standalone: true,       // if using standalone components
  imports: [CommonModule, NgbCarouselModule, RouterModule, AiChatComponent],            // list any components/modules you import here
  templateUrl: './landing.html',
  styleUrls: ['./landing.scss']
})
export class LandingComponent {
  todayPrompt: Observable<string>;
  public showChatOverlay: boolean = false;
  // height in pixels bound to the landing root to ensure it fits viewport
  public landingHeight: number = window.innerHeight;
   constructor(
    private router: Router,
    private modalService: ModalService,
    private dailyPromptService: DailyPromptService
  ) {
    this.todayPrompt = this.dailyPromptService.getPrompt();
    // initialize height
    this.updateLandingHeight();
  }

  @HostListener('window:resize', [])
  updateLandingHeight() {
    // subtract nothing here — footer is positioned absolute within the root
    this.landingHeight = window.innerHeight;
  }

  startJournaling() {
    this.router.navigate(['/journaling']);
  }

  chatWithAI() {
    // open full-screen chat overlay on landing
    this.showChatOverlay = true;
  }

  closeChatOverlay() {
    this.showChatOverlay = false;
  }

openLegalModal() {
  this.modalService.open(GoventlyLegalComponent, 'Privacy & Terms', {});
}
}
