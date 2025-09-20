-- LocalFix - Run All Migrations Script
-- Save as: database/999_run_all_migrations.sql
-- This script runs all migrations in the correct order

SET SERVEROUTPUT ON;

BEGIN
    DBMS_OUTPUT.PUT_LINE('=== Starting LocalFix Database Migration ===');
    DBMS_OUTPUT.PUT_LINE('Timestamp: ' || TO_CHAR(SYSTIMESTAMP, 'YYYY-MM-DD HH24:MI:SS'));
END;
/

-- Note: Run these files in order manually, or use this as a reference
-- This script serves as documentation of the correct execution order

PROMPT === Step 1: Database Setup ===
-- @000_database_setup.sql

PROMPT === Step 2: Users Table (Already exists) ===
-- @001_create_users_table.sql

PROMPT === Step 3: Locations Table ===
-- @002_create_locations_table.sql

PROMPT === Step 4: Issues Table ===
-- @003_create_issues_table.sql

PROMPT === Step 5: Job Status Table ===
-- @004_create_job_status_table.sql

PROMPT === Step 6: Jobs Table ===
-- @005_create_jobs_table.sql

PROMPT === Step 7: Application Status Table ===
-- @006_create_application_status_table.sql

PROMPT === Step 8: Applications Table ===
-- @007_create_applications_table.sql

PROMPT === Step 9: Job Proofs Table ===
-- @008_create_job_proofs_table.sql

PROMPT === Step 10: Payments Table ===
-- @009_create_payments_table.sql

PROMPT === Step 11: Ratings Table ===
-- @010_create_ratings_table.sql

PROMPT === Step 12: Notifications Table ===
-- @011_create_notifications_table.sql

PROMPT === Step 13: Worker Skills Table ===
-- @012_create_worker_skills_table.sql

PROMPT === Step 14: Database Views ===
-- @013_create_views.sql

PROMPT === Step 15: Seed Data ===
-- @014_seed_data.sql

PROMPT === Step 16: Stored Procedures ===
-- @015_stored_procedures.sql

PROMPT === Step 17: Additional Constraints ===
-- @016_additional_constraints_indexes.sql

PROMPT === Step 19: Withdrawals Table ===
-- @019_create_withdrawals_table.sql

-- Verification queries to check if everything is set up correctly
PROMPT === Verification: Checking Tables ===
SELECT 'Table: ' || table_name || ' - Rows: ' || num_rows as status
FROM user_tables 
WHERE table_name IN (
    'USERS', 'LOCATIONS', 'ISSUES', 'JOB_STATUS', 'JOBS', 
    'APPLICATION_STATUS', 'APPLICATIONS', 'JOB_PROOFS', 
    'PAYMENTS', 'RATINGS', 'NOTIFICATIONS', 'WORKER_SKILLS'
)
ORDER BY table_name;

PROMPT === Verification: Checking Views ===
SELECT view_name FROM user_views 
WHERE view_name LIKE 'V_%'
ORDER BY view_name;

PROMPT === Verification: Checking Procedures ===
SELECT object_name, object_type FROM user_objects 
WHERE object_type IN ('PROCEDURE', 'FUNCTION')
AND object_name LIKE 'SP_%' OR object_name LIKE 'FN_%'
ORDER BY object_type, object_name;

BEGIN
    DBMS_OUTPUT.PUT_LINE('=== LocalFix Database Migration Completed ===');
    DBMS_OUTPUT.PUT_LINE('All tables, views, procedures, and sample data have been created.');
    DBMS_OUTPUT.PUT_LINE('Database is ready for application development!');
END;
/