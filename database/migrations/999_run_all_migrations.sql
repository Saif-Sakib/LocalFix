-- LocalFix - Run All Migrations Script (Active Set)
-- This script lists the correct execution order for active migrations (000–008)

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

PROMPT === Step 2: Users Table ===
-- @001_create_users_table.sql

PROMPT === Step 3: Locations Table ===
-- @002_create_locations_table.sql

PROMPT === Step 4: Issues Table ===
-- @003_create_issues_table.sql

PROMPT === Step 5: Applications Table ===
-- @004_create_applications_table.sql

PROMPT === Step 6: Issue Proofs Table ===
-- @005_create_issue_proofs_table.sql

PROMPT === Step 7: Payments Table ===
-- @006_create_payments_table.sql

PROMPT === Step 8: Ratings Table ===
-- @007_create_ratings_table.sql

PROMPT === Step 9: Withdrawals Table + Views/PLSQL ===
-- @008_create_withdrawals_table.sql

-- Verification queries to check if everything is set up correctly
PROMPT === Verification: Checking Tables ===
SELECT table_name FROM user_tables 
WHERE table_name IN (
    'USERS','LOCATIONS','ISSUES','APPLICATIONS','ISSUE_PROOFS','PAYMENTS','RATINGS','WITHDRAWALS'
)
ORDER BY table_name;

PROMPT === Verification: Checking Views ===
SELECT view_name FROM user_views 
WHERE view_name IN ('V_ISSUES_WITH_DETAILS','V_WORKER_PAYMENT_SUMMARY')
ORDER BY view_name;

PROMPT === Verification: Checking Procedures/Functions ===
SELECT object_name, object_type FROM user_objects 
WHERE object_type IN ('PROCEDURE', 'FUNCTION')
    AND object_name IN ('SET_ISSUE_STATUS_SAFE','GET_ISSUE_COUNT_BY_STATUS')
ORDER BY object_type, object_name;

BEGIN
    DBMS_OUTPUT.PUT_LINE('=== LocalFix Database Migration Completed ===');
    DBMS_OUTPUT.PUT_LINE('Active schema objects (000–008) created successfully.');
END;
/