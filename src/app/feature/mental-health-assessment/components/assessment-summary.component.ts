import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssessmentResult } from '../assessment.types';

@Component({
  selector: 'app-assessment-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assessment-summary.component.html'
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
