-- LocalFix Database Seed Data
-- Save as: database/migrations/014_seed_data.sql

-- Insert sample citizens
INSERT INTO users (name, email, phone, address, password, user_type) VALUES
('Rahul Ahmed', 'rahul@example.com', '01711111111', 'House 15, Road 3, Dhanmondi, Dhaka', '$2a$10$hashedpassword1', 'citizen');

INSERT INTO users (name, email, phone, address, password, user_type) VALUES
('Fatima Khan', 'fatima@example.com', '01722222222', 'Flat 4B, Gulshan Avenue, Dhaka', '$2a$10$hashedpassword2', 'citizen');

INSERT INTO users (name, email, phone, address, password, user_type) VALUES
('Karim Hassan', 'karim@example.com', '01733333333', 'House 25, Sector 7, Uttara, Dhaka', '$2a$10$hashedpassword3', 'citizen');

-- Insert sample workers
INSERT INTO users (name, email, phone, address, password, user_type) VALUES
('Mohammad Electrician', 'electrician@example.com', '01744444444', 'Mirpur, Dhaka', '$2a$10$hashedpassword4', 'worker');

INSERT INTO users (name, email, phone, address, password, user_type) VALUES
('Nasir Plumber', 'plumber@example.com', '01755555555', 'Tejgaon, Dhaka', '$2a$10$hashedpassword5', 'worker');

INSERT INTO users (name, email, phone, address, password, user_type) VALUES
('Ravi Mechanic', 'mechanic@example.com', '01766666666', 'Wari, Dhaka', '$2a$10$hashedpassword6', 'worker');

-- Insert sample jobs
INSERT INTO jobs (citizen_id, issue_id, location_id, job_title, job_description, estimated_budget, deadline, status_id) 
SELECT 
    (SELECT user_id FROM users WHERE email = 'rahul@example.com'),
    1, -- Broken Road issue
    1, -- Dhanmondi location
    'Fix Broken Road in Front of House',
    'There is a big pothole in front of my house that needs immediate repair. It becomes dangerous during rain.',
    5000.00,
    SYSDATE + 7, -- 7 days from now
    1 -- Open status
FROM dual;

INSERT INTO jobs (citizen_id, issue_id, location_id, job_title, job_description, estimated_budget, deadline, status_id) 
SELECT 
    (SELECT user_id FROM users WHERE email = 'fatima@example.com'),
    2, -- Street Light issue
    2, -- Gulshan location
    'Repair Non-Working Street Light',
    'The street light outside our building has not been working for 2 weeks. Need urgent repair for safety.',
    3000.00,
    SYSDATE + 5, -- 5 days from now
    1 -- Open status
FROM dual;

INSERT INTO jobs (citizen_id, issue_id, location_id, job_title, job_description, estimated_budget, deadline, status_id) 
SELECT 
    (SELECT user_id FROM users WHERE email = 'karim@example.com'),
    3, -- Water Leakage issue
    3, -- Uttara location
    'Fix Water Pipe Leakage',
    'Water pipe under the road is leaking, creating waterlogging problem.',
    4000.00,
    SYSDATE + 10, -- 10 days from now
    1 -- Open status
FROM dual;

-- Insert sample applications
INSERT INTO applications (job_id, worker_id, estimated_cost, estimated_time, proposal_description, status_id)
SELECT 
    (SELECT job_id FROM jobs WHERE job_title = 'Fix Broken Road in Front of House'),
    (SELECT user_id FROM users WHERE email = 'mechanic@example.com'),
    4500.00,
    '2-3 days',
    'I have 5 years experience in road repair. I can fix this pothole using quality materials and ensure it lasts long.',
    1 -- Submitted
FROM dual;

INSERT INTO applications (job_id, worker_id, estimated_cost, estimated_time, proposal_description, status_id)
SELECT 
    (SELECT job_id FROM jobs WHERE job_title = 'Repair Non-Working Street Light'),
    (SELECT user_id FROM users WHERE email = 'electrician@example.com'),
    2800.00,
    '1 day',
    'I am a certified electrician with 8 years experience. I can fix this street light issue quickly and safely.',
    1 -- Submitted
FROM dual;

-- Insert sample worker skills
INSERT INTO worker_skills (worker_id, skill_name, experience_level, years_experience)
SELECT user_id, 'Electrical Work', 'advanced', 8 FROM users WHERE email = 'electrician@example.com';

INSERT INTO worker_skills (worker_id, skill_name, experience_level, years_experience)
SELECT user_id, 'Street Light Repair', 'expert', 8 FROM users WHERE email = 'electrician@example.com';

INSERT INTO worker_skills (worker_id, skill_name, experience_level, years_experience)
SELECT user_id, 'Plumbing', 'advanced', 6 FROM users WHERE email = 'plumber@example.com';

INSERT INTO worker_skills (worker_id, skill_name, experience_level, years_experience)
SELECT user_id, 'Water System Repair', 'intermediate', 6 FROM users WHERE email = 'plumber@example.com';

INSERT INTO worker_skills (worker_id, skill_name, experience_level, years_experience)
SELECT user_id, 'Road Repair', 'intermediate', 5 FROM users WHERE email = 'mechanic@example.com';

INSERT INTO worker_skills (worker_id, skill_name, experience_level, years_experience)
SELECT user_id, 'Construction', 'advanced', 5 FROM users WHERE email = 'mechanic@example.com';

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, notification_type, related_job_id)
SELECT 
    (SELECT user_id FROM users WHERE email = 'rahul@example.com'),
    'New Application Received',
    'A worker has applied to your job: Fix Broken Road in Front of House',
    'application_update',
    (SELECT job_id FROM jobs WHERE job_title = 'Fix Broken Road in Front of House')
FROM dual;

INSERT INTO notifications (user_id, title, message, notification_type, related_application_id)
SELECT 
    (SELECT user_id FROM users WHERE email = 'electrician@example.com'),
    'Application Submitted',
    'Your application for street light repair has been submitted successfully',
    'application_update',
    (SELECT application_id FROM applications WHERE worker_id = (SELECT user_id FROM users WHERE email = 'electrician@example.com') AND ROWNUM = 1)
FROM dual;

COMMIT;