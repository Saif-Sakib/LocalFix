# LocalFix — Oracle SQL Usage Report

This document summarizes where and why each type of Oracle SQL and PL/SQL construct is used in the LocalFix project. It is intended for DBMS sessional evaluation.

Note: Migrations actively used by the database are 000–008. We integrated a view and PL/SQL units into migration 008 to ensure they are part of the active schema.

## DDL: Users and Privileges

- File: `database/migrations/000_database_setup.sql`
  - CREATE USER local IDENTIFIED BY fix
  - GRANT CREATE SESSION, TABLE, SEQUENCE, TRIGGER, VIEW, PROCEDURE, UNLIMITED TABLESPACE
  - Rationale: minimal privileges required to create and manage app schema and stored programs needed by the app.

## DDL: Tables, Constraints, Indexes, Triggers

- File: `database/migrations/001_create_users_table.sql`
  - CREATE TABLE users (..., user_type CHECK, status CHECK)
  - Index: idx_users_type (on user_type)
  - Trigger: trg_users_updated_at (maintains updated_at)

- File: `database/migrations/002_create_locations_table.sql`
  - CREATE TABLE locations (..., latitude, longitude)
  - Indexes: idx_locations_district, idx_locations_upazila

- File: `database/migrations/003_create_issues_table.sql`
  - CREATE TABLE issues (... CLOB description, status workflow CHECK, FKs to users and locations, optional assigned_worker_id)
  - Indexes: citizen_id, location_id, status, category, assigned_worker_id
  - Trigger: trg_issues_updated_at (maintains updated_at)

- File: `database/migrations/004_create_applications_table.sql`
  - CREATE TABLE applications (..., status CHECK, reviewed_by)
  - FKs: issue, worker, reviewed_by (users)
  - Constraints: chk_applications_cost (>0), uk_applications_issue_worker (no duplicates per worker/issue)
  - Indexes: issue, worker, status, applied_at, reviewed_by
  - Triggers:
    - trg_applications_reviewed_at: sets reviewed_at when status becomes accepted/rejected and validates admin
    - trg_applications_insert_validate: validates worker type and issue is open for applications
    - trg_applications_status_update (compound): on accepting one app, assigns worker to issue and rejects others

- File: `database/migrations/005_create_issue_proofs_table.sql`
  - CREATE TABLE issue_proofs (..., verification_status CHECK, verified_by)
  - FKs: issue, worker, verified_by (users)
  - Constraints: uk_proofs_issue (one proof per issue)
  - Indexes: worker, status, submitted_at, verified_by
  - Triggers:
    - trg_proof_submitted: validates worker, ensures issue is assigned/in_progress, sets issue status to under_review
    - trg_proof_verified: timestamps verification
    - trg_proof_verified_admin_check: validates verifier is admin
    - trg_proof_verified_after: sets issue to resolved (approved) or in_progress (rejected)

- File: `database/migrations/006_create_payments_table.sql`
  - CREATE TABLE payments (..., payment_method CHECK, payment_status CHECK)
  - FKs: issue, citizen, worker
  - Constraints: chk_payments_amount (>0), uk_payments_issue (one payment per issue)
  - Indexes: issue, citizen, worker, status, date
  - Triggers: trg_payments_updated_at; trg_payment_completed (closes issue on completed)

- File: `database/migrations/007_create_ratings_table.sql`
  - CREATE TABLE ratings (..., rating CHECK)
  - FKs: issue, citizen, worker
  - Constraints: uk_ratings_job (one rating per issue)
  - Indexes: citizen, worker, rating

- File: `database/migrations/008_create_withdrawals_table.sql`
  - CREATE TABLE withdrawals (... method CHECK, amount CHECK, status CHECK)
  - FK: worker
  - Indexes: worker, status, requested_at
  - Trigger: trg_withdrawals_updated_at
  - Added View: v_issues_with_details (issues joined with citizen and location details)
  - Added Function: get_issue_count_by_status(worker_id, status)
  - Added Procedure: set_issue_status_safe(issue_id, status) with exception handling

## DML: CRUD in Backend

- File: `server/models/User.js`
  - SELECT hashed_pass FROM users WHERE user_id = :user_id (Auth)
  - SELECT ... FROM users WHERE email = :email (Login)
  - INSERT INTO users (...) RETURNING user_id (Registration)
  - UPDATE users SET ... updated_at = CURRENT_TIMESTAMP WHERE user_id = :user_id (Profile/Password update)
  - DELETE FROM users WHERE user_id = :user_id (Account delete)
  - SELECT ... ORDER BY created_at DESC OFFSET .. FETCH NEXT .. (Pagination)
  - SELECT ... WHERE LOWER(name|email|phone) LIKE LOWER(:term) (Dynamic search)

- File: `server/controllers/issueController.js`
  - INSERT INTO locations (...) RETURNING location_id (Create location)
  - INSERT INTO issues (...) (Create issue)
  - SELECT ... FROM issues LEFT JOIN users LEFT JOIN locations ORDER BY created_at DESC (List issues)
  - SELECT ... WHERE i.issue_id = :id (Get issue by id)
  - UPDATE issues SET ... updated_at = CURRENT_TIMESTAMP WHERE issue_id = :id (Update issue/status)
  - DELETE FROM issues WHERE issue_id = :id (Delete issue)
  - SELECT COUNT(...) with CASE expressions (Aggregations for user stats)
  - SELECT ... ORDER BY ... FETCH FIRST :limit ROWS ONLY (Recent issues)

