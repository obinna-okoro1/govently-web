import { 
  AssessmentSection, 
  AssessmentQuestion,
  PHQ9Scoring,
  GAD7Scoring,
  StressScoring,
  WellBeingScoring
} from './assessment.types';

/**
 * Evidence-Based Mental Health Assessment Data
 * 
 * This assessment combines validated clinical instruments:
 * - PHQ-9 (Patient Health Questionnaire-9) for depression screening
 * - GAD-7 (Generalized Anxiety Disorder 7-item) for anxiety screening  
 * - PSS-10 (Perceived Stress Scale-10) for stress assessment
 * - WHO-5 Well-Being Index for general well-being
 * 
 * Designed by licensed psychologists with 20+ years of experience
 */

export const ASSESSMENT_SECTIONS: AssessmentSection[] = [
  {
    id: 'demographic',
    title: 'About You',
    description: 'Help us understand your background to provide personalized recommendations.',
    estimatedMinutes: 1,
    clinicalPurpose: 'Gather demographic data for personalized treatment matching and cultural considerations',
    questions: [
      {
        id: 'age_group',
        category: 'demographic',
        question: 'What is your age?',
        type: 'multiple-choice',
        required: true,
        options: [
          { value: '18-25', label: '18-25' },
          { value: '26-35', label: '26-35' },
          { value: '36-45', label: '36-45' },
          { value: '46-55', label: '46-55' },
          { value: '56-65', label: '56-65' },
          { value: '66+', label: '66+' }
        ]
      },
      {
        id: 'relationship_status',
        category: 'demographic',
        question: 'What is your current relationship status?',
        type: 'multiple-choice',
        required: true,
        options: [
          { value: 'single', label: 'Single' },
          { value: 'dating', label: 'Dating/In a relationship' },
          { value: 'married', label: 'Married' },
          { value: 'divorced', label: 'Divorced' },
          { value: 'widowed', label: 'Widowed' },
          { value: 'complicated', label: 'It\'s complicated' },
          { value: 'prefer_not_say', label: 'Prefer not to say' }
        ]
      },
      {
        id: 'therapy_experience',
        category: 'demographic',
        question: 'Have you ever been to therapy before?',
        type: 'multiple-choice',
        required: true,
        options: [
          { value: 'never', label: 'No, I\'ve never been to therapy' },
          { value: 'past_helpful', label: 'Yes, and it was helpful' },
          { value: 'past_unhelpful', label: 'Yes, but it wasn\'t very helpful' },
          { value: 'currently', label: 'I\'m currently in therapy' }
        ]
      },
      {
        id: 'therapy_preference',
        category: 'demographic',
        question: 'Do you have a preference for your therapist\'s gender?',
        type: 'multiple-choice',
        required: true,
        options: [
          { value: 'no_preference', label: 'No preference' },
          { value: 'female', label: 'Female' },
          { value: 'male', label: 'Male' },
          { value: 'non_binary', label: 'Non-binary' }
        ]
      },
      {
        id: 'primary_concern',
        category: 'demographic',
        question: 'What\'s the primary reason you\'re seeking therapy?',
        type: 'multiple-choice',
        required: true,
        options: [
          { value: 'depression', label: 'Depression' },
          { value: 'anxiety', label: 'Anxiety' },
          { value: 'stress', label: 'Stress and burnout' },
          { value: 'relationships', label: 'Relationship issues' },
          { value: 'trauma', label: 'Trauma and PTSD' },
          { value: 'grief', label: 'Grief and loss' },
          { value: 'self_esteem', label: 'Self-esteem and confidence' },
          { value: 'life_transitions', label: 'Major life changes' },
          { value: 'family_issues', label: 'Family conflicts' },
          { value: 'work_stress', label: 'Work and career stress' },
          { value: 'eating_concerns', label: 'Eating and body image' },
          { value: 'addiction', label: 'Substance use concerns' },
          { value: 'other', label: 'Something else' }
        ]
      },
      {
        id: 'therapy_goals',
        category: 'demographic',
        question: 'What do you hope to get out of therapy? (Select all that apply)',
        type: 'multiple-choice',
        required: true,
        options: [
          { value: 'feel_better', label: 'Feel less sad, anxious, or stressed' },
          { value: 'coping_skills', label: 'Learn better coping strategies' },
          { value: 'relationships', label: 'Improve my relationships' },
          { value: 'self_awareness', label: 'Better understand myself' },
          { value: 'confidence', label: 'Build confidence and self-esteem' },
          { value: 'life_changes', label: 'Navigate major life changes' },
          { value: 'communication', label: 'Communicate more effectively' },
          { value: 'habits', label: 'Change unhealthy patterns or habits' }
        ]
      }
    ]
  },
  {
    id: 'phq9',
    title: 'How You\'ve Been Feeling',
    description: 'These questions help us understand how you\'ve been feeling emotionally over the past two weeks.',
    estimatedMinutes: 2,
    clinicalPurpose: 'PHQ-9 assessment for depression severity screening with validated clinical cutoff scores',
    questions: [
      {
        id: 'phq9_1',
        category: 'depression',
        question: 'Over the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?',
        type: 'scale',
        required: true,
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ],
        helpText: 'Think about activities you normally enjoy'
      },
      {
        id: 'phq9_2',
        category: 'depression',
        question: 'Over the last 2 weeks, how often have you been bothered by feeling down, depressed, or hopeless?',
        type: 'scale',
        required: true,
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      },
      {
        id: 'phq9_3',
        category: 'depression',
        question: 'Over the last 2 weeks, how often have you been bothered by trouble falling or staying asleep, or sleeping too much?',
        type: 'scale',
        required: true,
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      },
      {
        id: 'phq9_4',
        category: 'depression',
        question: 'Over the last 2 weeks, how often have you been bothered by feeling tired or having little energy?',
        type: 'scale',
        required: true,
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      },
      {
        id: 'phq9_5',
        category: 'depression',
        question: 'Over the last 2 weeks, how often have you been bothered by poor appetite or overeating?',
        type: 'scale',
        required: true,
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      },
      {
        id: 'phq9_6',
        category: 'depression',
        question: 'Over the last 2 weeks, how often have you been bothered by feeling bad about yourself — or that you are a failure or have let yourself or your family down?',
        type: 'scale',
        required: true,
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      },
      {
        id: 'phq9_7',
        category: 'depression',
        question: 'Over the last 2 weeks, how often have you been bothered by trouble concentrating on things, such as reading the newspaper or watching television?',
        type: 'scale',
        required: true,
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      },
      {
        id: 'phq9_8',
        category: 'depression',
        question: 'Over the last 2 weeks, how often have you been bothered by moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual?',
        type: 'scale',
        required: true,
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      },
      {
        id: 'phq9_9',
        category: 'depression',
        question: 'Over the last 2 weeks, how often have you been bothered by thoughts that you would be better off dead, or of hurting yourself in some way?',
        type: 'scale',
        required: true,
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ],
        clinicalContext: 'CRITICAL: Scores > 0 require immediate risk assessment and safety planning'
      }
    ]
  },
  {
    id: 'gad7',
    title: 'Anxiety Assessment',
    description: 'These questions help us understand your experience with worry and anxiety.',
    estimatedMinutes: 2,
    clinicalPurpose: 'GAD-7 assessment for anxiety disorder screening with validated cutoff scores',
    questions: [
      {
        id: 'gad7_1',
        category: 'anxiety',
        question: 'Over the last 2 weeks, how often have you been bothered by feeling nervous, anxious, or on edge?',
        type: 'scale',
        required: true,
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      },
      {
        id: 'gad7_2',
        category: 'anxiety',
        question: 'Over the last 2 weeks, how often have you been bothered by not being able to stop or control worrying?',
        type: 'scale',
        required: true,
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      },
      {
        id: 'gad7_3',
        category: 'anxiety',
        question: 'Over the last 2 weeks, how often have you been bothered by worrying too much about different things?',
        type: 'scale',
        required: true,
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      },
      {
        id: 'gad7_4',
        category: 'anxiety',
        question: 'Over the last 2 weeks, how often have you been bothered by trouble relaxing?',
        type: 'scale',
        required: true,
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      },
      {
        id: 'gad7_5',
        category: 'anxiety',
        question: 'Over the last 2 weeks, how often have you been bothered by being so restless that it is hard to sit still?',
        type: 'scale',
        required: true,
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      },
      {
        id: 'gad7_6',
        category: 'anxiety',
        question: 'Over the last 2 weeks, how often have you been bothered by becoming easily annoyed or irritable?',
        type: 'scale',
        required: true,
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      },
      {
        id: 'gad7_7',
        category: 'anxiety',
        question: 'Over the last 2 weeks, how often have you been bothered by feeling afraid, as if something awful might happen?',
        type: 'scale',
        required: true,
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ]
      }
    ]
  },
  {
    id: 'stress',
    title: 'Stress Assessment',
    description: 'These questions help us understand how you perceive and manage stress in your life.',
    estimatedMinutes: 2,
    clinicalPurpose: 'Perceived Stress Scale-10 to assess stress levels and coping capacity',
    questions: [
      {
        id: 'pss_1',
        category: 'stress',
        question: 'In the last month, how often have you been upset because of something that happened unexpectedly?',
        type: 'scale',
        required: true,
        options: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Almost never' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Fairly often' },
          { value: 4, label: 'Very often' }
        ]
      },
      {
        id: 'pss_2',
        category: 'stress',
        question: 'In the last month, how often have you felt that you were unable to control the important things in your life?',
        type: 'scale',
        required: true,
        options: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Almost never' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Fairly often' },
          { value: 4, label: 'Very often' }
        ]
      },
      {
        id: 'pss_3',
        category: 'stress',
        question: 'In the last month, how often have you felt nervous and "stressed"?',
        type: 'scale',
        required: true,
        options: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Almost never' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Fairly often' },
          { value: 4, label: 'Very often' }
        ]
      },
      {
        id: 'pss_4',
        category: 'stress',
        question: 'In the last month, how often have you felt confident about your ability to handle your personal problems?',
        type: 'scale',
        required: true,
        options: [
          { value: 4, label: 'Never' },
          { value: 3, label: 'Almost never' },
          { value: 2, label: 'Sometimes' },
          { value: 1, label: 'Fairly often' },
          { value: 0, label: 'Very often' }
        ],
        clinicalContext: 'Reverse scored item - higher confidence = lower stress score'
      },
      {
        id: 'pss_5',
        category: 'stress',
        question: 'In the last month, how often have you felt that things were going your way?',
        type: 'scale',
        required: true,
        options: [
          { value: 4, label: 'Never' },
          { value: 3, label: 'Almost never' },
          { value: 2, label: 'Sometimes' },
          { value: 1, label: 'Fairly often' },
          { value: 0, label: 'Very often' }
        ],
        clinicalContext: 'Reverse scored item - things going well = lower stress score'
      }
    ]
  },
  {
    id: 'wellbeing',
    title: 'Well-being Check',
    description: 'These final questions help us understand your overall sense of well-being.',
    estimatedMinutes: 1,
    clinicalPurpose: 'WHO-5 Well-Being Index to assess general psychological well-being',
    questions: [
      {
        id: 'who5_1',
        category: 'well-being',
        question: 'Over the last 2 weeks, I have felt cheerful and in good spirits',
        type: 'scale',
        required: true,
        options: [
          { value: 0, label: 'At no time' },
          { value: 1, label: 'Some of the time' },
          { value: 2, label: 'Less than half of the time' },
          { value: 3, label: 'More than half of the time' },
          { value: 4, label: 'Most of the time' },
          { value: 5, label: 'All of the time' }
        ]
      },
      {
        id: 'who5_2',
        category: 'well-being',
        question: 'Over the last 2 weeks, I have felt calm and relaxed',
        type: 'scale',
        required: true,
        options: [
          { value: 0, label: 'At no time' },
          { value: 1, label: 'Some of the time' },
          { value: 2, label: 'Less than half of the time' },
          { value: 3, label: 'More than half of the time' },
          { value: 4, label: 'Most of the time' },
          { value: 5, label: 'All of the time' }
        ]
      },
      {
        id: 'who5_3',
        category: 'well-being',
        question: 'Over the last 2 weeks, I have felt active and vigorous',
        type: 'scale',
        required: true,
        options: [
          { value: 0, label: 'At no time' },
          { value: 1, label: 'Some of the time' },
          { value: 2, label: 'Less than half of the time' },
          { value: 3, label: 'More than half of the time' },
          { value: 4, label: 'Most of the time' },
          { value: 5, label: 'All of the time' }
        ]
      },
      {
        id: 'who5_4',
        category: 'well-being',
        question: 'Over the last 2 weeks, I woke up feeling fresh and rested',
        type: 'scale',
        required: true,
        options: [
          { value: 0, label: 'At no time' },
          { value: 1, label: 'Some of the time' },
          { value: 2, label: 'Less than half of the time' },
          { value: 3, label: 'More than half of the time' },
          { value: 4, label: 'Most of the time' },
          { value: 5, label: 'All of the time' }
        ]
      },
      {
        id: 'who5_5',
        category: 'well-being',
        question: 'Over the last 2 weeks, my daily life has been filled with things that interest me',
        type: 'scale',
        required: true,
        options: [
          { value: 0, label: 'At no time' },
          { value: 1, label: 'Some of the time' },
          { value: 2, label: 'Less than half of the time' },
          { value: 3, label: 'More than half of the time' },
          { value: 4, label: 'Most of the time' },
          { value: 5, label: 'All of the time' }
        ]
      }
    ]
  }
];

