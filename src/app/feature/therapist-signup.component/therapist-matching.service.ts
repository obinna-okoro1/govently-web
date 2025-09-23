import { Injectable } from '@angular/core';

export interface ClientAssessment {
  age_group: string;
  relationship_status: string;
  therapy_experience: string;
  therapy_preference: string; // therapist gender preference
  primary_concern: string;
  severity_level: 'mild' | 'moderate' | 'severe' | 'crisis';
  preferred_session_type: 'individual' | 'couples' | 'family' | 'group';
  insurance_provider?: string;
  budget_range?: { min: number; max: number };
  preferred_languages: string[];
  preferred_schedule: string[];
  location_preference: 'in_person' | 'online' | 'hybrid';
  crisis_history: boolean;
  trauma_history: boolean;
}

export interface TherapistProfile {
  id: string;
  full_name: string;
  gender: 'male' | 'female' | 'non_binary' | 'not_specified';
  license_type: string;
  years_experience: number;
  specializations: string[];
  therapy_approaches: string[];
  client_demographics: string[];
  severity_levels: string[];
  crisis_intervention_trained: boolean;
  trauma_informed_certified: boolean;
  languages: string[];
  availability_slots: Array<{day: string; start_time: string; end_time: string}>;
  session_durations: number[];
  hourly_rates: {
    individual: number;
    couples: number;
    family: number;
    group: number;
  };
  sliding_scale_available: boolean;
  insurance_accepted: string[];
  location: string;
  services_offered: Array<'in_person' | 'online'>;
  emergency_availability: boolean;
}

export interface MatchScore {
  therapist_id: string;
  total_score: number;
  breakdown: {
    specialization_match: number;
    experience_match: number;
    approach_match: number;
    availability_match: number;
    cost_match: number;
    preference_match: number;
    crisis_readiness: number;
  };
  compatibility_reasons: string[];
  potential_concerns: string[];
}

@Injectable({
  providedIn: 'root'
})
export class TherapistMatchingService {

  /**
   * Main matching algorithm that scores therapists against client assessment
   * Uses weighted scoring system based on clinical importance and client preferences
   */
  public findMatches(
    clientAssessment: ClientAssessment, 
    availableTherapists: TherapistProfile[]
  ): MatchScore[] {
    const matches: MatchScore[] = [];

    for (const therapist of availableTherapists) {
      const match = this.calculateMatchScore(clientAssessment, therapist);
      matches.push(match);
    }

    // Sort by total score (descending) and filter out poor matches
    return matches
      .filter(match => match.total_score >= 0.3) // Minimum 30% compatibility
      .sort((a, b) => b.total_score - a.total_score);
  }

  private calculateMatchScore(assessment: ClientAssessment, therapist: TherapistProfile): MatchScore {
    const breakdown = {
      specialization_match: this.calculateSpecializationMatch(assessment, therapist),
      experience_match: this.calculateExperienceMatch(assessment, therapist),
      approach_match: this.calculateApproachMatch(assessment, therapist),
      availability_match: this.calculateAvailabilityMatch(assessment, therapist),
      cost_match: this.calculateCostMatch(assessment, therapist),
      preference_match: this.calculatePreferenceMatch(assessment, therapist),
      crisis_readiness: this.calculateCrisisReadiness(assessment, therapist)
    };

    // Weighted total score (weights based on clinical importance)
    const weights = {
      specialization_match: 0.25,  // Most important - clinical expertise
      experience_match: 0.15,      // Professional competence
      approach_match: 0.20,        // Treatment methodology fit
      availability_match: 0.15,    // Practical scheduling
      cost_match: 0.10,            // Financial accessibility
      preference_match: 0.10,      // Personal preferences
      crisis_readiness: 0.05       // Safety net capability
    };

    const total_score = Object.entries(breakdown).reduce((sum, [key, score]) => {
      return sum + (score * weights[key as keyof typeof weights]);
    }, 0);

    const compatibility_reasons = this.generateCompatibilityReasons(assessment, therapist, breakdown);
    const potential_concerns = this.generatePotentialConcerns(assessment, therapist, breakdown);

    return {
      therapist_id: therapist.id,
      total_score: Math.round(total_score * 100) / 100, // Round to 2 decimal places
      breakdown,
      compatibility_reasons,
      potential_concerns
    };
  }

