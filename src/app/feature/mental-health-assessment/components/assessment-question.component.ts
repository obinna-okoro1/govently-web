import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssessmentQuestion, AssessmentSection, AssessmentProgress } from '../assessment.types';

@Component({
  selector: 'app-assessment-question',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assessment-question.component.html'
})
export class AssessmentQuestionComponent {
  @Input() question!: AssessmentQuestion;
  @Input() currentSection!: AssessmentSection;
  @Input() progress!: AssessmentProgress;
  @Input() currentResponse: any = null;
  @Input() sectionProgress: number = 0;
  @Input() canGoBack: boolean = false;
  @Input() nextButtonText: string = 'Next';
  @Input() isLoading: boolean = false;
  @Input() errorMessage: string = '';

  @Output() responseChanged = new EventEmitter<any>();
  @Output() nextQuestion = new EventEmitter<void>();
  @Output() previousQuestion = new EventEmitter<void>();

  get isQuestionAnswered(): boolean {
    if (!this.question || this.currentResponse === null) {
      return false;
    }
    
    if (this.question.type === 'multiple-choice' || this.question.type === 'scale') {
      return this.currentResponse !== null && this.currentResponse !== undefined;
    }
    
    return false;
  }

  onResponseChange(value: any): void {
    // Convert to number if it's a numeric string for scale questions
    if (this.question?.type === 'scale' && typeof value === 'string' && !isNaN(Number(value))) {
      this.responseChanged.emit(Number(value));
    } else {
      this.responseChanged.emit(value);
    }
  }

  onTextInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    if (target) {
      this.responseChanged.emit(target.value);
    }
  }

  onNext(): void {
    this.nextQuestion.emit();
  }

  onPrevious(): void {
    this.previousQuestion.emit();
  }

  trackByValue(index: number, item: any): any {
    return item.value;
  }
}
