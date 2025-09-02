-- LocalFix Additional Constraints and Indexes
-- Save as: database/migrations/016_additional_constraints_indexes.sql

-- Add additional constraints to ensure data integrity

-- Ensure phone numbers are properly formatted (Bangladesh format)
ALTER TABLE users ADD CONSTRAINT chk_users_phone 
CHECK (REGEXP_LIKE(phone, '^017[0-9]{8}$'));

-- Ensure email format is valid
ALTER TABLE users ADD CONSTRAINT chk_users_email 
CHECK (REGEXP_LIKE(email, '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'));

-- Add business rule constraints

-- Constraint: Only workers can have skills
ALTER TABLE worker_skills ADD CONSTRAINT chk_worker_skills_user_type
CHECK (worker_id IN (SELECT user_id FROM users WHERE user_type = 'worker'));

-- Constraint: Only citizens can post jobs
ALTER TABLE jobs ADD CONSTRAINT chk_jobs_citizen_type
CHECK (citizen_id IN (SELECT user_id FROM users WHERE user_type = 'citizen'));

-- Constraint: Only workers can apply to jobs
ALTER TABLE applications ADD CONSTRAINT chk_applications_worker_type
CHECK (worker_id IN (SELECT user_id FROM users WHERE user_type = 'worker'));

-- Constraint: Only admin or citizen can review applications
ALTER TABLE applications ADD CONSTRAINT chk_applications_reviewer_type
CHECK (reviewed_by IS NULL OR reviewed_by IN (SELECT user_id FROM users WHERE user_type IN ('admin', 'citizen')));

-- Constraint: Only admins can verify proofs
ALTER TABLE job_proofs ADD CONSTRAINT chk_proofs_admin_type
CHECK (verified_by IS NULL OR verified_by IN (SELECT user_id FROM users WHERE user_type = 'admin'));

-- Additional useful indexes for performance

-- Composite indexes for common queries
CREATE INDEX idx_jobs_status_created ON jobs(status_id, created_at);
CREATE INDEX idx_applications_worker_status ON applications(worker_id, status_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);

-- Index for job search by location and status
CREATE INDEX idx_jobs_location_status ON jobs(location_id, status_id);

-- Index for worker performance queries
CREATE INDEX idx_ratings_worker_rating ON ratings(worker_id, rating);

-- Full-text search indexes (if needed for job descriptions)
-- Note: Oracle Text indexes would require additional setup, using basic for now
CREATE INDEX idx_jobs_title ON jobs(UPPER(job_title));

COMMIT;

-- Create sequences for consistent ID generation (if needed for manual inserts)
CREATE SEQUENCE seq_manual_job_id START WITH 1000 INCREMENT BY 1;
CREATE SEQUENCE seq_manual_application_id START WITH 1000 INCREMENT BY 1;
CREATE SEQUENCE seq_manual_notification_id START WITH 1000 INCREMENT BY 1;

COMMIT;