-- Corrected Seed Data for Issue Management System
-- This version follows the logical workflow enforced by database triggers.

-- ##################################################################
-- 1. SEED USERS AND LOCATIONS (No changes from original)
-- ##################################################################

-- Seed data for users table
-- Admin users
INSERT INTO users (name, email, phone, address, hashed_pass, user_type, status) VALUES
('Admin Khan', 'admin.khan@govt.bd', '01711111111', 'Secretariat Building, Dhaka-1000', '$2b$10$hashedpassword1', 'admin', 'active');
INSERT INTO users (name, email, phone, address, hashed_pass, user_type, status) VALUES
('Sarah Ahmed', 'sarah.ahmed@govt.bd', '01722222222', 'City Corporation Office, Chittagong-4000', '$2b$10$hashedpassword2', 'admin', 'active');
INSERT INTO users (name, email, phone, address, hashed_pass, user_type, status) VALUES
('Rafiq Hasan', 'rafiq.hasan@govt.bd', '01733333333', 'Municipal Office, Sylhet-3100', '$2b$10$hashedpassword3', 'admin', 'active');
-- Worker users
INSERT INTO users (name, email, phone, address, hashed_pass, user_type, status) VALUES
('Karim Ullah', 'karim.worker@gmail.com', '01811111111', 'Wari, Dhaka-1203', '$2b$10$hashedpassword4', 'worker', 'active');
INSERT INTO users (name, email, phone, address, hashed_pass, user_type, status) VALUES
('Fatima Begum', 'fatima.plumber@gmail.com', '01822222222', 'Dhanmondi, Dhaka-1205', '$2b$10$hashedpassword5', 'worker', 'active');
INSERT INTO users (name, email, phone, address, hashed_pass, user_type, status) VALUES
('Rashed Ali', 'rashed.electric@gmail.com', '01833333333', 'Mirpur, Dhaka-1216', '$2b$10$hashedpassword6', 'worker', 'active');
INSERT INTO users (name, email, phone, address, hashed_pass, user_type, status) VALUES
('Nasir Ahmed', 'nasir.road@gmail.com', '01844444444', 'Gulshan, Dhaka-1212', '$2b$10$hashedpassword7', 'worker', 'active');
INSERT INTO users (name, email, phone, address, hashed_pass, user_type, status) VALUES
('Rubina Khatun', 'rubina.cleaner@gmail.com', '01855555555', 'Uttara, Dhaka-1230', '$2b$10$hashedpassword8', 'worker', 'active');
INSERT INTO users (name, email, phone, address, hashed_pass, user_type, status) VALUES
('Aminul Islam', 'aminul.mason@gmail.com', '01866666666', 'Banani, Dhaka-1213', '$2b$10$hashedpassword9', 'worker', 'active');
INSERT INTO users (name, email, phone, address, hashed_pass, user_type, status) VALUES
('Shamsul Hoque', 'shamsul.gardener@gmail.com', '01877777777', 'Farmgate, Dhaka-1215', '$2b$10$hashedpassword10', 'worker', 'active');
-- Citizen users
INSERT INTO users (name, email, phone, address, hashed_pass, user_type, status) VALUES
('Mohammad Rahman', 'rahman.citizen@gmail.com', '01911111111', 'House 15, Road 7, Dhanmondi, Dhaka-1205', '$2b$10$hashedpassword11', 'citizen', 'active');
INSERT INTO users (name, email, phone, address, hashed_pass, user_type, status) VALUES
('Ayesha Siddique', 'ayesha.s@gmail.com', '01922222222', 'Flat 3A, Building 12, Gulshan-2, Dhaka-1212', '$2b$10$hashedpassword12', 'citizen', 'active');
INSERT INTO users (name, email, phone, address, hashed_pass, user_type, status) VALUES
('Tareq Hassan', 'tareq.h@gmail.com', '01933333333', 'House 25, Sector 4, Uttara, Dhaka-1230', '$2b$10$hashedpassword13', 'citizen', 'active');
INSERT INTO users (name, email, phone, address, hashed_pass, user_type, status) VALUES
('Nasreen Akter', 'nasreen.a@gmail.com', '01944444444', 'Village: Savar, Post: Savar, Dhaka-1340', '$2b$10$hashedpassword14', 'citizen', 'active');
INSERT INTO users (name, email, phone, address, hashed_pass, user_type, status) VALUES
('Selim Reza', 'selim.reza@gmail.com', '01955555555', 'House 8, Lane 3, Wari, Dhaka-1203', '$2b$10$hashedpassword15', 'citizen', 'active');
INSERT INTO users (name, email, phone, address, hashed_pass, user_type, status) VALUES
('Mahmuda Begum', 'mahmuda.b@gmail.com', '01966666666', 'Apartment 2B, Banani DOHS, Dhaka-1213', '$2b$10$hashedpassword16', 'citizen', 'active');
INSERT INTO users (name, email, phone, address, hashed_pass, user_type, status) VALUES
('Jahangir Alam', 'jahangir.a@gmail.com', '01977777777', 'House 45, Road 11, Mirpur-10, Dhaka-1216', '$2b$10$hashedpassword17', 'citizen', 'active');
INSERT INTO users (name, email, phone, address, hashed_pass, user_type, status) VALUES
('Rashida Khatun', 'rashida.k@gmail.com', '01988888888', 'Village: Keraniganj, Post: Keraniganj, Dhaka-1310', '$2b$10$hashedpassword18', 'citizen', 'active');

