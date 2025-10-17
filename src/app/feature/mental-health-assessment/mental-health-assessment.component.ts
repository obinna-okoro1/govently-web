import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../../core/auth/auth-service';
import { ModalService } from '../../shared/modal/modal.service';
import { ConfettiService } from '../../shared/confetti-service';
import { Login } from '../login/login';
import { CrisisSupportService } from '../../shared/crisis-support.service';

import {
  AssessmentSection,
  AssessmentQuestion,
  AssessmentResponse,
  AssessmentState,
  AssessmentProgress,
  AssessmentResult
} from './assessment.types';

import { ASSESSMENT_SECTIONS, ClinicalScoring } from './assessment.data';
import { AssessmentService } from './assessment.service';
import {
  AssessmentWelcomeComponent,
  AssessmentQuestionComponent,
  AssessmentResultsComponent,
  AssessmentSummaryComponent
} from './components';

@Component({
  selector: 'app-mental-health-assessment',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    AssessmentWelcomeComponent,
    AssessmentQuestionComponent,
    AssessmentResultsComponent,
    AssessmentSummaryComponent
  ],
  templateUrl: './mental-health-assessment.component.html',
  styleUrls: ['./mental-health-assessment.component.scss']
})
export class MentalHealthAssessmentComponent implements OnInit, OnDestroy {
  
  // Assessment State
  public assessmentState: AssessmentState = {
    isStarted: false,
    isCompleted: false,
    currentSection: null,
    currentQuestionIndex: 0,
    responses: new Map(),
    progress: {
      currentSection: 0,
      totalSections: ASSESSMENT_SECTIONS.length,
      currentQuestion: 0,
      totalQuestions: 0,
      percentComplete: 0,
      estimatedTimeRemaining: 0
    },
    startedAt: null,
    completedAt: null
  };

  // Current UI State
  public currentResponse: any = null;
  public isLoading: boolean = false;
  public errorMessage: string = '';
  public showSupportMessage: boolean = false;
  
  // Assessment Results
  public assessmentResult: AssessmentResult | null = null;
  
  // Previous Assessment
  public previousAssessment: AssessmentResult | null = null;
  public showPreviousAssessment: boolean = false;
  
