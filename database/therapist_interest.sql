-- =====================================================
-- Quick Setup Script for Govently Therapist Signup
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main therapist applications table (matches frontend exactly)
CREATE TABLE therapist_interest (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic Information (matches frontend exactly)
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    country VARCHAR(100) NOT NULL,
    state_province VARCHAR(100),
    city VARCHAR(100),
    timezone VARCHAR(100),
    
    -- Professional Credentials
    license_number VARCHAR(100),
    license_region VARCHAR(100),
    license_type VARCHAR(150),
    license_expiry_date VARCHAR(50), -- Frontend sends as string
    years_experience INTEGER,
    years_private_practice INTEGER,
    
    -- Education and Certifications as JSONB arrays (matches frontend)
    education JSONB DEFAULT '[]'::jsonb,
    certifications JSONB DEFAULT '[]'::jsonb,
    
    -- Arrays stored as JSONB (matches frontend)
    specializations JSONB DEFAULT '[]'::jsonb,
    therapy_approaches JSONB DEFAULT '[]'::jsonb,
    client_demographics JSONB DEFAULT '[]'::jsonb,
    severity_levels JSONB DEFAULT '[]'::jsonb,
    languages JSONB DEFAULT '[]'::jsonb,
    
    -- Training flags
    crisis_intervention_trained BOOLEAN DEFAULT FALSE,
    trauma_informed_certified BOOLEAN DEFAULT FALSE,
    
    -- Availability (matches frontend)
    availability_slots JSONB DEFAULT '[]'::jsonb,
    session_durations JSONB DEFAULT '[]'::jsonb,
    advance_booking_required INTEGER DEFAULT 24,
    max_clients_per_week INTEGER,
    emergency_availability BOOLEAN DEFAULT FALSE,
    
    -- Pricing (matches frontend structure with nested object)
    hourly_rates JSONB DEFAULT '{}'::jsonb,
    sliding_scale_available BOOLEAN DEFAULT FALSE,
    sliding_scale_min_rate DECIMAL(8,2),
    insurance_accepted JSONB DEFAULT '[]'::jsonb,
    payment_methods JSONB DEFAULT '[]'::jsonb,
    cancellation_policy TEXT,
    
    -- Profile
    bio TEXT,
    treatment_philosophy TEXT,
    linkedin_url TEXT,
    website_url TEXT,
    
    -- Professional References as JSONB array (matches frontend)
    professional_references JSONB DEFAULT '[]'::jsonb,
    
    -- Documents
    professional_photo_url TEXT,
    license_document_url TEXT,
    diploma_document_url TEXT,
    certification_documents JSONB DEFAULT '[]'::jsonb,
    
    -- Consent
    consent BOOLEAN DEFAULT FALSE,
    background_check_consent BOOLEAN DEFAULT FALSE,
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'pending',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Note: Education, Certifications, and References are stored as JSONB arrays 
-- in the main table to match frontend data structure exactly.
-- The separate tables below are optional for advanced querying/reporting.

-- Education table (OPTIONAL - for advanced queries)
-- Uncomment if you need separate table for complex education queries
/*
CREATE TABLE therapist_education (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    therapist_id UUID REFERENCES therapist_interest(id) ON DELETE CASCADE,
    degree VARCHAR(200) NOT NULL,
    institution VARCHAR(300) NOT NULL,
    graduation_year INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
*/

-- Certifications table (OPTIONAL - for expiry tracking)
-- Uncomment if you need separate table for certification expiry alerts
/*
CREATE TABLE therapist_certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    therapist_id UUID REFERENCES therapist_interest(id) ON DELETE CASCADE,
    name VARCHAR(300) NOT NULL,
    issuing_organization VARCHAR(300) NOT NULL,
    issue_date DATE,
    expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
*/

-- Professional references (OPTIONAL - for verification workflow)
-- Uncomment if you need separate table for reference verification tracking
/*
CREATE TABLE therapist_references (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    therapist_id UUID REFERENCES therapist_interest(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(200),
    organization VARCHAR(300),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    relationship VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
*/

-- Basic indexes
CREATE INDEX idx_therapist_interest_email ON therapist_interest(email);
CREATE INDEX idx_therapist_interest_status ON therapist_interest(status);
CREATE INDEX idx_therapist_interest_created ON therapist_interest(created_at);
CREATE INDEX idx_therapist_interest_specializations ON therapist_interest USING GIN(specializations);
CREATE INDEX idx_therapist_interest_languages ON therapist_interest USING GIN(languages);

-- Enable RLS on main table only (related tables are optional)
ALTER TABLE therapist_interest ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies for main table
CREATE POLICY "Anyone can insert applications" ON therapist_interest
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view applications" ON therapist_interest
    FOR SELECT USING (true); -- Adjust based on your security needs

CREATE POLICY "Users can update their own applications" ON therapist_interest
    FOR UPDATE USING (auth.email() = email OR auth.role() = 'authenticated')
    WITH CHECK (auth.email() = email OR auth.role() = 'authenticated');

-- Update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_therapist_interest_updated_at 
    BEFORE UPDATE ON therapist_interest 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Sample Data Structures (Frontend sends these exact formats)
-- =====================================================

/*
-- Sample JSONB data structures that match the frontend:

-- education field example:
[
  {
    "degree": "Master of Social Work (MSW)",
    "institution": "University of California",
    "graduation_year": 2018
  },
  {
    "degree": "Bachelor of Psychology",
    "institution": "UCLA",
    "graduation_year": 2016
  }
]

-- certifications field example:
[
  {
    "name": "EMDR Therapy Certification",
    "issuing_organization": "EMDR International Association",
    "issue_date": "2020-06-15",
    "expiry_date": "2025-06-15"
  }
]

-- hourly_rates field example:
{
  "individual": 150.00,
  "couples": 200.00,
  "family": 225.00,
  "group": 75.00
}

-- availability_slots field example:
[
  {"day": "Monday", "start_time": "09:00", "end_time": "17:00"},
  {"day": "Tuesday", "start_time": "10:00", "end_time": "16:00"}
]

-- professional_references field example:
[
  {
    "name": "Dr. Jane Smith",
    "position": "Clinical Supervisor",
    "organization": "Mental Health Center",
    "email": "jane.smith@mhc.org",
    "phone": "+1-555-0123",
    "relationship": "Former Supervisor"
  }
]

-- specializations, languages, etc. are simple string arrays:
["Anxiety Disorders", "Depression", "Trauma and PTSD"]
["English", "Spanish"]
[45, 60, 90]  -- session_durations
["Aetna", "Blue Cross Blue Shield"]  -- insurance_accepted

*/

-- =====================================================
-- Test Query Examples
-- =====================================================

/*
-- Find therapists by specialization:
SELECT full_name, email, specializations
FROM therapist_interest
WHERE specializations ? 'Anxiety Disorders';

-- Find therapists by language:
SELECT full_name, email, languages
FROM therapist_interest
WHERE languages ? 'Spanish';

-- Get therapist education:
SELECT full_name, education
FROM therapist_interest
WHERE id = 'your-uuid-here';

-- Find therapists with specific rates:
SELECT full_name, hourly_rates
FROM therapist_interest
WHERE (hourly_rates->>'individual')::decimal <= 150.00;

-- Get availability for a therapist:
SELECT full_name, availability_slots
FROM therapist_interest
WHERE id = 'your-uuid-here';
*/