-- Seed data for locations table
INSERT INTO locations (upazila, district, full_address, latitude, longitude) VALUES ('Dhaka Sadar', 'Dhaka', 'Ramna Park Area, Dhaka Sadar, Dhaka', 23.7275, 90.4065);
INSERT INTO locations (upazila, district, full_address, latitude, longitude) VALUES ('Dhanmondi', 'Dhaka', 'Dhanmondi Residential Area, Dhaka', 23.7465, 90.3765);
INSERT INTO locations (upazila, district, full_address, latitude, longitude) VALUES ('Gulshan', 'Dhaka', 'Gulshan Circle-2, Dhaka', 23.7925, 90.4175);
INSERT INTO locations (upazila, district, full_address, latitude, longitude) VALUES ('Mirpur', 'Dhaka', 'Mirpur-10 Roundabout, Dhaka', 23.8000, 90.3535);
INSERT INTO locations (upazila, district, full_address, latitude, longitude) VALUES ('Uttara', 'Dhaka', 'Uttara Sector-4, Dhaka', 23.8759, 90.3795);
INSERT INTO locations (upazila, district, full_address, latitude, longitude) VALUES ('Wari', 'Dhaka', 'Wari Residential Area, Dhaka', 23.7185, 90.4285);
INSERT INTO locations (upazila, district, full_address, latitude, longitude) VALUES ('Banani', 'Dhaka', 'Banani Commercial Area, Dhaka', 23.7939, 90.4044);
INSERT INTO locations (upazila, district, full_address, latitude, longitude) VALUES ('Farmgate', 'Dhaka', 'Farmgate Intersection, Dhaka', 23.7586, 90.3897);
INSERT INTO locations (upazila, district, full_address, latitude, longitude) VALUES ('Savar', 'Dhaka', 'Savar Municipality Area, Dhaka', 23.8583, 90.2667);
INSERT INTO locations (upazila, district, full_address, latitude, longitude) VALUES ('Keraniganj', 'Dhaka', 'Keraniganj Municipality, Dhaka', 23.6853, 90.3742);
INSERT INTO locations (upazila, district, full_address, latitude, longitude) VALUES ('Panchlaish', 'Chittagong', 'Panchlaish Residential Area, Chittagong', 22.3569, 91.7832);
INSERT INTO locations (upazila, district, full_address, latitude, longitude) VALUES ('Kotwali', 'Chittagong', 'Kotwali Police Station Area, Chittagong', 22.3475, 91.8123);
INSERT INTO locations (upazila, district, full_address, latitude, longitude) VALUES ('Sylhet Sadar', 'Sylhet', 'Sylhet City Center, Sylhet', 24.8949, 91.8687);
INSERT INTO locations (upazila, district, full_address, latitude, longitude) VALUES ('South Surma', 'Sylhet', 'South Surma Area, Sylhet', 24.8607, 91.8735);
INSERT INTO locations (upazila, district, full_address, latitude, longitude) VALUES ('Bogura Sadar', 'Bogura', 'Bogura Town Center, Bogura', 24.8465, 89.3778);

