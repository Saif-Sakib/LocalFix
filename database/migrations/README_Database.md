# LocalFix Database Setup Guide

## Overview
This directory contains all SQL migration files for the LocalFix database. The database is designed for Oracle and includes all necessary tables, relationships, triggers, and procedures to support the LocalFix application.

## File Structure
```
database/
├── 000_database_setup.sql          # Initial database setup
├── 001_create_users_table.sql      # Users table (already exists)
├── 002_create_locations_table.sql  # Locations table
├── 003_create_issues_table.sql     # Issues/categories table
├── 004_create_job_status_table.sql # Job status lookup
├── 005_create_jobs_table.sql       # Main jobs table
├── 006_create_application_status_table.sql # Application status lookup
├── 007_create_applications_table.sql # Job applications
├── 008_create_job_proofs_table.sql # Job completion proofs
├── 009_create_payments_table.sql   # Payment records
├── 010_create_ratings_table.sql    # Worker ratings
├── 011_create_notifications_table.sql # Notification system
├── 012_create_worker_skills_table.sql # Worker skills
├── 013_create_views.sql            # Database views
├── 014_seed_data.sql               # Sample data
├── 015_stored_procedures.sql       # Business logic procedures
├── 016_additional_constraints_indexes.sql # Performance optimization
├── 017_utility_procedures.sql      # Helper procedures
├── 018_common_queries.sql          # Queries for app development
├── 999_run_all_migrations.sql      # Migration runner
└── 999_cleanup_reset.sql           # Database reset script
```

## Quick Start

### 1. Prerequisites
- Oracle Database (11g or higher)
- SQL Developer, DBeaver, or similar Oracle client
- Proper database privileges (CREATE TABLE, CREATE TRIGGER, etc.)

### 2. Run Migrations
Execute the SQL files in this exact order:

```sql
-- Step 1: Setup
@000_database_setup.sql

-- Step 2: Core Tables
@001_create_users_table.sql
@002_create_locations_table.sql
@003_create_issues_table.sql
@004_create_job_status_table.sql
@005_create_jobs_table.sql

-- Step 3: Application System
@006_create_application_status_table.sql
@007_create_applications_table.sql

-- Step 4: Additional Features
@008_create_job_proofs_table.sql
@009_create_payments_table.sql
@010_create_ratings_table.sql
@011_create_notifications_table.sql
@012_create_worker_skills_table.sql

-- Step 5: Views and Procedures
@013_create_views.sql
@015_stored_procedures.sql
@017_utility_procedures.sql

-- Step 6: Optimization
@016_additional_constraints_indexes.sql

-- Step 7: Sample Data
@014_seed_data.sql
```

### 3. Verification
After running all migrations, verify with:
```sql
-- Check all tables exist
SELECT table_name FROM user_tables ORDER BY table_name;

-- Check views
SELECT view_name FROM user_views WHERE view_name LIKE 'V_%';

-- Check procedures
SELECT object_name FROM user_objects WHERE object_type = 'PROCEDURE';
```

## Database Schema

### Core Tables
1. **users** - All user types (citizens, workers, admins)
2. **locations** - Geographic information
3. **issues** - Issue categories and types
4. **jobs** - Main job postings
5. **applications** - Worker applications to jobs
6. **job_proofs** - Completion verification
7. **payments** - Payment processing
8. **ratings** - Worker performance ratings
9. **notifications** - User notifications
10. **worker_skills** - Worker skill tracking

### Lookup Tables
- **job_status** - Job workflow states
- **application_status** - Application workflow states

## Key Features

### Automated Workflows
- **Job Assignment**: When application is accepted, job status automatically updates
- **Status Progression**: Job moves through states automatically with triggers
- **Notifications**: Automatic notifications for status changes
- **Payment Processing**: Links job completion to payment records

### Data Integrity
- Foreign key constraints maintain relationships
- Check constraints validate data quality
- Unique constraints prevent duplicates
- Triggers ensure data consistency

### Performance Optimization
- Indexed columns for fast queries
- Views for complex data retrieval
- Stored procedures for business logic
- Optimized queries for common operations

## Common Use Cases

### For Frontend Development
- Use the views (v_job_listings, v_application_details) for easy data display
- Use stored procedures for complex operations
- Reference 018_common_queries.sql for ready-to-use queries

### For Testing
- Sample data is included in 014_seed_data.sql
- Use the seed data to test application functionality
- Reset database with 999_cleanup_reset.sql if needed

## Security Considerations
- Passwords should be hashed using bcrypt in the application
- Use prepared statements to prevent SQL injection
- Implement proper authentication middleware
- Validate all user inputs

## Troubleshooting

### Common Issues
1. **Foreign Key Errors**: Ensure parent records exist before inserting child records
2. **Check Constraint Violations**: Verify data meets constraint requirements
3. **Trigger Issues**: Check trigger compilation with `SELECT * FROM user_errors`

### Reset Database
If you need to start fresh:
```sql
@999_cleanup_reset.sql
-- Then run all migrations again
```

## Next Steps
1. Test all migrations in your Oracle environment
2. Verify data integrity with sample operations
3. Connect your Node.js backend to the database
4. Implement the API endpoints using the provided queries
5. Test the complete workflow from job posting to payment

## Team Responsibilities

### Authentication
- Focus on users table and auth-related queries
- Implement JWT token management
- Use authentication queries from 018_common_queries.sql

### Citizen System
- Work with jobs, applications, and ratings tables
- Use citizen-specific views and procedures
- Implement job posting and application review features

### Worker System
- Focus on applications, worker_skills, and job_proofs tables
- Use worker-specific views and queries
- Implement job browsing and application features

### Admin System
- Work with all tables for management features
- Use admin-specific procedures and views
- Implement verification and reporting features

## Support
If you encounter any issues with the database setup, check:
1. Oracle error logs
2. User permissions
3. Table dependencies
4. Constraint violations

The database is designed to be simple yet comprehensive for your university project needs.