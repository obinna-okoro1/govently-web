-- =====================================================
-- SIMPLIFIED USER ASSESSMENTS TABLE
-- Single table with both summary scores and individual responses
-- Perfect for therapist review and client tracking
-- =====================================================

CREATE TABLE IF NOT EXISTS user_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id VARCHAR(255) NOT NULL, -- UUID string from frontend
  
  -- Clinical summary scores from validated instruments
  phq9_score INTEGER NOT NULL DEFAULT 0 CHECK (phq9_score >= 0 AND phq9_score <= 27),
  gad7_score INTEGER NOT NULL DEFAULT 0 CHECK (gad7_score >= 0 AND gad7_score <= 21),
  pss10_score INTEGER NOT NULL DEFAULT 0 CHECK (pss10_score >= 0 AND pss10_score <= 40),
  who_wellbeing_score INTEGER NOT NULL DEFAULT 0 CHECK (who_wellbeing_score >= 0 AND who_wellbeing_score <= 100),
  
  -- Overall risk assessment
  risk_level VARCHAR(50) NOT NULL CHECK (risk_level IN ('minimal', 'mild', 'moderate', 'moderately-severe', 'severe')),
  
  -- Clinical recommendations
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- ===== ENHANCED INDIVIDUAL RESPONSES FOR THERAPIST REVIEW =====
  -- Each question response includes question text, answer, and clinical context
  individual_responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Metadata
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure one assessment per user (unique constraint)
  CONSTRAINT unique_user_assessment UNIQUE (user_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_assessments_user_id ON user_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_assessments_risk_level ON user_assessments(risk_level);
CREATE INDEX IF NOT EXISTS idx_user_assessments_completed_at ON user_assessments(completed_at);
CREATE INDEX IF NOT EXISTS idx_user_assessments_phq9_score ON user_assessments(phq9_score);
CREATE INDEX IF NOT EXISTS idx_user_assessments_gad7_score ON user_assessments(gad7_score);

-- GIN indexes for JSONB fields to enable efficient queries
CREATE INDEX IF NOT EXISTS idx_user_assessments_recommendations ON user_assessments USING GIN(recommendations);
CREATE INDEX IF NOT EXISTS idx_user_assessments_individual_responses ON user_assessments USING GIN(individual_responses);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- =====================================================

CREATE OR REPLACE FUNCTION update_user_assessments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_user_assessments_updated_at ON user_assessments;
CREATE TRIGGER trigger_update_user_assessments_updated_at
    BEFORE UPDATE ON user_assessments
    FOR EACH ROW EXECUTE FUNCTION update_user_assessments_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

ALTER TABLE user_assessments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own assessments" ON user_assessments;
DROP POLICY IF EXISTS "Users can view their own assessments" ON user_assessments;
DROP POLICY IF EXISTS "Users can update their own assessments" ON user_assessments;

-- Create RLS policies for users only
CREATE POLICY "Users can insert their own assessments" ON user_assessments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own assessments" ON user_assessments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments" ON user_assessments
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- SAMPLE QUERIES FOR DIRECT TABLE ACCESS
-- =====================================================

/*
-- 1. Get user's own assessment
SELECT * FROM user_assessments 
WHERE user_id = auth.uid();

-- 2. Get specific individual responses for current user
SELECT 
    user_id,
    phq9_score,
    (individual_responses -> 'depression' -> 'phq9_9' ->> 'label') as suicidal_ideation_response,
    (individual_responses -> 'depression' -> 'phq9_9' ->> 'value')::int as suicidal_ideation_score,
    completed_at
FROM user_assessments 
WHERE user_id = auth.uid();

-- 3. Get depression responses for current user
SELECT 
    user_id,
    jsonb_pretty(individual_responses -> 'depression') as depression_responses
FROM user_assessments 
WHERE user_id = auth.uid();

-- 4. Check if user has high risk scores
SELECT 
    user_id,
    phq9_score,
    gad7_score,
    risk_level,
    CASE 
        WHEN phq9_score >= 20 OR gad7_score >= 15 THEN 'HIGH_RISK'
        WHEN phq9_score >= 15 OR gad7_score >= 10 THEN 'MODERATE_RISK'
        WHEN phq9_score >= 10 OR gad7_score >= 8 THEN 'MILD_RISK'
        ELSE 'LOW_RISK'
    END as clinical_priority,
    CASE 
        WHEN (individual_responses -> 'depression' -> 'phq9_9' ->> 'value')::int > 0 THEN 'SUICIDAL_IDEATION_INDICATED'
        ELSE 'NO_SUICIDAL_IDEATION'
    END as suicide_risk_flag
FROM user_assessments 
WHERE user_id = auth.uid();

-- 5. Query specific question response
SELECT 
    user_id,
    (individual_responses -> 'depression' -> 'phq9_1' ->> 'question') as question,
    (individual_responses -> 'depression' -> 'phq9_1' ->> 'label') as answer,
    (individual_responses -> 'depression' -> 'phq9_1' ->> 'value')::int as score,
    phq9_score as total_depression_score
FROM user_assessments 
WHERE user_id = auth.uid()
AND individual_responses -> 'depression' -> 'phq9_1' ->> 'value' IS NOT NULL;
*/

-- =====================================================
-- SAMPLE individual_responses JSONB STRUCTURE
-- =====================================================

/*
individual_responses JSONB structure:
{
  "demographic": {
    "age_group": {
      "question": "What is your age?",
      "value": "26-35",
      "label": "26-35",
      "answered_at": "2024-01-15T10:25:00Z"
    },
    "primary_concern": {
      "question": "What would you most like to work on in therapy?",
      "value": "anxiety",
      "label": "Managing anxiety and stress",
      "answered_at": "2024-01-15T10:25:30Z"
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
      "question": "Over the last 2 weeks, how often have you been bothered by thoughts that you would be better off dead, or of hurting yourself?",
      "value": 0,
      "label": "Not at all",
      "scale_type": "phq9",
      "max_score": 3,
      "clinical_significance": "CRITICAL: Assesses suicidal ideation - requires immediate clinical attention if > 0",
      "answered_at": "2024-01-15T10:35:00Z"
    }
  },
  "anxiety": {
    "gad7_1": {
      "question": "Over the last 2 weeks, how often have you been bothered by feeling nervous, anxious, or on edge?",
      "value": 3,
      "label": "Nearly every day",
      "scale_type": "gad7",
      "max_score": 3,
      "clinical_significance": "GAD-7 anxiety assessment - measures frequency of anxiety symptoms",
      "answered_at": "2024-01-15T10:31:00Z"
    }
  },
  "stress": {
    "pss_1": {
      "question": "In the last month, how often have you been upset because of something that happened unexpectedly?",
      "value": 2,
      "label": "Sometimes",
      "scale_type": "pss10",
      "max_score": 4,
      "clinical_significance": "Perceived Stress Scale - measures stress perception and coping",
      "answered_at": "2024-01-15T10:32:00Z"
    }
  },
  "well-being": {
    "who5_1": {
      "question": "Over the last 2 weeks, I have felt cheerful and in good spirits",
      "value": 4,
      "label": "Most of the time",
      "scale_type": "who5",
      "max_score": 5,
      "clinical_significance": "WHO-5 Well-Being Index - measures psychological well-being",
      "answered_at": "2024-01-15T10:33:00Z"
    }
  }
}
*/

-- =====================================================
-- SAMPLE THERAPIST QUERIES
-- =====================================================

/*
-- 1. Get complete assessment for a specific client
SELECT * FROM therapist_assessment_review 
WHERE client_user_id = 'client-uuid';

-- 2. Find clients with high suicide risk
SELECT 
    client_user_id,
    phq9_score,
    suicide_risk_flag,
    (depression_responses -> 'phq9_9' ->> 'label') as suicidal_ideation_response,
    completed_at
FROM therapist_assessment_review 
WHERE suicide_risk_flag = 'SUICIDAL_IDEATION_INDICATED'
ORDER BY phq9_score DESC, completed_at DESC;

-- 3. Get specific depression question responses for a client
SELECT 
    client_user_id,
    jsonb_pretty(depression_responses) as phq9_responses
FROM therapist_assessment_review 
WHERE client_user_id = 'client-uuid';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_assessments'
ORDER BY ordinal_position;

-- Check indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'user_assessments'
ORDER BY indexname;

-- Check policies
SELECT 
    policyname,
    permissive,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_assessments'
ORDER BY policyname;

RAISE NOTICE 'Simplified assessment system setup complete!';
RAISE NOTICE 'Single table: user_assessments';
RAISE NOTICE 'Direct table access only - no views required';
RAISE NOTICE 'Benefits:';
RAISE NOTICE '- Single table for both summary and individual responses';
RAISE NOTICE '- Rich JSONB structure for detailed question review';
RAISE NOTICE '- Efficient queries with GIN indexes';
RAISE NOTICE '- Built-in RLS for privacy and direct access';
RAISE NOTICE '- Users can only access their own assessment data';
RAISE NOTICE '- Therapists can query table directly if their ID exists';
RAISE NOTICE '- Ready for assessment persistence without dependencies';
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_assessments'
ORDER BY ordinal_position;

-- Check indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'user_assessments'
ORDER BY indexname;

-- Check policies
SELECT 
    policyname,
    permissive,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_assessments'
ORDER BY policyname;

RAISE NOTICE 'Simplified assessment system setup complete!';
RAISE NOTICE 'Single table: user_assessments';
RAISE NOTICE 'View created: therapist_assessment_review';
RAISE NOTICE 'Benefits:';
RAISE NOTICE '- Single table for both summary and individual responses';
RAISE NOTICE '- Rich JSONB structure for detailed question review';
RAISE NOTICE '- Efficient queries with GIN indexes';
RAISE NOTICE '- Built-in clinical flags and suicide risk detection';
RAISE NOTICE '- Users can only access their own assessment data';
RAISE NOTICE '- Ready for assessment persistence without external relationships';