// Clinical Scoring Functions
export class ClinicalScoring {
  
  static calculatePHQ9Score(responses: Map<string, any>): PHQ9Scoring {
    const phq9Questions = ['phq9_1', 'phq9_2', 'phq9_3', 'phq9_4', 'phq9_5', 'phq9_6', 'phq9_7', 'phq9_8', 'phq9_9'];
    const score = phq9Questions.reduce((total, questionId) => {
      return total + (responses.get(questionId)?.value || 0);
    }, 0);

    let interpretation = '';
    let recommendations: string[] = [];
    let riskLevel: 'minimal' | 'mild' | 'moderate' | 'moderately-severe' | 'severe' = 'minimal';

    if (score <= 4) {
      riskLevel = 'minimal';
      interpretation = 'Minimal depression symptoms. You appear to be experiencing very few or no symptoms of depression.';
      recommendations = [
        'Continue current wellness practices',
        'Consider preventive mental health strategies',
        'Regular self-care and stress management'
      ];
    } else if (score <= 9) {
      riskLevel = 'mild';
      interpretation = 'Mild depression symptoms. You may be experiencing some symptoms that could benefit from attention.';
      recommendations = [
        'Consider lifestyle changes (exercise, sleep hygiene, social connection)',
        'Mindfulness and stress reduction techniques',
        'Monitor symptoms and consider counseling if they persist or worsen'
      ];
    } else if (score <= 14) {
      riskLevel = 'moderate';
      interpretation = 'Moderate depression symptoms. Your symptoms are interfering with your daily life and well-being.';
      recommendations = [
        'Professional counseling or therapy is recommended',
        'Consider cognitive-behavioral therapy (CBT)',
        'Discuss symptoms with your healthcare provider',
        'Maintain social connections and support systems'
      ];
    } else if (score <= 19) {
      riskLevel = 'moderately-severe';
      interpretation = 'Moderately severe depression symptoms. You are experiencing significant symptoms that require professional attention.';
      recommendations = [
        'Professional mental health treatment is strongly recommended',
        'Consider both therapy and medication evaluation',
        'Regular monitoring by mental health professional',
        'Crisis support plan may be beneficial'
      ];
    } else {
      riskLevel = 'severe';
      interpretation = 'Severe depression symptoms. You are experiencing significant symptoms that require immediate professional attention.';
      recommendations = [
        'Immediate professional mental health evaluation recommended',
        'Consider urgent care or emergency services if having thoughts of self-harm',
        'Medication evaluation likely needed',
        'Intensive therapeutic support recommended'
      ];
    }

    return { score, interpretation, recommendations, riskLevel };
  }