- File: `server/controllers/workerController.js`
  - SELECT with UNION and NOT EXISTS, JOIN users/locations, ORDER BY last_updated DESC (My applications + assigned jobs)
  - UPDATE issues ... WHERE ... AND status = 'assigned' (Start work)
  - INSERT INTO issue_proofs ... ; UPDATE issues SET status='under_review' (Submit proof transaction)
  - SELECT/DELETE/UPDATE with conditions + transactional bundle (Delete rejected application and update issue status)
  - SELECT COUNT DISTINCT with CASE and JOIN (Worker statistics)

- File: `server/controllers/jobProofController.js`
  - SELECT assigned_worker_id, status FROM issues WHERE issue_id = :issueId (Validation)
  - SELECT proof_id FROM issue_proofs WHERE issue_id = :issueId (Uniqueness)
  - INSERT INTO issue_proofs (...) (Submit proof)
  - SELECT ... JOIN issues/LEFT JOIN users (Proof status)
  - UPDATE issues SET status = 'in_progress' ... (Resume work)
  - SELECT ... JOIN locations/users (Admin pending proofs)
  - UPDATE issue_proofs SET verification_status = 'approved'/'rejected' ... (Admin review)

- File: `server/controllers/paymentsController.js`
  - SELECT with scalar subquery, NOT EXISTS, JOINs (Pending payments)
  - INSERT INTO payments (...) (Create payment records)
  - SELECT SUM/CASE aggregations (Totals, pending)
  - SELECT JOIN issues ORDER BY ... FETCH FIRST 10 (Recent incomes)
  - SELECT SUM/CASE from withdrawals (Balance)
  - INSERT INTO withdrawals (...) (Create withdrawal)
  - SELECT ... ORDER BY requested_at DESC FETCH FIRST 10 (List withdrawals)

## Views

- v_issues_with_details: convenient join of issues, users, locations.
  - File: `database/migrations/008_create_withdrawals_table.sql` (appended section)
  - Intended Use: simplifies reporting/reads; could replace some LEFT JOIN queries in controllers.

## PL/SQL Functions and Procedures

- get_issue_count_by_status(p_worker_id, p_status) RETURNS NUMBER
  - File: `database/migrations/008_create_withdrawals_table.sql`
  - Purpose: utility for analytics; can be used in dashboards.
  - Exception handling: returns 0 on NO_DATA_FOUND and generic errors.

- set_issue_status_safe(p_issue_id, p_status)
  - File: `database/migrations/008_create_withdrawals_table.sql`
  - Purpose: central, validated status update with error signaling using RAISE_APPLICATION_ERROR.

- Triggers (see DDL section) demonstrate procedural logic tied to business rules.

## Constraints and Referential Integrity

- CHECK constraints on enumerated fields (user_type, status, priority, method, rating bounds)
- UNIQUE constraints to prevent duplicates (email, uk_applications_issue_worker, uk_proofs_issue, uk_payments_issue, uk_ratings_job)
- FOREIGN KEYS with ON DELETE CASCADE where appropriate

## Indexes

- Created across common filter columns: user_type, district, upazila, multiple issue columns, application columns, payment columns, etc., to optimize query performance.

## Joins, Subqueries, UNION, EXISTS

- workerController.getMyApplications: UNION two datasets; NOT EXISTS subquery
- paymentsController.getPendingPayments: scalar subquery and NOT EXISTS anti-join
- Numerous JOINs across issues/users/locations

## Aggregations and GROUP BY style

- Aggregations implemented via COUNT/SUM with CASE in controllers
- Although explicit GROUP BY is not heavily used, aggregations are demonstrated with CASE expressions; could be integrated into additional views if desired.

## Dynamic Searching

- server/models/User.js: WHERE LOWER(...) LIKE LOWER(:searchTerm) across multiple columns.

## Exception Handling (PL/SQL)

- In triggers: RAISE_APPLICATION_ERROR for validation failures (e.g., -20002..-20007)
- In set_issue_status_safe: RAISE_APPLICATION_ERROR for invalid status/issue not found
- In function: safe fallbacks for NO_DATA_FOUND and OTHERS

## Why We Used Each Feature

- Triggers: enforce business rules at the database layer (status transitions, timestamps, admin-only actions)
- Views: simplify common multi-table reads for reporting and potential reuse
- Functions/Procedures: encapsulate logic and show PL/SQL usage with parameters and exceptions
- Constraints: ensure data integrity and valid enumerations
- Indexes: improve performance of frequent filters/joins
- Subqueries/UNION/EXISTS: express complex retrieval logic efficiently
- RETURNING clause: obtain generated IDs without extra roundtrips
- FETCH/OFFSET: pagination and limiting results

## Pointers to Code

- Backend database access helper: `server/config/database.js` (executeQuery, executeMultipleQueries, connection pool)
- Business logic using SQL: controllers and model listed above

---
Prepared for: LocalFix DBMS Sessional Project Evaluation.