  private calculateSpecializationMatch(assessment: ClientAssessment, therapist: TherapistProfile): number {
    const clientConcerns = [assessment.primary_concern];
    
    // Map assessment concerns to therapist specializations
    const concernMappings: { [key: string]: string[] } = {
      'anxiety': ['Anxiety Disorders', 'OCD', 'Panic Disorder'],
      'depression': ['Depression', 'Mood Disorders', 'Bipolar Disorder'],
      'trauma': ['Trauma and PTSD', 'EMDR', 'Complex Trauma'],
      'relationships': ['Relationship Issues', 'Couples Counseling', 'Communication Skills'],
      'family': ['Family Therapy', 'Family Systems', 'Parenting Support'],
      'grief': ['Grief and Loss', 'Bereavement Counseling'],
      'stress': ['Stress Management', 'Burnout Prevention', 'Life Transitions'],
      'self_esteem': ['Self-Esteem Building', 'Identity Issues', 'Personal Growth']
    };

    const relevantSpecializations = concernMappings[assessment.primary_concern] || [assessment.primary_concern];
    const matchingSpecializations = therapist.specializations.filter(spec => 
      relevantSpecializations.some(relevant => 
        spec.toLowerCase().includes(relevant.toLowerCase()) ||
        relevant.toLowerCase().includes(spec.toLowerCase())
      )
    );

    const matchRatio = matchingSpecializations.length / Math.max(relevantSpecializations.length, 1);
    return Math.min(matchRatio, 1.0);
  }

  private calculateExperienceMatch(assessment: ClientAssessment, therapist: TherapistProfile): number {
    const clientComplexity = this.assessClientComplexity(assessment);
    const requiredExperience = this.getRequiredExperience(clientComplexity);
    
    if (therapist.years_experience >= requiredExperience) {
      return 1.0;
    } else {
      return therapist.years_experience / requiredExperience;
    }
  }

  private calculateApproachMatch(assessment: ClientAssessment, therapist: TherapistProfile): number {
    // Score based on evidence-based approaches for specific conditions
    const approachMappings: { [key: string]: string[] } = {
      'anxiety': ['Cognitive Behavioral Therapy (CBT)', 'Acceptance and Commitment Therapy (ACT)', 'Mindfulness-Based Therapy'],
      'depression': ['Cognitive Behavioral Therapy (CBT)', 'Psychodynamic Therapy', 'Interpersonal Therapy'],
      'trauma': ['Eye Movement Desensitization and Reprocessing (EMDR)', 'Trauma-Focused CBT', 'Somatic Therapies'],
      'relationships': ['Emotionally Focused Therapy (EFT)', 'Gottman Method', 'Solution-Focused Brief Therapy (SFBT)'],
      'addiction': ['Motivational Interviewing', 'Dialectical Behavior Therapy (DBT)', 'Cognitive Behavioral Therapy (CBT)']
    };

    const recommendedApproaches = approachMappings[assessment.primary_concern] || [];
    const matchingApproaches = therapist.therapy_approaches.filter(approach => 
      recommendedApproaches.some(recommended => 
        approach.toLowerCase().includes(recommended.toLowerCase())
      )
    );

    return recommendedApproaches.length > 0 
      ? matchingApproaches.length / recommendedApproaches.length 
      : 0.5; // Neutral score if no specific recommendations
  }

  private calculateAvailabilityMatch(assessment: ClientAssessment, therapist: TherapistProfile): number {
    // Simple availability check - in real implementation would compare specific time slots
    const hasAvailability = therapist.availability_slots.length > 0;
    const offersPreferredDuration = therapist.session_durations.includes(60); // Standard 60-min sessions
    
    let score = 0;
    if (hasAvailability) score += 0.6;
    if (offersPreferredDuration) score += 0.4;
    
    return Math.min(score, 1.0);
  }

  private calculateCostMatch(assessment: ClientAssessment, therapist: TherapistProfile): number {
    if (!assessment.budget_range) return 0.5; // Neutral if no budget specified

    const sessionType = assessment.preferred_session_type || 'individual';
    const therapistRate = therapist.hourly_rates[sessionType];
    
    if (!therapistRate) return 0.5;

    const { min, max } = assessment.budget_range;
    
    if (therapistRate >= min && therapistRate <= max) {
      return 1.0; // Perfect fit within budget
    } else if (therapist.sliding_scale_available && therapistRate > max) {
      return 0.7; // Sliding scale may make it affordable
    } else if (therapistRate < min) {
      return 0.8; // Cheaper than expected (potentially positive)
    } else {
      return Math.max(0, 1 - (therapistRate - max) / max); // Diminishing returns as price increases
    }
  }

