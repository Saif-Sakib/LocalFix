-- LocalFix Common Queries for Application Development
-- Save as: database/018_common_queries.sql

-- ====================================================================
-- AUTHENTICATION QUERIES (Member 1)
-- ====================================================================

-- Login query
SELECT user_id, name, email, user_type, status
FROM users 
WHERE email = ? AND password = ? AND status = 'active';

-- Register new user
INSERT INTO users (name, email, phone, address, password, user_type)
VALUES (?, ?, ?, ?, ?, ?);

-- Check if email exists
SELECT COUNT(*) FROM users WHERE email = ?;

-- ====================================================================
-- CITIZEN QUERIES (Member 2)
-- ====================================================================

-- Get citizen's jobs with application counts
SELECT j.*, js.status_name, fn_get_job_application_count(j.job_id) as app_count
FROM jobs j
JOIN job_status js ON j.status_id = js.status_id
WHERE j.citizen_id = ?
ORDER BY j.created_at DESC;

-- Post new job
INSERT INTO jobs (citizen_id, issue_id, location_id, job_title, job_description, estimated_budget, deadline)
VALUES (?, ?, ?, ?, ?, ?, ?);

-- Get applications for citizen's job
SELECT * FROM v_application_details 
WHERE job_id = ? 
ORDER BY applied_at DESC;

-- Accept application (use stored procedure)
EXEC sp_accept_application(?, ?);

-- Get job details with location
SELECT * FROM v_job_listings WHERE job_id = ?;

-- ====================================================================
-- WORKER QUERIES (Member 3)
-- ====================================================================

-- Browse available jobs (open status)
SELECT * FROM v_job_listings 
WHERE job_status = 'open'
AND job_id NOT IN (
    SELECT job_id FROM applications WHERE worker_id = ?
)
ORDER BY job_created_at DESC;

-- Apply to job
INSERT INTO applications (job_id, worker_id, estimated_cost, estimated_time, proposal_description)
VALUES (?, ?, ?, ?, ?);

-- Get worker's applications
SELECT * FROM v_application_details 
WHERE worker_id = ? 
ORDER BY applied_at DESC;

-- Get assigned jobs for worker
SELECT * FROM v_job_listings 
WHERE worker_name IS NOT NULL 
AND worker_id = ?
ORDER BY job_created_at DESC;

-- Submit job proof
EXEC sp_complete_job(?, ?, ?, ?);

-- Get worker skills
SELECT skill_name, experience_level, years_experience, is_verified
FROM worker_skills 
WHERE worker_id = ?
ORDER BY skill_name;

-- Add worker skill
INSERT INTO worker_skills (worker_id, skill_name, experience_level, years_experience)
VALUES (?, ?, ?, ?);

-- ====================================================================
-- ADMIN QUERIES (Member 4)
-- ====================================================================

-- Get pending applications for review
SELECT * FROM v_application_details 
WHERE application_status = 'submitted'
ORDER BY applied_at ASC;

-- Get pending proof verifications
SELECT 
    jp.*,
    j.job_title,
    w.name as worker_name,
    c.name as citizen_name
FROM job_proofs jp
JOIN jobs j ON jp.job_id = j.job_id
JOIN users w ON jp.worker_id = w.user_id
JOIN users c ON j.citizen_id = c.user_id
WHERE jp.verification_status = 'pending'
ORDER BY jp.submitted_at ASC;

-- Verify job proof
EXEC sp_verify_job_proof(?, ?, ?, ?);

-- Get all users with statistics
SELECT 
    u.user_id,
    u.name,
    u.email,
    u.user_type,
    u.status,
    u.created_at,
    CASE 
        WHEN u.user_type = 'worker' THEN fn_get_worker_rating(u.user_id)
        ELSE NULL
    END as rating
FROM users u
WHERE u.user_type != 'admin'
ORDER BY u.created_at DESC;

-- Platform statistics
SELECT 
    'Total Users' as metric,
    COUNT(*) as value
FROM users
WHERE status = 'active'
UNION ALL
SELECT 
    'Total Jobs' as metric,
    COUNT(*) as value
FROM jobs
UNION ALL
SELECT 
    'Total Applications' as metric,
    COUNT(*) as value
FROM applications
UNION ALL
SELECT 
    'Total Payments' as metric,
    SUM(amount) as value
FROM payments
WHERE payment_status = 'completed';

-- ====================================================================
-- NOTIFICATION QUERIES (All Members)
-- ====================================================================

-- Get user notifications
SELECT 
    notification_id,
    title,
    message,
    notification_type,
    is_read,
    created_at,
    related_job_id,
    related_application_id
FROM notifications 
WHERE user_id = ?
ORDER BY created_at DESC
FETCH FIRST 50 ROWS ONLY;

-- Mark notifications as read
EXEC sp_mark_notifications_read(?, ?);

-- Get unread notification count
SELECT fn_get_unread_notification_count(?) as unread_count FROM dual;

-- ====================================================================
-- SEARCH AND FILTER QUERIES
-- ====================================================================

-- Search jobs by location
SELECT * FROM v_job_listings 
WHERE job_status = 'open'
AND (UPPER(district) LIKE UPPER(?) OR UPPER(upazila) LIKE UPPER(?))
ORDER BY job_created_at DESC;

-- Search jobs by category
SELECT * FROM v_job_listings 
WHERE job_status = 'open'
AND UPPER(issue_category) LIKE UPPER(?)
ORDER BY job_created_at DESC;

-- Filter jobs by budget range
SELECT * FROM v_job_listings 
WHERE job_status = 'open'
AND estimated_budget BETWEEN ? AND ?
ORDER BY estimated_budget ASC;

-- Get workers by skill
SELECT DISTINCT 
    u.user_id,
    u.name,
    u.phone,
    u.email,
    fn_get_worker_rating(u.user_id) as rating,
    fn_get_worker_success_rate(u.user_id) as success_rate
FROM users u
JOIN worker_skills ws ON u.user_id = ws.worker_id
WHERE u.user_type = 'worker' 
AND u.status = 'active'
AND UPPER(ws.skill_name) LIKE UPPER(?)
ORDER BY fn_get_worker_rating(u.user_id) DESC;

-- ====================================================================
-- REPORTING QUERIES
-- ====================================================================

-- Monthly job statistics
SELECT 
    TO_CHAR(created_at, 'YYYY-MM') as month,
    COUNT(*) as jobs_posted,
    AVG(estimated_budget) as avg_budget
FROM jobs 
WHERE created_at >= ADD_MONTHS(SYSDATE, -12)
GROUP BY TO_CHAR(created_at, 'YYYY-MM')
ORDER BY month DESC;

-- Top performing workers
SELECT 
    w.name,
    w.email,
    COUNT(j.job_id) as jobs_completed,
    AVG(r.rating) as avg_rating,
    SUM(p.amount) as total_earnings
FROM users w
LEFT JOIN jobs j ON w.user_id = j.assigned_worker_id
LEFT JOIN job_status js ON j.status_id = js.status_id
LEFT JOIN ratings r ON w.user_id = r.worker_id
LEFT JOIN payments p ON j.job_id = p.job_id AND p.payment_status = 'completed'
WHERE w.user_type = 'worker'
AND js.status_name IN ('completed', 'verified', 'closed')
GROUP BY w.user_id, w.name, w.email
HAVING COUNT(j.job_id) > 0
ORDER BY avg_rating DESC, jobs_completed DESC
FETCH FIRST 10 ROWS ONLY;