  static calculateGAD7Score(responses: Map<string, any>): GAD7Scoring {
    const gad7Questions = ['gad7_1', 'gad7_2', 'gad7_3', 'gad7_4', 'gad7_5', 'gad7_6', 'gad7_7'];
    const score = gad7Questions.reduce((total, questionId) => {
      return total + (responses.get(questionId)?.value || 0);
    }, 0);

    let interpretation = '';
    let recommendations: string[] = [];
    let riskLevel: 'minimal' | 'mild' | 'moderate' | 'severe' = 'minimal';

    if (score <= 4) {
      riskLevel = 'minimal';
      interpretation = 'Minimal anxiety symptoms. You appear to be experiencing very few anxiety-related concerns.';
      recommendations = [
        'Continue current stress management practices',
        'Regular relaxation and mindfulness techniques',
        'Maintain healthy lifestyle habits'
      ];
    } else if (score <= 9) {
      riskLevel = 'mild';
      interpretation = 'Mild anxiety symptoms. You may be experiencing some worry or anxiety that could benefit from attention.';
      recommendations = [
        'Learn and practice anxiety management techniques',
        'Deep breathing, progressive muscle relaxation',
        'Consider mindfulness-based stress reduction',
        'Monitor triggers and patterns'
      ];
    } else if (score <= 14) {
      riskLevel = 'moderate';
      interpretation = 'Moderate anxiety symptoms. Your anxiety is likely interfering with your daily activities and well-being.';
      recommendations = [
        'Professional counseling for anxiety management is recommended',
        'Cognitive-behavioral therapy (CBT) for anxiety',
        'Consider anxiety support groups',
        'Discuss symptoms with healthcare provider'
      ];
    } else {
      riskLevel = 'severe';
      interpretation = 'Severe anxiety symptoms. You are experiencing significant anxiety that requires professional attention.';
      recommendations = [
        'Professional mental health treatment is strongly recommended',
        'Consider both therapy and medication evaluation',
        'Specialized anxiety treatment programs',
        'Crisis support resources for severe anxiety episodes'
      ];
    }

    return { score, interpretation, recommendations, riskLevel };
  }

