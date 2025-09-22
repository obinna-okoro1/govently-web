// Mental Health Assessment Types and Interfaces

export interface AssessmentQuestion {
  id: string;
  category: 'depression' | 'anxiety' | 'stress' | 'well-being' | 'demographic';
  question: string;
  type: 'scale' | 'multiple-choice' | 'text' | 'boolean';
  options?: AssessmentOption[];
  required: boolean;
  validationRules?: ValidationRule[];
  helpText?: string;
  clinicalContext?: string;
}

export interface AssessmentOption {
  value: number | string;
  label: string;
  description?: string;
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern';
  value?: any;
  message: string;
}

export interface AssessmentResponse {
  questionId: string;
  value: number | string | boolean;
  timestamp: Date;
}

export interface AssessmentSection {
  id: string;
  title: string;
  description: string;
  questions: AssessmentQuestion[];
  estimatedMinutes: number;
  clinicalPurpose: string;
}

export interface AssessmentResult {
  userId: string;
  assessmentId: string;
  responses: AssessmentResponse[];
  scores: {
    phq9Score: number;
    gad7Score: number;
    pss10Score: number; // Perceived Stress Scale
    whoWellBeingScore: number;
  };
  riskLevel: 'minimal' | 'mild' | 'moderate' | 'moderately-severe' | 'severe';
  recommendations: string[];
  completedAt: Date;
  clinicalNotes?: string;
}

export interface TherapistRecommendation {
  specialization: string[];
  approachTypes: string[];
  urgency: 'immediate' | 'urgent' | 'routine';
  sessionFrequency: 'weekly' | 'bi-weekly' | 'monthly';
  estimatedDuration: string;
  specificNeeds: string[];
}

// Clinical Scoring Interfaces
export interface PHQ9Scoring {
  score: number;
  interpretation: string;
  recommendations: string[];
  riskLevel: 'minimal' | 'mild' | 'moderate' | 'moderately-severe' | 'severe';
}

export interface GAD7Scoring {
  score: number;
  interpretation: string;
  recommendations: string[];
  riskLevel: 'minimal' | 'mild' | 'moderate' | 'severe';
}

export interface StressScoring {
  score: number;
  interpretation: string;
  recommendations: string[];
  riskLevel: 'low' | 'moderate' | 'high';
}

export interface WellBeingScoring {
  score: number;
  interpretation: string;
  recommendations: string[];
  wellBeingLevel: 'poor' | 'below-average' | 'average' | 'good' | 'excellent';
}

// Assessment Progress Interface
export interface AssessmentProgress {
  currentSection: number;
  totalSections: number;
  currentQuestion: number;
  totalQuestions: number;
  percentComplete: number;
  estimatedTimeRemaining: number;
}

// Assessment State Management
export interface AssessmentState {
  isStarted: boolean;
  isCompleted: boolean;
  currentSection: AssessmentSection | null;
  currentQuestionIndex: number;
  responses: Map<string, AssessmentResponse>;
  progress: AssessmentProgress;
  startedAt: Date | null;
  completedAt: Date | null;
}