# Govently Therapist Signup Database Setup

This directory contains SQL scripts to set up the database tables for the enhanced therapist signup system in Supabase.

## Files Overview

### 1. `therapist_signup_tables.sql` (Complete Schema)
**The comprehensive, production-ready schema** with:
- Full table structure with all fields
- Row Level Security (RLS) policies
- Indexes for performance
- Triggers for automatic timestamps
- Views for common queries
- Sample data and maintenance functions
- Complete documentation

**Use this for**: New projects or when you want the complete, enterprise-level setup.

### 2. `quick_setup.sql` (Simplified Version)
**A streamlined version** for quick deployment:
- Essential tables with core fields
- Basic RLS policies
- Minimal indexes
- Easy to understand and modify

**Use this for**: Rapid prototyping, testing, or when you want a simpler setup.

### 3. `migration.sql` (Upgrade Script)
**Upgrades existing `therapist_interest` table** to support the new form:
- Safely adds new columns
- Preserves existing data
- Updates column names if needed
- Adds related tables and indexes

**Use this for**: Upgrading an existing therapist signup table to support the enhanced form.

## How to Use

### For New Supabase Projects
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `quick_setup.sql` (recommended) or `therapist_signup_tables.sql` (full version)
4. Run the script
5. Verify tables are created in the Table Editor

### For Existing Projects with therapist_interest Table
1. **Backup your data first!**
2. Go to SQL Editor in Supabase
3. Copy and paste the contents of `migration.sql`
4. Run the script
5. Test with a sample form submission

### Verification Steps
After running any script, verify the setup:

```sql
-- Check if main table exists with correct columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'therapist_interest'
ORDER BY ordinal_position;

-- Check related tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE 'therapist_%';

-- Test insert (replace with real data)
INSERT INTO therapist_interest (
    full_name, email, country, license_type, years_experience, 
    specializations, languages, consent, background_check_consent
) VALUES (
    'Test Therapist',
    'test@example.com',
    'United States',
    'Licensed Clinical Social Worker (LCSW)',
    5,
    '["Anxiety Disorders", "Depression"]'::jsonb,
    '["English"]'::jsonb,
    true,
    true
);
```

## Table Structure Overview

### Main Table: `therapist_interest`
Stores all therapist application data including:
- Basic information (name, email, location)
- Professional credentials (license, experience, education)
- Specializations and therapy approaches
- Availability and booking preferences  
- Pricing and insurance information
- Professional profile data
- Document references
- Consent and verification status

### Related Tables:
- `therapist_education`: Academic degrees and institutions
- `therapist_certifications`: Professional certifications with expiry dates
- `therapist_references`: Professional references for verification

## Data Types Used

### JSONB Fields
Several fields use JSONB to store arrays of strings:
- `specializations`: Clinical specializations
- `therapy_approaches`: Therapeutic modalities 
- `languages`: Languages spoken
- `availability_slots`: Weekly schedule
- `session_durations`: Available session lengths
- `insurance_accepted`: Insurance providers
- `payment_methods`: Payment options accepted

### Example JSONB Data:
```json
// specializations
["Anxiety Disorders", "Depression", "Trauma and PTSD"]

// availability_slots  
[
  {"day": "Monday", "start_time": "09:00", "end_time": "17:00"},
  {"day": "Tuesday", "start_time": "10:00", "end_time": "16:00"}
]

// session_durations
[45, 60, 90]
```

## Security Notes

### Row Level Security (RLS)
All tables have RLS enabled with policies that:
- Allow users to insert new applications
- Allow users to view their own applications
- Allow authenticated users to view approved therapist profiles
- Restrict admin functions appropriately

### Recommended Additional Security:
1. Set up proper authentication flows
2. Validate email addresses before allowing applications
3. Implement file upload security for documents
4. Add rate limiting for application submissions
5. Set up monitoring for suspicious activity

## Common Queries

### Get All Applications with Status
```sql
SELECT full_name, email, status, created_at 
FROM therapist_interest 
ORDER BY created_at DESC;
```

### Get Complete Therapist Profile
```sql
SELECT 
    ti.*,
    array_agg(DISTINCT te.degree) as degrees,
    array_agg(DISTINCT tc.name) as certifications
FROM therapist_interest ti
LEFT JOIN therapist_education te ON ti.id = te.therapist_id
LEFT JOIN therapist_certifications tc ON ti.id = tc.therapist_id
WHERE ti.id = 'your-uuid-here'
GROUP BY ti.id;
```

### Find Therapists by Specialization
```sql
SELECT full_name, email, specializations
FROM therapist_interest
WHERE specializations ? 'Anxiety Disorders'
AND status = 'approved';
```

## Troubleshooting

### Common Issues:
1. **UUID Extension Error**: Make sure UUID extension is enabled
2. **RLS Policy Error**: Check authentication setup in Supabase
3. **JSONB Query Issues**: Use proper JSONB operators (?, ?&, ?|, @>, etc.)
4. **Foreign Key Errors**: Ensure parent records exist before inserting related data

### Getting Help:
- Check Supabase documentation for RLS and JSONB
- Review the table comments in the full schema
- Test queries in the SQL Editor before using in code

## Performance Considerations

The scripts include indexes on commonly queried fields:
- Email (for user lookups)
- Status (for filtering applications)
- Created date (for chronological sorting)
- Specializations (GIN index for JSONB array queries)
- Location fields (for geographic filtering)

For high-volume applications, consider:
- Partitioning by creation date
- Additional indexes based on query patterns
- Connection pooling
- Caching frequently accessed data

## Next Steps

After setting up the database:
1. Update your Supabase client configuration
2. Test the enhanced form with real data
3. Implement file upload for documents
4. Set up email notifications for status changes
5. Create admin interface for reviewing applications
6. Implement the therapist matching algorithm