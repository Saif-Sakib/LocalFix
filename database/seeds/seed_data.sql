--  1. Inserting into locations table
INSERT INTO locations (location_id, upazila, district, full_address, latitude, longitude) VALUES (1, 'Mirpur', 'Dhaka', '123 Road, Section 10, Mirpur, Dhaka', 23.8069, 90.3687);
INSERT INTO locations (location_id, upazila, district, full_address, latitude, longitude) VALUES (2, 'Gulshan', 'Dhaka', '456 Avenue, Gulshan 1, Dhaka', 23.7925, 90.4078);
INSERT INTO locations (location_id, upazila, district, full_address, latitude, longitude) VALUES (3, 'Dhanmondi', 'Dhaka', '789 Street, Road 32, Dhanmondi, Dhaka', 23.7465, 90.3760);

-- 2. Inserting into users table (citizens, workers, admin)
-- Citizens
INSERT INTO users (user_id, name, email, phone, address, password, user_type) VALUES (1, 'Karim Ahmed', 'karim.a@example.com', '01711111111', 'House 1, Mirpur, Dhaka', 'pass123', 'citizen');
INSERT INTO users (user_id, name, email, phone, address, password, user_type) VALUES (2, 'Fatima Begum', 'fatima.b@example.com', '01822222222', 'House 2, Gulshan, Dhaka', 'pass123', 'citizen');
-- Workers
INSERT INTO users (user_id, name, email, phone, address, password, user_type) VALUES (3, 'Rahim Sheikh', 'rahim.s@example.com', '01933333333', 'Worker Area 1, Dhaka', 'pass123', 'worker');
INSERT INTO users (user_id, name, email, phone, address, password, user_type) VALUES (4, 'Sultana Khatun', 'sultana.k@example.com', '01544444444', 'Worker Area 2, Dhaka', 'pass123', 'worker');
-- Admin
INSERT INTO users (user_id, name, email, phone, address, password, user_type) VALUES (5, 'Admin User', 'admin@example.com', '01655555555', 'Admin Office, Dhaka', 'adminpass', 'admin');

-- 3. Inserting into application_status lookup table
INSERT INTO application_status (status_id, status_name, description) VALUES (1, 'Submitted', 'The worker has submitted their application.');
INSERT INTO application_status (status_id, status_name, description) VALUES (2, 'Under Review', 'The application is being reviewed by an admin.');
INSERT INTO application_status (status_id, status_name, description) VALUES (3, 'Accepted', 'The application has been accepted and the worker is assigned.');
INSERT INTO application_status (status_id, status_name, description) VALUES (4, 'Rejected', 'The application was not selected.');

-- 4. Inserting into job_status lookup table
INSERT INTO job_status (status_id, status_name, description) VALUES (1, 'Open', 'Job is open and accepting applications.');
INSERT INTO job_status (status_id, status_name, description) VALUES (2, 'Assigned', 'A worker has been assigned to the job.');
INSERT INTO job_status (status_id, status_name, description) VALUES (3, 'In Progress', 'The assigned worker has started the job.');
INSERT INTO job_status (status_id, status_name, description) VALUES (4, 'Completed', 'The worker has submitted proof of completion.');
INSERT INTO job_status (status_id, status_name, description) VALUES (5, 'Verified', 'An admin has verified the job completion.');
INSERT INTO job_status (status_id, status_name, description) VALUES (6, 'Closed', 'The job is complete and closed.');

COMMIT;

-- 5. Inserting into issues table (created by citizens)
INSERT INTO issues (issue_id, citizen_id, title, description, category, priority, location_id) VALUES (1, 1, 'Broken streetlight on Main Road', 'The streetlight in front of House 1 has been out for a week, making the area unsafe at night.', 'Electrical', 'high', 1);
INSERT INTO issues (issue_id, citizen_id, title, description, category, priority, location_id, status) VALUES (2, 2, 'Large pothole needs fixing', 'A large and dangerous pothole has formed on the main avenue in Gulshan 1. It is a hazard to traffic.', 'Roadwork', 'urgent', 2, 'assigned');
INSERT INTO issues (issue_id, citizen_id, title, description, category, priority, location_id) VALUES (3, 1, 'Clogged drainage system', 'The drain on Road 32 in Dhanmondi is clogged, causing waterlogging after rain.', 'Plumbing', 'medium', 3);