  private calculatePreferenceMatch(assessment: ClientAssessment, therapist: TherapistProfile): number {
    let score = 0;
    let totalPreferences = 0;

    // Gender preference
    if (assessment.therapy_preference !== 'no_preference') {
      totalPreferences++;
      if (therapist.gender === assessment.therapy_preference || therapist.gender === 'not_specified') {
        score += 0.4;
      }
    }

    // Language preference
    if (assessment.preferred_languages.length > 0) {
      totalPreferences++;
      const languageMatch = assessment.preferred_languages.some(lang => 
        therapist.languages.includes(lang)
      );
      if (languageMatch) score += 0.4;
    }

    // Insurance preference
    if (assessment.insurance_provider) {
      totalPreferences++;
      if (therapist.insurance_accepted.includes(assessment.insurance_provider)) {
        score += 0.2;
      }
    }

    return totalPreferences > 0 ? score / (totalPreferences * 0.2) : 0.5; // Normalize and provide neutral baseline
  }

  private calculateCrisisReadiness(assessment: ClientAssessment, therapist: TherapistProfile): number {
    if (assessment.severity_level !== 'crisis' && !assessment.crisis_history) {
      return 0.5; // Neutral if no crisis concern
    }

    let score = 0;
    if (therapist.crisis_intervention_trained) score += 0.5;
    if (therapist.emergency_availability) score += 0.3;
    if (therapist.years_experience >= 5) score += 0.2; // Experience matters in crisis situations

    return Math.min(score, 1.0);
  }

  private assessClientComplexity(assessment: ClientAssessment): 'low' | 'moderate' | 'high' {
    let complexityScore = 0;

    // Severity factors
    if (assessment.severity_level === 'severe' || assessment.severity_level === 'crisis') complexityScore += 2;
    if (assessment.severity_level === 'moderate') complexityScore += 1;

    // History factors
    if (assessment.trauma_history) complexityScore += 1;
    if (assessment.crisis_history) complexityScore += 1;
    if (assessment.therapy_experience === 'past_unhelpful') complexityScore += 1;

    if (complexityScore >= 4) return 'high';
    if (complexityScore >= 2) return 'moderate';
    return 'low';
  }

  private getRequiredExperience(complexity: 'low' | 'moderate' | 'high'): number {
    switch (complexity) {
      case 'high': return 7;
      case 'moderate': return 3;
      case 'low': return 1;
    }
  }

  private generateCompatibilityReasons(
    assessment: ClientAssessment, 
    therapist: TherapistProfile, 
    breakdown: MatchScore['breakdown']
  ): string[] {
    const reasons: string[] = [];

    if (breakdown.specialization_match > 0.7) {
      reasons.push(`Specializes in ${assessment.primary_concern} treatment`);
    }

    if (breakdown.experience_match === 1.0) {
      reasons.push(`${therapist.years_experience}+ years of experience`);
    }

    if (breakdown.approach_match > 0.6) {
      reasons.push('Uses evidence-based therapeutic approaches for your concerns');
    }

    if (breakdown.cost_match > 0.8) {
      reasons.push('Rates fit within your budget range');
    }

    if (therapist.sliding_scale_available) {
      reasons.push('Offers sliding scale pricing for financial flexibility');
    }

    if (therapist.crisis_intervention_trained && (assessment.crisis_history || assessment.severity_level === 'crisis')) {
      reasons.push('Trained in crisis intervention');
    }

    if (assessment.preferred_languages.some(lang => therapist.languages.includes(lang))) {
      reasons.push(`Fluent in ${assessment.preferred_languages.join(', ')}`);
    }

    return reasons;
  }

  private generatePotentialConcerns(
    assessment: ClientAssessment, 
    therapist: TherapistProfile, 
    breakdown: MatchScore['breakdown']
  ): string[] {
    const concerns: string[] = [];

    if (breakdown.specialization_match < 0.3) {
      concerns.push('Limited specialization match with your primary concerns');
    }

    if (breakdown.experience_match < 0.5) {
      concerns.push('May have limited experience with your specific needs');
    }

    if (breakdown.cost_match < 0.5) {
      concerns.push('Rates may exceed your budget range');
    }

    if (assessment.severity_level === 'crisis' && !therapist.crisis_intervention_trained) {
      concerns.push('Not specifically trained in crisis intervention');
    }

    if (assessment.trauma_history && !therapist.trauma_informed_certified) {
      concerns.push('No specific trauma-informed care certification');
    }

    if (breakdown.availability_match < 0.3) {
      concerns.push('Limited availability may affect scheduling');
    }

    return concerns;
  }
}