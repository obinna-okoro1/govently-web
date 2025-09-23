import { Injectable } from '@angular/core';
import { Observable, from, of, throwError, forkJoin } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';

import { SupabaseService } from '../../core/auth/supabase-client';
import { AuthService } from '../../core/auth/auth-service';
import { AssessmentResult, AssessmentResponse, TherapistRecommendation } from './assessment.types';
import { ASSESSMENT_SECTIONS } from './assessment.data';

interface AssessmentRecord {
  id?: string;
  user_id: string;
  assessment_id: string;
  phq9_score: number;
  gad7_score: number;
  pss10_score: number;
  who_wellbeing_score: number;
  risk_level: string;
  recommendations: string[];
  individual_responses: any; // Enhanced JSONB structure with question details
  completed_at: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AssessmentService {
  
  constructor(
    private supabase: SupabaseService,
    private authService: AuthService
  ) {}

  /**
   * Save assessment result to Supabase using UPSERT (one assessment per user)
   * Saves both summary scores and individual question responses in single table
   */
  public saveAssessmentResult(result: AssessmentResult): Observable<AssessmentResult> {
    return this.authService.getSession().pipe(
      switchMap(session => {
        if (!session?.user) {
          return throwError(() => new Error('User must be authenticated to save assessment'));
        }

        const record: AssessmentRecord = {
          user_id: session.user.id,
          assessment_id: result.assessmentId,
          phq9_score: result.scores.phq9Score,
          gad7_score: result.scores.gad7Score,
          pss10_score: result.scores.pss10Score,
          who_wellbeing_score: result.scores.whoWellBeingScore,
          risk_level: result.riskLevel,
          recommendations: result.recommendations,
          individual_responses: this.prepareIndividualResponses(result.responses),
          completed_at: result.completedAt.toISOString()
        };

        // Use UPSERT to ensure one assessment per user
        return from(
          this.supabase.client
            .from('user_assessments')
            .upsert(record, { 
              onConflict: 'user_id',
              ignoreDuplicates: false 
            })
            .select()
            .single()
        );
      }),
      map((response: any) => {
        if (response.error) {
          throw new Error(`Failed to save assessment: ${response.error.message}`);
        }
        
        console.log('Assessment saved successfully with individual responses');
        
        // Return the original result with user ID populated
        return {
          ...result,
          userId: response.data.user_id
        };
      }),
      catchError(error => {
        console.error('Error saving assessment result:', error);
        return throwError(() => new Error('Failed to save assessment results. Please try again.'));
      })
    );
  }

  /**
   * Get assessment results for current user (latest assessment only due to unique constraint)
   */
  public getUserAssessments(): Observable<AssessmentResult[]> {
    return this.authService.getSession().pipe(
      switchMap(session => {
        if (!session?.user) {
          return of([]);
        }

        return from(
          this.supabase.client
            .from('user_assessments')
            .select('*')
            .eq('user_id', session.user.id)
            .order('completed_at', { ascending: false })
        );
      }),
      map((response: any) => {
        if (response.error) {
          throw new Error(`Failed to fetch assessments: ${response.error.message}`);
        }

        return response.data.map((record: any) => this.mapRecordToResult(record));
      }),
      catchError(error => {
        console.error('Error fetching user assessments:', error);
        return of([]);
      })
    );
  }

  /**
   * Get the current assessment for the user
   */
  public getCurrentAssessment(): Observable<AssessmentResult | null> {
    return this.authService.getSession().pipe(
      switchMap(session => {
        if (!session?.user) {
          return of(null);
        }

        return from(
          this.supabase.client
            .from('user_assessments')
            .select('*')
            .eq('user_id', session.user.id)
            .single()
        );
      }),
      map((response: any) => {
        if (response.error || !response.data) {
          return null;
        }

        return this.mapRecordToResult(response.data);
      }),
      catchError(error => {
        console.error('Error fetching current assessment:', error);
        return of(null);
      })
    );
  }

  /**
   * Get individual question responses for a user (for therapist review)
   * Now uses the individual_responses JSONB field from single table
   */
  public getQuestionResponses(userId: string): Observable<any> {
    return this.authService.getSession().pipe(
      switchMap(session => {
        if (!session?.user) {
          return of(null);
        }

        return from(
          this.supabase.client
            .from('user_assessments')
            .select('individual_responses, completed_at, assessment_id')
            .eq('user_id', userId)
            .single()
        );
      }),
      map((response: any) => {
        if (response.error || !response.data) {
          return null;
        }

        return {
          assessmentId: response.data.assessment_id,
          completedAt: response.data.completed_at,
          responses: response.data.individual_responses
        };
      }),
      catchError(error => {
        console.error('Error fetching question responses:', error);
        return of(null);
      })
    );
  }

  /**
   * Get comprehensive assessment review for therapists
   * Uses the simplified single-table approach with therapist_assessment_review view
   */
  public getAssessmentReview(clientUserId: string): Observable<any> {
    return from(
      this.supabase.client
        .from('therapist_assessment_review')
        .select('*')
        .eq('client_user_id', clientUserId)
        .single()
    ).pipe(
      map((response: any) => {
        if (response.error) {
          throw new Error(`Failed to fetch assessment review: ${response.error.message}`);
        }

        return response.data;
      }),
      catchError(error => {
        console.error('Error fetching assessment review:', error);
        return of(null);
      })
    );
  }

  /**
   * Get specific assessment by ID
   */
  public getAssessmentById(assessmentId: string): Observable<AssessmentResult | null> {
    return this.authService.getSession().pipe(
      switchMap(session => {
        if (!session?.user) {
          return of(null);
        }

        return from(
          this.supabase.client
            .from('user_assessments')
            .select('*')
            .eq('assessment_id', assessmentId)
            .eq('user_id', session.user.id)
            .single()
        );
      }),
      map((response: any) => {
        if (response.error || !response.data) {
          return null;
        }

        return this.mapRecordToResult(response.data);
      }),
      catchError(error => {
        console.error('Error fetching assessment:', error);
        return of(null);
      })
    );
  }

  /**
   * Generate therapist recommendations based on assessment
   */
  public generateTherapistRecommendations(result: AssessmentResult): Observable<TherapistRecommendation> {
    const recommendation: TherapistRecommendation = {
      specialization: this.getRecommendedSpecializations(result),
      approachTypes: this.getRecommendedApproaches(result),
      urgency: this.determineUrgency(result.riskLevel),
      sessionFrequency: this.recommendSessionFrequency(result.riskLevel),
      estimatedDuration: this.estimateTreatmentDuration(result.riskLevel),
      specificNeeds: this.identifySpecificNeeds(result)
    };

    return of(recommendation);
  }

  /**
   * Track assessment start for analytics
   */
  public trackAssessmentStart(): void {
    // Track assessment started event
    this.trackEvent('assessment_started', {
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Track suicide risk indication for clinical follow-up
   */
  public trackSuicideRiskIndicated(): void {
    // This is a critical clinical event that needs immediate attention
    this.trackEvent('suicide_risk_indicated', {
      timestamp: new Date().toISOString(),
      requires_followup: true
    });

    // In a real-world scenario, this would also trigger:
    // - Alert to clinical team
    // - Automatic crisis resource provision
    // - Priority therapy matching
  }

  /**
   * Get assessment completion statistics (simplified for single assessment per user)
   */
  public getAssessmentStats(): Observable<any> {
    return this.authService.getSession().pipe(
      switchMap(session => {
        if (!session?.user) {
          return of(null);
        }

        return from(
          this.supabase.client
            .from('user_assessments')
            .select('completed_at, created_at, updated_at, risk_level, phq9_score, gad7_score')
            .eq('user_id', session.user.id)
            .single()
        );
      }),
      map((response: any) => {
        if (response.error || !response.data) {
          return {
            totalAssessments: 0,
            lastAssessment: null,
            currentPhq9Score: null,
            currentGad7Score: null,
            currentRiskLevel: null,
            hasRetaken: false
          };
        }

        const assessment = response.data;
        const hasRetaken = new Date(assessment.created_at).getTime() !== new Date(assessment.updated_at).getTime();
        
        return {
          totalAssessments: 1,
          lastAssessment: new Date(assessment.completed_at),
          currentPhq9Score: assessment.phq9_score,
          currentGad7Score: assessment.gad7_score,
          currentRiskLevel: assessment.risk_level,
          hasRetaken: hasRetaken,
          firstTaken: new Date(assessment.created_at),
          lastUpdated: new Date(assessment.updated_at)
        };
      }),
      catchError(() => of({
        totalAssessments: 0,
        lastAssessment: null,
        currentPhq9Score: null,
        currentGad7Score: null,
        currentRiskLevel: null,
        hasRetaken: false
      }))
    );
  }

  // ===== Private Helper Methods =====

  /**
   * Prepare individual responses in enhanced JSONB structure for therapist review
   */
  private prepareIndividualResponses(responses: AssessmentResponse[]): any {
    const individualResponses = {
      demographic: {},
      depression: {},
      anxiety: {},
      stress: {},
      'well-being': {}
    };
    
    // Create a map of all questions from assessment sections for quick lookup
    const questionMap = new Map();
    ASSESSMENT_SECTIONS.forEach(section => {
      section.questions.forEach(question => {
        questionMap.set(question.id, {
          category: question.category,
          text: question.question,
          type: question.type,
          options: question.options,
          clinicalContext: question.clinicalContext
        });
      });
    });

    responses.forEach(response => {
      const questionDetails = questionMap.get(response.questionId);
      
      if (questionDetails) {
        // Find the human-readable label for the response
        let responseLabel: string | undefined;
        if (questionDetails.options && typeof response.value !== 'boolean') {
          const option = questionDetails.options.find((opt: any) => opt.value === response.value);
          responseLabel = option?.label;
        } else if (typeof response.value === 'boolean') {
          responseLabel = response.value ? 'Yes' : 'No';
        } else {
          responseLabel = response.value.toString();
        }

        // Determine scale type and max score
        let scaleType: string | undefined;
        let maxScore: number | undefined;
        let clinicalSignificance: string | undefined;

        if (response.questionId.startsWith('phq9_')) {
          scaleType = 'phq9';
          maxScore = 3;
          clinicalSignificance = 'PHQ-9 Depression Severity Scale - measures depression symptoms';
          if (response.questionId === 'phq9_9') {
            clinicalSignificance = 'CRITICAL: Assesses suicidal ideation - requires immediate clinical attention if > 0';
          }
        } else if (response.questionId.startsWith('gad7_')) {
          scaleType = 'gad7';
          maxScore = 3;
          clinicalSignificance = 'GAD-7 Anxiety Scale - measures anxiety symptoms';
        } else if (response.questionId.startsWith('pss_')) {
          scaleType = 'pss10';
          maxScore = 4;
          clinicalSignificance = 'Perceived Stress Scale - measures stress perception and coping';
        } else if (response.questionId.startsWith('who5_')) {
          scaleType = 'who5';
          maxScore = 5;
          clinicalSignificance = 'WHO-5 Well-Being Index - measures psychological well-being';
        } else if (questionDetails.category === 'demographic') {
          scaleType = 'demographic';
          clinicalSignificance = 'Demographic information for personalized treatment';
        }

        // Add clinical context if available
        if (questionDetails.clinicalContext) {
          clinicalSignificance = questionDetails.clinicalContext;
        }

        // Create the enhanced response object
        const enhancedResponse = {
          question: questionDetails.text,
          value: response.value,
          label: responseLabel,
          scale_type: scaleType,
          max_score: maxScore,
          clinical_significance: clinicalSignificance,
          answered_at: response.timestamp.toISOString()
        };

        // Add to the appropriate category
        const category = questionDetails.category;
        if (category === 'well-being') {
          (individualResponses['well-being'] as any)[response.questionId] = enhancedResponse;
        } else {
          (individualResponses as any)[category][response.questionId] = enhancedResponse;
        }
      }
    });

    return individualResponses;
  }

  /**
   * Map database record to AssessmentResult
   */
  private mapRecordToResult(record: AssessmentRecord): AssessmentResult {
    const responses: AssessmentResponse[] = [];
    
    // Extract responses from individual_responses JSONB structure
    if (record.individual_responses) {
      Object.values(record.individual_responses).forEach((categoryResponses: any) => {
        if (categoryResponses && typeof categoryResponses === 'object') {
          Object.entries(categoryResponses).forEach(([questionId, responseData]: [string, any]) => {
            if (responseData && responseData.value !== undefined && responseData.answered_at) {
              responses.push({
                questionId,
                value: responseData.value,
                timestamp: new Date(responseData.answered_at)
              });
            }
          });
        }
      });
    }

    return {
      userId: record.user_id,
      assessmentId: record.assessment_id,
      responses,
      scores: {
        phq9Score: record.phq9_score,
        gad7Score: record.gad7_score,
        pss10Score: record.pss10_score,
        whoWellBeingScore: record.who_wellbeing_score
      },
      riskLevel: record.risk_level as any,
      recommendations: record.recommendations,
      completedAt: new Date(record.completed_at)
    };
  }

  /**
   * Get recommended therapist specializations
   */
  private getRecommendedSpecializations(result: AssessmentResult): string[] {
    const specializations: string[] = [];

    if (result.scores.phq9Score >= 10) {
      specializations.push('Depression', 'Mood Disorders');
    }

    if (result.scores.gad7Score >= 10) {
      specializations.push('Anxiety Disorders', 'Generalized Anxiety');
    }

    if (result.scores.pss10Score >= 14) {
      specializations.push('Stress Management', 'Burnout Prevention');
    }

    if (result.scores.whoWellBeingScore < 50) {
      specializations.push('Life Transitions', 'Self-Esteem');
    }

    // Add specializations based on demographics
    const primaryConcern = result.responses.find(r => r.questionId === 'primary_concern')?.value;
    if (primaryConcern) {
      switch (primaryConcern) {
        case 'relationships':
          specializations.push('Relationship Counseling', 'Communication Skills');
          break;
        case 'trauma':
          specializations.push('Trauma Therapy', 'PTSD Treatment');
          break;
        case 'life-changes':
          specializations.push('Life Transitions', 'Adjustment Disorders');
          break;
      }
    }

    return Array.from(new Set(specializations));
  }

  /**
   * Get recommended therapy approaches
   */
  private getRecommendedApproaches(result: AssessmentResult): string[] {
    const approaches: string[] = ['Cognitive Behavioral Therapy (CBT)'];

    if (result.scores.phq9Score >= 15 || result.scores.gad7Score >= 15) {
      approaches.push('Dialectical Behavior Therapy (DBT)', 'Acceptance and Commitment Therapy (ACT)');
    }

    if (result.scores.pss10Score >= 14) {
      approaches.push('Mindfulness-Based Stress Reduction', 'Relaxation Training');
    }

    const primaryConcern = result.responses.find(r => r.questionId === 'primary_concern')?.value;
    if (primaryConcern === 'trauma') {
      approaches.push('EMDR', 'Trauma-Focused CBT');
    } else if (primaryConcern === 'relationships') {
      approaches.push('Emotionally Focused Therapy (EFT)', 'Gottman Method');
    }

    return approaches;
  }

  /**
   * Determine urgency level
   */
  private determineUrgency(riskLevel: string): 'immediate' | 'urgent' | 'routine' {
    switch (riskLevel) {
      case 'severe':
      case 'moderately-severe':
        return 'immediate';
      case 'moderate':
        return 'urgent';
      default:
        return 'routine';
    }
  }

  /**
   * Recommend session frequency
   */
  private recommendSessionFrequency(riskLevel: string): 'weekly' | 'bi-weekly' | 'monthly' {
    switch (riskLevel) {
      case 'severe':
      case 'moderately-severe':
        return 'weekly';
      case 'moderate':
        return 'bi-weekly';
      default:
        return 'monthly';
    }
  }

  /**
   * Estimate treatment duration
   */
  private estimateTreatmentDuration(riskLevel: string): string {
    switch (riskLevel) {
      case 'severe':
        return '6-12 months';
      case 'moderately-severe':
        return '4-8 months';
      case 'moderate':
        return '2-6 months';
      default:
        return '1-3 months';
    }
  }

  /**
   * Identify specific therapeutic needs
   */
  private identifySpecificNeeds(result: AssessmentResult): string[] {
    const needs: string[] = [];

    // Check for suicide risk
    const suicideQuestion = result.responses.find(r => r.questionId === 'phq9_9');
    if (suicideQuestion && (suicideQuestion.value as number) > 0) {
      needs.push('Crisis intervention', 'Safety planning', 'Risk assessment');
    }

    // Check sleep issues
    const sleepQuestion = result.responses.find(r => r.questionId === 'phq9_3');
    if (sleepQuestion && (sleepQuestion.value as number) >= 2) {
      needs.push('Sleep hygiene counseling');
    }

    // Check concentration issues
    const concentrationQuestion = result.responses.find(r => r.questionId === 'phq9_7');
    if (concentrationQuestion && (concentrationQuestion.value as number) >= 2) {
      needs.push('Cognitive enhancement techniques');
    }

    // Check anxiety-specific needs
    if (result.scores.gad7Score >= 10) {
      needs.push('Anxiety management techniques', 'Relaxation training');
    }

    return needs;
  }

  /**
   * Calculate average score
   */
  private calculateAverage(scores: number[]): number {
    if (scores.length === 0) return 0;
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  /**
   * Analyze risk level trend
   */
  private analyzeRiskTrend(assessments: any[]): string {
    if (assessments.length < 2) return 'insufficient_data';

    const recent = assessments[0];
    const previous = assessments[1];

    const riskLevels = ['minimal', 'mild', 'moderate', 'moderately-severe', 'severe'];
    const recentIndex = riskLevels.indexOf(recent.risk_level);
    const previousIndex = riskLevels.indexOf(previous.risk_level);

    if (recentIndex < previousIndex) {
      return 'improving';
    } else if (recentIndex > previousIndex) {
      return 'worsening';
    } else {
      return 'stable';
    }
  }

  /**
   * Calculate progress indicators
   */
  private calculateProgressIndicators(assessments: any[]): any {
    if (assessments.length === 0) return null;

    const latest = assessments[0];
    
    return {
      currentDepression: this.getDepressionLevel(latest.phq9_score),
      currentAnxiety: this.getAnxietyLevel(latest.gad7_score),
      improvementNeeded: latest.phq9_score > 9 || latest.gad7_score > 9,
      strengths: this.identifyStrengths(latest)
    };
  }

  /**
   * Get depression severity level
   */
  private getDepressionLevel(score: number): string {
    if (score <= 4) return 'minimal';
    if (score <= 9) return 'mild';
    if (score <= 14) return 'moderate';
    if (score <= 19) return 'moderately-severe';
    return 'severe';
  }

  /**
   * Get anxiety severity level
   */
  private getAnxietyLevel(score: number): string {
    if (score <= 4) return 'minimal';
    if (score <= 9) return 'mild';
    if (score <= 14) return 'moderate';
    return 'severe';
  }

  /**
   * Identify user strengths
   */
  private identifyStrengths(assessment: any): string[] {
    const strengths: string[] = [];

    if (assessment.phq9_score <= 4) {
      strengths.push('Low depression symptoms');
    }

    if (assessment.gad7_score <= 4) {
      strengths.push('Well-managed anxiety');
    }

    if (assessment.who_wellbeing_score >= 60) {
      strengths.push('Good overall well-being');
    }

    return strengths;
  }

  /**
   * Track events for analytics
   */
  private trackEvent(eventName: string, data: any): void {
    // In a real application, this would send to analytics service
    console.log(`Assessment Event: ${eventName}`, data);
  }
}