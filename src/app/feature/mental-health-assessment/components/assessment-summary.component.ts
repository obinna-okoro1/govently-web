import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssessmentResult } from '../assessment.types';

@Component({
  selector: 'app-assessment-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex-grow-1 d-flex align-items-center">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-12 col-lg-8 col-xl-6">
            <div class="card shadow-sm border-0">
              <div class="card-body p-4 p-lg-5">
                <div class="text-center mb-4">
                  <i class="bi bi-clipboard-check text-primary" style="font-size: 3rem;"></i>
                </div>
                
                <h1 class="h3 mb-3 text-center">Your Assessment Summary</h1>
                <p class="text-muted text-center mb-4">
                  You completed your assessment on {{ previousAssessment.completedAt | date:'mediumDate' }}
                </p>

                <!-- Risk Level Summary -->
                <div class="risk-summary mb-4 p-4 rounded text-center" 
                     [class.bg-success-subtle]="previousAssessment.riskLevel === 'minimal'"
                     [class.bg-info-subtle]="previousAssessment.riskLevel === 'mild'"
                     [class.bg-warning-subtle]="previousAssessment.riskLevel === 'moderate'"
                     [class.bg-danger-subtle]="previousAssessment.riskLevel === 'severe' || previousAssessment.riskLevel === 'moderately-severe'">
                  <h5 class="mb-2">
                    <span class="text-capitalize">{{ previousAssessment.riskLevel || 'Unknown' }}</span> Support Level
                  </h5>
                </div>

                <!-- Score Summary -->
                <div class="score-summary mb-4">
                  <h6 class="mb-3">Your Scores:</h6>
                  <div class="row g-3">
                    <div class="col-6">
                      <div class="score-item p-3 bg-light rounded text-center">
                        <small class="text-muted d-block">Depression</small>
                        <strong class="h4">{{ previousAssessment.scores.phq9Score || 0 }}/27</strong>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="score-item p-3 bg-light rounded text-center">
                        <small class="text-muted d-block">Anxiety</small>
                        <strong class="h4">{{ previousAssessment.scores.gad7Score || 0 }}/21</strong>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="score-item p-3 bg-light rounded text-center">
                        <small class="text-muted d-block">Stress</small>
                        <strong class="h4">{{ previousAssessment.scores.pss10Score || 0 }}/20</strong>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="score-item p-3 bg-light rounded text-center">
                        <small class="text-muted d-block">Well-being</small>
                        <strong class="h4">{{ previousAssessment.scores.whoWellBeingScore || 0 }}/100</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Recommendations -->
                <div class="recommendations-section mb-4" *ngIf="previousAssessment?.recommendations && previousAssessment.recommendations.length > 0">
                  <h6 class="mb-3">Your Recommendations:</h6>
                  <div class="recommendations-list">
                    <div class="recommendation-item p-2 bg-light rounded mb-2" 
                         *ngFor="let recommendation of previousAssessment.recommendations.slice(0, 3); trackBy: trackByIndex">
                      <small>
                        <i class="bi bi-lightbulb text-primary me-2"></i>
                        {{ recommendation }}
                      </small>
                    </div>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="action-buttons">
                  <div class="row g-2">
                    <div class="col-12">
                      <button 
                        class="btn btn-primary btn-lg w-100"
                        (click)="onBookTherapist()">
                        <i class="bi bi-calendar-check me-2"></i>
                        Book a Therapist Appointment
                      </button>
                    </div>
                    <div class="col-12">
                      <button 
                        class="btn btn-outline-primary w-100"
                        (click)="onRetakeAssessment()">
                        <i class="bi bi-arrow-clockwise me-2"></i>
                        Retake Assessment
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Help Text -->
                <div class="alert alert-info mt-4 mb-0">
                  <small>
                    <i class="bi bi-info-circle me-2"></i>
                    Regular assessments help track your progress. We recommend retaking this assessment every 2-4 weeks.
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AssessmentSummaryComponent {
  @Input() previousAssessment!: AssessmentResult;

  @Output() retakeAssessment = new EventEmitter<void>();
  @Output() bookTherapist = new EventEmitter<void>();

  onRetakeAssessment(): void {
    this.retakeAssessment.emit();
  }

  onBookTherapist(): void {
    this.bookTherapist.emit();
  }

  trackByIndex(index: number): number {
    return index;
  }
}
