import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssessmentResult } from '../assessment.types';

@Component({
  selector: 'app-assessment-results',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="results-screen flex-grow-1 d-flex align-items-center">
      <div class="container-fluid px-3 px-md-4">
        <div class="row justify-content-center">
          <div class="col-12 col-lg-8 col-xl-6">
            <div class="results-card bg-white p-3 p-md-5 rounded-3 shadow-sm text-center">
              
              <div class="celebration-icon mb-3 mb-md-4">
                <i class="bi bi-check-circle-fill text-success" style="font-size: 3rem;"></i>
              </div>
              
              <h1 class="h3 h2-md mb-3 mb-md-4">Assessment Complete!</h1>
              <p class="lead mb-3 mb-md-4 text-muted">
                Thank you for taking the time to complete your mental health assessment. 
                Your responses have been securely saved and analyzed.
              </p>

              <!-- Error Message if any -->
              <div class="alert alert-info" *ngIf="errorMessage" role="alert">
                <i class="bi bi-info-circle me-2"></i>
                {{ errorMessage }}
              </div>

              <!-- Risk Level Summary -->
              <div class="risk-summary mb-4 p-4 rounded" 
                   [class.bg-success-subtle]="result.riskLevel === 'minimal'"
                   [class.bg-info-subtle]="result.riskLevel === 'mild'"
                   [class.bg-warning-subtle]="result.riskLevel === 'moderate'"
                   [class.bg-danger-subtle]="result.riskLevel === 'severe' || result.riskLevel === 'moderately-severe'">
                <h5 class="mb-2">
                  <span class="text-capitalize">{{ result.riskLevel || 'Unknown' }}</span> Support Level Indicated
                </h5>
                <p class="small mb-0">
                  Based on your responses, we've identified your current support needs and prepared personalized recommendations.
                </p>
              </div>

              <!-- Score Summary -->
              <div class="score-summary mb-4" *ngIf="result?.scores">
                <div class="row g-3 text-start">
                  <div class="col-6">
                    <div class="score-item p-3 bg-light rounded">
                      <small class="text-muted d-block">Depression Screening</small>
                      <strong>{{ result.scores.phq9Score || 0 }}/27</strong>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="score-item p-3 bg-light rounded">
                      <small class="text-muted d-block">Anxiety Screening</small>
                      <strong>{{ result.scores.gad7Score || 0 }}/21</strong>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="score-item p-3 bg-light rounded">
                      <small class="text-muted d-block">Stress Level</small>
                      <strong>{{ result.scores.pss10Score || 0 }}/20</strong>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="score-item p-3 bg-light rounded">
                      <small class="text-muted d-block">Well-being</small>
                      <strong>{{ result.scores.whoWellBeingScore || 0 }}/100</strong>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Recommendations Section -->
              <div class="recommendations-section mb-4" *ngIf="result?.recommendations && result.recommendations.length > 0">
                <h6 class="text-start mb-3">Personalized Recommendations:</h6>
                <div class="recommendations-list text-start">
                  <div class="recommendation-item p-3 bg-light rounded mb-2" *ngFor="let recommendation of result.recommendations; trackBy: trackByIndex">
                    <i class="bi bi-lightbulb text-primary me-2"></i>
                    {{ recommendation }}
                  </div>
                </div>
              </div>

              <!-- Next Steps -->
              <div class="next-steps mb-4">
                <h6 class="text-start mb-3">Your Next Steps:</h6>
                <div class="row g-2">
                  <div class="col-12">
                    <button 
                      class="btn btn-primary btn-lg w-100"
                      (click)="onConnectWithTherapist()">
                      <i class="bi bi-person-heart me-2"></i>
                      Connect with a Licensed Therapist
                    </button>
                  </div>
                  <div class="col-12">
                    <button 
                      class="btn btn-outline-primary w-100"
                      (click)="onViewDetailedResults()">
                      <i class="bi bi-file-text me-2"></i>
                      View Detailed Results & Recommendations
                    </button>
                  </div>
                </div>
              </div>

              <div class="additional-actions">
                <button 
                  class="btn btn-link text-muted"
                  (click)="onRetakeAssessment()">
                  <i class="bi bi-arrow-clockwise me-1"></i>
                  Retake Assessment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AssessmentResultsComponent {
  @Input() result!: AssessmentResult;
  @Input() errorMessage: string = '';

  @Output() connectWithTherapist = new EventEmitter<void>();
  @Output() viewDetailedResults = new EventEmitter<void>();
  @Output() retakeAssessment = new EventEmitter<void>();

  onConnectWithTherapist(): void {
    this.connectWithTherapist.emit();
  }

  onViewDetailedResults(): void {
    this.viewDetailedResults.emit();
  }

  onRetakeAssessment(): void {
    this.retakeAssessment.emit();
  }

  trackByIndex(index: number): number {
    return index;
  }
}