-- 6. Inserting into jobs table (created from issues, initially 'Open')
INSERT INTO jobs (job_id, citizen_id, issue_id, location_id, job_title, job_description, estimated_budget, deadline, status_id) VALUES (1, 1, 1, 1, 'Repair Streetlight in Mirpur', 'Needs a certified electrician to repair or replace the broken streetlight.', 5000.00, TO_DATE('2025-09-15', 'YYYY-MM-DD'), 1);
INSERT INTO jobs (job_id, citizen_id, issue_id, location_id, job_title, job_description, estimated_budget, deadline, status_id) VALUES (2, 2, 2, 2, 'Fix Pothole in Gulshan', 'Requires asphalt and proper equipment to fill a large pothole and secure the road surface.', 15000.00, TO_DATE('2025-09-10', 'YYYY-MM-DD'), 1);
INSERT INTO jobs (job_id, citizen_id, issue_id, location_id, job_title, job_description, estimated_budget, deadline, status_id) VALUES (3, 1, 3, 3, 'Clear Clogged Drain', 'Heavy-duty cleaning needed for the main drainage line in Dhanmondi.', 8000.00, TO_DATE('2025-09-20', 'YYYY-MM-DD'), 1);

COMMIT;

-- 7. Inserting into applications table (workers applying for open jobs)
-- Application for Job 1
INSERT INTO applications (application_id, job_id, worker_id, estimated_cost, estimated_time, proposal_description, status_id) VALUES (1, 1, 3, 4800.00, '2 days', 'I am a certified electrician with 5 years of experience. I can fix this quickly.', 1);

-- Applications for Job 2
INSERT INTO applications (application_id, job_id, worker_id, estimated_cost, estimated_time, proposal_description, status_id) VALUES (2, 2, 4, 14500.00, '3 days', 'My team has all the necessary equipment for road repair. We can complete it within the deadline.', 1);
INSERT INTO applications (application_id, job_id, worker_id, estimated_cost, estimated_time, proposal_description, status_id) VALUES (3, 2, 3, 16000.00, '4 days', 'I can also handle roadwork, but it may take longer.', 1);

-- Application for Job 3
INSERT INTO applications (application_id, job_id, worker_id, estimated_cost, estimated_time, proposal_description, status_id) VALUES (4, 3, 4, 7500.00, '1 day', 'I have experience with municipal drainage systems and can clear the blockage efficiently.', 1);

COMMIT;

-- 8. SIMULATION: Admin accepts applications. This will now work without error.
-- Admin (user_id 5) accepts worker 3's application for job 1
UPDATE applications SET status_id = 3, reviewed_by = 5, reviewed_at = CURRENT_TIMESTAMP WHERE application_id = 1;

-- Admin (user_id 5) accepts worker 4's application for job 2 (this will also auto-reject application 3 for the same job)
UPDATE applications SET status_id = 3, reviewed_by = 5, reviewed_at = CURRENT_TIMESTAMP WHERE application_id = 2;

COMMIT;

-- 9. SIMULATION: Worker 4 starts and completes Job 2
-- First, update the job status to 'In Progress' manually
UPDATE jobs SET status_id = 3 WHERE job_id = 2;

-- Worker 4 submits proof of completion for Job 2.
-- This INSERT will trigger an update, setting the job status to 'Completed' (4).
INSERT INTO job_proofs (proof_id, job_id, worker_id, proof_photo, proof_description) VALUES (1, 2, 4, 'http://example.com/proofs/job2_proof.jpg', 'The pothole in Gulshan has been filled and the road is now smooth and safe for travel. See attached photo.');

COMMIT;

-- 10. SIMULATION: Admin verifies the submitted proof.
-- This UPDATE will trigger an update, setting the job status to 'Verified' (5).
UPDATE job_proofs SET verification_status = 'approved', verified_by = 5, admin_feedback = 'Excellent work. Payment will be processed.' WHERE proof_id = 1;

COMMIT;