-- ##################################################################
-- 2. SEED ISSUES (All issues start as 'submitted')
-- ##################################################################
INSERT INTO issues (citizen_id, title, description, category, priority, location_id, image_url, status) VALUES (11, 'Broken Street Light on Road 7', 'The street light on Road 7, Dhanmondi has been broken for 2 weeks. It creates safety issues during night time.', 'Infrastructure', 'high', 2, 'https://example.com/images/broken_streetlight1.jpg', 'submitted');
INSERT INTO issues (citizen_id, title, description, category, priority, location_id, image_url, status) VALUES (12, 'Water Pipe Leakage in Gulshan-2', 'Major water pipe leakage causing road flooding near Building 12, Gulshan-2. Urgent repair needed.', 'Water & Sanitation', 'urgent', 3, 'https://example.com/images/water_leak1.jpg', 'submitted');
INSERT INTO issues (citizen_id, title, description, category, priority, location_id, image_url, status) VALUES (13, 'Garbage Collection Issue in Uttara', 'Garbage has not been collected for 5 days in Sector 4, Uttara. Creating health hazards.', 'Waste Management', 'high', 5, 'https://example.com/images/garbage1.jpg', 'submitted');
INSERT INTO issues (citizen_id, title, description, category, priority, location_id, image_url, status) VALUES (14, 'Damaged Road in Savar', 'Main road in Savar has multiple potholes making transportation difficult.', 'Roads & Transport', 'medium', 9, 'https://example.com/images/pothole1.jpg', 'submitted');
INSERT INTO issues (citizen_id, title, description, category, priority, location_id, image_url, status) VALUES (15, 'Blocked Drain in Wari', 'Drainage system blocked in Lane 3, Wari causing water logging during rain.', 'Water & Sanitation', 'high', 6, 'https://example.com/images/blocked_drain1.jpg', 'submitted');
INSERT INTO issues (citizen_id, title, description, category, priority, location_id, image_url, status) VALUES (16, 'Park Maintenance in Banani DOHS', 'Park area needs grass cutting and tree pruning in Banani DOHS.', 'Parks & Recreation', 'low', 7, 'https://example.com/images/park1.jpg', 'submitted');
INSERT INTO issues (citizen_id, title, description, category, priority, location_id, image_url, status) VALUES (17, 'Traffic Signal Malfunction in Mirpur', 'Traffic signal not working properly at Mirpur-10 roundabout causing traffic jam.', 'Traffic Management', 'urgent', 4, 'https://example.com/images/traffic_signal1.jpg', 'submitted');
INSERT INTO issues (citizen_id, title, description, category, priority, location_id, image_url, status) VALUES (18, 'Street Cleaning in Keraniganj', 'Streets need regular cleaning in Keraniganj municipality area.', 'Cleanliness', 'medium', 10, 'https://example.com/images/dirty_street1.jpg', 'submitted');
INSERT INTO issues (citizen_id, title, description, category, priority, location_id, image_url, status) VALUES (11, 'Electricity Issue in Ramna Park', 'Frequent power outages in Ramna Park area affecting residents.', 'Utilities', 'high', 1, 'https://example.com/images/power_outage1.jpg', 'submitted');
INSERT INTO issues (citizen_id, title, description, category, priority, location_id, image_url, status) VALUES (13, 'Sidewalk Repair Needed', 'Broken sidewalk in Uttara Sector-4 creating walking difficulties.', 'Infrastructure', 'medium', 5, 'https://example.com/images/sidewalk1.jpg', 'submitted');

