import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssessmentResult } from '../assessment.types';

@Component({
  selector: 'app-assessment-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assessment-results.component.html'
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
