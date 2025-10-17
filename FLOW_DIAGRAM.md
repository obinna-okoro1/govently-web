# Connect to Therapist - User Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY                            │
└─────────────────────────────────────────────────────────────────┘

Step 1: User Action
┌──────────────────────┐
│  User clicks         │
│  "Connect to         │
│  Therapist"          │
│  in Sidebar          │
└──────────┬───────────┘
           │
           ↓
Step 2: Navigation
┌──────────────────────┐
│  Navigate to         │
│  /assessment         │
│  route               │
└──────────┬───────────┘
           │
           ↓
Step 3: Component Init
┌──────────────────────┐
│  MentalHealth-       │
│  Assessment          │
│  Component loads     │
│                      │
│  ngOnInit() →        │
│  checkExisting-      │
│  Assessment()        │
└──────────┬───────────┘
           │
           ↓
Step 4: Loading State
┌──────────────────────┐
│  Show Spinner        │
│  "Checking your      │
│   assessment         │
│   history..."        │
└──────────┬───────────┘
           │
           ↓
Step 5: Database Query
┌──────────────────────┐
│  Query Supabase:     │
│                      │
│  SELECT *            │
│  FROM user_          │
│    assessments       │
│  WHERE user_id =     │
│    current_user.id   │
│  LIMIT 1             │
└──────────┬───────────┘
           │
           ↓
     ┌─────┴─────┐
     │           │
     ↓           ↓
┌─────────┐  ┌─────────┐
│ Found   │  │   No    │
│ Record  │  │ Record  │
└────┬────┘  └────┬────┘
     │            │
     │            ↓
     │      ┌──────────────────────┐
     │      │  Show Welcome        │
     │      │  Screen              │
     │      │                      │
     │      │  "Start Your Mental  │
     │      │   Health Assessment" │
     │      │                      │
     │      │  [Start Assessment]  │
     │      └──────────────────────┘
     │
     ↓
┌──────────────────────────────────────────┐
│  Assessment Summary Component            │
├──────────────────────────────────────────┤
│                                          │
│  📋 Your Assessment Summary              │
│                                          │
│  Completed: [Date]                       │
│                                          │
│  ┌────────────────────────────────┐     │
│  │  [Color] Support Level         │     │
│  │  Minimal/Mild/Moderate/        │     │
│  │  Moderately-Severe/Severe      │     │
│  └────────────────────────────────┘     │
│                                          │
│  Your Scores:                            │
│  ┌─────────┐  ┌─────────┐               │
│  │Depression│ │ Anxiety  │               │
│  │   X/27   │ │   X/21   │               │
│  └─────────┘  └─────────┘               │
│  ┌─────────┐  ┌─────────┐               │
│  │  Stress  │ │Well-being│               │
│  │   X/20   │ │  X/100   │               │
│  └─────────┘  └─────────┘               │
│                                          │
│  Your Recommendations:                   │
│  💡 Recommendation 1                     │
│  💡 Recommendation 2                     │
│  💡 Recommendation 3                     │
│                                          │
│  ┌────────────────────────────────┐     │
│  │ 📅 Book a Therapist Appointment│     │
│  │         (Primary Button)       │     │
│  └────────────────────────────────┘     │
│                                          │
│  ┌────────────────────────────────┐     │
│  │  🔄 Retake Assessment          │     │
│  │      (Secondary Button)        │     │
│  └────────────────────────────────┘     │
│                                          │
│  ℹ️  Regular assessments help track     │
│      your progress. We recommend         │
│      retaking every 2-4 weeks.          │
└──────────────────────────────────────────┘
           │
           ↓
    ┌──────┴──────┐
    │             │
    ↓             ↓
┌─────────┐  ┌─────────────┐
│  Book   │  │   Retake    │
│Therapist│  │ Assessment  │
└────┬────┘  └─────┬───────┘
     │             │
     ↓             ↓
┌──────────┐  ┌──────────────┐
│Navigate  │  │Hide Summary  │
│to        │  │Start New     │
│/therapist│  │Assessment    │
│-matching │  │              │
│          │  │(UPSERT in DB)│
│with:     │  └──────────────┘
│- assess- │
│  ment_id │
│- risk_   │
│  level   │
└──────────┘
```

## Key Points

### Database Design
- **Table**: `user_assessments`
- **Unique Constraint**: `user_id` (one assessment per user)
- **Query Pattern**: `.eq('user_id', session.user.id).single()`

### Component Hierarchy
```
NavComponent
  ↓ (click "Connect to Therapist")
MentalHealthAssessmentComponent
  ├─ (loading) → Spinner Component
  ├─ (if existing) → AssessmentSummaryComponent
  ├─ (if new) → AssessmentWelcomeComponent
  ├─ (in progress) → AssessmentQuestionComponent
  └─ (completed) → AssessmentResultsComponent
```

### Data Flow
```
User Click
  ↓
Navigation (Router)
  ↓
Component Init
  ↓
Service Call (getCurrentAssessment)
  ↓
Supabase Query
  ↓
Observable Response
  ↓
Component State Update
  ↓
Template Rendering (Summary or Welcome)
  ↓
User Action (Book/Retake)
  ↓
Router Navigation or Component Method
```

### State Management
```typescript
// Component State Variables
isCheckingExisting: boolean    // Loading state
showPreviousAssessment: boolean // Show summary
previousAssessment: AssessmentResult | null // Data
assessmentState: AssessmentState // Current assessment state
```

### Route Configuration
```typescript
{
  path: 'assessment',
  component: MentalHealthAssessmentComponent
}
{
  path: 'therapist-matching',
  component: TherapistListingComponent
}
```
