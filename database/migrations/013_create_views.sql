-- LocalFix Database Views for easier data access
-- Save as: database/migrations/013_create_views.sql

-- View for job listings with all related information
CREATE OR REPLACE VIEW v_job_listings AS
SELECT 
    j.job_id,
    j.job_title,
    j.job_description,
    j.estimated_budget,
    j.deadline,
    j.job_photo,
    j.created_at as job_created_at,
    
    -- Citizen information
    c.name as citizen_name,
    c.phone as citizen_phone,
    c.email as citizen_email,
    
    -- Issue information
    i.issue_category,
    i.issue_name,
    i.priority,
    
    -- Location information
    l.upazila,
    l.district,
    l.full_address,
    l.latitude,
    l.longitude,
    
    -- Status information
    js.status_name as job_status,
    js.description as status_description,
    
    -- Assigned worker (if any)
    w.name as worker_name,
    w.phone as worker_phone,
    
    -- Application count
    (SELECT COUNT(*) FROM applications WHERE job_id = j.job_id) as application_count
    
FROM jobs j
JOIN users c ON j.citizen_id = c.user_id
JOIN issues i ON j.issue_id = i.issue_id
JOIN locations l ON j.location_id = l.location_id
JOIN job_status js ON j.status_id = js.status_id
LEFT JOIN users w ON j.assigned_worker_id = w.user_id;

-- View for application details
CREATE OR REPLACE VIEW v_application_details AS
SELECT 
    a.application_id,
    a.estimated_cost,
    a.estimated_time,
    a.proposal_description,
    a.applied_at,
    a.reviewed_at,
    a.feedback,
    
    -- Job information
    j.job_title,
    j.job_description,
    j.estimated_budget as job_budget,
    
    -- Worker information
    w.name as worker_name,
    w.phone as worker_phone,
    w.email as worker_email,
    
    -- Application status
    ast.status_name as application_status,
    
    -- Citizen information
    c.name as citizen_name,
    
    -- Reviewer information (if reviewed)
    r.name as reviewed_by_name
    
FROM applications a
JOIN jobs j ON a.job_id = j.job_id
JOIN users w ON a.worker_id = w.user_id
JOIN users c ON j.citizen_id = c.user_id
JOIN application_status ast ON a.status_id = ast.status_id
LEFT JOIN users r ON a.reviewed_by = r.user_id;

-- View for worker dashboard statistics
CREATE OR REPLACE VIEW v_worker_stats AS
SELECT 
    w.user_id as worker_id,
    w.name as worker_name,
    
    -- Application statistics
    COUNT(DISTINCT a.application_id) as total_applications,
    COUNT(DISTINCT CASE WHEN ast.status_name = 'accepted' THEN a.application_id END) as accepted_applications,
    COUNT(DISTINCT CASE WHEN ast.status_name = 'rejected' THEN a.application_id END) as rejected_applications,
    
    -- Job statistics
    COUNT(DISTINCT j.job_id) as total_jobs_assigned,
    COUNT(DISTINCT CASE WHEN js.status_name = 'completed' THEN j.job_id END) as jobs_completed,
    
    -- Earnings
    NVL(SUM(CASE WHEN p.payment_status = 'completed' THEN p.amount END), 0) as total_earnings,
    
    -- Rating
    NVL(AVG(r.rating), 0) as average_rating,
    COUNT(r.rating_id) as total_ratings

FROM users w
LEFT JOIN applications a ON w.user_id = a.worker_id
LEFT JOIN application_status ast ON a.status_id = ast.status_id
LEFT JOIN jobs j ON w.user_id = j.assigned_worker_id
LEFT JOIN job_status js ON j.status_id = js.status_id
LEFT JOIN payments p ON j.job_id = p.job_id
LEFT JOIN ratings r ON w.user_id = r.worker_id
WHERE w.user_type = 'worker'
GROUP BY w.user_id, w.name;

-- View for citizen dashboard statistics
CREATE OR REPLACE VIEW v_citizen_stats AS
SELECT 
    c.user_id as citizen_id,
    c.name as citizen_name,
    
    -- Job statistics
    COUNT(DISTINCT j.job_id) as total_jobs_posted,
    COUNT(DISTINCT CASE WHEN js.status_name = 'open' THEN j.job_id END) as open_jobs,
    COUNT(DISTINCT CASE WHEN js.status_name = 'in_progress' THEN j.job_id END) as jobs_in_progress,
    COUNT(DISTINCT CASE WHEN js.status_name = 'completed' THEN j.job_id END) as jobs_completed,
    
    -- Payment statistics
    NVL(SUM(CASE WHEN p.payment_status = 'completed' THEN p.amount END), 0) as total_spent
    
FROM users c
LEFT JOIN jobs j ON c.user_id = j.citizen_id
LEFT JOIN job_status js ON j.status_id = js.status_id
LEFT JOIN payments p ON j.job_id = p.job_id
WHERE c.user_type = 'citizen'
GROUP BY c.user_id, c.name;

COMMIT;