-- ##################################################################
-- 3. WORKERS SUBMIT APPLICATIONS
-- ##################################################################
-- Note: Manually updating issue status to 'applied' after applications are inserted.
INSERT INTO applications (issue_id, worker_id, estimated_cost, estimated_time, proposal_description, applied_at) VALUES (1, 6, 2500.00, '2 days', 'I will replace the broken street light with LED fixture and check electrical connections. I have 5 years experience in electrical work.', CURRENT_TIMESTAMP - 2);
INSERT INTO applications (issue_id, worker_id, estimated_cost, estimated_time, proposal_description, applied_at) VALUES (1, 4, 3000.00, '1 day', 'Quick street light repair with quality materials. Will test all connections and provide 6 months warranty.', CURRENT_TIMESTAMP - 1);
UPDATE issues SET status = 'applied' WHERE issue_id = 1;

INSERT INTO applications (issue_id, worker_id, estimated_cost, estimated_time, proposal_description, applied_at) VALUES (2, 5, 1500.00, '4 hours', 'Emergency water pipe repair using high-grade PVC pipes. I specialize in plumbing and have emergency repair kit ready.', CURRENT_TIMESTAMP - 3);
INSERT INTO applications (issue_id, worker_id, estimated_cost, estimated_time, proposal_description, applied_at) VALUES (2, 9, 1800.00, '6 hours', 'Complete pipe replacement with waterproofing. Will ensure no future leakage in this area.', CURRENT_TIMESTAMP - 2);
UPDATE issues SET status = 'applied' WHERE issue_id = 2;

INSERT INTO applications (issue_id, worker_id, estimated_cost, estimated_time, proposal_description, applied_at) VALUES (3, 8, 800.00, '1 day', 'Immediate garbage collection with proper disposal. I have waste management certification.', CURRENT_TIMESTAMP - 4);
INSERT INTO applications (issue_id, worker_id, estimated_cost, estimated_time, proposal_description, applied_at) VALUES (3, 7, 1000.00, '2 days', 'Complete area cleaning and garbage collection with sanitization.', CURRENT_TIMESTAMP - 4);
UPDATE issues SET status = 'applied' WHERE issue_id = 3;

INSERT INTO applications (issue_id, worker_id, estimated_cost, estimated_time, proposal_description, applied_at) VALUES (4, 4, 15000.00, '1 week', 'Professional road repair with quality asphalt. Will fix all potholes and ensure smooth surface.', CURRENT_TIMESTAMP - 5);
INSERT INTO applications (issue_id, worker_id, estimated_cost, estimated_time, proposal_description, applied_at) VALUES (4, 7, 18000.00, '10 days', 'Complete road reconstruction with proper drainage system.', CURRENT_TIMESTAMP - 5);
UPDATE issues SET status = 'applied' WHERE issue_id = 4;

-- Insert dummy applications for issues 5, 6, 7, 8 to allow assignment
INSERT INTO applications (issue_id, worker_id, estimated_cost, estimated_time, proposal_description) VALUES (5, 5, 2000.00, '1 day', 'Drain cleaning expert, ready to start.');
UPDATE issues SET status = 'applied' WHERE issue_id = 5;
INSERT INTO applications (issue_id, worker_id, estimated_cost, estimated_time, proposal_description) VALUES (6, 8, 1200.00, '1 day', 'Park maintenance and cleaning services.');
UPDATE issues SET status = 'applied' WHERE issue_id = 6;