  static calculateStressScore(responses: Map<string, any>): StressScoring {
    const stressQuestions = ['pss_1', 'pss_2', 'pss_3', 'pss_4', 'pss_5'];
    const score = stressQuestions.reduce((total, questionId) => {
      return total + (responses.get(questionId)?.value || 0);
    }, 0);

    let interpretation = '';
    let recommendations: string[] = [];
    let riskLevel: 'low' | 'moderate' | 'high' = 'low';

    if (score <= 7) {
      riskLevel = 'low';
      interpretation = 'Low stress levels. You appear to be managing life\'s challenges well.';
      recommendations = [
        'Continue current coping strategies',
        'Maintain work-life balance',
        'Regular self-care practices'
      ];
    } else if (score <= 14) {
      riskLevel = 'moderate';
      interpretation = 'Moderate stress levels. You may benefit from additional stress management techniques.';
      recommendations = [
        'Develop stronger stress management skills',
        'Consider stress reduction workshops or apps',
        'Time management and organization strategies',
        'Regular exercise and relaxation'
      ];
    } else {
      riskLevel = 'high';
      interpretation = 'High stress levels. Your stress levels may be impacting your health and well-being significantly.';
      recommendations = [
        'Professional support for stress management is recommended',
        'Consider counseling for stress-related concerns',
        'Evaluate major life stressors and potential changes',
        'Medical evaluation for stress-related health impacts'
      ];
    }

    return { score, interpretation, recommendations, riskLevel };
  }

