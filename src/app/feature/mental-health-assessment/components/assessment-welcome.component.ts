import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrisisSupportService } from '../../../shared/crisis-support.service';

@Component({
  selector: 'app-assessment-welcome',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assessment-welcome.component.html'
})
export class AssessmentWelcomeComponent {
  @Input() isLoading: boolean = false;
  @Output() startAssessment = new EventEmitter<void>();

  constructor(public crisisSupportService: CrisisSupportService) {}

  onStartAssessment(): void {
    this.startAssessment.emit();
  }
}
