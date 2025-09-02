-- LocalFix Utility Procedures and Functions
-- Save as: database/migrations/017_utility_procedures.sql

-- Procedure to create a notification
CREATE OR REPLACE PROCEDURE sp_create_notification(
    p_user_id IN NUMBER,
    p_title IN VARCHAR2,
    p_message IN CLOB,
    p_notification_type IN VARCHAR2 DEFAULT 'general',
    p_related_job_id IN NUMBER DEFAULT NULL,
    p_related_application_id IN NUMBER DEFAULT NULL
) AS
BEGIN
    INSERT INTO notifications (user_id, title, message, notification_type, related_job_id, related_application_id)
    VALUES (p_user_id, p_title, p_message, p_notification_type, p_related_job_id, p_related_application_id);
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

-- Function to get job application count
CREATE OR REPLACE FUNCTION fn_get_job_application_count(p_job_id IN NUMBER)
RETURN NUMBER AS
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM applications 
    WHERE job_id = p_job_id;
    
    RETURN v_count;
EXCEPTION
    WHEN OTHERS THEN
        RETURN 0;
END;
/

-- Function to get user's unread notification count
CREATE OR REPLACE FUNCTION fn_get_unread_notification_count(p_user_id IN NUMBER)
RETURN NUMBER AS
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM notifications 
    WHERE user_id = p_user_id AND is_read = 0;
    
    RETURN v_count;
EXCEPTION
    WHEN OTHERS THEN
        RETURN 0;
END;
/

-- Procedure to mark notifications as read
CREATE OR REPLACE PROCEDURE sp_mark_notifications_read(
    p_user_id IN NUMBER,
    p_notification_ids IN VARCHAR2 DEFAULT NULL -- Comma-separated IDs, NULL for all
) AS
BEGIN
    IF p_notification_ids IS NULL THEN
        -- Mark all unread notifications as read
        UPDATE notifications 
        SET is_read = 1
        WHERE user_id = p_user_id AND is_read = 0;
    ELSE
        -- Mark specific notifications as read
        UPDATE notifications 
        SET is_read = 1
        WHERE user_id = p_user_id 
        AND notification_id IN (
            SELECT TO_NUMBER(TRIM(REGEXP_SUBSTR(p_notification_ids, '[^,]+', 1, LEVEL)))
            FROM dual
            CONNECT BY REGEXP_SUBSTR(p_notification_ids, '[^,]+', 1, LEVEL) IS NOT NULL
        );
    END IF;
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

-- Function to calculate worker success rate
CREATE OR REPLACE FUNCTION fn_get_worker_success_rate(p_worker_id IN NUMBER)
RETURN NUMBER AS
    v_total_jobs NUMBER;
    v_completed_jobs NUMBER;
    v_success_rate NUMBER;
BEGIN
    -- Get total assigned jobs
    SELECT COUNT(*) INTO v_total_jobs
    FROM jobs 
    WHERE assigned_worker_id = p_worker_id;
    
    IF v_total_jobs = 0 THEN
        RETURN 0;
    END IF;
    
    -- Get completed jobs
    SELECT COUNT(*) INTO v_completed_jobs
    FROM jobs j
    JOIN job_status js ON j.status_id = js.status_id
    WHERE j.assigned_worker_id = p_worker_id 
    AND js.status_name IN ('completed', 'verified', 'closed');
    
    v_success_rate := (v_completed_jobs / v_total_jobs) * 100;
    
    RETURN ROUND(v_success_rate, 1);
EXCEPTION
    WHEN OTHERS THEN
        RETURN 0;
END;
/

-- Procedure to get dashboard statistics for any user
CREATE OR REPLACE PROCEDURE sp_get_dashboard_stats(
    p_user_id IN NUMBER,
    p_user_type IN VARCHAR2,
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    IF p_user_type = 'citizen' THEN
        OPEN p_cursor FOR
        SELECT 
            'total_jobs' as metric,
            COUNT(*) as value
        FROM jobs 
        WHERE citizen_id = p_user_id
        UNION ALL
        SELECT 
            'open_jobs' as metric,
            COUNT(*) as value
        FROM jobs j
        JOIN job_status js ON j.status_id = js.status_id
        WHERE j.citizen_id = p_user_id AND js.status_name = 'open'
        UNION ALL
        SELECT 
            'completed_jobs' as metric,
            COUNT(*) as value
        FROM jobs j
        JOIN job_status js ON j.status_id = js.status_id
        WHERE j.citizen_id = p_user_id AND js.status_name IN ('completed', 'verified', 'closed');
        
    ELSIF p_user_type = 'worker' THEN
        OPEN p_cursor FOR
        SELECT 
            'total_applications' as metric,
            COUNT(*) as value
        FROM applications 
        WHERE worker_id = p_user_id
        UNION ALL
        SELECT 
            'accepted_applications' as metric,
            COUNT(*) as value
        FROM applications a
        JOIN application_status ast ON a.status_id = ast.status_id
        WHERE a.worker_id = p_user_id AND ast.status_name = 'accepted'
        UNION ALL
        SELECT 
            'completed_jobs' as metric,
            COUNT(*) as value
        FROM jobs j
        JOIN job_status js ON j.status_id = js.status_id
        WHERE j.assigned_worker_id = p_user_id AND js.status_name IN ('completed', 'verified', 'closed');
        
    ELSIF p_user_type = 'admin' THEN
        OPEN p_cursor FOR
        SELECT 
            'total_users' as metric,
            COUNT(*) as value
        FROM users
        UNION ALL
        SELECT 
            'pending_applications' as metric,
            COUNT(*) as value
        FROM applications a
        JOIN application_status ast ON a.status_id = ast.status_id
        WHERE ast.status_name = 'submitted'
        UNION ALL
        SELECT 
            'pending_verifications' as metric,
            COUNT(*) as value
        FROM job_proofs 
        WHERE verification_status = 'pending';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
/

COMMIT;