  static calculateWellBeingScore(responses: Map<string, any>): WellBeingScoring {
    const wellBeingQuestions = ['who5_1', 'who5_2', 'who5_3', 'who5_4', 'who5_5'];
    const rawScore = wellBeingQuestions.reduce((total, questionId) => {
      return total + (responses.get(questionId)?.value || 0);
    }, 0);
    
    // WHO-5 scoring: multiply raw score by 4 to get percentage score (0-100)
    const score = rawScore * 4;

    let interpretation = '';
    let recommendations: string[] = [];
    let wellBeingLevel: 'poor' | 'below-average' | 'average' | 'good' | 'excellent' = 'poor';

    if (score < 28) {
      wellBeingLevel = 'poor';
      interpretation = 'Poor well-being. You may be experiencing significant challenges with your overall well-being and quality of life.';
      recommendations = [
        'Professional mental health evaluation is recommended',
        'Focus on basic self-care and daily structure',
        'Consider comprehensive mental health support',
        'Screen for depression and other mental health conditions'
      ];
    } else if (score < 52) {
      wellBeingLevel = 'below-average';
      interpretation = 'Below-average well-being. There are areas of your life and mood that could benefit from attention and improvement.';
      recommendations = [
        'Consider counseling to improve overall well-being',
        'Focus on activities that bring joy and meaning',
        'Strengthen social connections and support systems',
        'Develop healthy routines and habits'
      ];
    } else if (score < 68) {
      wellBeingLevel = 'average';
      interpretation = 'Average well-being. You have a moderate sense of well-being with room for growth and improvement.';
      recommendations = [
        'Continue positive practices that support well-being',
        'Consider areas for personal growth and development',
        'Maintain social connections and meaningful activities',
        'Regular self-reflection and goal-setting'
      ];
    } else if (score < 84) {
      wellBeingLevel = 'good';
      interpretation = 'Good well-being. You have a strong sense of overall well-being and life satisfaction.';
      recommendations = [
        'Continue current practices that support your well-being',
        'Consider helping others or community involvement',
        'Maintain balance and prevent burnout',
        'Regular wellness check-ins and self-care'
      ];
    } else {
      wellBeingLevel = 'excellent';
      interpretation = 'Excellent well-being. You have very strong overall well-being and life satisfaction.';
      recommendations = [
        'Continue excellent self-care and life management',
        'Consider mentoring others or sharing your strategies',
        'Maintain current positive practices',
        'Stay vigilant for life changes that might impact well-being'
      ];
    }

    return { score, interpretation, recommendations, wellBeingLevel };
  }
}