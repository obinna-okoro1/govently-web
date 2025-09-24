import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { ModalService } from '../../shared/modal/modal.service';
import { DailyPromptService } from '../../shared/daily-prompt.service';
import { AuthService } from '../../core/auth/auth-service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { GoventlyLegalComponent } from '../govently-legal.component/govently-legal.component';
import { Signup } from '../signup/signup';
import { Login } from '../login/login';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, NgbCarouselModule, RouterModule],
  templateUrl: './landing.html',
  styleUrls: ['./landing-new.scss']
})
export class LandingComponent implements OnInit {
  public todayPrompt: Observable<string>;
  public showCrisisSupport: boolean = true;
  
  // Demo interaction state
  public demoUserResponse: string = '';
  public demoAiResponse: string = '';
  
  // height in pixels bound to the landing root to ensure it fits viewport
  public landingHeight: number = window.innerHeight;
  
  // Demo responses for AI chat preview
  private demoResponses = {
    'stressed': {
      userText: "I'm feeling really stressed lately",
      aiText: "I hear that you're feeling stressed. That's completely understandable - stress is our body's natural response to challenges. Can you tell me what's been weighing on your mind lately? I'm here to listen and help you work through this."
    },
    'sad': {
      userText: "I've been feeling really sad",
      aiText: "Thank you for sharing that with me. Feeling sad is a valid emotion, and it's important that you're acknowledging it. Would you like to talk about what might be contributing to these feelings? Sometimes just talking can help lighten the load."
    },
    'anxious': {
      userText: "I'm feeling anxious about everything",
      aiText: "Anxiety can feel overwhelming, but you're taking a positive step by reaching out. Let's work together to break down what's causing these feelings. What specific situations or thoughts tend to trigger your anxiety the most?"
    },
    'okay': {
      userText: "I'm feeling okay today",
      aiText: "That's wonderful to hear! It's great that you're checking in with yourself. Even on okay days, it can be helpful to reflect on what's going well. What's one thing that's contributing to you feeling okay today?"
    }
  };

  constructor(
    private router: Router,
    private modalService: ModalService,
    private dailyPromptService: DailyPromptService,
    private authService: AuthService
  ) {
    this.todayPrompt = this.dailyPromptService.getPrompt();
    this.updateLandingHeight();
  }

  ngOnInit() {
    // Show crisis banner for first 30 seconds, then hide
    setTimeout(() => {
      this.showCrisisSupport = false;
    }, 30000);
  }

  @HostListener('window:resize', [])
  public updateLandingHeight() {
    this.landingHeight = window.innerHeight;
  }

  // Primary CTA - Start Free Assessment
  public startFreeAssessment() {
    this.router.navigate(['/assessment']);
  }

  // Secondary CTA - Explore Features
  public exploreFeatures() {
    // Scroll to features section
    const featuresSection = document.querySelector('.features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Demo interaction handlers
  public demoResponse(emotion: 'stressed' | 'sad' | 'anxious' | 'okay') {
    const response = this.demoResponses[emotion];
    this.demoUserResponse = response.userText;
    
    // Simulate AI typing delay
    setTimeout(() => {
      this.demoAiResponse = response.aiText;
    }, 1500);
  }

  public startFullExperience() {
    this.router.navigate(['/ai-chat']);
  }

  // Navigation methods
  public startJournaling() {
    // Check if user is logged in, if not prompt signup
    this.authService.getSession().subscribe(session => {
      if (session?.user) {
        this.router.navigate(['/journaling']);
      } else {
        this.modalService.open(Signup, 'Sign Up to Start Journaling', {
          onSuccess: () => {
            setTimeout(() => {
              this.router.navigate(['/journaling']);
            }, 1000);
          }
        });
      }
    });
  }

  public chatWithAI() {
    // Check if user is logged in, if not prompt signup
    this.authService.getSession().subscribe(session => {
      if (session?.user) {
        this.router.navigate(['/ai-chat']);
      } else {
        this.modalService.open(Signup, 'Sign Up to Chat with AI', {
          onSuccess: () => {
            setTimeout(() => {
              this.router.navigate(['/ai-chat']);
            }, 1000);
          }
        });
      }
    });
  }

  public openLegalModal() {
    this.modalService.open(GoventlyLegalComponent, 'Privacy Policy & Terms of Service', {});
  }

  // Therapist signup from landing
  public becomeTherapist() {
    // This would open therapist signup flow
    this.router.navigate(['/therapist-signup']);
  }

  // Quick login access
  public quickLogin() {
    this.modalService.open(Login, 'Welcome Back', {});
  }
}
