-- LocalFix Database Stored Procedures
-- Save as: database/migrations/015_stored_procedures.sql

-- Procedure to accept an application and assign worker to job
CREATE OR REPLACE PROCEDURE sp_accept_application(
    p_application_id IN NUMBER,
    p_reviewed_by IN NUMBER
) AS
    v_job_id NUMBER;
    v_worker_id NUMBER;
    v_citizen_id NUMBER;
BEGIN
    -- Get application details
    SELECT job_id, worker_id INTO v_job_id, v_worker_id
    FROM applications 
    WHERE application_id = p_application_id;
    
    -- Get citizen_id for notification
    SELECT citizen_id INTO v_citizen_id
    FROM jobs 
    WHERE job_id = v_job_id;
    
    -- Update application status to accepted
    UPDATE applications 
    SET status_id = 3, reviewed_by = p_reviewed_by, reviewed_at = CURRENT_TIMESTAMP
    WHERE application_id = p_application_id;
    
    -- The trigger will handle updating job status and rejecting other applications
    
    -- Send notification to worker
    INSERT INTO notifications (user_id, title, message, notification_type, related_application_id)
    VALUES (v_worker_id, 'Application Accepted', 'Congratulations! Your application has been accepted.', 'application_update', p_application_id);
    
    -- Send notification to citizen
    INSERT INTO notifications (user_id, title, message, notification_type, related_job_id)
    VALUES (v_citizen_id, 'Worker Assigned', 'A worker has been assigned to your job.', 'job_update', v_job_id);
    
    COMMIT;
    
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

-- Procedure to complete a job and create payment record
CREATE OR REPLACE PROCEDURE sp_complete_job(
    p_job_id IN NUMBER,
    p_worker_id IN NUMBER,
    p_proof_description IN CLOB,
    p_proof_photo IN VARCHAR2 DEFAULT NULL
) AS
    v_citizen_id NUMBER;
    v_amount NUMBER;
BEGIN
    -- Get job details
    SELECT citizen_id, estimated_budget INTO v_citizen_id, v_amount
    FROM jobs 
    WHERE job_id = p_job_id AND assigned_worker_id = p_worker_id;
    
    -- Insert job proof
    INSERT INTO job_proofs (job_id, worker_id, proof_description, proof_photo)
    VALUES (p_job_id, p_worker_id, p_proof_description, p_proof_photo);
    
    -- Create payment record
    INSERT INTO payments (job_id, citizen_id, worker_id, amount, payment_status)
    VALUES (p_job_id, v_citizen_id, p_worker_id, v_amount, 'pending');
    
    -- The trigger will handle updating job status
    
    -- Send notification to citizen
    INSERT INTO notifications (user_id, title, message, notification_type, related_job_id)
    VALUES (v_citizen_id, 'Job Completed', 'Your job has been completed. Please verify and make payment.', 'job_update', p_job_id);
    
    COMMIT;
    
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

-- Procedure to verify job proof
CREATE OR REPLACE PROCEDURE sp_verify_job_proof(
    p_proof_id IN NUMBER,
    p_admin_id IN NUMBER,
    p_verification_status IN VARCHAR2,
    p_admin_feedback IN CLOB DEFAULT NULL
) AS
    v_job_id NUMBER;
    v_worker_id NUMBER;
    v_citizen_id NUMBER;
BEGIN
    -- Get proof details
    SELECT job_id, worker_id INTO v_job_id, v_worker_id
    FROM job_proofs 
    WHERE proof_id = p_proof_id;
    
    -- Get citizen_id
    SELECT citizen_id INTO v_citizen_id
    FROM jobs 
    WHERE job_id = v_job_id;
    
    -- Update proof verification
    UPDATE job_proofs 
    SET verified_by = p_admin_id, 
        verified_at = CURRENT_TIMESTAMP,
        verification_status = p_verification_status,
        admin_feedback = p_admin_feedback
    WHERE proof_id = p_proof_id;
    
    -- The trigger will handle updating job status if approved
    
    -- Send notifications
    IF p_verification_status = 'approved' THEN
        INSERT INTO notifications (user_id, title, message, notification_type, related_job_id)
        VALUES (v_worker_id, 'Job Verified', 'Your job completion has been verified and approved.', 'job_update', v_job_id);
        
        INSERT INTO notifications (user_id, title, message, notification_type, related_job_id)
        VALUES (v_citizen_id, 'Job Verified', 'The job has been verified. Please proceed with payment.', 'payment', v_job_id);
    ELSE
        INSERT INTO notifications (user_id, title, message, notification_type, related_job_id)
        VALUES (v_worker_id, 'Job Verification Failed', 'Your job completion proof was rejected. Please resubmit.', 'job_update', v_job_id);
    END IF;
    
    COMMIT;
    
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

-- Procedure to process payment
CREATE OR REPLACE PROCEDURE sp_process_payment(
    p_payment_id IN NUMBER,
    p_payment_method IN VARCHAR2,
    p_transaction_id IN VARCHAR2 DEFAULT NULL
) AS
    v_job_id NUMBER;
    v_worker_id NUMBER;
    v_amount NUMBER;
BEGIN
    -- Get payment details
    SELECT job_id, worker_id, amount INTO v_job_id, v_worker_id, v_amount
    FROM payments 
    WHERE payment_id = p_payment_id;
    
    -- Update payment status
    UPDATE payments 
    SET payment_status = 'completed',
        payment_method = p_payment_method,
        transaction_id = p_transaction_id,
        payment_date = CURRENT_TIMESTAMP
    WHERE payment_id = p_payment_id;
    
    -- The trigger will handle updating job status to closed
    
    -- Send notification to worker
    INSERT INTO notifications (user_id, title, message, notification_type, related_job_id)
    VALUES (v_worker_id, 'Payment Received', 'You have received payment of ' || v_amount || ' Taka for your completed job.', 'payment', v_job_id);
    
    COMMIT;
    
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

-- Function to get worker average rating
CREATE OR REPLACE FUNCTION fn_get_worker_rating(p_worker_id IN NUMBER)
RETURN NUMBER AS
    v_avg_rating NUMBER;
BEGIN
    SELECT NVL(AVG(rating), 0) INTO v_avg_rating
    FROM ratings 
    WHERE worker_id = p_worker_id;
    
    RETURN ROUND(v_avg_rating, 1);
EXCEPTION
    WHEN OTHERS THEN
        RETURN 0;
END;
/

-- Function to check if user can apply to job
CREATE OR REPLACE FUNCTION fn_can_apply_to_job(
    p_worker_id IN NUMBER,
    p_job_id IN NUMBER
) RETURN NUMBER AS
    v_existing_application NUMBER;
    v_job_status VARCHAR2(50);
    v_citizen_id NUMBER;
BEGIN
    -- Check if job is open
    SELECT js.status_name, j.citizen_id INTO v_job_status, v_citizen_id
    FROM jobs j
    JOIN job_status js ON j.status_id = js.status_id
    WHERE j.job_id = p_job_id;
    
    -- Can't apply to own job (if worker is also citizen)
    IF v_citizen_id = p_worker_id THEN
        RETURN 0;
    END IF;
    
    -- Can only apply to open jobs
    IF v_job_status != 'open' THEN
        RETURN 0;
    END IF;
    
    -- Check if already applied
    SELECT COUNT(*) INTO v_existing_application
    FROM applications 
    WHERE job_id = p_job_id AND worker_id = p_worker_id;
    
    IF v_existing_application > 0 THEN
        RETURN 0; -- Already applied
    END IF;
    
    RETURN 1; -- Can apply
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN 0;
END;
/

COMMIT;