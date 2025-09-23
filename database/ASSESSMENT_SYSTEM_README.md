# Assessment Persistence System

## Overview

This system provides comprehensive mental health assessment persistence with both summary scores and detailed individual question responses for therapist review. It uses a single table approach for simplicity and efficiency.

## Database Structure

### Single Table: `user_assessments`

The `user_assessments` table contains:

1. **Summary Scores**: PHQ-9, GAD-7, PSS-10, WHO-5 scores
2. **Individual Responses**: Enhanced JSONB structure with question text, answers, and clinical context
3. **User Management**: One assessment per user with UPSERT functionality

### Key Features

- **One Assessment Per User**: Unique constraint ensures each user has only one assessment record
- **Retake Support**: When users retake the assessment, their existing record is updated
- **Therapist Review**: Rich JSONB structure includes question text, answers, and clinical significance
- **Clinical Flags**: Built-in suicide risk detection and clinical priority scoring

## JSONB Structure for Individual Responses

```json
{
  "demographic": {
    "age_group": {
      "question": "What is your age?",
      "value": "26-35",
      "label": "26-35",
      "answered_at": "2024-01-15T10:25:00Z"
    }
  },
  "depression": {
    "phq9_1": {
      "question": "Over the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?",
      "value": 2,
      "label": "More than half the days",
      "scale_type": "phq9",
      "max_score": 3,
      "clinical_significance": "Measures anhedonia (loss of interest/pleasure), core symptom of depression",
      "answered_at": "2024-01-15T10:30:00Z"
    },
    "phq9_9": {
      "question": "Thoughts that you would be better off dead, or of hurting yourself?",
      "value": 0,
      "label": "Not at all",
      "scale_type": "phq9",
      "max_score": 3,
      "clinical_significance": "CRITICAL: Assesses suicidal ideation - requires immediate clinical attention if > 0",
      "answered_at": "2024-01-15T10:35:00Z"
    }
  },
  "anxiety": { /* GAD-7 responses */ },
  "stress": { /* PSS-10 responses */ },
  "well-being": { /* WHO-5 responses */ }
}
```

## Setup Instructions

1. **Run the SQL setup script**:
   ```sql
   -- Execute: /database/simplified_assessment_setup.sql
   ```

2. **Verify the setup**:
   - Table `user_assessments` should be created
   - View `therapist_assessment_review` should be available
   - Indexes and RLS policies should be in place

## Frontend Usage

### Saving Assessment Results

The `AssessmentService.saveAssessmentResult()` method automatically:

1. Saves summary scores (PHQ-9, GAD-7, etc.)
2. Converts individual responses to enhanced JSONB format
3. Uses UPSERT to handle assessment retakes
4. Includes clinical context for therapist review

```typescript
// This happens automatically when assessment is completed
this.assessmentService.saveAssessmentResult(assessmentResult).subscribe({
  next: (result) => console.log('Assessment saved:', result),
  error: (error) => console.error('Save failed:', error)
});
```

### Retrieving Assessment Data

```typescript
// Get user's current assessment
this.assessmentService.getCurrentAssessment().subscribe(assessment => {
  if (assessment) {
    console.log('User has existing assessment:', assessment);
  }
});

// Get individual question responses for therapist review
this.assessmentService.getQuestionResponses(userId).subscribe(responses => {
  console.log('Individual responses:', responses);
});

// Get comprehensive assessment review (therapists only)
this.assessmentService.getAssessmentReview(clientUserId).subscribe(review => {
  console.log('Clinical review:', review);
});
```

## Therapist Queries

### Using the Assessment Review View

```sql
-- Get complete assessment for a client
SELECT * FROM therapist_assessment_review 
WHERE client_user_id = 'client-uuid';

-- Find clients with suicide risk
SELECT 
    client_user_id,
    phq9_score,
    suicide_risk_flag,
    (depression_responses -> 'phq9_9' ->> 'label') as suicidal_ideation_response
FROM therapist_assessment_review 
WHERE suicide_risk_flag = 'SUICIDAL_IDEATION_INDICATED';

-- Get specific depression responses
SELECT 
    client_user_id,
    jsonb_pretty(depression_responses) as phq9_details
FROM therapist_assessment_review 
WHERE client_user_id = 'client-uuid';
```

### Direct Table Queries

```sql
-- Query specific responses across all clients
SELECT 
    user_id,
    (individual_responses -> 'depression' -> 'phq9_1' ->> 'question') as question,
    (individual_responses -> 'depression' -> 'phq9_1' ->> 'label') as answer,
    (individual_responses -> 'depression' -> 'phq9_1' ->> 'value')::int as score,
    phq9_score as total_score
FROM user_assessments 
WHERE individual_responses -> 'depression' -> 'phq9_1' IS NOT NULL
ORDER BY (individual_responses -> 'depression' -> 'phq9_1' ->> 'value')::int DESC;
```

## Benefits of This Approach

1. **Simplicity**: Single table instead of complex relationships
2. **Performance**: Efficient queries with GIN indexes on JSONB
3. **Flexibility**: Easy to add new question types or modify structure
4. **Clinical Value**: Rich context for therapist review
5. **Scalability**: JSONB handles varying question structures well

## Clinical Features

### Suicide Risk Detection
- Automatic flagging based on PHQ-9 question 9
- `suicide_risk_flag` in assessment review view
- Clinical significance notes for immediate attention questions

### Clinical Priority Scoring
- `clinical_priority` field for triage:
  - `HIGH_RISK`: PHQ-9 ≥ 20 or GAD-7 ≥ 15
  - `MODERATE_RISK`: PHQ-9 ≥ 15 or GAD-7 ≥ 10  
  - `MILD_RISK`: PHQ-9 ≥ 10 or GAD-7 ≥ 8
  - `LOW_RISK`: Below mild thresholds

### Assessment Tracking
- `assessment_status`: Indicates if assessment was retaken
- Timestamps for created/updated tracking
- Complete audit trail of assessment changes

## Security

### Row Level Security (RLS)
- Users can only access their own assessments
- Therapists can access client assessments through relationship table
- Secure by default with proper authentication checks

### Data Privacy
- Individual responses stored securely in JSONB
- Clinical context preserved for legitimate therapeutic use
- No unnecessary data exposure

## Maintenance

### Regular Tasks
1. Monitor assessment completion rates
2. Review clinical flags for high-risk cases
3. Analyze question response patterns
4. Update clinical significance notes as needed

### Performance Monitoring
- Monitor JSONB query performance
- Check index usage on large datasets
- Optimize queries for therapist dashboards

This system provides a robust, scalable foundation for mental health assessment persistence while maintaining clinical utility and security.