  private subscriptions: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private assessmentService: AssessmentService,
    private modalService: ModalService,
    private confettiService: ConfettiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public crisisSupportService: CrisisSupportService
  ) {
    this.calculateTotalQuestions();
  }

  public ngOnInit(): void {
    this.calculateTotalQuestions();
    this.checkExistingAssessment();
  }
  
  /**
   * Check if user has taken assessment before
   */
  private checkExistingAssessment(): void {
    this.assessmentService.getCurrentAssessment().subscribe({
      next: (existingAssessment) => {
        if (existingAssessment) {
          console.log('User has existing assessment:', existingAssessment);
          this.previousAssessment = existingAssessment;
          this.showPreviousAssessment = true;
        }
      },
      error: (error) => {
        console.error('Error checking existing assessment:', error);
      }
    });
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Calculate total questions across all sections
   */
  private calculateTotalQuestions(): void {
    this.assessmentState.progress.totalQuestions = ASSESSMENT_SECTIONS.reduce(
      (total, section) => total + section.questions.length, 
      0
    );
  }

  /**
   * Start the mental health assessment
   */
  public startAssessment(): void {
    // Check if user is authenticated before starting
    if (!this.authService.isAuthenticated()) {
      this.modalService.open(Login, 'Login to Continue', {
        message: 'Please log in to start your mental health assessment'
      });
      return;
    }

    // Hide previous assessment view if showing
    this.showPreviousAssessment = false;

    this.assessmentState.isStarted = true;
    this.assessmentState.startedAt = new Date();
    this.assessmentState.currentSection = ASSESSMENT_SECTIONS[0];
    this.assessmentState.currentQuestionIndex = 0;
    this.loadCurrentResponse(); // Load existing response if any
    this.updateProgress();
    
    // Track assessment start
    this.assessmentService.trackAssessmentStart();
  }

  /**
   * Load current response from saved responses
   */
  private loadCurrentResponse(): void {
    if (this.currentQuestion) {
      const existingResponse = this.assessmentState.responses.get(this.currentQuestion.id);
      this.currentResponse = existingResponse?.value || null;
      console.log('Loaded response for question', this.currentQuestion.id, ':', this.currentResponse);
    }
  }

  /**
   * Get current question
   */
  public get currentQuestion(): AssessmentQuestion | null {
    if (!this.assessmentState.currentSection) return null;
    return this.assessmentState.currentSection.questions[this.assessmentState.currentQuestionIndex] || null;
  }

  /**
   * Handle response to current question
   */
  public onResponseChanged(value: any): void {
    // Convert to number if it's a numeric string for scale questions
    if (this.currentQuestion?.type === 'scale' && typeof value === 'string' && !isNaN(Number(value))) {
      this.currentResponse = Number(value);
    } else {
      this.currentResponse = value;
    }
    this.errorMessage = '';
    
    console.log('Response changed for question', this.currentQuestion?.id, ':', this.currentResponse);
    console.log('Current option values:', this.currentQuestion?.options?.map(o => o.value));
  }

  /**
   * Handle textarea input event
   */
  public onTextAreaInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    if (target) {
      this.onResponseChanged(target.value);
    }
  }

  /**
   * Check if the current question has been answered
   */
  public isCurrentQuestionAnswered(): boolean {
    if (!this.currentQuestion || this.currentResponse === null) {
      return false;
    }
    
    // For multiple-choice questions, check if a value is selected
    if (this.currentQuestion.type === 'multiple-choice') {
      return this.currentResponse !== null && this.currentResponse !== undefined;
    }
    
    // For scale questions, check if a value is selected
    if (this.currentQuestion.type === 'scale') {
      return this.currentResponse !== null && this.currentResponse !== undefined;
    }
    
    return false;
  }

  /**
   * Navigate to next question or section
   */
  public nextQuestion(): void {
    if (!this.currentQuestion || this.currentResponse === null || this.currentResponse === undefined) {
      this.errorMessage = 'Please select an answer to continue.';
      return;
    }

    // Save current response
    const response: AssessmentResponse = {
      questionId: this.currentQuestion.id,
      value: this.currentResponse,
      timestamp: new Date()
    };
    
    this.assessmentState.responses.set(this.currentQuestion.id, response);

    // Check for suicide ideation (PHQ-9 question 9)
    if (this.currentQuestion.id === 'phq9_9' && this.currentResponse > 0) {
      this.showSuicideRiskSupport();
      return;
    }

    // Move to next question
    this.assessmentState.currentQuestionIndex++;

    // Check if we've completed the current section
    if (this.assessmentState.currentQuestionIndex >= (this.assessmentState.currentSection?.questions.length || 0)) {
      this.nextSection();
    } else {
      this.updateProgress();
      this.loadCurrentResponse(); // Load existing response when navigating
    }
  }

  /**
   * Navigate to previous question
   */
  public previousQuestion(): void {
    if (this.assessmentState.currentQuestionIndex > 0) {
      this.assessmentState.currentQuestionIndex--;
      
      // Load previous response if it exists
      this.loadCurrentResponse();
      
      this.updateProgress();
    } else {
      this.previousSection();
    }
  }

  /**
   * Navigate to next section
   */
  private nextSection(): void {
    const currentSectionIndex = ASSESSMENT_SECTIONS.findIndex(
      section => section.id === this.assessmentState.currentSection?.id
    );
    
    if (currentSectionIndex < ASSESSMENT_SECTIONS.length - 1) {
      this.assessmentState.progress.currentSection = currentSectionIndex + 1;
      this.assessmentState.currentSection = ASSESSMENT_SECTIONS[currentSectionIndex + 1];
      this.assessmentState.currentQuestionIndex = 0;
      this.loadCurrentResponse(); // Load existing response for first question of new section
      this.updateProgress();
    } else {
      this.completeAssessment();
    }
  }

  /**
   * Navigate to previous section
   */
  private previousSection(): void {
    const currentSectionIndex = ASSESSMENT_SECTIONS.findIndex(
      section => section.id === this.assessmentState.currentSection?.id
    );
    
    if (currentSectionIndex > 0) {
      this.assessmentState.progress.currentSection = currentSectionIndex - 1;
      this.assessmentState.currentSection = ASSESSMENT_SECTIONS[currentSectionIndex - 1];
      this.assessmentState.currentQuestionIndex = this.assessmentState.currentSection.questions.length - 1;
      
      // Load the last response from previous section
      const lastQuestion = this.currentQuestion;
      if (lastQuestion) {
        const lastResponse = this.assessmentState.responses.get(lastQuestion.id);
        this.currentResponse = lastResponse?.value || null;
      }
      
      this.updateProgress();
    }
  }

  /**
   * Update progress tracking
   */
  private updateProgress(): void {
    const currentSectionIndex = ASSESSMENT_SECTIONS.findIndex(
      section => section.id === this.assessmentState.currentSection?.id
    );
    
    // Calculate questions completed so far
    let questionsCompleted = 0;
    for (let i = 0; i < currentSectionIndex; i++) {
      questionsCompleted += ASSESSMENT_SECTIONS[i].questions.length;
    }
    questionsCompleted += this.assessmentState.currentQuestionIndex;
    
    this.assessmentState.progress = {
      currentSection: currentSectionIndex,
      totalSections: ASSESSMENT_SECTIONS.length,
      currentQuestion: questionsCompleted + 1,
      totalQuestions: this.assessmentState.progress.totalQuestions,
      percentComplete: Math.round((questionsCompleted / this.assessmentState.progress.totalQuestions) * 100),
      estimatedTimeRemaining: this.calculateEstimatedTimeRemaining(questionsCompleted)
    };
  }

  /**
   * Calculate estimated time remaining
   */
  private calculateEstimatedTimeRemaining(questionsCompleted: number): number {
    const questionsRemaining = this.assessmentState.progress.totalQuestions - questionsCompleted;
    const averageTimePerQuestion = 0.5; // 30 seconds per question
    return Math.round(questionsRemaining * averageTimePerQuestion);
  }

  /**
   * Complete the assessment and calculate results
   */
  private async completeAssessment(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = ''; // Clear any previous errors
    this.assessmentState.completedAt = new Date();
    
    try {
      // Calculate clinical scores
      const phq9Score = ClinicalScoring.calculatePHQ9Score(this.assessmentState.responses);
      const gad7Score = ClinicalScoring.calculateGAD7Score(this.assessmentState.responses);
      const stressScore = ClinicalScoring.calculateStressScore(this.assessmentState.responses);
      const wellBeingScore = ClinicalScoring.calculateWellBeingScore(this.assessmentState.responses);

      // Log calculated scores for debugging
      console.log('Calculated scores:', {
        phq9Score: phq9Score,
        gad7Score: gad7Score,
        stressScore: stressScore,
        wellBeingScore: wellBeingScore
      });

      // Create assessment result
      this.assessmentResult = {
        userId: '', // Will be set by service
        assessmentId: crypto.randomUUID(),
        responses: Array.from(this.assessmentState.responses.values()),
        scores: {
          phq9Score: phq9Score.score,
          gad7Score: gad7Score.score,
          pss10Score: stressScore.score,
          whoWellBeingScore: wellBeingScore.score
        },
        riskLevel: this.determineOverallRiskLevel(phq9Score.riskLevel, gad7Score.riskLevel),
        recommendations: this.generateRecommendations(phq9Score, gad7Score, stressScore, wellBeingScore),
        completedAt: this.assessmentState.completedAt
      };

      console.log('Assessment result created:', this.assessmentResult);

      // Save assessment results using UPSERT (will update existing or insert new)
      try {
        const savedResult = await firstValueFrom(this.assessmentService.saveAssessmentResult(this.assessmentResult));
        
        if (savedResult) {
          this.assessmentResult = savedResult;
          console.log('Assessment saved successfully:', savedResult);
        }
      } catch (saveError: any) {
        console.warn('Assessment save failed, but continuing with local results:', saveError);
        this.errorMessage = 'Your assessment was completed but could not be saved. Your results are still available below.';
      }

      // Mark as completed regardless of save status
      this.assessmentState.isCompleted = true;
      this.confettiService.launchConfetti();
      
      // Track completion
      console.log('Assessment completed:', {
        assessmentId: this.assessmentResult.assessmentId,
        userId: this.assessmentResult.userId,
        riskLevel: this.assessmentResult.riskLevel,
        scores: this.assessmentResult.scores
      });
      
    } catch (error: any) {
      this.errorMessage = error?.message || 'There was an error completing your assessment. Please try again.';
      console.error('Assessment completion error:', error);
      
      // Don't mark as completed if there was a critical error
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges(); // Force change detection
    }
  }

  /**
   * Determine overall risk level from individual assessments
   */
  private determineOverallRiskLevel(depressionLevel: string, anxietyLevel: string): 'minimal' | 'mild' | 'moderate' | 'moderately-severe' | 'severe' {
    const riskLevels = ['minimal', 'mild', 'moderate', 'moderately-severe', 'severe'];
    const depressionIndex = riskLevels.indexOf(depressionLevel);
    const anxietyIndex = riskLevels.indexOf(anxietyLevel as any);
    
    // Use the higher of the two risk levels, defaulting to 0 if not found
    const maxIndex = Math.max(
      depressionIndex >= 0 ? depressionIndex : 0, 
      anxietyIndex >= 0 ? anxietyIndex : 0
    );
    
    return riskLevels[maxIndex] as any;
  }

  /**
   * Generate comprehensive recommendations
   */
  private generateRecommendations(phq9: any, gad7: any, stress: any, wellBeing: any): string[] {
    const recommendations: string[] = [];
    
    // Debug logging
    console.log('Generating recommendations from:', {
      phq9: phq9,
      gad7: gad7,
      stress: stress,
      wellBeing: wellBeing
    });
    
    // Safely combine recommendations from all assessments
    if (phq9?.recommendations) recommendations.push(...phq9.recommendations);
    if (gad7?.recommendations) recommendations.push(...gad7.recommendations);
    if (stress?.recommendations) recommendations.push(...stress.recommendations);
    if (wellBeing?.recommendations) recommendations.push(...wellBeing.recommendations);
    
    // Remove duplicates and add general recommendations
    const uniqueRecommendations = Array.from(new Set(recommendations));
    
    // Add personalized recommendations based on primary concern
    const primaryConcern = this.assessmentState.responses.get('primary_concern')?.value;
    if (primaryConcern) {
      uniqueRecommendations.push(`Connect with a therapist who specializes in ${primaryConcern}`);
    }
    
    // Ensure there's always at least one recommendation
    if (uniqueRecommendations.length === 0) {
      uniqueRecommendations.push(
        'Consider speaking with a mental health professional for personalized guidance',
        'Practice self-care and stress management techniques',
        'Maintain social connections and support systems'
      );
    }
    
    console.log('Generated recommendations:', uniqueRecommendations);
    return uniqueRecommendations;
  }

  /**
   * Show suicide risk support information
   */
  private showSuicideRiskSupport(): void {
    this.showSupportMessage = true;
    this.errorMessage = '';
    
    // Track this important clinical event
    this.assessmentService.trackSuicideRiskIndicated();
  }

  /**
   * Continue after reviewing suicide risk support
   */
  public continueAfterSupport(): void {
    this.showSupportMessage = false;
    this.nextQuestion();
  }

  /**
   * Get crisis resources immediately
   */
  public getCrisisHelp(): void {
    this.crisisSupportService.callSuicideHotline();
  }

  /**
   * Restart the assessment
   */
  public restartAssessment(): void {
    this.assessmentState = {
      isStarted: false,
      isCompleted: false,
      currentSection: null,
      currentQuestionIndex: 0,
      responses: new Map(),
      progress: {
        currentSection: 0,
        totalSections: ASSESSMENT_SECTIONS.length,
        currentQuestion: 0,
        totalQuestions: this.assessmentState.progress.totalQuestions,
        percentComplete: 0,
        estimatedTimeRemaining: 0
      },
      startedAt: null,
      completedAt: null
    };
    this.currentResponse = null;
    this.assessmentResult = null;
    this.errorMessage = '';
    this.showSupportMessage = false;
    this.startAssessment();
  }

  /**
   * Connect with a therapist
   */
  public connectWithTherapist(): void {
    this.router.navigate(['/therapist-matching'], { 
      queryParams: { 
        assessment: this.assessmentResult?.assessmentId,
        riskLevel: this.assessmentResult?.riskLevel 
      }
    });
  }

  /**
   * Book therapist from assessment summary
   */
  public bookTherapistFromSummary(): void {
    this.router.navigate(['/therapist-matching'], { 
      queryParams: { 
        assessment: this.previousAssessment?.assessmentId,
        riskLevel: this.previousAssessment?.riskLevel 
      }
    });
  }

  /**
   * View detailed results
   */
  public viewDetailedResults(): void {
    this.router.navigate(['/assessment-results'], { 
      queryParams: { 
        assessment: this.assessmentResult?.assessmentId 
      }
    });
  }

  /**
   * Get current section completion percentage
   */
  public get currentSectionProgress(): number {
    if (!this.assessmentState.currentSection) return 0;
    return Math.round(
      (this.assessmentState.currentQuestionIndex / this.assessmentState.currentSection.questions.length) * 100
    );
  }

  /**
   * Check if user can go back
   */
  public get canGoBack(): boolean {
    return this.assessmentState.currentQuestionIndex > 0 || this.assessmentState.progress.currentSection > 0;
  }

  /**
   * Get appropriate button text for next action
   */
  public get nextButtonText(): string {
    if (!this.assessmentState.currentSection) return 'Next';
    
    const isLastQuestion = this.assessmentState.currentQuestionIndex === this.assessmentState.currentSection.questions.length - 1;
    const isLastSection = this.assessmentState.progress.currentSection === ASSESSMENT_SECTIONS.length - 1;
    
    if (isLastQuestion && isLastSection) {
      return 'Complete Assessment';
    } else if (isLastQuestion) {
      return 'Next Section';
    } else {
      return 'Next';
    }
  }

  /**
   * Track by function for ngFor performance optimization
   */
  public trackByValue(index: number, item: any): any {
    return item.value;
  }

  /**
   * Track by index for ngFor performance optimization
   */
  public trackByIndex(index: number, item: any): number {
    return index;
  }
}