-- ##################################################################
-- 4. ADMINS REVIEW APPLICATIONS (This assigns workers and updates issue status to 'assigned')
-- ##################################################################
UPDATE applications SET status = 'accepted', reviewed_by = 1 WHERE issue_id = 3 AND worker_id = 8;
UPDATE applications SET status = 'accepted', reviewed_by = 2 WHERE issue_id = 4 AND worker_id = 4;
UPDATE applications SET status = 'accepted', reviewed_by = 1 WHERE issue_id = 5 AND worker_id = 5;
UPDATE applications SET status = 'accepted', reviewed_by = 1 WHERE issue_id = 6 AND worker_id = 8;

-- In case triggers are not yet loaded, explicitly set assignment on issues
UPDATE issues SET status = 'assigned', assigned_worker_id = 8 WHERE issue_id = 3;
UPDATE issues SET status = 'assigned', assigned_worker_id = 4 WHERE issue_id = 4;
UPDATE issues SET status = 'assigned', assigned_worker_id = 5 WHERE issue_id = 5;
UPDATE issues SET status = 'assigned', assigned_worker_id = 8 WHERE issue_id = 6;

-- ##################################################################
-- 5. WORKERS START WORK & SUBMIT PROOF
-- ##################################################################
-- For issue 5, worker starts the job.
UPDATE issues SET status = 'in_progress' WHERE issue_id = 5;

-- For issue 6, worker submits proof. The trigger moves the issue to 'under_review'.
INSERT INTO issue_proofs (issue_id, worker_id, proof_photo, proof_description, submitted_at) VALUES (6, 8, 'https://example.com/proofs/park_after1.jpg', 'Park maintenance completed. Grass cut, trees pruned, and area cleaned. Before and after photos attached showing significant improvement.', CURRENT_TIMESTAMP - 1);

-- ##################################################################
-- 6. ADMIN REVIEWS & APPROVES PROOF (Issue 6 becomes 'resolved')
-- ##################################################################
-- Admin (user_id = 1) approves the submitted proof for issue 6
UPDATE issue_proofs
SET verification_status = 'approved',
	admin_feedback = 'Verified. Good work and clean finish.',
	verified_by = 1,
	verified_at = CURRENT_TIMESTAMP
WHERE issue_id = 6;

-- After approval, the trigger updates the related issue (issue_id = 6) status to 'resolved'.

-- ##################################################################
-- 7. ADMIN SENDS PAYOUT FOR RESOLVED ISSUE (Issue 6 becomes 'closed')
-- ##################################################################
-- We pay the worker based on the accepted application for issue 6.
-- From applications: (issue_id=6, worker_id=8) estimated_cost = 1200.00
INSERT INTO payments (issue_id, citizen_id, worker_id, amount, payment_method, payment_status, transaction_id, payment_date)
VALUES (6, 16, 8, 1200.00, 'bkash', 'completed', 'BKASH-TEST-0001', CURRENT_TIMESTAMP);

-- Payment trigger sets issue (issue_id = 6) status to 'closed'.

-- ##################################################################
-- 8. OPTIONAL: WORKER WITHDRAWAL (partial cashout from balance)
-- ##################################################################
-- Worker 8 requests a withdrawal against their earnings
INSERT INTO withdrawals (worker_id, method, account_number, amount, status, requested_at)
VALUES (8, 'bkash', '01877777777', 500.00, 'processing', CURRENT_TIMESTAMP);

-- ##################################################################
-- 9. OPTIONAL: CITIZEN RATING FOR COMPLETED ISSUE
-- ##################################################################
-- Citizen 16 rates the worker 8 for issue 6
INSERT INTO ratings (issue_id, citizen_id, worker_id, rating, review_comment)
VALUES (6, 16, 8, 4.5, 'Great job! Park looks much better now.');

-- ##################################################################
-- 10. COMMIT
-- ##################################################################
COMMIT;