-- ====================================================================
-- COMPLETE ROLLBACK FOR ALL LOCALFIX SQL SCRIPTS
-- Run these commands to undo everything (except users table)
-- ====================================================================

-- ====================================================================
-- DROP VIEWS FIRST (013_create_views.sql)
-- ====================================================================
DROP VIEW v_job_listings;
DROP VIEW v_application_details;
DROP VIEW v_worker_stats;
DROP VIEW v_citizen_stats;

-- ====================================================================
-- DROP PROCEDURES AND FUNCTIONS (015_stored_procedures.sql + 017_utility_procedures.sql)
-- ====================================================================
DROP PROCEDURE sp_accept_application;
DROP PROCEDURE sp_complete_job;
DROP PROCEDURE sp_verify_job_proof;
DROP PROCEDURE sp_process_payment;
DROP PROCEDURE sp_create_notification;
DROP PROCEDURE sp_mark_notifications_read;
DROP PROCEDURE sp_get_dashboard_stats;
DROP FUNCTION fn_get_worker_rating;
DROP FUNCTION fn_can_apply_to_job;
DROP FUNCTION fn_get_job_application_count;
DROP FUNCTION fn_get_unread_notification_count;
DROP FUNCTION fn_get_worker_success_rate;

-- ====================================================================
-- DROP SEQUENCES (016_additional_constraints_indexes.sql)
-- ====================================================================
DROP SEQUENCE seq_manual_job_id;
DROP SEQUENCE seq_manual_application_id;
DROP SEQUENCE seq_manual_notification_id;

-- ====================================================================
-- DROP TABLES IN REVERSE DEPENDENCY ORDER
-- ====================================================================

-- RATINGS TABLE (010_create_ratings_table.sql)
DROP INDEX idx_ratings_job;
DROP INDEX idx_ratings_citizen;
DROP INDEX idx_ratings_worker;
DROP INDEX idx_ratings_rating;
DROP TABLE ratings CASCADE CONSTRAINTS;

-- NOTIFICATIONS TABLE (011_create_notifications_table.sql)
DROP TRIGGER trg_notifications_read_at;
DROP INDEX idx_notifications_user;
DROP INDEX idx_notifications_read;
DROP INDEX idx_notifications_type;
DROP INDEX idx_notifications_created_at;
DROP TABLE notifications CASCADE CONSTRAINTS;

-- WORKER SKILLS TABLE (012_create_worker_skills_table.sql)
DROP INDEX idx_worker_skills_worker;
DROP INDEX idx_worker_skills_name;
DROP INDEX idx_worker_skills_level;
DROP TABLE worker_skills CASCADE CONSTRAINTS;

-- PAYMENTS TABLE (009_create_payments_table.sql)
DROP TRIGGER trg_payments_updated_at;
DROP TRIGGER trg_payment_completed;
DROP INDEX idx_payments_job;
DROP INDEX idx_payments_citizen;
DROP INDEX idx_payments_worker;
DROP INDEX idx_payments_status;
DROP INDEX idx_payments_date;
DROP TABLE payments CASCADE CONSTRAINTS;

-- JOB PROOFS TABLE (008_create_job_proofs_table.sql)
DROP TRIGGER trg_proof_verified;
DROP TRIGGER trg_proof_submitted;
DROP INDEX idx_proofs_job;
DROP INDEX idx_proofs_worker;
DROP INDEX idx_proofs_status;
DROP INDEX idx_proofs_submitted_at;
DROP TABLE job_proofs CASCADE CONSTRAINTS;

-- APPLICATIONS TABLE (007_create_applications_table.sql)
DROP TRIGGER trg_applications_status_update;
DROP INDEX idx_applications_job;
DROP INDEX idx_applications_worker;
DROP INDEX idx_applications_status;
DROP INDEX idx_applications_applied_at;
DROP TABLE applications CASCADE CONSTRAINTS;

-- APPLICATION STATUS TABLE (006_create_application_status_table.sql)
DROP TABLE application_status CASCADE CONSTRAINTS;

-- JOBS TABLE (005_create_jobs_table.sql)
DROP TRIGGER trg_jobs_updated_at;
DROP INDEX idx_jobs_citizen;
DROP INDEX idx_jobs_status;
DROP INDEX idx_jobs_worker;
DROP INDEX idx_jobs_location;
DROP INDEX idx_jobs_created_at;
DROP TABLE jobs CASCADE CONSTRAINTS;

-- JOB STATUS TABLE (004_create_job_status_table.sql)
DROP TABLE job_status CASCADE CONSTRAINTS;

-- ISSUES TABLE (003_create_issues_table.sql)
DROP TRIGGER trg_issues_updated_at;
DROP INDEX idx_issues_category;
DROP INDEX idx_issues_priority;
DROP TABLE issues CASCADE CONSTRAINTS;

-- LOCATIONS TABLE (002_create_locations_table.sql)
DROP INDEX idx_locations_district;
DROP INDEX idx_locations_upazila;
DROP TABLE locations CASCADE CONSTRAINTS;

-- ====================================================================
-- USERS TABLE CONSTRAINTS (016_additional_constraints_indexes.sql)
-- Remove only the additional constraints added, keep the original table
-- ====================================================================
-- Remove additional constraints added in script 016
ALTER TABLE users DROP CONSTRAINT chk_users_phone;
ALTER TABLE users DROP CONSTRAINT chk_users_email;

-- Drop additional indexes added in script 016
DROP INDEX idx_jobs_status_created;
DROP INDEX idx_applications_worker_status;
DROP INDEX idx_notifications_user_read;
DROP INDEX idx_jobs_location_status;
DROP INDEX idx_ratings_worker_rating;
DROP INDEX idx_jobs_title;

-- ====================================================================
-- VERIFICATION QUERIES
-- Run these to confirm everything is cleaned up
-- ====================================================================

-- Check remaining tables (should only show USERS and system tables)
SELECT table_name FROM user_tables ORDER BY table_name;

-- Check remaining views (should be empty)
SELECT view_name FROM user_views WHERE view_name LIKE 'V_%';

-- Check remaining procedures/functions (should be empty)
SELECT object_name, object_type FROM user_objects 
WHERE object_type IN ('PROCEDURE', 'FUNCTION')
AND (object_name LIKE 'SP_%' OR object_name LIKE 'FN_%');

-- Check remaining triggers (should only show users table trigger)
SELECT trigger_name FROM user_triggers ORDER BY trigger_name;

-- Check remaining sequences (should be empty)
SELECT sequence_name FROM user_sequences 
WHERE sequence_name LIKE 'SEQ_MANUAL_%';

COMMIT;